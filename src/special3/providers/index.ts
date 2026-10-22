import { IS_PREVIEW_MODE } from '../../lib/contracts/contractConfig';
import { liveSystemProvider } from './live';
import { previewSystemProvider } from './preview';

export type { ProviderResult, Special3SystemProvider, SpecialNotification, SpecialTransaction } from './contracts';
export const special3SystemProvider = IS_PREVIEW_MODE ? previewSystemProvider : liveSystemProvider;
