import type { AchievementRuleRegistry } from './ruleRegistry.ts';
import { UNRESOLVED_SOURCE, type AchievementEvaluation, type LockedAchievementRule, type NormalizedProgressionPayload, type ProductEventEnvelope, type ProgressionState } from './types.ts';

function includesUnresolved(value: unknown) {
  return JSON.stringify(value).includes(UNRESOLVED_SOURCE);
}

function referralEligible(rule: LockedAchievementRule) {
  return rule.referralEligibility.toLowerCase().includes('eligible under global line-1');
}

function familyMatches(achievementId: string, family: string) {
  return achievementId === family || achievementId.startsWith(`${family}-`);
}

function selectMatchingRules(rules: readonly LockedAchievementRule[], payload: NormalizedProgressionPayload) {
  if (payload.achievementId) return rules.filter((rule) => rule.achievementId === payload.achievementId);
  if (payload.ruleFamily) return rules.filter((rule) => familyMatches(rule.achievementId, payload.ruleFamily!));
  if (payload.milestoneValue !== undefined) return rules.filter((rule) => rule.milestone.threshold === payload.milestoneValue);
  if (payload.cumulativeValue !== undefined) return rules.filter((rule) => rule.milestone.threshold <= payload.cumulativeValue!);
  return rules.length === 1 ? [...rules] : [];
}

function unresolvedFields(rule: LockedAchievementRule) {
  const fields: string[] = [];
  if (includesUnresolved(rule.prerequisite)) fields.push('prerequisite');
  if (includesUnresolved(rule.qualificationRule)) fields.push('qualificationRule');
  if (includesUnresolved(rule.repeatability)) fields.push('repeatability');
  if (includesUnresolved(rule.cap)) fields.push('cap');
  if (includesUnresolved(rule.rewardEffect)) fields.push('nonEqReward');
  return fields;
}

function shouldBlockForProtocolResolution(rule: LockedAchievementRule) {
  return includesUnresolved(rule.prerequisite) || includesUnresolved(rule.qualificationRule) || includesUnresolved(rule.repeatability);
}

function eidCapReached(rule: LockedAchievementRule, state: ProgressionState) {
  if (rule.product !== 'EID') return false;
  const cap = typeof rule.cap === 'object' ? rule.cap : { count:20, totalEq:400 };
  const entries = state.eqLedger.filter((entry) => entry.achievementId === rule.achievementId && entry.classification === 'personal');
  return entries.length >= cap.count || entries.reduce((sum, entry) => sum + entry.eqDelta, 0) >= cap.totalEq;
}

export function evaluateAchievements(event: ProductEventEnvelope, registry: AchievementRuleRegistry, state: ProgressionState): AchievementEvaluation[] {
  const payload = event.payload as NormalizedProgressionPayload;
  const candidates = registry.byProductEvent(event.product, event.eventType);
  if (payload.eligible !== true) {
    return candidates.map((rule) => ({
      achievementId:rule.achievementId, product:rule.product, eventType:rule.eventType, status:'ineligible', eqDelta:0,
      journeyImpactCategory:rule.journeyImpactCategory, referralEligible:false, unresolved:[],
    }));
  }
  const matching = selectMatchingRules(candidates, payload);
  if (!matching.length) {
    return candidates.map((rule) => ({
      achievementId:rule.achievementId, product:rule.product, eventType:rule.eventType, status:'mapping-unresolved', eqDelta:0,
      journeyImpactCategory:rule.journeyImpactCategory, referralEligible:false, unresolved:['event-selector'],
    }));
  }
  return matching.map((rule) => {
    const unresolved = unresolvedFields(rule);
    if (shouldBlockForProtocolResolution(rule)) {
      return { achievementId:rule.achievementId, product:rule.product, eventType:rule.eventType, status:'requires-protocol-resolution', eqDelta:0, journeyImpactCategory:rule.journeyImpactCategory, referralEligible:false, unresolved };
    }
    const count = state.achievementAwardCounts[rule.achievementId] ?? 0;
    const once = rule.repeatability === 'once-per-achievement-id';
    if ((once && state.completedAchievementIds.includes(rule.achievementId)) || (typeof rule.cap === 'number' && count >= rule.cap)) {
      return { achievementId:rule.achievementId, product:rule.product, eventType:rule.eventType, status:'already-completed', eqDelta:0, journeyImpactCategory:rule.journeyImpactCategory, referralEligible:false, unresolved };
    }
    if (eidCapReached(rule, state)) {
      return { achievementId:rule.achievementId, product:rule.product, eventType:rule.eventType, status:'capped', eqDelta:0, journeyImpactCategory:rule.journeyImpactCategory, referralEligible:false, unresolved };
    }
    return {
      achievementId:rule.achievementId,
      product:rule.product,
      eventType:rule.eventType,
      status:'completed',
      eqDelta:rule.eqDelta,
      journeyImpactCategory:rule.journeyImpactCategory,
      referralEligible:referralEligible(rule),
      unresolved,
    };
  });
}
