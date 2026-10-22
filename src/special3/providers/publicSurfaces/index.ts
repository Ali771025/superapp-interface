import { IS_PREVIEW_MODE } from '../../../lib/contracts/contractConfig';
import { livePublicSurfaceProvider } from './live';
import { previewPublicSurfaceProvider } from './preview';

export type { ArticleRecord, ContractCatalogEntry, LeaderboardCurrentUserPosition, LeaderboardDataset, LeaderboardEntry, LeaderboardMovement, LeaderboardRankingBasis, LeaderboardTimeFilter, PublicSurfaceProvider } from './contracts';
export const publicSurfaceProvider = IS_PREVIEW_MODE ? previewPublicSurfaceProvider : livePublicSurfaceProvider;
export const publicSurfaceProviders = { preview:previewPublicSurfaceProvider, live:livePublicSurfaceProvider } as const;
