import type { ProviderResult, Special3SystemProvider } from './contracts';

const unavailable = <T,>(detail: string): ProviderResult<T> => ({
  state:'unavailable', mode:'live', sourceLabel:'Live provider', detail, data:null,
});

export const liveSystemProvider: Special3SystemProvider = {
  mode:'live',
  profile: () => unavailable('Verified Profile projection provider is not configured.'),
  economy: () => unavailable('Verified portfolio provider is not configured.'),
  assets: () => unavailable('Verified asset and ownership provider is not configured.'),
  transactions: () => unavailable('Verified transaction history provider is not configured.'),
  notifications: () => unavailable('Live notification provider is not configured.'),
  rewards: () => unavailable('Verified reward availability provider is not configured.'),
  user: () => unavailable('Connected identity provider is not configured.'),
};
