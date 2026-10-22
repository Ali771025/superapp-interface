import type { AchievementProduct, JourneyProgressionHandoff } from './types.ts';

export type MissionAchievementMappingStatus =
  | 'authoritative'
  | 'family-known-exact-rule-runtime-dependent'
  | 'unresolved'
  | 'no-achievement-required';

export interface MissionAchievementMapping {
  missionId: string;
  taskId: string;
  product: AchievementProduct;
  productId: string;
  expectedProductAction: string;
  status: MissionAchievementMappingStatus;
  eligibleAchievementIds: string[];
  eligibleAchievementFamily?: string;
  verificationRequirement: string;
  journeyApplicationRule: string;
  sourceEvidence: string[];
}

export const MISSION_ACHIEVEMENT_MAPPINGS: readonly MissionAchievementMapping[] = [
  {
    missionId:'mission-shield-foundation', taskId:'task-create-first-shield', product:'SHIELD', productId:'shield', expectedProductAction:'Create SHIELD',
    status:'unresolved', eligibleAchievementIds:[],
    verificationRequirement:'Creating SHIELD is not proof of a qualifying fully-paid SHIELD milestone.',
    journeyApplicationRule:'Task may be attempted, but no Achievement/EQ or SPECIAL Mission completion is applied until an authoritative mapping exists.',
    sourceEvidence:['docs/special3/inventories/achievement-eq-map.json', 'src/lib/journey/missionRegistry.ts'],
  },
  {
    missionId:'mission-generator-foundation', taskId:'task-generate-first-eter', product:'Generator', productId:'generator', expectedProductAction:'Generate ETER',
    status:'family-known-exact-rule-runtime-dependent', eligibleAchievementIds:[], eligibleAchievementFamily:'generator-turnover',
    verificationRequirement:'A verified generator.turnover.indexed event must establish eligible cumulative turnover and newly crossed thresholds.',
    journeyApplicationRule:'Family knowledge may explain pending evaluation; it cannot complete the Mission without an authoritative Mission-to-Achievement mapping.',
    sourceEvidence:['docs/special3/inventories/achievement-eq-map.json#Generator', 'src/lib/journey/missionRegistry.ts'],
  },
  {
    missionId:'mission-forecast-participation', taskId:'task-enter-forecast', product:'Forecast', productId:'forecast', expectedProductAction:'Enter Forecast',
    status:'family-known-exact-rule-runtime-dependent', eligibleAchievementIds:[], eligibleAchievementFamily:'forecast-ticket',
    verificationRequirement:'A verified forecast.ticket.indexed event must establish the eligible cumulative ticket milestone.',
    journeyApplicationRule:'Family knowledge may explain pending evaluation; confirmation alone cannot complete the Mission.',
    sourceEvidence:['docs/special3/inventories/achievement-eq-map.json#Forecast', 'src/lib/journey/missionRegistry.ts'],
  },
  {
    missionId:'mission-ownership-readiness', taskId:'task-review-ees-requirements', product:'STOCK/EES', productId:'ees', expectedProductAction:'Review EES',
    status:'unresolved', eligibleAchievementIds:[],
    verificationRequirement:'A readiness review is not a verified stock.completed.verified event.',
    journeyApplicationRule:'Journey may track UX task state only; no Achievement, EQ or protocol Mission completion is inferred.',
    sourceEvidence:['docs/special3/inventories/achievement-eq-map.json#STOCK/EES', 'src/lib/journey/missionRegistry.ts'],
  },
] as const;

export function missionAchievementMappingFor(missionId?: string) {
  return missionId ? MISSION_ACHIEVEMENT_MAPPINGS.find((mapping) => mapping.missionId === missionId) : undefined;
}

export function mappingAuthorizesHandoff(mapping: MissionAchievementMapping | undefined, handoff: JourneyProgressionHandoff) {
  if (!mapping || mapping.status !== 'authoritative' || !handoff.achievementId) return false;
  return mapping.product === handoff.product && mapping.eligibleAchievementIds.includes(handoff.achievementId);
}

export interface MissionProgressionPresentation {
  mappingStatus: MissionAchievementMappingStatus;
  achievementLabel: string;
  potentialEqLabel: string;
  detail: string;
}

export function missionProgressionPresentation(missionId?: string): MissionProgressionPresentation {
  const mapping = missionAchievementMappingFor(missionId);
  if (!mapping || mapping.status === 'unresolved') return {
    mappingStatus:'unresolved',
    achievementLabel:'Achievement mapping unavailable',
    potentialEqLabel:'Potential EQ unavailable',
    detail:'Journey task progress is separate from Achievement and EQ ledger truth.',
  };
  if (mapping.status === 'family-known-exact-rule-runtime-dependent') return {
    mappingStatus:mapping.status,
    achievementLabel:'Pending verified Achievement evaluation',
    potentialEqLabel:'Potential EQ unavailable',
    detail:'The Achievement family is known; exact EQ depends on verified runtime evidence.',
  };
  if (mapping.status === 'no-achievement-required') return {
    mappingStatus:mapping.status,
    achievementLabel:'No Achievement required',
    potentialEqLabel:'Not applicable',
    detail:'This Journey task does not award protocol progression.',
  };
  return {
    mappingStatus:'authoritative',
    achievementLabel:'Verified Achievement mapping available',
    potentialEqLabel:'Resolved after verified evaluation',
    detail:'Exact committed EQ is read from the Personal EQ ledger.',
  };
}
