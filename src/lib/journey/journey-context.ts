import { createContext, useContext } from 'react';
import type { JourneyEvent, JourneyImpact, JourneyPlan, MissionHandoff, NextBestAction } from './types';
import type { JourneyImpactStatus, JourneyProgressionHandoff } from '../../special3/progression/types.ts';

export interface CompleteJourneyActionInput {
  sourceProduct: string;
  sourceAction: string;
  missionId?: string;
  taskId?: string;
  transactionHash?: string;
  impact?: JourneyImpact[];
  nextAction?: NextBestAction;
}

export interface JourneyContextValue {
  handoff: MissionHandoff | null;
  events: JourneyEvent[];
  recentImpact: JourneyEvent | null;
  pendingImpact: JourneyEvent | null;
  nextAction: NextBestAction | null;
  eqDelta: number;
  plan: JourneyPlan | null;
  updateGoalFromQora: (goalTitle: string, activeMissionId?: string) => void;
  startMission: (handoff: Omit<MissionHandoff, 'createdAt'>) => void;
  clearHandoff: () => void;
  completeAction: (input: CompleteJourneyActionInput) => JourneyEvent;
  applyProgressionHandoff: (handoff: JourneyProgressionHandoff) => { status: JourneyImpactStatus; event?: JourneyEvent };
  dismissImpact: () => void;
}

export const JourneyContext = createContext<JourneyContextValue | null>(null);

export function useJourney() {
  const value = useContext(JourneyContext);
  if (!value) throw new Error('useJourney must be used inside JourneyProvider');
  return value;
}
