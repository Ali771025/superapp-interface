import type {
  EcosystemStats,
  EIDName,
  FanProfile,
  ForecastEntry,
  ForecastWeek,
  PaymentQuote,
  PaymentToken,
  Proposal,
  Reward,
  Shield,
  TransactionLog,
  User,
} from "../../../lib/types";
import type {
  StockMultiplier,
  StockIncomeEntitlement,
  StockPosition,
  StockProtocolContext,
} from "../../products/stock/stockProtocol";
import type {
  ForecastContributorState,
  ForecastClaimGuard,
  ForecastEnterInput,
  ForecastEntitlement,
  ForecastProtocolContext,
  ForecastParticipationQuote,
  ForecastTicketGiftQuote,
} from "../../products/forecast/forecastProtocol";
import type {
  FanJoinIdentity,
  FanMessage,
  FanProtocolContext,
  FanQuote,
} from "../../products/fan/fanProtocol";
import type {
  EraGrade,
  EraProtocolContext,
  EraReviewDecision,
  EraSuggestionInput,
  EraVoteChoice,
} from "../../products/era/eraProtocol";
import type {
  EidAcquisitionQuote,
  EidAvailabilityStatus,
  EidMarketplaceQuote,
  EidPaymentLeg,
  EidProtocolContext,
} from "../../products/eid/eidProtocol";

export type ProductProviderMode = "preview" | "live";

export interface RewardPoolProjection {
  id: string;
  product: string;
  title: string;
  cycle: string;
  amount: number;
  token: string;
}

export interface RewardHistoryRecord {
  id: string;
  title: string;
  occurredAt: string;
  amount: number;
  token: string;
  status: "confirmed" | "pending" | "failed";
  productRef?: string;
}

export interface EraVotingEligibility {
  state: "eligible" | "ineligible" | "unknown";
  votingPower: number;
  reason: string;
  source: ProductProviderMode;
}

export interface ShieldProtocolContext {
  source: ProductProviderMode;
  quoteAt?: string;
  activityWeek?: number;
  ecEterBalance?: number;
  isFanMember?: boolean;
  directReferredShieldWallets?: number;
  tokenUsdRates?: Partial<Record<"USDT" | "ETER" | "ET", number>>;
  sectionCShieldCounts?: Partial<Record<100 | 1000 | 10000, number>>;
  authoritativeMintQuote?: {
    totalDueTokenAmount?: number;
    allocatedEt?: number;
    totalLevyUsd?: number;
    maturity?: string;
  };
}

export interface ProductPresentationData {
  user: User;
  tokenRates: Record<string, number>;
  fanProfile: FanProfile;
  ownedEids: EIDName[];
  currentForecast: ForecastWeek;
  forecastEntries: ForecastEntry[];
  shields: Shield[];
  stocks: StockPosition[];
  proposals: Proposal[];
  rewards: Reward[];
  rewardPools: RewardPoolProjection[];
  rewardHistory: RewardHistoryRecord[];
  eraVotingEligibility: EraVotingEligibility;
  ecosystemStats: EcosystemStats;
  transactionLogs: TransactionLog[];
  shieldProtocolContext?: ShieldProtocolContext;
  stockProtocolContext?: StockProtocolContext;
  forecastProtocolContext?: ForecastProtocolContext;
  fanProtocolContext?: FanProtocolContext;
  eraProtocolContext?: EraProtocolContext;
  eidProtocolContext?: EidProtocolContext;
}

type TransactionResult = Promise<{ txHash: string; [key: string]: unknown }>;

export interface ProductActionMap {
  fan: {
    quoteFanMembership(params: {
      operation: "join" | "upgrade" | "renew";
      target?: 0 | 1 | 2 | 3 | 4 | "indie";
      referralCode?: string | null;
    }): Promise<{ quote: FanQuote; source: ProductProviderMode }>;
    joinFan(params: {
      expectedQuoteId: string;
      expectedQuoteVersion: number;
      expectedAmountETER: number;
      target: 0 | 1 | 2 | 3 | "indie";
      referralCode?: string | null;
    }): Promise<{ txHash: string; quoteId: string; identity: FanJoinIdentity }>;
    upgradeFanRank(params: {
      expectedQuoteId: string;
      expectedQuoteVersion: number;
      expectedAmountETER: number;
    }): TransactionResult;
    renewFan(params: {
      expectedQuoteId: string;
      expectedQuoteVersion: number;
      expectedAmountETER: number;
    }): TransactionResult;
    sendFanCommunityMessage(params: {
      recipientId: string;
      body: string;
      expectedNetworkSource: "preview" | "live";
    }): Promise<{ message: FanMessage; source: ProductProviderMode }>;
    upgradeFan(address: string, targetLevel: string): TransactionResult;
    claimFanRewards(
      address: string,
    ): Promise<{ txHash: string; amount: number }>;
  };
  era: {
    createSuggestion(
      params: EraSuggestionInput,
    ): Promise<{
      id: string;
      version: number;
      lifecycle: string;
      requestId: string;
      approvalStatus: "not-required" | "pending";
    }>;
    reviewSuggestion(params: {
      suggestionId: string;
      decision: EraReviewDecision;
      feedback?: string;
      qualificationDeadline?: string;
      expectedVersion: number;
    }): TransactionResult;
    amendSuggestion(params: {
      suggestionId: string;
      expectedVersion: number;
      input: EraSuggestionInput;
    }): TransactionResult;
    advanceSuggestion(params: {
      suggestionId: string;
      expectedVersion: number;
    }): TransactionResult;
    cancelProposal(params: {
      proposalId: string;
      expectedVersion: number;
    }): TransactionResult;
    vote(params: {
      proposalId: string;
      vote: EraVoteChoice;
      expectedVersion: number;
      expectedVotingPower: number;
      expectedVotingCountAvailable: number;
    }): TransactionResult;
    executeProposal(params: {
      proposalId: string;
      expectedVersion: number;
    }): TransactionResult;
    submitEraCodePreparationProof(params: {
      recordId: string;
      expectedVersion: number;
      proofReference: string;
    }): TransactionResult;
    submitOwnerDiscretionProposal(params: {
      suggestionId: string;
      expectedVersion: number;
    }): Promise<{
      txHash: string;
      proposalId: string;
      version: number;
      lifecycle: string;
      attributionState: "owner-discretion";
      submittedBy: "OWNER";
      submittedByOwner: true;
      proposerId: "OWNER";
      proposerIsOwner: true;
      ownerQueuePriority: true;
      ownerReportProtected: true;
      originalSuggestionId: string;
      originalSuggestionProposerId: string;
    }>;
    submitOwnerFinalCode(params: {
      proposalId: string;
      expectedVersion: number;
      codeReference: string;
    }): TransactionResult;
    donateEliteFund(params: {
      grade: EraGrade;
      asset: string;
      amount: number;
      expectedVersion: number;
    }): TransactionResult;
    withdrawEliteFund(params: {
      grade: EraGrade;
      expectedVersion: number;
      expectedAmount: number;
      expectedToken: string;
    }): TransactionResult;
    donateStockholderFund(params: {
      asset: string;
      amount: number;
      expectedVersion: number;
    }): TransactionResult;
    adjustStockholderAllocation(params: {
      allocationPercent: number;
      expectedVersion: number;
    }): TransactionResult;
  };
  eid: {
    checkEidAvailability(params: { name: string }): Promise<{
      canonicalName: string;
      status: EidAvailabilityStatus;
      source: "preview" | "live";
      freshness: string;
    }>;
    quoteEidAcquisition(params: {
      name: string;
      paymentAsset?: PaymentToken;
    }): Promise<EidAcquisitionQuote>;
    acquireEid(params: {
      name: string;
      expectedQuoteId: string;
      expectedVersion: number;
      expectedExpiresAt: string;
      expectedAcquisitionOrdinal: number;
      paymentAsset?: PaymentToken;
      expectedPaymentLegs: EidPaymentLeg[];
      expectedFinalPriceUsd: number;
      expectedNetworkFeeResponsibility: "user" | "owner-delegate-sponsored";
    }): TransactionResult;
    setActiveEid(params: { eidId: string; expectedVersion: number }): TransactionResult;
    requestEidInviteLink(params: { eidId: string; expectedVersion: number }): Promise<{ txHash: string; inviteLink: string; status: "available" }>;
    listEidForSale(params: { eidId: string; amount: number; paymentAsset: PaymentToken; expectedVersion: number }): TransactionResult;
    quoteEidMarketBuy(params: { listingId: string }): Promise<EidMarketplaceQuote>;
    buyEid(params: {
      listingId: string;
      expectedListingVersion: number;
      expectedQuoteId: string;
      expectedQuoteVersion: number;
      expectedExpiresAt: string;
      expectedOwner: string;
      expectedAmount: number;
      expectedPaymentAsset: PaymentToken;
      expectedLoyaltySplit: EidMarketplaceQuote["loyaltySplit"];
    }): TransactionResult;
  };
  forecast: {
    enterForecast(params: ForecastEnterInput): TransactionResult;
    quoteForecastParticipation(params: {
      mode: "gift";
      beneficiary: string;
      predictionCount: number;
    }): Promise<{
      quote: ForecastParticipationQuote;
      source: ProductProviderMode;
    }>;
    verifyForecastBeneficiary(
      address: string,
    ): Promise<{
      eligible: boolean;
      quote?: ForecastParticipationQuote;
      source: ProductProviderMode;
    }>;
    quoteForecastTicketGift(params: {
      ticketId: string;
      beneficiary: string;
    }): Promise<{
      quote: ForecastTicketGiftQuote;
      source: ProductProviderMode;
    }>;
    giftForecastTicket(params: {
      ticketId: string;
      beneficiary: string;
      method: "signature" | "transaction";
      expectedQuoteId: string;
      expectedQuoteVersion: number;
    }): TransactionResult;
    checkForecastPrize(
      scope?: "winner" | "savior",
    ): Promise<{
      entitlement?: ForecastEntitlement;
      source: ProductProviderMode;
    }>;
    withdrawForecastPrize(
      expected: ForecastClaimGuard,
    ): Promise<{ txHash: string; entitlement?: ForecastEntitlement }>;
    donateForecastPool(params: {
      pool: "main" | "savior" | "savior-prizes";
      amount: number;
      asset: "USDT" | "ETER" | "ET";
    }): TransactionResult;
    checkContributorReward(): Promise<{
      contributor?: ForecastContributorState;
      source: ProductProviderMode;
    }>;
    withdrawContributorReward(
      expected: ForecastClaimGuard,
    ): Promise<{ txHash: string; entitlement?: ForecastEntitlement }>;
  };
  shield: {
    buyShield(params: { tier: string; amount: number; paymentToken: PaymentToken }): TransactionResult;
    setInheritance(params: {
      tokenId: string;
      beneficiary: string;
    }): TransactionResult;
    setInheritanceAllocation(params: {
      tokenId: string;
      heirs: Array<{ wallet: string; sharePercent: number }>;
      feeToken: PaymentToken;
      expectedFeeTokenAmount?: number;
    }): TransactionResult;
    claimShieldRewards(
      tokenId: string,
    ): Promise<{ txHash: string; amount: number }>;
    runShieldAction(params: {
      tokenId: string;
      action: string;
      receiver?: string;
      amount?: number;
      paymentToken?: PaymentToken;
      receiveToken?: PaymentToken;
      reservePercent?: number;
      unlockDate?: string;
      receiveAllocatedET?: boolean;
    }): TransactionResult;
    runGroupAction(params: {
      tokenIds: string[];
      action: string;
    }): TransactionResult;
  };
  stock: {
    buyStock(params: { amount: number }): TransactionResult;
    buyStocks(params: {
      quantity: number;
      initialPaymentETER: number;
      recipient?: string;
    }): Promise<{
      txHash: string;
      positions: Array<{
        tokenId: string;
        multiplier: StockMultiplier;
        phase: 1 | 2;
        origin: "Purchase" | "Gift";
      }>;
    }>;
    completeStock(params: {
      tokenId: string;
      amountETER: number;
    }): TransactionResult;
    verifyFanMember(
      address: string,
    ): Promise<{ isFan: boolean; source: ProductProviderMode }>;
    transferStocks(params: {
      tokenIds: string[];
      to: string;
    }): TransactionResult;
    checkStockIncome(): Promise<{
      entitlement?: StockIncomeEntitlement;
      source: ProductProviderMode;
    }>;
    withdrawStockIncome(expected?: {
      expectedAmount: number;
      expectedToken: string;
    }): Promise<{ txHash: string; entitlement?: StockIncomeEntitlement }>;
    claimDividends(tokenId: string): TransactionResult;
  };
  swap: {
    getQuote(
      fromToken: PaymentToken,
      toToken: PaymentToken,
      fromAmount: number,
    ): Promise<PaymentQuote & { toAmount: number; priceImpact: number }>;
    swap(
      fromToken: PaymentToken,
      toToken: PaymentToken,
      fromAmount: number,
    ): Promise<{ txHash: string; toAmount: number }>;
  };
  generator: {
    buyETER(params: { amount: number; paymentToken: PaymentToken; slippage?: number }): TransactionResult;
    sellETER(params: { amount: number }): TransactionResult;
    burnETER(params: { amount: number }): TransactionResult;
    donate(params: { amount: number; token: PaymentToken }): TransactionResult;
    transferETER(params: { to: string; amount: number }): TransactionResult;
  };
}

export interface ProductPresentationProvider {
  mode: ProductProviderMode;
  available: boolean;
  reason?: string;
  data: ProductPresentationData;
  actions: ProductActionMap;
}
