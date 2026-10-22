import { personalEqTotal, referralEqTotal } from './ledgers.ts';
import { resolveLevel } from './levelResolver.ts';
import type { ProgressionState } from './types.ts';

export interface ProgressionProjectionInput {
  rank?: string;
  reputation?: string;
  access?: Array<{ id: string; eligible: boolean; reason: string }>;
}

export interface ProgressionProjection {
  accountKey: string;
  personalEq: number;
  referralEq: number;
  level: ReturnType<typeof resolveLevel>;
  rank?: string;
  reputation?: string;
  access: Array<{ id: string; eligible: boolean; reason: string }>;
  completedAchievementIds: string[];
  lastImpact: ProgressionState['lastImpact'];
}

export function buildProgressionProjection(state: ProgressionState, thresholds: readonly number[], input: ProgressionProjectionInput = {}): ProgressionProjection {
  const personalEq = personalEqTotal(state);
  return {
    accountKey:state.accountKey,
    personalEq,
    referralEq:referralEqTotal(state),
    level:resolveLevel(personalEq, thresholds),
    rank:input.rank ?? state.openingSnapshot?.rank,
    reputation:input.reputation,
    access:input.access ?? [],
    completedAchievementIds:[...state.completedAchievementIds],
    lastImpact:state.lastImpact,
  };
}

export function buildPassportProgressionProjection(projection: ProgressionProjection) {
  return Object.freeze({
    personalEq:projection.personalEq,
    referralEq:projection.referralEq,
    level:projection.level.level,
    levelProgress:projection.level.progressPercent,
    eqToNextLevel:projection.level.eqToNextLevel,
    rank:projection.rank,
    achievementCount:projection.completedAchievementIds.length,
    access:projection.access,
    progressionAlert:projection.lastImpact?.rejectionReason,
  });
}

export function buildQoraProgressionContext(projection: ProgressionProjection) {
  return Object.freeze({
    personalEq:projection.personalEq,
    referralEq:projection.referralEq,
    referralEqAffectsPersonalLevel:false,
    level:projection.level.level,
    eqToNextLevel:projection.level.eqToNextLevel,
    rank:projection.rank ?? 'Unavailable',
    access:projection.access,
    achievements:projection.completedAchievementIds,
    lastVerifiedImpact:projection.lastImpact,
    explanation:projection.lastImpact?.rejectionReason
      ? `Progression was not committed: ${projection.lastImpact.rejectionReason}.`
      : 'Progression context is read-only and grounded in committed ledger state.',
  });
}
