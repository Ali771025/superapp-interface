import { CHAIN_CONFIG } from '../../lib/contracts/contractConfig';
import { mockEESStocks, mockPortfolioValue, mockRewards, mockShields, mockTokenAssets, mockUser } from '../../data/mockAssets';
import { mockTransactionLogs } from '../../data/mockLogs';
import type { Special3SystemProvider, SpecialNotification } from './contracts';
import { getPreviewProfileProjection } from './profilePreviewData';

const notifications: SpecialNotification[] = [
  { id:'n1', kind:'reward', title:'Reward ready to claim', body:'Your FAN direct bonus of 45.5 ETER is claimable.', time:'2m ago', read:false },
  { id:'n2', kind:'deadline', title:'Forecast closes in 8 hours', body:'Week 28 prediction window is about to close.', time:'1h ago', read:false },
  { id:'n3', kind:'governance', title:'New governance proposal', body:'Reduce Generator Buy Fee is now open for review.', time:'4h ago', read:false },
  { id:'n4', kind:'confirmation', title:'SHIELD payment confirmed', body:'Your SHIELD #1042 payment of 100 USDT was processed.', time:'1d ago', read:true },
  { id:'n5', kind:'distribution', title:'STOCK dividend available', body:'Electoral Stock #0044 dividend of 28.5 USDT is ready.', time:'2d ago', read:true },
];

const ready = <T,>(data: T, detail: string) => ({ state:'ready' as const, mode:'preview' as const, sourceLabel:'Preview data', detail, data });

const previewTransactions = () => mockTransactionLogs.map((transaction) => ({
  ...transaction,
  network:CHAIN_CONFIG.name,
  gasToken:CHAIN_CONFIG.nativeCurrency.symbol,
  explorerUrl:transaction.txHash ? `${CHAIN_CONFIG.explorerUrl}/tx/${transaction.txHash}` : undefined,
}));

export const previewSystemProvider: Special3SystemProvider = {
  mode:'preview',
  profile: () => ready(getPreviewProfileProjection({
    tokenAssets:mockTokenAssets,
    activity:previewTransactions(),
    search:typeof window === 'undefined' ? '' : window.location.search,
  }), 'Profile projection composed from frozen Product provider records.'),
  economy: () => ready({ portfolio:mockPortfolioValue, tokens:mockTokenAssets }, 'Illustrative balances; not read from a wallet or chain.'),
  assets: () => ready({ portfolio:mockPortfolioValue, tokens:mockTokenAssets, shields:mockShields, stocks:mockEESStocks, user:mockUser }, 'Illustrative portfolio and ownership records.'),
  transactions: () => ready(previewTransactions(), `Preview activity normalized to ${CHAIN_CONFIG.name}; explorer links derive from configured chain metadata.`),
  notifications: () => ready(notifications, 'Illustrative notification feed for interaction review.'),
  rewards: () => ready(mockRewards, 'Illustrative rewards; availability is not a Live claimability assertion.'),
  user: () => ready(mockUser, 'Illustrative identity; not a connected-wallet claim.'),
};
