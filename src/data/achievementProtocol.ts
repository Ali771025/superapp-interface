export type AchievementProductId =
  | 'generator'
  | 'fan'
  | 'forecast'
  | 'shield'
  | 'stock'
  | 'era'
  | 'eid';

export type AchievementUnit = 'USD' | 'ticket' | 'week' | 'qualification' | 'policy' | 'stock' | 'vote' | 'eid' | 'rank' | 'direct' | 'prize' | 'proposal' | 'set';

export interface AchievementMilestone {
  id: string;
  label: string;
  threshold: number;
  unit: AchievementUnit;
  eq: number;
  qualifier?: string;
  note?: string;
}

export interface AchievementTrack {
  id: string;
  title: string;
  description: string;
  progress?: number;
  progressLabel?: string;
  milestones: AchievementMilestone[];
}

export interface AchievementProduct {
  id: AchievementProductId;
  name: string;
  shortName: string;
  philosophy: string;
  policy: string;
  accent: string;
  route: string;
  tracks: AchievementTrack[];
}

export interface ProtocolLevel {
  level: number;
  minEQ: number;
}

const milestones = (
  prefix: string,
  thresholds: number[],
  eq: number[],
  unit: AchievementUnit,
  label: (threshold: number) => string,
): AchievementMilestone[] => thresholds.map((threshold, index) => ({
  id: `${prefix}-${threshold}`,
  threshold,
  unit,
  eq: eq[index],
  label: label(threshold),
}));

export const PROTOCOL_LEVELS: ProtocolLevel[] = [
  100, 250, 600, 1_500, 3_500, 7_500, 15_000, 30_000, 55_000,
  85_000, 140_000, 210_000, 310_000, 440_000, 600_000, 800_000,
  1_100_000, 1_450_000, 1_900_000,
].map((minEQ, index) => ({ level: index + 1, minEQ }));

export const ACHIEVEMENT_PRODUCTS: AchievementProduct[] = [
  {
    id: 'generator',
    name: 'Generator',
    shortName: 'Generator',
    philosophy: 'Rewards direct economic value created through ETER activity.',
    policy: 'Tracked from protocol activation. Earlier turnover is not credited.',
    accent: '#F4C300',
    route: '/generator',
    tracks: [{
      id: 'turnover',
      title: 'Generator turnover',
      description: 'Combined buy, sell and transfer volume in USD.',
      progress: 2_400,
      progressLabel: '$2,400 indexed',
      milestones: milestones('generator-turnover', [10, 50, 200, 1_000, 5_000, 20_000, 100_000], [10, 50, 200, 1_000, 5_000, 20_000, 100_000], 'USD', (n) => `$${n.toLocaleString()} turnover`),
    }],
  },
  {
    id: 'fan',
    name: 'FAN Community',
    shortName: 'FAN',
    philosophy: 'Rewards network growth, leadership and ecosystem income milestones.',
    policy: 'Personal and network progress is tracked from the user’s current state onward.',
    accent: '#8B7CFF',
    route: '/fan',
    tracks: [
      {
        id: 'personal-rank',
        title: 'Personal rank',
        description: 'Registration and upgrade milestones are accounted for separately.',
        progress: 2,
        progressLabel: '2-star registered',
        milestones: [
          { id: 'fan-rank-0', label: 'Zero star', threshold: 0, unit: 'rank', eq: 10, qualifier: 'Current status' },
          { id: 'fan-rank-1-register', label: '1-star registration', threshold: 1, unit: 'rank', eq: 50, qualifier: 'Registration' },
          { id: 'fan-rank-1-upgrade', label: 'Upgrade to 1 star', threshold: 1, unit: 'rank', eq: 40, qualifier: 'Upgrade' },
          { id: 'fan-rank-2-register', label: '2-star registration', threshold: 2, unit: 'rank', eq: 200, qualifier: 'Registration' },
          { id: 'fan-rank-2-upgrade', label: 'Upgrade to 2 stars', threshold: 2, unit: 'rank', eq: 150, qualifier: 'Upgrade' },
          { id: 'fan-rank-3-register', label: '3-star registration', threshold: 3, unit: 'rank', eq: 800, qualifier: 'Registration' },
          { id: 'fan-rank-3-upgrade', label: 'Upgrade to 3 stars', threshold: 3, unit: 'rank', eq: 600, qualifier: 'Upgrade' },
          { id: 'fan-rank-4-upgrade', label: 'Upgrade to 4 stars', threshold: 4, unit: 'rank', eq: 2_000, qualifier: 'Upgrade' },
          { id: 'fan-rank-4-existing', label: 'Existing 4-star member', threshold: 4, unit: 'rank', eq: 2_800, qualifier: 'Current status' },
        ],
      },
      {
        id: 'directs',
        title: 'Direct referrals',
        description: 'Active first-line members in the user’s community.',
        progress: 6,
        progressLabel: '6 active directs',
        milestones: milestones('fan-direct', [1, 4, 10, 30, 60, 100], [10, 40, 100, 300, 600, 1_000], 'direct', (n) => `${n} direct${n === 1 ? '' : 's'}`),
      },
      {
        id: 'prizes',
        title: 'Community prizes',
        description: 'EQ awarded when a qualifying community prize is earned.',
        milestones: [
          { id: 'fan-prize-1', label: '1-star prize', threshold: 1, unit: 'prize', eq: 1_000 },
          { id: 'fan-prize-2', label: '2-star prize', threshold: 2, unit: 'prize', eq: 2_000 },
          { id: 'fan-prize-3', label: '3-star prize', threshold: 3, unit: 'prize', eq: 4_000 },
          { id: 'fan-prize-4', label: '4-star prize', threshold: 4, unit: 'prize', eq: 8_000 },
          { id: 'fan-prize-legend-star', label: 'Starred Legend prize', threshold: 5, unit: 'prize', eq: 8_000 },
          { id: 'fan-prize-leg', label: 'Leg prize', threshold: 6, unit: 'prize', eq: 5_000 },
        ],
      },
    ],
  },
  {
    id: 'forecast',
    name: 'Forecast',
    shortName: 'Forecast',
    philosophy: 'Rewards consistent participation and demonstrated forecasting skill.',
    policy: 'Tickets, active weeks and qualifications are counted from protocol activation.',
    accent: '#0085C7',
    route: '/forecast',
    tracks: [
      {
        id: 'tickets', title: 'Forecast tickets', description: 'Total eligible prediction tickets entered.', progress: 12, progressLabel: '12 tickets',
        milestones: milestones('forecast-ticket', [1, 3, 5, 10, 50, 100], [10, 30, 50, 100, 500, 1_000], 'ticket', (n) => `${n} ticket${n === 1 ? '' : 's'}`),
      },
      {
        id: 'weeks', title: 'Active weeks', description: 'Weeks with at least one qualifying Forecast entry.', progress: 4, progressLabel: '4 active weeks',
        milestones: milestones('forecast-week', [1, 3, 10, 20, 30, 40, 50], [20, 60, 200, 400, 600, 800, 1_000], 'week', (n) => `${n} active week${n === 1 ? '' : 's'}`),
      },
      {
        id: 'contributor', title: 'Contributor qualifications', description: 'Number of times the user qualifies as a contributor.', progress: 1, progressLabel: '1 qualification',
        milestones: milestones('forecast-contributor', [1, 3, 5, 10, 20, 30, 40], [200, 600, 1_000, 2_000, 4_000, 6_000, 8_000], 'qualification', (n) => `${n} qualification${n === 1 ? '' : 's'}`),
      },
      {
        id: 'forecast-prizes', title: 'Forecast prizes', description: 'Recognition for high-skill Forecast outcomes.',
        milestones: [
          { id: 'forecast-savior', label: 'Savior', threshold: 1, unit: 'prize', eq: 2_000 },
          { id: 'forecast-savior-star', label: 'Starred Savior', threshold: 2, unit: 'prize', eq: 5_000 },
        ],
      },
      {
        id: 'stock-provider', title: 'Stock provider', description: 'EQ is issued for each qualifying provider share.', progress: 0, progressLabel: 'No provider shares yet',
        milestones: [{ id: 'forecast-stock-provider', label: 'Per provider share', threshold: 1, unit: 'stock', eq: 2_000, note: 'Repeatable for every qualifying share.' }],
      },
    ],
  },
  {
    id: 'shield',
    name: 'Insurance',
    shortName: 'SHIELD',
    philosophy: 'Rewards trust, long-term commitment and responsible risk management.',
    policy: 'Only fully paid insurance policies count toward policy milestones.',
    accent: '#009F3D',
    route: '/shield',
    tracks: [
      {
        id: 'shield-100', title: '$100 policies', description: 'Fully paid policies in the $100 group.', progress: 5, progressLabel: '5 fully paid',
        milestones: milestones('shield-100', [1, 5, 20, 40], [200, 1_000, 4_000, 8_000], 'policy', (n) => `${n} fully paid polic${n === 1 ? 'y' : 'ies'}`),
      },
      {
        id: 'shield-1000', title: '$1,000 policies', description: 'Fully paid policies in the $1,000 group.', progress: 1, progressLabel: '1 fully paid',
        milestones: milestones('shield-1000', [1, 5, 10, 20], [2_000, 10_000, 40_000, 80_000], 'policy', (n) => `${n} fully paid polic${n === 1 ? 'y' : 'ies'}`),
      },
      {
        id: 'shield-10000', title: '$10,000 policies', description: 'Fully paid policies in the $10,000 group.', progress: 0, progressLabel: 'No fully paid policies yet',
        milestones: milestones('shield-10000', [1, 3, 5, 10], [20_000, 60_000, 100_000, 200_000], 'policy', (n) => `${n} fully paid polic${n === 1 ? 'y' : 'ies'}`),
      },
      {
        id: 'olympic', title: 'Olympic milestones', description: 'Qualifying Olympic achievements by policy group.',
        milestones: [
          { id: 'shield-olympic-100', label: '$100 Olympic', threshold: 100, unit: 'prize', eq: 4_000 },
          { id: 'shield-olympic-1000', label: '$1,000 Olympic', threshold: 1_000, unit: 'prize', eq: 40_000 },
          { id: 'shield-olympic-10000', label: '$10,000 Olympic', threshold: 10_000, unit: 'prize', eq: 400_000 },
        ],
      },
      {
        id: 'special-insurance', title: 'Special insurance awards', description: 'Protocol-defined insurance and sequential awards.',
        milestones: [
          { id: 'shield-et-prize', label: 'ET Prize', threshold: 1, unit: 'prize', eq: 500 },
          { id: 'shield-sequential-a', label: 'Sequential A', threshold: 1, unit: 'set', eq: 3_000 },
          { id: 'shield-sequential-b', label: 'Sequential B', threshold: 2, unit: 'set', eq: 1_000 },
          { id: 'shield-sequential-c', label: 'Sequential C', threshold: 3, unit: 'set', eq: 1_000 },
          { id: 'shield-sequential-d', label: 'Sequential D', threshold: 4, unit: 'set', eq: 1_000 },
          { id: 'shield-sequential-e', label: 'Sequential E', threshold: 5, unit: 'set', eq: 500 },
          { id: 'shield-sequential-set', label: 'Complete set of five', threshold: 5, unit: 'set', eq: 7_000, note: 'Additional bonus for each complete set.' },
        ],
      },
    ],
  },
  {
    id: 'stock',
    name: 'Electoral Stock',
    shortName: 'Stock',
    philosophy: 'Rewards strategic ownership and growth of the electoral stock ecosystem.',
    policy: 'The reward is repeatable for each completed stock.',
    accent: '#DF0024',
    route: '/stock',
    tracks: [{
      id: 'stock-complete', title: 'Completed stock', description: 'Every fully completed electoral stock.', progress: 1, progressLabel: '1 completed stock',
      milestones: [{ id: 'stock-each-complete', label: 'Per completed stock', threshold: 1, unit: 'stock', eq: 2_000, note: 'Repeatable for every completed stock.' }],
    }],
  },
  {
    id: 'era',
    name: 'ERA Governance',
    shortName: 'ERA',
    philosophy: 'Rewards active participation in decentralized ecosystem governance.',
    policy: 'Proposal rewards follow their on-chain grade; every eligible vote earns EQ.',
    accent: '#EA7A35',
    route: '/era',
    tracks: [
      {
        id: 'proposals', title: 'Submitted proposals', description: 'EQ by the final grade of each submitted proposal.',
        milestones: [
          { id: 'era-proposal-a', label: 'Proposal grade A', threshold: 1, unit: 'proposal', eq: 5_000, qualifier: 'Per proposal' },
          { id: 'era-proposal-b', label: 'Proposal grade B', threshold: 1, unit: 'proposal', eq: 3_000, qualifier: 'Per proposal' },
          { id: 'era-proposal-c', label: 'Proposal grade C', threshold: 1, unit: 'proposal', eq: 1_000, qualifier: 'Per proposal' },
        ],
      },
      {
        id: 'votes', title: 'Voting participation', description: 'Every eligible governance vote.', progress: 2, progressLabel: '2 eligible votes',
        milestones: [{ id: 'era-vote-each', label: 'Per eligible vote', threshold: 1, unit: 'vote', eq: 100, note: 'Repeatable for every eligible vote.' }],
      },
    ],
  },
  {
    id: 'eid',
    name: 'EID Identity',
    shortName: 'EID',
    philosophy: 'Rewards broader identity ownership across the ETERNITY ecosystem.',
    policy: 'Each purchased EID earns EQ, up to a maximum of 20 EIDs.',
    accent: '#5170FF',
    route: '/eid',
    tracks: [{
      id: 'eid-purchases', title: 'EID purchases', description: 'Purchased identity names, capped at 20.', progress: 1, progressLabel: '1 of 20 EIDs',
      milestones: [{ id: 'eid-each', label: 'Per purchased EID', threshold: 1, unit: 'eid', eq: 20, note: 'Repeatable up to 20 purchases (400 EQ maximum).' }],
    }],
  },
];

export const EQ_LEDGER = [
  { id: 'eq-1', product: 'stock' as AchievementProductId, label: 'Completed electoral stock', source: 'Personal EQ', amount: 2_000, date: 'Jul 18, 2026', status: 'confirmed' as const },
  { id: 'eq-2', product: 'shield' as AchievementProductId, label: 'Five fully paid $100 policies', source: 'Personal EQ', amount: 1_000, date: 'Jul 14, 2026', status: 'confirmed' as const },
  { id: 'eq-3', product: 'generator' as AchievementProductId, label: '$1,000 Generator turnover', source: 'Personal EQ', amount: 1_000, date: 'Jul 11, 2026', status: 'confirmed' as const },
  { id: 'eq-4', product: 'forecast' as AchievementProductId, label: 'First contributor qualification', source: 'Personal EQ', amount: 200, date: 'Jul 08, 2026', status: 'confirmed' as const },
  { id: 'eq-5', product: 'fan' as AchievementProductId, label: '2-star registration', source: 'Personal EQ', amount: 200, date: 'Jul 03, 2026', status: 'confirmed' as const },
  { id: 'eq-6', product: 'era' as AchievementProductId, label: 'Two eligible votes', source: 'Personal EQ', amount: 200, date: 'Jun 28, 2026', status: 'confirmed' as const },
  { id: 'eq-7', product: 'forecast' as AchievementProductId, label: 'Ten Forecast tickets', source: 'Personal EQ', amount: 100, date: 'Jun 22, 2026', status: 'confirmed' as const },
  { id: 'eq-8', product: 'forecast' as AchievementProductId, label: 'Three active weeks', source: 'Personal EQ', amount: 60, date: 'Jun 16, 2026', status: 'confirmed' as const },
  { id: 'eq-9', product: 'fan' as AchievementProductId, label: 'Four active directs', source: 'Personal EQ', amount: 40, date: 'Jun 12, 2026', status: 'confirmed' as const },
  { id: 'eq-10', product: 'eid' as AchievementProductId, label: 'Purchased EID', source: 'Personal EQ', amount: 20, date: 'Jun 04, 2026', status: 'confirmed' as const },
];

export const REFERRAL_EQ_ROWS = [
  { id: 'ref-1', eid: 'NOVA.ETER', level: 4, userLevel: 5, baseEQ: 600, bonusEQ: 60, eligible: true },
  { id: 'ref-2', eid: 'ORBIT.ETER', level: 5, userLevel: 5, baseEQ: 250, bonusEQ: 25, eligible: true },
  { id: 'ref-3', eid: 'LYRA.ETER', level: 7, userLevel: 5, baseEQ: 1_000, bonusEQ: 0, eligible: false },
];

export function getLevelState(totalEQ: number) {
  const reached = PROTOCOL_LEVELS.filter((item) => totalEQ >= item.minEQ);
  const current = reached[reached.length - 1] ?? { level: 0, minEQ: 0 };
  const next = PROTOCOL_LEVELS.find((item) => item.level === current.level + 1);
  const range = next ? next.minEQ - current.minEQ : 1;
  const progress = next ? Math.min(100, Math.max(0, ((totalEQ - current.minEQ) / range) * 100)) : 100;
  return { current, next, progress };
}

export function getTrackState(track: AchievementTrack) {
  if (track.progress === undefined) return { completed: 0, total: track.milestones.length, next: track.milestones[0], progress: 0 };
  const completed = track.milestones.filter((item) => track.progress! >= item.threshold).length;
  const next = track.milestones.find((item) => track.progress! < item.threshold);
  const previousThreshold = [...track.milestones].reverse().find((item) => track.progress! >= item.threshold)?.threshold ?? 0;
  const progress = next ? Math.min(100, ((track.progress - previousThreshold) / Math.max(1, next.threshold - previousThreshold)) * 100) : 100;
  return { completed, total: track.milestones.length, next, progress };
}
