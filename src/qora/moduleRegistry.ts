import type { QoraCardKind } from './types';

export interface QoraModuleDefinition {
  id: string;
  title: string;
  purpose: string;
  miniKind: QoraCardKind;
  advancedRoute: string;
  requiredInputs: string[];
  riskLevel: 'low' | 'medium' | 'high';
  adapter: string;
  indexedSource: string;
}

export const qoraModuleRegistry: Record<string, QoraModuleDefinition> = {
  wallet: { id: 'wallet', title: 'Wallet connection', purpose: 'Connect identity to Polygon', miniKind: 'wallet', advancedRoute: '/settings', requiredInputs: [], riskLevel: 'low', adapter: 'provider.ts', indexedSource: 'wallet state' },
  assets: { id: 'assets', title: 'Asset summary', purpose: 'Understand balances and ownership', miniKind: 'asset', advancedRoute: '/assets', requiredInputs: ['wallet'], riskLevel: 'low', adapter: 'indexed portfolio service', indexedSource: 'portfolio index' },
  generator: { id: 'generator', title: 'ETER Generator', purpose: 'Generate and manage ETER', miniKind: 'transaction', advancedRoute: '/generator', requiredInputs: ['amount', 'paymentToken'], riskLevel: 'high', adapter: 'generatorAdapter.ts', indexedSource: 'Generator events' },
  swap: { id: 'swap', title: 'Token Swap', purpose: 'Exchange supported Polygon assets', miniKind: 'transaction', advancedRoute: '/swap', requiredInputs: ['sourceToken', 'targetToken', 'amount'], riskLevel: 'high', adapter: 'swapAdapter.ts', indexedSource: 'swap transaction index' },
  rewards: { id: 'rewards', title: 'Reward review', purpose: 'Review verified Economy reward sources', miniKind: 'transaction', advancedRoute: '/earn', requiredInputs: ['wallet', 'rewardId'], riskLevel: 'medium', adapter: 'product adapters', indexedSource: 'reward index' },
  shield: { id: 'shield', title: 'SHIELD', purpose: 'Create or manage protection ownership', miniKind: 'product', advancedRoute: '/shield', requiredInputs: ['tier', 'paymentToken'], riskLevel: 'high', adapter: 'insuranceAdapter.ts', indexedSource: 'SHIELD events' },
  forecast: { id: 'forecast', title: 'Forecast', purpose: 'Review and enter weekly prediction', miniKind: 'product', advancedRoute: '/forecast', requiredInputs: ['selection', 'entryType'], riskLevel: 'high', adapter: 'forecastAdapter.ts', indexedSource: 'Forecast events' },
  fan: { id: 'fan', title: 'FAN Community', purpose: 'Join and grow a responsible network', miniKind: 'referral', advancedRoute: '/fan', requiredInputs: ['slot'], riskLevel: 'medium', adapter: 'fanAdapter.ts', indexedSource: 'FAN index' },
  ees: { id: 'ees', title: 'STOCK', purpose: 'Own stock, voting rights and dividend eligibility', miniKind: 'product', advancedRoute: '/stock/buy', requiredInputs: ['multiplier', 'paymentToken'], riskLevel: 'high', adapter: 'eesAdapter.ts', indexedSource: 'STOCK events' },
  era: { id: 'era', title: 'ERA Governance', purpose: 'Understand and vote on proposals', miniKind: 'vote', advancedRoute: '/era', requiredInputs: ['proposalId', 'choice'], riskLevel: 'high', adapter: 'eraAdapter.ts', indexedSource: 'governance index' },
  eid: { id: 'eid', title: 'EID', purpose: 'Create the unified ETERNITY identity', miniKind: 'identity', advancedRoute: '/eid', requiredInputs: ['name'], riskLevel: 'medium', adapter: 'eidAdapter.ts', indexedSource: 'EID index' },
  edge: { id: 'edge', title: 'EDGE Learning', purpose: 'Learn a concept at the moment it matters', miniKind: 'learning', advancedRoute: '/readiness', requiredInputs: ['lessonId'], riskLevel: 'low', adapter: 'learning service', indexedSource: 'learning progress' },
};
