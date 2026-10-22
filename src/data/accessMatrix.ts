import type { FanLevel } from '../lib/types';

export type AccessLevelKey = 'none' | 'fan0' | 'star1' | 'star2' | 'star3' | 'star4' | 'indie';

export interface AccessLevel {
  key: AccessLevelKey;
  fanLevel: FanLevel;
  label: string;
  stars: number;
  subscriptionFeeUSD: number;
  totalPathUSD: number;
  color: string;
  bgColor: string;
}

export interface AccessFeature {
  id: string;
  label: string;
  description: string;
  category: 'core' | 'income' | 'prizes' | 'advanced' | 'subscription';
  minLevel: AccessLevelKey;
}

export const ACCESS_LEVELS: AccessLevel[] = [
  { key: 'none',  fanLevel: 'none',   label: 'Non-FAN',     stars: 0, subscriptionFeeUSD: 0,   totalPathUSD: 0,   color: 'text-primary-500',        bgColor: 'bg-primary-500/10' },
  { key: 'fan0',  fanLevel: 'fan',    label: '0-Star FAN',  stars: 0, subscriptionFeeUSD: 0,   totalPathUSD: 0,   color: 'text-primary-500',        bgColor: 'bg-primary-500/10' },
  { key: 'star1', fanLevel: '1star',  label: '1-Star FAN',  stars: 1, subscriptionFeeUSD: 10,  totalPathUSD: 10,  color: 'text-primary-500',     bgColor: 'bg-primary-500/10' },
  { key: 'star2', fanLevel: '2star',  label: '2-Star FAN',  stars: 2, subscriptionFeeUSD: 50,  totalPathUSD: 50,  color: 'text-success-DEFAULT', bgColor: 'bg-success-DEFAULT/10' },
  { key: 'star3', fanLevel: '3star',  label: '3-Star FAN',  stars: 3, subscriptionFeeUSD: 210, totalPathUSD: 210, color: 'text-warning-DEFAULT', bgColor: 'bg-warning-DEFAULT/10' },
  { key: 'star4', fanLevel: '4star',  label: '4-Star FAN',  stars: 4, subscriptionFeeUSD: 910, totalPathUSD: 910, color: 'text-primary-500',       bgColor: 'bg-primary-500/10' },
  { key: 'indie', fanLevel: 'indie',  label: 'Indie FAN',   stars: 4, subscriptionFeeUSD: 910, totalPathUSD: 910, color: 'text-accent-DEFAULT',   bgColor: 'bg-accent-DEFAULT/10' },
];

const LEVEL_ORDER: AccessLevelKey[] = ['none', 'fan0', 'star1', 'star2', 'star3', 'star4', 'indie'];

export function getLevelIndex(key: AccessLevelKey): number {
  return LEVEL_ORDER.indexOf(key);
}

export function isFeatureUnlocked(feature: AccessFeature, userLevel: AccessLevelKey): boolean {
  if (feature.minLevel === 'none') return true;
  // indie has equivalent access to star4
  if (userLevel === 'indie') {
    const indieLevelIdx = getLevelIndex('star4');
    const requiredIdx = getLevelIndex(feature.minLevel);
    return indieLevelIdx >= requiredIdx;
  }
  return getLevelIndex(userLevel) >= getLevelIndex(feature.minLevel);
}

export function getUnlockedFeatures(userLevel: AccessLevelKey): AccessFeature[] {
  return ACCESS_FEATURES.filter((f) => isFeatureUnlocked(f, userLevel));
}

export function getNewlyUnlockedFeatures(fromLevel: AccessLevelKey, toLevel: AccessLevelKey): AccessFeature[] {
  return ACCESS_FEATURES.filter(
    (f) => !isFeatureUnlocked(f, fromLevel) && isFeatureUnlocked(f, toLevel)
  );
}

export function fanLevelToAccessKey(fanLevel: FanLevel): AccessLevelKey {
  const map: Partial<Record<FanLevel, AccessLevelKey>> = {
    none: 'none',
    fan: 'fan0',
    '1star': 'star1',
    '2star': 'star2',
    '3star': 'star3',
    '4star': 'star4',
    indie: 'indie',
    legioner: 'star4',
    legend: 'star4',
    elitelegend: 'star4',
  };
  return map[fanLevel] ?? 'none';
}

export const ACCESS_FEATURES: AccessFeature[] = [
  { id: 'eter-exchange',     label: 'ETER Exchange',              description: 'Buy, sell, burn, donate and transfer ETER tokens',                    category: 'core',         minLevel: 'none' },
  { id: 'forecast',          label: 'FORECAST',                   description: 'Access the Forecast Product; its provider owns final participation eligibility', category: 'core', minLevel: 'none' },
  { id: 'referral',          label: 'Referral',                   description: 'Use the referral and invitation capability; bonus economics require above-0-Star', category: 'core', minLevel: 'fan0' },
  { id: 'eip',               label: 'EIP',                        description: 'Discover the existing EIP Product route; its provider owns final eligibility', category: 'advanced', minLevel: 'fan0' },
  { id: 'eid',               label: 'EID',                        description: 'Register and own Eternity Identity Names through the EID Product',       category: 'core',         minLevel: 'fan0' },
  { id: 'qdrop',             label: 'QDrop',                      description: 'Receive QORA token airdrops and community distributions',               category: 'income',       minLevel: 'fan0' },
  { id: 'fan-income',        label: 'FAN Income',                 description: 'Earn ongoing income from your FAN network activity',                    category: 'income',       minLevel: 'star1' },
  { id: '1star-prize',       label: 'One-star Prize',             description: 'Eligible for 1-star level ecosystem prize draws',                       category: 'prizes',       minLevel: 'star1' },
  { id: 'forecast-discount',        label: 'Forecast Discount',          description: 'FAN-level access metadata only; Forecast provider owns the calculation', category: 'income',  minLevel: 'star1' },
  { id: 'forecast-winners-bonus',   label: "FORECAST Winner's Bonus",   description: 'FAN-level access metadata only; Forecast provider owns the outcome',     category: 'prizes',  minLevel: 'star1' },
  { id: '2star-prize',              label: 'Two-star Prize',              description: 'Eligible for 2-star level ecosystem prize draws',                       category: 'prizes',  minLevel: 'star2' },
  { id: '2layer-matching',          label: 'Two-layer Matching Bonus',    description: 'Earn matching bonuses 2 levels deep in your referral network',           category: 'income',  minLevel: 'star2' },
  { id: 'eip-sales-bonus',          label: 'EIP Sales Bonus',             description: 'Additional bonus from EIP feature sales within your network',           category: 'income',  minLevel: 'star2' },
  { id: 'ees',                      label: 'EES',                         description: 'FAN-level access starts here; frozen STOCK owns purchase eligibility',  category: 'advanced', minLevel: 'star2' },
  { id: 'ees-referrer-bonus',   label: "EES Referrer's Bonus",    description: 'FAN-level access metadata; frozen STOCK owns the actual bonus',            category: 'income',  minLevel: 'star2' },
  { id: '3star-prize',          label: 'Three-star Prize',        description: 'Eligible for 3-star level ecosystem prize draws',                       category: 'prizes',  minLevel: 'star3' },
  { id: '3layer-matching',      label: 'Three-layer Matching Bonus', description: 'Earn matching bonuses 3 levels deep in your referral network',       category: 'income',  minLevel: 'star3' },
  { id: 'starred-savior',       label: 'Starred SAVIOR',          description: 'FAN-level access starts here; Forecast owns the actual Savior result',   category: 'advanced', minLevel: 'star3' },
  { id: 'eits-prize',       label: 'EITS Prize',               description: 'FAN-level access starts here; frozen SHIELD owns complete eligibility',    category: 'prizes',  minLevel: 'star3' },
  { id: '4star-prize',      label: 'Four-star Prize',          description: 'Eligible for 4-star level ecosystem prize draws',                       category: 'prizes',  minLevel: 'star4' },
  { id: '4layer-matching',  label: 'Four-layer Matching Bonus', description: 'Earn matching bonuses 4 levels deep in your referral network',         category: 'income',  minLevel: 'star4' },
  { id: 'sub-legioner',     label: 'Sub-Legioner',             description: 'Access Sub-Legioner status with Legioner-level perks',                   category: 'advanced', minLevel: 'star4' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core Features',
  income: 'Income & Bonuses',
  prizes: 'Prizes',
  advanced: 'Advanced Access',
  subscription: 'Subscription',
};
