import type { AchievementProduct } from './types.ts';

export interface ProductEventMapping {
  product: AchievementProduct;
  sourceProductIds: string[];
  eventTypes: string[];
  requiredSelector: 'cumulativeValue' | 'achievementId' | 'ruleFamily' | 'single-rule';
  verification: string;
}

export const PRODUCT_EVENT_MAPPINGS: readonly ProductEventMapping[] = Object.freeze([
  { product:'Generator', sourceProductIds:['generator'], eventTypes:['generator.turnover.indexed'], requiredSelector:'cumulativeValue', verification:'Eligible indexed turnover evidence.' },
  { product:'FanCommunity', sourceProductIds:['fan'], eventTypes:['fan.rank.status.verified','fan.rank.registered','fan.rank.upgraded','fan.direct.active-count.verified','fan.prize.qualified'], requiredSelector:'achievementId', verification:'Verified Rank, Direct-count or prize evidence; registration and upgrade remain distinct.' },
  { product:'Forecast', sourceProductIds:['forecast'], eventTypes:['forecast.ticket.indexed','forecast.week.qualified','forecast.contributor.qualified','forecast.prize.qualified','forecast.stock-provider.share-qualified'], requiredSelector:'achievementId', verification:'Indexed ticket or verified rule-specific participation evidence.' },
  { product:'SHIELD', sourceProductIds:['shield','insurance'], eventTypes:['shield.policy.fully-paid-count.verified','shield.olympic.qualified','shield.special-award.qualified','shield.sequential.qualified','shield.sequential-set.completed'], requiredSelector:'achievementId', verification:'Verified fully-paid or rule-specific SHIELD evidence.' },
  { product:'STOCK/EES', sourceProductIds:['ees','stock'], eventTypes:['stock.completed.verified'], requiredSelector:'single-rule', verification:'Verified fully completed Electoral Stock evidence.' },
  { product:'ERA', sourceProductIds:['era'], eventTypes:['era.proposal.graded.verified','era.vote.eligible-recorded'], requiredSelector:'achievementId', verification:'Verified proposal grade or eligible recorded vote.' },
  { product:'EID', sourceProductIds:['eid'], eventTypes:['eid.purchase.indexed'], requiredSelector:'single-rule', verification:'Indexed eligible EID purchase evidence.' },
]);

export function canonicalAchievementProduct(sourceProductId: string) {
  return PRODUCT_EVENT_MAPPINGS.find((mapping) => mapping.sourceProductIds.includes(sourceProductId.toLowerCase()))?.product;
}
