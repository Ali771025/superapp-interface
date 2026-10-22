import type { PaymentToken, Shield, ShieldTier } from "../../../lib/types";

export type ShieldValue = 100 | 1000 | 10000;
export type ShieldColor = "Yellow" | "Black" | "Red" | "Green" | "Blue";
export const SPECIAL_COLOR_ID: Record<1|2|3|4|5, ShieldColor> = { 1:"Blue", 2:"Green", 3:"Red", 4:"Black", 5:"Yellow" };

export const SHIELD_RARITY: ReadonlyArray<{ color: ShieldColor; continent: string; percent: number; hex: string }> = [
  { color: "Yellow", continent: "Asia", percent: 59.3, hex: "#F4C300" },
  { color: "Black", continent: "Africa", percent: 17.7, hex: "#000000" },
  { color: "Red", continent: "America", percent: 13.1, hex: "#DF0024" },
  { color: "Green", continent: "Europe", percent: 9.4, hex: "#009F3D" },
  { color: "Blue", continent: "Oceania", percent: 0.5, hex: "#0085C7" },
] as const;

export const tierValue = (tier: ShieldTier): ShieldValue => tier === "starter" ? 100 : tier === "balanced" ? 1000 : 10000;
export const tierDurationOptions = (value: ShieldValue): number[] => value === 100 ? [1] : value === 1000 ? [1, 2, 3] : [1, 2, 3, 4, 5];
export const minimumInitialPayment = (years: number): number => ({ 1: 10, 2: 8, 3: 6, 4: 4, 5: 2 }[years] ?? 10);
export const valueLevy = (value: ShieldValue): number => value === 100 ? 0 : value === 1000 ? 2 : 4;
export const periodLevy = (years: number): number => Math.max(0, Math.min(8, 10 - years * 2));
export const timeLevy = (activityWeek?: number): number | null => activityWeek === undefined ? null : activityWeek <= 2 ? 0 : Math.min(5, Number(((activityWeek - 2) * 0.1).toFixed(1)));
export const balanceLevy = (eterBalance?: number): number | null => {
  if (eterBalance === undefined) return null;
  if (eterBalance <= 5000) return 0;
  if (eterBalance < 15000) return 1;
  if (eterBalance < 50000) return 2;
  if (eterBalance < 150000) return 3;
  if (eterBalance < 500000) return 4;
  return 5;
};

export interface MintQuoteInput {
  value: ShieldValue;
  durationYears: number;
  initialPercent: number;
  paymentToken: PaymentToken;
  tokenRate: number;
  activityWeek?: number;
  eterBalance?: number;
  isFan?: boolean;
  quoteAt?: string | Date;
  authoritativeQuote?: { totalDueTokenAmount?: number; allocatedEt?: number; totalLevyUsd?: number; maturity?: string };
}

export const SHIELD_LIFECYCLE = ["issued", "funding", "fully-paid", "maturing", "c-shield", "checked", "eligible", "claimable", "claimed"] as const;
export type ShieldLifecycleState = typeof SHIELD_LIFECYCLE[number];
export type ShieldLifecycleStep = { state: ShieldLifecycleState; label: string; status: "completed" | "current" | "upcoming" };
const SHIELD_LIFECYCLE_LABELS: Record<ShieldLifecycleState, string> = {
  issued:"Issued", funding:"Funding", "fully-paid":"Fully Paid", maturing:"Maturing", "c-shield":"C-SHIELD", checked:"Checked", eligible:"Eligible", claimable:"Claimable", claimed:"Claimed",
};

export function resolveShieldLifecycle(current?: Shield["lifecycleState"]): ShieldLifecycleStep[] {
  const currentIndex = current ? SHIELD_LIFECYCLE.indexOf(current) : -1;
  return SHIELD_LIFECYCLE.map((state,index) => ({
    state,
    label:SHIELD_LIFECYCLE_LABELS[state],
    status:currentIndex < 0 ? "upcoming" : index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming",
  }));
}

function resolveMaturity(input: MintQuoteInput): string | null {
  if (input.authoritativeQuote?.maturity) {
    const maturity = new Date(input.authoritativeQuote.maturity);
    return Number.isNaN(maturity.getTime()) ? null : maturity.toISOString().slice(0,10);
  }
  if (!input.quoteAt) return null;
  const maturity = new Date(input.quoteAt);
  if (Number.isNaN(maturity.getTime())) return null;
  maturity.setUTCFullYear(maturity.getUTCFullYear() + input.durationYears);
  return maturity.toISOString().slice(0,10);
}

export function buildMintQuote(input: MintQuoteInput) {
  const minimum = minimumInitialPayment(input.durationYears);
  const initialPercent = Math.max(minimum, Math.min(100, input.initialPercent));
  const initialReserve = input.value * initialPercent / 100;
  const timeRate = input.paymentToken === "ET" ? null : timeLevy(input.activityWeek);
  const balanceRate = input.paymentToken === "ET" ? null : balanceLevy(input.eterBalance);
  const fanRegistrationUsd = input.isFan === false ? 10.5 : input.isFan === true ? 0 : null;
  const rates = { issuance: 6, value: valueLevy(input.value), period: periodLevy(input.durationYears), time:timeRate, balance:balanceRate };
  return {
    source: "Protocol preview" as const,
    initialPercent,
    minimumPercent: minimum,
    initialReserve,
    remaining: input.value - initialReserve,
    rates,
    fanRegistrationUsd,
    totalLevy: input.authoritativeQuote?.totalLevyUsd ?? null,
    payUsd: null,
    payTokenAmount: input.authoritativeQuote?.totalDueTokenAmount ?? null,
    allocatedEt: input.authoritativeQuote?.allocatedEt ?? null,
    maturity: resolveMaturity(input),
  };
}

export const transferLevy = (kind: "SHIELD" | "C-SHIELD", ownerHeir = false): number => (kind === "C-SHIELD" ? 10 : 3) * (ownerHeir ? 0.5 : 1);
export const cShieldProfitRate = (sectionCount?: number): number | null => sectionCount === undefined ? null : Math.min(sectionCount * 10, 100);
export const periodReductionQuote = (value: number, months: number, token: PaymentToken) => {
  const baseUsd = value * 0.00175 * Math.max(0, months);
  const discount = token === "ET" ? baseUsd * 0.2 : 0;
  return { source: "Protocol quote preview" as const, baseUsd: Number(baseUsd.toFixed(4)), discount: Number(discount.toFixed(4)), totalUsd: Number((baseUsd - discount).toFixed(4)) };
};
export const eternalShareWeight = (value: ShieldValue): 1 | 10 | 100 => value === 100 ? 1 : value === 1000 ? 10 : 100;
export const isEternalEligible = (etFundedPercent?: number): boolean | null => etFundedPercent === undefined ? null : etFundedPercent > 50;
export const isEitsEligible = (ownsShield: boolean, referrals: number, fanRank: number): boolean => ownsShield && referrals >= 250 && fanRank >= 3;
export function olympicCollection(shields: Shield[], value: ShieldValue) {
  const qualifying = shields.filter((shield) => shield.cShieldStatus === "active" && tierValue(shield.tier ?? "starter") === value);
  const colors = new Set(qualifying.map((shield) => shield.color).filter((color): color is ShieldColor => SHIELD_RARITY.some((item) => item.color === color)));
  return { qualifying, colors, missing: SHIELD_RARITY.filter((item) => !colors.has(item.color)), eligible:colors.size === 5 };
}
export function inheritanceFeeEvents(original: Array<{wallet:string;share:number}>, draft: Array<{wallet:string;share:number}>) {
  const shared = Math.min(original.length, draft.length);
  let events = Math.max(0, draft.length - original.length) + Math.max(0, original.length - draft.length);
  for (let index = 0; index < shared; index += 1) if (original[index].wallet !== draft[index].wallet || original[index].share !== draft[index].share) events += 1;
  if (original.length === 0 && draft.length === 1) return 0;
  return events;
}
export function inheritanceFeeQuote(events: number, token: PaymentToken, usdRate?: number) {
  const usdBeforeDiscount = Math.max(0, events) * 5;
  const usdAfterDiscount = token === "ET" ? usdBeforeDiscount * 0.8 : usdBeforeDiscount;
  return { events, usdBeforeDiscount, usdAfterDiscount, tokenAmount:usdRate && usdRate > 0 ? Number((usdAfterDiscount / usdRate).toFixed(6)) : null };
}
export function evaluateSpecialTraits(input?: Array<"A"|"B"|"C"|"D"|"E"> | { tokenId: number; batchCode: number; colorId: number }) {
  if (!input || Array.isArray(input)) {
    const labels = (input ?? []).filter((label): label is "A"|"B"|"C"|"D"|"E" => ["A","B","C","D","E"].includes(label));
    return { count: labels.length, labels, special: Boolean(labels.length) };
  }
  const { tokenId, batchCode, colorId } = input;
  const root = Math.sqrt(tokenId);
  const labels: string[] = [];
  if (Number.isInteger(root) && (batchCode - root) % 7 === 0) labels.push("A");
  if (tokenId % 100 === 0) labels.push("B");
  if (tokenId % 10 === 0 && batchCode % 10 === 0) labels.push("C");
  if (batchCode !== 0 && tokenId % batchCode === 0) labels.push("D");
  if (batchCode % 10 === colorId && colorId >= 1 && colorId <= 5) labels.push("E");
  return { count: labels.length, labels, special: Boolean(labels.length) };
}
