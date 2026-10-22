import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useWallet } from '../wallet-context';
import { useEternityUserState } from '../userState';
import { defaultMission } from './missionRegistry';
import { trackJourneyEvent } from './analytics';
import type { JourneyEvent, JourneyImpact, JourneyPlan, MissionHandoff, NextBestAction } from './types';
import { JourneyContext, type CompleteJourneyActionInput, type JourneyContextValue } from './journey-context';
import { evaluateJourneyMapping } from '../../special3/progression/journeyHandoff';
import { mappingAuthorizesHandoff, missionAchievementMappingFor } from '../../special3/progression/missionAchievementMappings';
import type { JourneyProgressionHandoff } from '../../special3/progression/types';

const STORAGE_VERSION = 2;
const MAX_EVENTS = 80;

interface JourneyStore {
  version: number;
  handoff: MissionHandoff | null;
  events: JourneyEvent[];
  plan: JourneyPlan | null;
  progressionCommitIds: string[];
}

function emptyStore(): JourneyStore {
  return { version:STORAGE_VERSION, handoff:null, events:[], plan:null, progressionCommitIds:[] };
}

function storageKey(address: string | null) {
  return `eternity-journey-v${STORAGE_VERSION}:${address?.toLowerCase() ?? 'guest'}`;
}

function readStore(key: string): JourneyStore {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null') as JourneyStore | null;
    if (parsed?.version === STORAGE_VERSION) return { ...parsed, progressionCommitIds:parsed.progressionCommitIds ?? [] };
    const previousKey = key.replace('eternity-journey-v2:', 'eternity-journey-v1:');
    const previous = JSON.parse(localStorage.getItem(previousKey) ?? 'null') as Partial<JourneyStore> | null;
    if (previous?.version === 1) return { ...emptyStore(), handoff:previous.handoff ?? null, events:previous.events ?? [] };
    return emptyStore();
  } catch {
    return emptyStore();
  }
}

function impactEq(impact: JourneyImpact[]) {
  return impact
    .filter((item) => item.kind === 'eq')
    .reduce((total, item) => total + Number((item.value ?? '0').replace(/[^\d-]/g, '')), 0);
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const user = useEternityUserState();
  const key = storageKey(wallet.address);
  const [store, setStore] = useState<JourneyStore>(() => readStore(key));
  const [pendingImpact, setPendingImpact] = useState<JourneyEvent | null>(null);
  const [nextAction, setNextAction] = useState<NextBestAction | null>(null);

  useEffect(() => {
    setStore(readStore(key));
    setPendingImpact(null);
    setNextAction(null);
  }, [key]);

  useEffect(() => {
    if (user.isGuest) return;
    localStorage.setItem(key, JSON.stringify(store));
  }, [key, store, user.isGuest]);

  const startMission = useCallback((handoff: Omit<MissionHandoff, 'createdAt'>) => {
    const next = { ...handoff, createdAt:Date.now() };
    setStore((current) => ({ ...current, handoff:next }));
    trackJourneyEvent('mission_started', {
      missionId:next.missionId,
      taskId:next.taskId,
      productId:next.destinationProduct,
      route:next.returnPath,
    });
  }, []);

  const clearHandoff = useCallback(() => {
    setStore((current) => ({ ...current, handoff:null }));
  }, []);

  const completeAction = useCallback((input: CompleteJourneyActionInput) => {
    const activeMission = defaultMission(user);
    const impact = input.impact ?? activeMission?.legacyExpectedImpact ?? [];
    const event: JourneyEvent = {
      id:`journey-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      userId:wallet.address ?? undefined,
      type:input.taskId || store.handoff?.taskId ? 'task_completed' : 'area_progress_changed',
      sourceProduct:input.sourceProduct,
      sourceAction:input.sourceAction,
      missionId:input.missionId ?? store.handoff?.missionId,
      taskId:input.taskId ?? store.handoff?.taskId,
      timestamp:Date.now(),
      transactionHash:input.transactionHash,
      impact,
    };
    setStore((current) => ({
      ...current,
      handoff:null,
      events:[event, ...current.events].slice(0, MAX_EVENTS),
    }));
    setPendingImpact(event);
    setNextAction(input.nextAction ?? activeMission?.nextAction ?? null);
    trackJourneyEvent('task_completed', {
      productId:input.sourceProduct,
      missionId:event.missionId,
      taskId:event.taskId,
    });
    return event;
  }, [store.handoff?.missionId, store.handoff?.taskId, user, wallet.address]);

  const applyProgressionHandoff = useCallback((handoff: JourneyProgressionHandoff) => {
    const activeMission = store.handoff?.missionId ?? store.plan?.activeMissionId ?? defaultMission(user)?.id;
    if (!mappingAuthorizesHandoff(missionAchievementMappingFor(activeMission), handoff)) return { status:'mapping-unresolved' as const };
    const decision = evaluateJourneyMapping(handoff, activeMission, store.progressionCommitIds);
    if (decision.status !== 'applied' || !decision.missionId) return { status:decision.status };
    const mission = defaultMission(user);
    const impact: JourneyImpact[] = [
      { kind:'achievement', label:`Achievement ${handoff.achievementId ?? 'verified'}`, faLabel:`دستاورد ${handoff.achievementId ?? 'تأییدشده'}` },
      { kind:'eq', label:`+${handoff.personalEqDelta} Personal EQ`, faLabel:`${handoff.personalEqDelta}+ EQ شخصی`, value:`+${handoff.personalEqDelta}` },
      { kind:'task', label:'Verified progression handoff committed', faLabel:'تحویل پیشرفت تأییدشده ثبت شد' },
    ];
    const event: JourneyEvent = {
      id:`journey:${handoff.progressionCommitId}`,
      userId:wallet.address ?? undefined,
      type:'task_completed',
      sourceProduct:handoff.product,
      sourceAction:handoff.achievementId ?? handoff.impactCategory,
      missionId:decision.missionId,
      taskId:store.handoff?.taskId,
      timestamp:Date.now(),
      impact,
    };
    setStore((current) => ({
      ...current,
      handoff:null,
      progressionCommitIds:[handoff.progressionCommitId, ...current.progressionCommitIds].slice(0, MAX_EVENTS),
      events:[event, ...current.events].slice(0, MAX_EVENTS),
    }));
    setPendingImpact(event);
    setNextAction(mission?.nextAction ?? null);
    trackJourneyEvent('task_completed', { productId:handoff.product, missionId:decision.missionId, taskId:event.taskId });
    return { status:'applied' as const, event };
  }, [store.handoff?.missionId, store.handoff?.taskId, store.plan?.activeMissionId, store.progressionCommitIds, user, wallet.address]);

  const dismissImpact = useCallback(() => setPendingImpact(null), []);
  const updateGoalFromQora = useCallback((goalTitle: string, activeMissionId?: string) => {
    const clean = goalTitle.trim().replace(/\s+/g, ' ').slice(0, 120);
    if (!clean) return;
    setStore((current) => ({ ...current, plan:{ goalTitle:clean, activeMissionId, generatedBy:'qora', updatedAt:Date.now() } }));
  }, []);
  const value = useMemo<JourneyContextValue>(() => ({
    handoff:store.handoff,
    events:user.isGuest ? [] : store.events,
    recentImpact:user.isGuest ? null : (store.events[0] ?? null),
    pendingImpact:user.isGuest ? null : pendingImpact,
    nextAction:user.isGuest ? null : nextAction,
    eqDelta:user.isGuest ? 0 : store.events.reduce((total, event) => total + impactEq(event.impact), 0),
    plan:user.isGuest ? null : store.plan,
    updateGoalFromQora,
    startMission,
    clearHandoff,
    completeAction,
    applyProgressionHandoff,
    dismissImpact,
  }), [applyProgressionHandoff, clearHandoff, completeAction, dismissImpact, nextAction, pendingImpact, startMission, store.events, store.handoff, store.plan, updateGoalFromQora, user.isGuest]);

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}
