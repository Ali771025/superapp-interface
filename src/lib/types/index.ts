// Core entity types for Eternity DApp

export type ThemeMode = 'dark' | 'light';
export type PaymentToken = 'USDT' | 'ETER' | 'ET' | 'Q';

export interface PaymentQuote {
  paymentToken: PaymentToken;
  usdAmount: number;
  tokenAmount: number;
  rate: number;
  fee?: number;
}

export interface EIDName {
  id: string;
  name: string;
  tokenId: string;
  owner: string;
  isPrimary: boolean;
  characterCount: number;
  mintPrice: number;
  discount: number;
  finalPrice: number;
  listedForSale: boolean;
  salePrice?: number;
  royalty: number;
  inviteLink?: string;
  createdAt: string;
}

export interface AchievementProgress {
  level: number;
  title: string;
  eqPoints: number;
  currentLevelMin: number;
  nextLevelRequired: number;
  progressPercent: number;
  completedTasks: number;
  activeTasks: number;
  nextTask: string;
}

export interface AchievementLevel {
  level: number;
  title: string;
  minEQ: number;
  maxEQ: number;
  color: string;
  perks: string[];
}

export interface AchievementTask {
  id: string;
  title: string;
  description: string;
  eqReward: number;
  status: 'locked' | 'active' | 'completed';
  category: string;
  progress?: number;
  maxProgress?: number;
}

export interface ProductMenuItem {
  id: string;
  title: string;
  description: string;
  route: string;
  status: 'active' | 'coming-soon' | 'locked';
  icon: string;
  accent: string;
}

export interface ShieldPurchaseConfig {
  tier: 'starter' | 'balanced' | 'professional';
  totalAmount: number;
  minPrepaymentPercent: number;
  selectedPaymentPercent: number;
  paymentAmount: number;
  remainingAmount: number;
  durationYears: number;
  paymentToken: PaymentToken;
  estimatedTokenAmount?: number;
  maturityDate?: string;
}

export interface EESPurchaseConfig {
  quantity: number;
  fullPriceETER: number;
  minimumDownPaymentETER: number;
  selectedDownPaymentETER: number;
  paymentToken: PaymentToken;
  estimatedTokenAmount: number;
  remainingETER: number;
}

export interface User {
  id: string;
  eid: string;
  primaryEid: string;
  ownedEids: EIDName[];
  eidInviteLink: string;
  walletAddress: string;
  username: string;
  avatar?: string;
  fanLevel: FanLevel;
  starLevel: number;
  eterBalance: number;
  etBalance: number;
  qBalance: number;
  usdtBalance: number;
  eqPoints: number;
  trustScore: number;
  daoStatus: 'active' | 'locked' | 'observer';
  joinedAt: string;
  lastActive: string;
  role: 'user' | 'admin' | 'moderator';
  referralCode: string;
  referredBy?: string;
  achievementProgress?: AchievementProgress;
}

export type FanLevel = 'none' | 'fan' | 'indie' | '1star' | '2star' | '3star' | '4star' | 'legioner' | 'legend' | 'elitelegend';

export interface TokenAsset {
  symbol: 'ETER' | 'ET' | 'Q' | 'USDT';
  name: string;
  balance: number;
  usdValue: number;
  price: number;
  change24h: number;
  status: 'active' | 'locked' | 'pending';
  actions: string[];
  logoPath?: string;
}

export interface NFTAsset {
  tokenId: string;
  type: 'SHIELD' | 'C-SHIELD' | 'SPECIAL-SHIELD' | 'EES';
  name: string;
  tier?: ShieldTier;
  color?: string;
  continent?: string;
  paidAmount: number;
  totalAmount: number;
  maturityDate?: string;
  growth?: number;
  status: 'active' | 'complete' | 'matured' | 'redeemed';
  beneficiary?: string;
  isSpecial?: boolean;
}

export type ShieldTier = 'starter' | 'balanced' | 'professional';
export type ShieldVisualKey = 'blue' | 'green' | 'graphite' | 'gold' | 'crimson';
export type ShieldProtocolColor = 'Blue' | 'Green' | 'Red' | 'Black' | 'Yellow';

export interface Shield extends NFTAsset {
  type: 'SHIELD';
  shieldVisualKey: ShieldVisualKey;
  shieldAssetKey?: string;
  priceGroup: 100 | 1000 | 10000;
  remainingAmount: number;
  paymentToken?: PaymentToken;
  durationYears?: number;
  cShieldStatus: 'locked' | 'active' | 'claimed';
  olympicPrize?: number;
  eternalPrize?: number;
  eitsReferrals: number;
  nextPayment?: string;
  inheritanceSet: boolean;
  buybackAvailable?: boolean;
  specialStatus?: string;
  batchCode?: string;
  colorId?: number;
  specialTraits?: Array<'A' | 'B' | 'C' | 'D' | 'E'>;
  numericBatchCode?: number;
  lifecycleState?: 'issued' | 'funding' | 'fully-paid' | 'maturing' | 'c-shield' | 'checked' | 'eligible' | 'claimable' | 'claimed';
  issuedAt?: string;
  fullyPaidAt?: string;
  cShieldActivatedAt?: string;
  paymentLedger?: Array<{ token: PaymentToken; amount: number; usdValue: number; paidAt: string }>;
  etFundedPercent?: number;
  heirs?: Array<{ wallet: string; share: number }>;
  claimableReward?: number;
  rewardState?: 'unavailable' | 'checking' | 'eligible' | 'claimable' | 'claimed';
  transferLocked?: boolean;
}

export interface EESStock extends NFTAsset {
  type: 'EES';
  votingPower: number;
  dividends: number;
  nextDistribution?: string;
  multiplier: number;
  completionStatus: number;
  transferable: boolean;
  paidETER?: number;
  remainingETER?: number;
  paymentToken?: PaymentToken;
}

export interface IdentityAsset {
  eid: string;
  fanStatus: FanLevel;
  certificates: Certificate[];
  badges: Badge[];
  qoraAvatar: string;
  trustScore: TrustScore;
}

export interface Certificate {
  id: string;
  type: CertificateType;
  name: string;
  earnedAt: string;
  level: 'basic' | 'intermediate' | 'advanced';
  icon: string;
}

export type CertificateType =
  | 'web3-ready'
  | 'ecosystem-explorer'
  | 'product-user'
  | 'governance-member'
  | 'secure-web3'
  | 'network-leader'
  | 'ecosystem-mentor';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface TrustScore {
  score: number;
  level: 'new' | 'developing' | 'established' | 'trusted' | 'elite';
  factors: { label: string; value: number; max: number }[];
}

export interface Reward {
  id: string;
  type: 'fan' | 'forecast' | 'shield' | 'ees' | 'social' | 'achievement';
  source: string;
  amount: number;
  token: string;
  status: 'claimable' | 'pending' | 'claimed' | 'expired';
  claimableAt?: string;
  expiresAt?: string;
  /** Product-owned identifier used only to delegate a claim to its owning action. */
  productRef?: string;
}

export interface FanProfile {
  userId: string;
  level: FanLevel;
  starLevel: number;
  directReferrals: number;
  activeDownline: number;
  totalDownline: number;
  matchingBonus: number;
  directBonus: number;
  prizePool: number;
  claimableIncome: number;
  lastRenewal?: string;
  nextRenewal?: string;
  referralQualityScore: number;
  isIndie: boolean;
}

export interface ForecastEntry {
  id: string;
  weekNumber: number;
  prediction: string;
  ticketCount: number;
  entryFee: number;
  status: 'active' | 'closed' | 'won' | 'lost';
  isSavior?: boolean;
  prizeAmount?: number;
  poolSize: number;
  closesAt: string;
  result?: string;
}

export interface ForecastWeek {
  weekNumber: number;
  question: string;
  options: string[];
  entryFee: number;
  poolSize: number;
  totalTickets: number;
  closesAt: string;
  status: 'open' | 'closed' | 'resolved';
  saviorPool: number;
  saviorCount: number;
}

export interface Proposal {
  id: string;
  title: string;
  grade: 'A' | 'B' | 'C';
  challenge: string;
  aim: string;
  solution: string;
  description: string;
  hasCode: boolean;
  status: 'active' | 'passed' | 'rejected' | 'executed' | 'draft';
  votesYes: number;
  votesNo: number;
  reports: number;
  quorum: number;
  quorumReached: boolean;
  timeLeft: string;
  createdAt: string;
  createdBy: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskSummary: string;
}

export interface EcosystemStats {
  eterPrice: number;
  eterChange24h: number;
  generatorVolume24h: number;
  forecastPool: number;
  activeProposals: number;
  activeFans: number;
  shieldSupply: number;
  eesHolders: number;
  totalUsers: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'qora';
  content: string;
  timestamp: string;
  cards?: ChatCard[];
  intent?: ChatIntent;
}

export type ChatIntent =
  | 'show-assets'
  | 'show-insurance'
  | 'show-rewards'
  | 'show-forecast'
  | 'show-community'
  | 'show-governance'
  | 'show-ees'
  | 'today-actions'
  | 'explain'
  | 'learn'
  | 'show-profile'
  | 'show-eid'
  | 'show-achievements'
  | 'show-edge'
  | 'show-swap'
  | 'buy-q'
  | 'sell-q'
  | 'buy-shield'
  | 'buy-ees'
  | 'complete-shield'
  | 'complete-ees'
  | 'show-products'
  | 'show-access'
  | 'show-access-locked'
  | 'show-upgrade-benefits'
  | 'general';

export interface ChatCard {
  type: 'shield' | 'ees' | 'forecast' | 'reward' | 'proposal' | 'fan' | 'learning' | 'action' | 'asset' | 'next-action' | 'profile' | 'eid' | 'achievement' | 'swap' | 'payment' | 'edge' | 'product-menu' | 'access-overview' | 'access-locked' | 'access-upgrade';
  data: Record<string, unknown>;
}

// Admin types
export interface AdminUser {
  id: string;
  walletAddress: string;
  eid: string;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  trustScore: number;
  certificates: number;
  fanLevel: FanLevel;
  status: 'active' | 'inactive' | 'suspended';
  lastActivity: string;
  joinedAt: string;
}

export interface OnChainLog {
  id: string;
  chainId: number;
  blockNumber: number;
  transactionHash: string;
  contractAddress: string;
  eventName: string;
  eventPayload: Record<string, unknown>;
  walletAddress: string;
  module: string;
  timestamp: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  errorMessage?: string;
}

export interface OffChainLog {
  id: string;
  userId: string;
  walletAddress: string;
  sessionId: string;
  actionType: string;
  page: string;
  module: string;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  ipDevice: string;
  timestamp: string;
  result: 'success' | 'failure' | 'error';
  errorMessage?: string;
}

export interface QoraChatLog {
  id: string;
  userId: string;
  walletAddress: string;
  prompt: string;
  intent: ChatIntent;
  suggestedAction: string;
  displayedCardType: string;
  userAction?: string;
  timestamp: string;
  safetyWarning: boolean;
}

export interface TransactionLog {
  id: string;
  userId: string;
  walletAddress: string;
  module: string;
  action: string;
  amount: number;
  token: string;
  status: 'success' | 'pending' | 'failed';
  txHash?: string;
  gasEstimate?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface AdminAuditEntry {
  id: string;
  adminUser: string;
  action: string;
  target: string;
  timestamp: string;
  result: 'success' | 'failure';
  beforeSnapshot?: string;
  afterSnapshot?: string;
}

export interface ModuleStatus {
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  apiStatus: 'online' | 'offline' | 'degraded';
  contractAdapterStatus: 'synced' | 'behind' | 'error';
  lastSyncedBlock: number;
  errorCount: number;
}

export interface BackupEntry {
  id: string;
  type: 'manual' | 'auto';
  status: 'success' | 'pending' | 'failed';
  size: string;
  createdAt: string;
  includes: string[];
}

export interface ReadinessItem {
  id: string;
  label: string;
  description: string;
  progress: number;
  status: 'locked' | 'in-progress' | 'complete';
  certificateType?: CertificateType;
}

export interface NextAction {
  id: string;
  type: 'reward' | 'learning' | 'vote' | 'forecast' | 'shield' | 'fan' | 'ees' | 'stake';
  title: string;
  description: string;
  cta: string;
  priority: 'high' | 'medium' | 'low';
  route: string;
  icon: string;
}

export interface SwapLog {
  id: string;
  userId: string;
  fromToken: PaymentToken;
  toToken: PaymentToken;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  status: 'success' | 'pending' | 'failed';
  txHash?: string;
  timestamp: string;
}
