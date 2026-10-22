import type { EESStock } from "../../../lib/types";

export const STOCK_FULL_PRICE_ETER = 100;
export const STOCK_MINIMUM_INITIAL_ETER = 19;
export const STOCK_TOTAL_SUPPLY = 5_100;
export const STOCK_PHASE_ONE_SUPPLY = 4_000;
export const STOCK_PHASE_TWO_SUPPLY = 1_100;
export const STOCK_TRANSFER_FEE_ETER = 19;
export const STOCK_REFERRAL_CYCLE = 19;
export const STOCK_INCOME_CHECK_DAYS = 10;
export const STOCK_INCOME_WITHDRAW_DAYS = 20;
export const STOCK_REVENUE_SHARE_PERCENT = 10;
export const STOCK_MULTIPLIERS = [1, 2, 3, 5, 10] as const;

export type StockMultiplier = (typeof STOCK_MULTIPLIERS)[number];
export type StockPhase = 1 | 2;
export type StockOrigin = "Purchase" | "Gift" | "Referral Award" | "Transfer";
export type StockFundingState = "Partial" | "Fully paid" | "Unpaid award";
export type StockIncomeEligibility = "Eligible" | "Funding required";

export const stockNftVisualMap: Record<
  StockMultiplier,
  { image: string; label: string; family: string; sha256: string }
> = {
  1: {
    image: "/assets/stock-nft/owner-stock-1x.png",
    label: "1X Stock NFT",
    family: "Orange-copper",
    sha256: "f44dbf204e16d9fecd2d6eb1dfbbda8847c7070d33b3cf24b7e1d341d9730ec2",
  },
  2: {
    image: "/assets/stock-nft/owner-stock-2x.png",
    label: "2X Stock NFT",
    family: "Silver",
    sha256: "af24af43b1a1bf2ce1b0d70759e2916d9e97db03996718844b7de70ee6023a85",
  },
  3: {
    image: "/assets/stock-nft/owner-stock-3x.png",
    label: "3X Stock NFT",
    family: "Gold",
    sha256: "d9bd7e578ac9897ad74d147b4ae7b2e04ae710a90b03bb2388d8753d76488bd6",
  },
  5: {
    image: "/assets/stock-nft/owner-stock-5x.png",
    label: "5X Stock NFT",
    family: "Blue-icy",
    sha256: "22fe6aafb597856bf30b0308e4e23ccd705a59400b559cb9c77ed9b181d911ab",
  },
  10: {
    image: "/assets/stock-nft/owner-stock-10x.png",
    label: "10X Stock NFT",
    family: "Lavender-iridescent",
    sha256: "807786dd56ee59d30ceb23d0fa2b8a66defd738a1d930d6cb93bc3a88e2987d9",
  },
};

export const STOCK_PHASE_ALLOCATIONS: Record<
  StockPhase,
  Record<StockMultiplier, number>
> = {
  1: { 1: 3_400, 2: 340, 3: 171, 5: 70, 10: 19 },
  2: { 1: 940, 2: 100, 3: 40, 5: 16, 10: 4 },
};

export type StockRank = "2-Star" | "3-Star" | "4-Star";

export interface StockIncomeEntitlement {
  amount: number;
  token: string;
}

export interface StockIncomeContext {
  window: "check" | "withdraw" | "closed";
  nextCycleAt?: string;
  checkedEntitlement?: StockIncomeEntitlement;
  withdrawableEntitlement?: StockIncomeEntitlement;
}

export function isStockIncomeEntitlement(value?: StockIncomeEntitlement): value is StockIncomeEntitlement {
  return Boolean(value?.token.trim() && Number.isFinite(value.amount) && value.amount > 0);
}

export function formatStockIncomeEntitlement(value?: StockIncomeEntitlement): string {
  return isStockIncomeEntitlement(value) ? `${value.amount} ${value.token}` : "Entitlement unavailable";
}

export interface StockActivityRecord {
  id: string;
  type: "Buy" | "Gift" | "Funding" | "Complete" | "Transfer" | "Referral Award" | "Check" | "Withdraw";
  detail: string;
  status: string;
  occurredAt?: string;
  tokenId?: string;
}

export interface StockReferralAwardRecord {
  cycle: number;
  tokenId?: string;
  multiplier?: StockMultiplier;
  awardedAt?: string;
}

export interface StockProtocolContext {
  source: "preview" | "live";
  currentPhase: StockPhase;
  phase1Sold: number;
  phase2Sold: number;
  phase2Unlocked: boolean;
  rank: StockRank;
  isFanPro: boolean;
  phase1Purchased: number;
  phase2Purchased: number;
  weeklyDailySold: Array<{ day: string; sold: number }>;
  nextWeekVest?: string;
  directReferralStockPurchases: number;
  referralAwardedStocks: number;
  income?: StockIncomeContext;
  stockActivity?: StockActivityRecord[];
  referralAwardHistory?: StockReferralAwardRecord[];
}

/**
 * Legacy Preview fixture retained for Phase08 protocol-test compatibility.
 * Product pages must consume the provider-owned `stockProtocolContext` read model.
 */
export const stockPreviewContext: StockProtocolContext = {
  source: "preview",
  currentPhase: 1,
  phase1Sold: 2_867,
  phase2Sold: 0,
  phase2Unlocked: false,
  rank: "2-Star",
  isFanPro: false,
  phase1Purchased: 0,
  phase2Purchased: 0,
  weeklyDailySold: [
    { day: "Mon", sold: 12 },
    { day: "Tue", sold: 9 },
    { day: "Wed", sold: 17 },
    { day: "Thu", sold: 8 },
    { day: "Fri", sold: 14 },
    { day: "Sat", sold: 11 },
    { day: "Sun", sold: 7 },
  ],
  nextWeekVest: undefined,
  directReferralStockPurchases: 38,
  referralAwardedStocks: 2,
  income: {
    window: "check",
    nextCycleAt: "2027-01-01T00:00:00Z",
    checkedEntitlement: { amount: 43.25, token: "ETER" },
    withdrawableEntitlement: { amount: 43.25, token: "ETER" },
  },
  stockActivity: [
    { id:"stock-buy-0901", type:"Buy", detail:"2 Stocks · 38 ETER initial", status:"Confirmed", occurredAt:"2026-06-01T10:00:00Z" },
    { id:"stock-gift-0388", type:"Gift", detail:"1 Stock · verified Fan", status:"Confirmed", tokenId:"#EES-0388", occurredAt:"2026-06-03T10:00:00Z" },
    { id:"stock-funding-0044", type:"Funding", detail:"#0044 · +57 ETER", status:"Confirmed", tokenId:"#EES-0044", occurredAt:"2026-06-05T10:00:00Z" },
    { id:"stock-complete-0190", type:"Complete", detail:"#0190 · fully paid", status:"Confirmed", tokenId:"#EES-0190", occurredAt:"2026-06-07T10:00:00Z" },
    { id:"stock-transfer-0388", type:"Transfer", detail:"#0388 · 19 ETER fee", status:"Confirmed", tokenId:"#EES-0388", occurredAt:"2026-06-09T10:00:00Z" },
    { id:"stock-award-0712", type:"Referral Award", detail:"#0712 · 10X", status:"Confirmed", tokenId:"#EES-0712", occurredAt:"2026-06-11T10:00:00Z" },
    { id:"stock-check-2026-01", type:"Check", detail:"Biannual entitlement", status:"Provider result", occurredAt:"2026-07-02T12:00:00Z" },
    { id:"stock-withdraw-2026-01", type:"Withdraw", detail:"43.25 ETER", status:"Ready in window", occurredAt:"2026-07-02T12:05:00Z" },
  ],
  referralAwardHistory: [
    { cycle:1, tokenId:"#EES-0712", multiplier:10, awardedAt:"2026-05-28T09:45:00Z" },
    { cycle:2 },
  ],
};

export interface StockPosition extends EESStock {
  multiplier: StockMultiplier;
  paidETER: number;
  remainingETER: number;
  phase: StockPhase;
  origin: StockOrigin;
  fundingState: StockFundingState;
  incomeEligibility: StockIncomeEligibility;
  issuedAt: string;
}

function position(
  tokenId: string,
  multiplier: StockMultiplier,
  phase: StockPhase,
  origin: StockOrigin,
  paidETER: number,
  issuedAt: string,
): StockPosition {
  const remainingETER = STOCK_FULL_PRICE_ETER - paidETER;
  const fundingState: StockFundingState =
    paidETER === 0 ? "Unpaid award" : remainingETER === 0 ? "Fully paid" : "Partial";
  return {
    tokenId,
    type: "EES",
    name: `Electoral Stock ${tokenId.replace("#EES-", "#")}`,
    paidAmount: paidETER,
    totalAmount: STOCK_FULL_PRICE_ETER,
    maturityDate: "Provider owned",
    growth: 0,
    status: remainingETER === 0 ? "complete" : "active",
    votingPower: 1,
    dividends: 0,
    multiplier,
    completionStatus: paidETER,
    transferable: true,
    paidETER,
    remainingETER,
    paymentToken: "ETER",
    phase,
    origin,
    fundingState,
    incomeEligibility: remainingETER === 0 ? "Eligible" : "Funding required",
    issuedAt,
  };
}

/** Explicit Preview fixtures. Live mode must replace these with provider truth. */
export const stockPreviewPositions: StockPosition[] = [
  position("#EES-0044", 1, 1, "Purchase", 76, "2026-04-12T10:00:00Z"),
  position("#EES-0190", 2, 1, "Purchase", 100, "2026-04-20T11:30:00Z"),
  position("#EES-0388", 3, 1, "Gift", 100, "2026-05-02T08:15:00Z"),
  position("#EES-0510", 5, 1, "Purchase", 19, "2026-05-11T14:20:00Z"),
  position("#EES-0712", 10, 1, "Referral Award", 0, "2026-05-28T09:45:00Z"),
];

export function stockPhaseSupply(phase: StockPhase): number {
  return phase === 1 ? STOCK_PHASE_ONE_SUPPLY : STOCK_PHASE_TWO_SUPPLY;
}

export function availableSupply(context: StockProtocolContext): number {
  if (context.currentPhase === 2) {
    if (!context.phase2Unlocked) return 0;
    return Math.max(0, STOCK_PHASE_TWO_SUPPLY - context.phase2Sold);
  }
  return Math.max(0, STOCK_PHASE_ONE_SUPPLY - context.phase1Sold);
}

export function purchaseAllowance(
  context: Pick<StockProtocolContext, "currentPhase" | "rank" | "isFanPro">,
): number {
  if (context.currentPhase === 1) {
    if (context.isFanPro || context.rank === "4-Star") return 8;
    if (context.rank === "3-Star") return 4;
    return 2;
  }
  if (context.isFanPro || context.rank === "4-Star") return 4;
  if (context.rank === "3-Star") return 2;
  return 0;
}

export function remainingAllowance(context: StockProtocolContext): number {
  const purchased =
    context.currentPhase === 1 ? context.phase1Purchased : context.phase2Purchased;
  return Math.max(0, purchaseAllowance(context) - purchased);
}

/** Authoritative purchase ceiling shared by UI and provider action validation. */
export function maxPurchasable(context: StockProtocolContext): number {
  return Math.min(remainingAllowance(context), availableSupply(context));
}

export function validateStockPurchase(
  input: { quantity: number; initialPaymentETER: number; giftRequested?: boolean; recipientVerified?: boolean },
  context?: StockProtocolContext,
): number {
  if (!context) throw new Error("Authoritative STOCK purchase context is unavailable.");
  if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error("Quantity must be a positive whole number.");
  if (context.currentPhase === 2 && !context.phase2Unlocked) throw new Error("Phase 2 is locked.");
  const ceiling = maxPurchasable(context);
  if (input.quantity > ceiling) throw new Error(ceiling === 0 ? "No purchase allowance or phase supply is available." : `Maximum purchasable quantity is ${ceiling}.`);
  if (input.initialPaymentETER < input.quantity * STOCK_MINIMUM_INITIAL_ETER) throw new Error(`Minimum initial payment is ${STOCK_MINIMUM_INITIAL_ETER} ETER per Stock.`);
  if (input.initialPaymentETER > input.quantity * STOCK_FULL_PRICE_ETER) throw new Error(`Maximum payment is ${STOCK_FULL_PRICE_ETER} ETER per Stock.`);
  if (input.giftRequested && !input.recipientVerified) throw new Error("Recipient must be a verified Fan member.");
  return ceiling;
}

export function daoOwnerPower(stocksSold: number): number {
  return Math.min((Math.max(0, stocksSold) / 51) * 49, 4_900);
}

export function referralCycles(directPurchases: number): number {
  return Math.floor(Math.max(0, directPurchases) / STOCK_REFERRAL_CYCLE);
}

export function isStockMultiplier(value: number): value is StockMultiplier {
  return STOCK_MULTIPLIERS.includes(value as StockMultiplier);
}
