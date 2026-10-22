import { progressionAnalyticsEvent, type ProgressionAnalyticsSink, emitProgressionAnalytics } from './analytics.ts';
import { evaluateAchievements } from './achievementEngine.ts';
import { evaluateEventIntegrity } from './integrityGate.ts';
import { createJourneyHandoffs, evaluateJourneyMapping } from './journeyHandoff.ts';
import { commitPersonalEq, createReferralEqEntries, personalEqTotal } from './ledgers.ts';
import { resolveLevel } from './levelResolver.ts';
import type { AchievementRuleRegistry } from './ruleRegistry.ts';
import type {
  EqLedgerEntry, JourneyProgressionHandoff, ProductEventEnvelope, ProgressionAnalyticsEvent, ProgressionImpact,
  ProgressionMode, ProgressionState, ReferralContext,
} from './types.ts';

export interface ProgressionPipelineInput {
  mode: ProgressionMode;
  event: ProductEventEnvelope;
  registry: AchievementRuleRegistry;
  state: ProgressionState;
  expectedChainId?: number;
  supportedPayloadVersions?: readonly string[];
  allowMockVerification?: boolean;
  activeMissionId?: string;
  referralContext?: ReferralContext;
  referralState?: ProgressionState;
  now?: string;
  analyticsSink?: ProgressionAnalyticsSink;
}

export interface ProgressionPipelineResult {
  mode: ProgressionMode;
  writesApplied: boolean;
  nextState: ProgressionState;
  nextReferralState?: ProgressionState;
  impact: ProgressionImpact;
  handoffs: JourneyProgressionHandoff[];
  personalEntries: EqLedgerEntry[];
  referralEntries: EqLedgerEntry[];
  analytics: ProgressionAnalyticsEvent[];
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function sumEq(entries: readonly EqLedgerEntry[]) {
  return entries.reduce((sum, entry) => sum + entry.eqDelta, 0);
}

function rejectionResult(input: ProgressionPipelineInput, reason: ProgressionImpact['rejectionReason'], analytics: ProgressionAnalyticsEvent[]): ProgressionPipelineResult {
  const impact: ProgressionImpact = {
    eventId:input.event.eventId,
    verificationStatus:input.event.status,
    achievements:[],
    personalEqDelta:0,
    referralEqDelta:0,
    journeyImpact:{ status:'not-committed' },
    rejectionReason:reason,
  };
  emitProgressionAnalytics(analytics, input.analyticsSink);
  return { mode:input.mode, writesApplied:false, nextState:input.state, nextReferralState:input.referralState, impact, handoffs:[], personalEntries:[], referralEntries:[], analytics };
}

export function runProgressionPipeline(input: ProgressionPipelineInput): ProgressionPipelineResult {
  const now = input.now ?? new Date().toISOString();
  const analytics: ProgressionAnalyticsEvent[] = [progressionAnalyticsEvent('progression_event_observed', input.event, now)];
  if (input.mode === 'legacy') {
    analytics.push(progressionAnalyticsEvent('progression_event_rejected', input.event, now, undefined, 'legacy_mode_authoritative'));
    return rejectionResult(input, 'legacy_mode_authoritative', analytics);
  }

  const integrity = evaluateEventIntegrity(input.event, {
    accountKey:input.state.accountKey,
    expectedChainId:input.expectedChainId,
    supportedPayloadVersions:input.supportedPayloadVersions ?? ['1.0.0'],
    registry:input.registry,
    state:input.state,
    allowMockVerification:input.allowMockVerification,
  });
  if (!integrity.accepted) {
    const name = integrity.reason === 'duplicate_event' ? 'progression_duplicate_ignored' : 'progression_event_rejected';
    analytics.push(progressionAnalyticsEvent(name, input.event, now, undefined, integrity.reason));
    return rejectionResult(input, integrity.reason, analytics);
  }

  analytics.push(progressionAnalyticsEvent('progression_event_verified', input.event, now));
  const evaluations = evaluateAchievements(input.event, input.registry, input.state);
  evaluations.forEach((evaluation) => {
    analytics.push(progressionAnalyticsEvent('achievement_evaluated', input.event, now, evaluation.achievementId, evaluation.status));
    if (evaluation.status === 'completed') analytics.push(progressionAnalyticsEvent('achievement_completed', input.event, now, evaluation.achievementId));
    if (evaluation.status === 'requires-protocol-resolution' || evaluation.status === 'mapping-unresolved') {
      analytics.push(progressionAnalyticsEvent('progression_rule_unresolved', input.event, now, evaluation.achievementId, evaluation.unresolved.join(',')));
    }
  });
  const { entries:personalEntries, rewards } = commitPersonalEq(input.state, input.event, evaluations, now);
  const referralEntries = createReferralEqEntries(personalEntries, input.referralContext, now);
  const personalBefore = personalEqTotal(input.state);
  const personalDelta = sumEq(personalEntries);
  const referralDelta = sumEq(referralEntries);
  const levelBefore = resolveLevel(personalBefore, input.registry.levels).level;
  const levelAfter = resolveLevel(personalBefore + personalDelta, input.registry.levels).level;
  const handoffs = createJourneyHandoffs(input.event, evaluations, personalEntries, referralEntries);
  const mappedJourney = handoffs.length
    ? evaluateJourneyMapping(handoffs[0], input.activeMissionId, input.state.appliedJourneyCommitIds)
    : { status:'not-committed' as const };
  const unresolved = unique(evaluations.flatMap((evaluation) => evaluation.unresolved));
  const allIneligible = evaluations.length > 0 && evaluations.every((evaluation) => evaluation.status === 'ineligible');
  const allMappingUnresolved = evaluations.length > 0 && evaluations.every((evaluation) => evaluation.status === 'mapping-unresolved');
  const impact: ProgressionImpact = {
    eventId:input.event.eventId,
    verificationStatus:'verified',
    achievements:evaluations.map((evaluation) => ({ achievementId:evaluation.achievementId, status:evaluation.status, eqDelta:evaluation.eqDelta || undefined })),
    personalEqDelta:personalDelta,
    referralEqDelta:referralDelta,
    levelBefore,
    levelAfter,
    journeyImpact:mappedJourney,
    unresolved:unresolved.length ? unresolved : undefined,
    rejectionReason:allIneligible ? 'verified_but_ineligible' : allMappingUnresolved ? 'protocol_mapping_missing' : undefined,
  };

  if (input.mode === 'shadow') {
    emitProgressionAnalytics(analytics, input.analyticsSink);
    return { mode:input.mode, writesApplied:false, nextState:input.state, nextReferralState:input.referralState, impact, handoffs, personalEntries, referralEntries, analytics };
  }

  personalEntries.forEach((entry) => analytics.push(progressionAnalyticsEvent('eq_committed', input.event, now, entry.achievementId)));
  referralEntries.forEach((entry) => analytics.push(progressionAnalyticsEvent('referral_eq_committed', input.event, now, entry.achievementId)));
  if (levelAfter !== levelBefore) analytics.push(progressionAnalyticsEvent('level_changed', input.event, now, undefined, `${levelBefore}->${levelAfter}`));

  const hasDeferredEvaluation = evaluations.some((evaluation) => evaluation.status === 'requires-protocol-resolution' || evaluation.status === 'mapping-unresolved');
  const shouldMarkProcessed = !hasDeferredEvaluation;
  const nextState: ProgressionState = {
    ...input.state,
    processedEventIds:shouldMarkProcessed ? unique([...input.state.processedEventIds, input.event.eventId]) : input.state.processedEventIds,
    achievementAwardCounts:personalEntries.reduce((counts, entry) => ({ ...counts, [entry.achievementId]:(counts[entry.achievementId] ?? 0) + 1 }), { ...input.state.achievementAwardCounts }),
    completedAchievementIds:unique([...input.state.completedAchievementIds, ...personalEntries.map((entry) => entry.achievementId)]),
    eqLedger:[...input.state.eqLedger, ...personalEntries],
    rewardLedger:[...input.state.rewardLedger, ...rewards.filter((reward) => !input.state.rewardLedger.some((entry) => entry.rewardEntryId === reward.rewardEntryId))],
    lastImpact:impact,
    updatedAt:now,
  };
  let nextReferralState = input.referralState;
  if (input.referralState && referralEntries.length) {
    const fresh = referralEntries.filter((entry) => !input.referralState!.referralEqLedger.some((existing) => existing.ledgerEntryId === entry.ledgerEntryId));
    nextReferralState = { ...input.referralState, referralEqLedger:[...input.referralState.referralEqLedger, ...fresh], updatedAt:now };
  }
  emitProgressionAnalytics(analytics, input.analyticsSink);
  return { mode:input.mode, writesApplied:true, nextState, nextReferralState, impact, handoffs, personalEntries, referralEntries, analytics };
}
