import type { ProviderResult } from '../contracts';
import type { PublicSurfaceProvider } from './contracts';

const unavailable = <T,>(detail:string): ProviderResult<T> => ({ state:'unavailable', mode:'live', sourceLabel:'Live provider', detail, data:null });

export const livePublicSurfaceProvider: PublicSurfaceProvider = {
  mode:'live',
  contractCatalog: () => unavailable('Verified contract data unavailable. An audited contract/indexer provider is not configured.'),
  articles: () => unavailable('Verified editorial provider unavailable. No Preview article fallback is used in Live mode.'),
  leaderboard: () => unavailable('Live leaderboard unavailable. An authoritative ranking provider is not configured.'),
};
