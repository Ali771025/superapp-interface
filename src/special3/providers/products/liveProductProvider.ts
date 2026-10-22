import type { ProductActionMap, ProductPresentationData, ProductPresentationProvider } from './contracts';

const reason = 'Verified Product integration is required. Preview fixtures and mock actions are unavailable in Live mode.';
const fail = async () => { throw new Error(reason); };
const unavailableActions = new Proxy({}, { get:() => new Proxy({}, { get:() => fail }) }) as ProductActionMap;
// Property reads stay inert so route modules can load; the presentation gate renders the explicit unavailable state.
const unavailableData = new Proxy({}, { get:() => undefined }) as ProductPresentationData;

/** Fail-closed Live provider. This file imports no Preview fixture or mock adapter implementation. */
export const liveProductProvider: ProductPresentationProvider = { mode:'live', available:false, reason, data:unavailableData, actions:unavailableActions };
