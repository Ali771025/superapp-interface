import { special3SystemProvider } from '../providers';
import { productPresentationProvider } from '../providers/products';

/**
 * Presentation-only projection for the convergence layer.
 * Product data remains owned by the configured system/product providers; React
 * pages never import preview fixtures directly.
 */
const product = productPresentationProvider.data;
const economyResult = special3SystemProvider.economy();
const profileResult = special3SystemProvider.profile();

export const convergenceViewModel = {
  mode: productPresentationProvider.mode,
  sourceLabel: productPresentationProvider.mode === 'preview' ? 'Preview provider' : 'Live provider',
  user: product.user,
  achievement: {
    level: profileResult.data?.progress.level ?? 0,
    eqPoints: profileResult.data?.progress.personalEq ?? 0,
    completedTasks: profileResult.data?.progress.completedAchievements ?? 0,
    activeTasks: profileResult.data?.progress.activeAchievements ?? 0,
    progressPercent: profileResult.data?.progress.progressPercent ?? 0,
    nextLevelRequired: profileResult.data?.progress.nextLevelRequired ?? 0,
    nextTask: 'Secure your wallet',
  },
  portfolio: economyResult.data?.portfolio ?? { total: 0, change24h: 0 },
  tokenAssets: economyResult.data?.tokens ?? [],
  fanProfile: product.fanProfile,
  currentForecast: product.currentForecast,
  forecastEntries: product.forecastEntries,
  ownedEids: product.ownedEids,
  shields: product.shields,
  proposals: product.proposals,
  stocks: product.stocks,
  rewards: product.rewards,
  ecosystemStats: product.ecosystemStats,
  transactionLogs: product.transactionLogs,
  availability: {
    economy: economyResult.state,
    profile: profileResult.state,
    products: productPresentationProvider.available ? 'ready' : 'unavailable',
  },
} as const;

export type ConvergenceViewModel = typeof convergenceViewModel;
