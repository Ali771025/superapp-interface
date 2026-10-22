import type { TransactionLog } from '../../lib/types';
import type { ProfileProjection } from './profile';

export type ProviderMode = 'preview' | 'live';
export type ProviderState = 'ready' | 'unavailable';

export interface ProviderResult<T> {
  state: ProviderState;
  mode: ProviderMode;
  sourceLabel: string;
  detail: string;
  data: T | null;
}

export interface SpecialNotification {
  id: string;
  kind: 'reward' | 'deadline' | 'governance' | 'confirmation' | 'distribution';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface SpecialTransaction extends TransactionLog {
  network: string;
  gasToken: string;
  explorerUrl?: string;
}

export interface Special3SystemProvider {
  mode: ProviderMode;
  profile: () => ProviderResult<ProfileProjection>;
  economy: () => ProviderResult<{
    portfolio: typeof import('../../data/mockAssets').mockPortfolioValue;
    tokens: typeof import('../../data/mockAssets').mockTokenAssets;
  }>;
  assets: () => ProviderResult<{
    portfolio: typeof import('../../data/mockAssets').mockPortfolioValue;
    tokens: typeof import('../../data/mockAssets').mockTokenAssets;
    shields: typeof import('../../data/mockAssets').mockShields;
    stocks: typeof import('../../data/mockAssets').mockEESStocks;
    user: typeof import('../../data/mockAssets').mockUser;
  }>;
  transactions: () => ProviderResult<SpecialTransaction[]>;
  notifications: () => ProviderResult<SpecialNotification[]>;
  rewards: () => ProviderResult<typeof import('../../data/mockAssets').mockRewards>;
  user: () => ProviderResult<typeof import('../../data/mockAssets').mockUser>;
}
