import { IS_PREVIEW_MODE } from '../../../lib/contracts/contractConfig';
import { liveProductProvider } from './liveProductProvider';
import { previewProductProvider } from './preview/provider';

export type { ProductPresentationProvider, ProductProviderMode } from './contracts';
export const productPresentationProvider = IS_PREVIEW_MODE ? previewProductProvider : liveProductProvider;
export const productData = productPresentationProvider.data;
export const productActions = productPresentationProvider.actions;
