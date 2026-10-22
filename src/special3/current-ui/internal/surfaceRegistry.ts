import type { RunBBatch, RunBModule, RunBPattern, RunBSurfaceContract } from './patternTypes';

const rows: ReadonlyArray<readonly [string, RunBModule, RunBPattern, RunBBatch]> = [
  ['/missions', 'achievement', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/progress', 'achievement', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/assets', 'economy', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/earn', 'economy', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/community', 'fan', 'CHAT_COMMUNITY', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/profile/edit', 'profile', 'SETTINGS_FORM', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/profile/community', 'profile', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/profile/achievements', 'profile', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/profile/eid', 'profile', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/profile/certificates', 'profile', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/profile/badges', 'profile', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/profile/trust-score', 'profile', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/profile/access', 'profile', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/transactions', 'economy', 'HISTORY', 'B1_COLLECTION_HISTORY'],
  ['/swap', 'economy', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/achievements', 'achievement', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/achievements/:id', 'achievement', 'DETAIL', 'B2_DETAIL_STATUS_PRIZE'],
  ['/eid', 'eid', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/eid/my-names', 'eid', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/eid/active', 'eid', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/eid/referral', 'eid', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/eid/settings', 'eid', 'SETTINGS_FORM', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/eid/:eidName', 'eid', 'DETAIL', 'B2_DETAIL_STATUS_PRIZE'],
  ['/readiness', 'edge', 'LEARNING', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/certificates', 'edge', 'LEARNING', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/trust-score', 'edge', 'LEARNING', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/generator/generate', 'generator', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/generator/sell', 'generator', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/generator/burn', 'generator', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/generator/donate', 'generator', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/generator/transfer', 'generator', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/generator/history', 'generator', 'HISTORY', 'B1_COLLECTION_HISTORY'],
  ['/fan/join', 'fan', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/fan/upgrade', 'fan', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/fan/renewal', 'fan', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/fan/referrals', 'fan', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/fan/network', 'fan', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/fan/status', 'fan', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/fan/income', 'fan', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/fan/rewards', 'fan', 'PRIZE', 'B2_DETAIL_STATUS_PRIZE'],
  ['/fan/prize-pools', 'fan', 'PRIZE', 'B2_DETAIL_STATUS_PRIZE'],
  ['/fan/legion', 'fan', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/fan/indie', 'fan', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/fan/access', 'fan', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/forecast/enter', 'forecast', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/forecast/tickets', 'forecast', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/forecast/results', 'forecast', 'HISTORY', 'B1_COLLECTION_HISTORY'],
  ['/forecast/claim', 'forecast', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/forecast/savior', 'forecast', 'PRIZE', 'B2_DETAIL_STATUS_PRIZE'],
  ['/forecast/current', 'forecast', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/forecast/history', 'forecast', 'HISTORY', 'B1_COLLECTION_HISTORY'],
  ['/forecast/treasury', 'forecast', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/forecast/my-forecasts', 'forecast', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/forecast/rewards', 'forecast', 'PRIZE', 'B2_DETAIL_STATUS_PRIZE'],
  ['/forecast/contributor', 'forecast', 'PRIZE', 'B2_DETAIL_STATUS_PRIZE'],
  ['/forecast/pools', 'forecast', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/shield/mint', 'shield', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/shield/my-shields', 'shield', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/shield/distribution', 'shield', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/shield/rewards', 'shield', 'PRIZE', 'B2_DETAIL_STATUS_PRIZE'],
  ['/shield/:priceGroup/:tokenId', 'shield', 'DETAIL', 'B2_DETAIL_STATUS_PRIZE'],
  ['/shield/:id', 'shield', 'DETAIL', 'B2_DETAIL_STATUS_PRIZE'],
  ['/shield/inheritance', 'shield', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/shield/buyback', 'shield', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/shield/activity', 'shield', 'HISTORY', 'B1_COLLECTION_HISTORY'],
  ['/shield/status', 'shield', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/stock', 'stock', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/stock/buy', 'stock', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/stock/my-stock', 'stock', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/stock/status', 'stock', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/stock/transfer', 'stock', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/stock/prize', 'stock', 'PRIZE', 'B2_DETAIL_STATUS_PRIZE'],
  ['/stock/dividends', 'stock', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/stock/history', 'stock', 'HISTORY', 'B1_COLLECTION_HISTORY'],
  ['/stock/income', 'stock', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/stock/referrals', 'stock', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/stock/activity', 'stock', 'HISTORY', 'B1_COLLECTION_HISTORY'],
  ['/stock/metadata', 'stock', 'STATUS_ACCESS', 'B2_DETAIL_STATUS_PRIZE'],
  ['/era/proposals', 'era', 'COLLECTION', 'B1_COLLECTION_HISTORY'],
  ['/era/proposals/:id', 'era', 'DETAIL', 'B2_DETAIL_STATUS_PRIZE'],
  ['/era/create', 'era', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/era/vote', 'era', 'ACTION', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
  ['/era/elite', 'era', 'PRIZE', 'B2_DETAIL_STATUS_PRIZE'],
  ['/leaderboard', 'edge', 'LEARNING', 'B3_ACTION_SETTINGS_CHAT_LEARNING'],
];

export const runBSurfaceContracts: ReadonlyArray<RunBSurfaceContract> = rows.map(([route, module, pattern, batch]) => ({ route, module, pattern, batch }));

if (runBSurfaceContracts.length !== 84) throw new Error(`Expected 84 RUN B surface contracts, found ${runBSurfaceContracts.length}`);

const routeExpression = (route: string) => new RegExp(`^${route.split('/').map((part) => part.startsWith(':') ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/')}$`);

const orderedContracts = [...runBSurfaceContracts].sort((a, b) => {
  const aDynamic = a.route.includes(':');
  const bDynamic = b.route.includes(':');
  return Number(aDynamic) - Number(bDynamic) || b.route.split('/').length - a.route.split('/').length;
});

export function resolveRunBSurfaceContract(pathname: string): RunBSurfaceContract | null {
  if (pathname === '/eid/mint') return null;
  return orderedContracts.find((contract) => routeExpression(contract.route).test(pathname)) ?? null;
}
