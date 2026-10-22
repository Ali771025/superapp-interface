import type { AchievementProduct, LockedAchievementMap, LockedAchievementRule } from './types.ts';

export interface AchievementRuleRegistry {
  readonly ruleCount: number;
  readonly levels: readonly number[];
  readonly source: LockedAchievementMap;
  byProductEvent(product: AchievementProduct, eventType: string): readonly LockedAchievementRule[];
  byId(achievementId: string): LockedAchievementRule | undefined;
  all(): readonly LockedAchievementRule[];
}

export function createAchievementRuleRegistry(source: LockedAchievementMap): AchievementRuleRegistry {
  if (source.ruleCount !== 79 || source.rules.length !== 79) throw new Error(`Locked rule count mismatch: expected 79, received ${source.rules.length}.`);
  if (source.levels.count !== 19 || source.levels.thresholds.length !== 19) throw new Error('Locked Level threshold count mismatch.');
  const byId = new Map<string, LockedAchievementRule>();
  const byProductEvent = new Map<string, LockedAchievementRule[]>();
  for (const rule of source.rules) {
    if (byId.has(rule.achievementId)) throw new Error(`Duplicate Achievement ID: ${rule.achievementId}`);
    byId.set(rule.achievementId, rule);
    const key = `${rule.product}::${rule.eventType}`;
    const bucket = byProductEvent.get(key) ?? [];
    bucket.push(rule);
    byProductEvent.set(key, bucket);
  }
  return Object.freeze({
    ruleCount: source.ruleCount,
    levels: Object.freeze([...source.levels.thresholds]),
    source,
    byProductEvent: (product: AchievementProduct, eventType: string) => byProductEvent.get(`${product}::${eventType}`) ?? [],
    byId: (achievementId: string) => byId.get(achievementId),
    all: () => source.rules,
  });
}
