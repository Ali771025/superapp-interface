import type { ProviderResult } from '../contracts';
import type { SourceFreshness } from '../../interaction';

export interface ContractCatalogEntry {
  id: string;
  label: string;
  network: string;
  standard: string;
  address: string;
}

export interface ArticleRecord {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  category: string;
  tags: string[];
  author: string;
  verified: boolean;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  echoes: number;
  cover: string;
}

export type LeaderboardTimeFilter = 'Daily' | 'Weekly' | 'Monthly' | 'All-time';
export type LeaderboardMovement = 'up' | 'down' | 'same';
export interface LeaderboardRankingBasis {
  label: string;
  unit: string;
  detail: string;
  formulaStatus: 'available' | 'unavailable';
}
export interface LeaderboardEntry {
  rank: number;
  username: string;
  eid: string;
  level?: number;
  totalPersonalEq?: number;
  rankValue: number;
  rankUnit: string;
  movement?: LeaderboardMovement;
  isCurrentUser?: boolean;
}
export interface LeaderboardCurrentUserPosition {
  rank: number;
  eid: string;
  label: 'Preview position' | 'Live position';
}
export interface LeaderboardDataset {
  period: LeaderboardTimeFilter;
  entries: LeaderboardEntry[];
  source: SourceFreshness;
  rankingBasis: LeaderboardRankingBasis;
  currentUserPosition?: LeaderboardCurrentUserPosition;
}

export interface PublicSurfaceProvider {
  mode: 'preview' | 'live';
  contractCatalog: () => ProviderResult<{ entries: ContractCatalogEntry[]; source: SourceFreshness }>;
  articles: () => ProviderResult<{ entries: ArticleRecord[]; source: SourceFreshness; publishing: { canPublish: false; reason: string } }>;
  leaderboard: (filter: LeaderboardTimeFilter) => ProviderResult<LeaderboardDataset>;
}
