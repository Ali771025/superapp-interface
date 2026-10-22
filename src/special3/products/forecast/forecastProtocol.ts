export type ForecastMode = 'standard' | 'special' | 'free' | 'gift';
export type ForecastPaymentAsset = 'USDT' | 'ETER' | 'ET';
export type ForecastDonationPool = 'main' | 'savior' | 'savior-prizes';
export type ForecastNumber = string;

export interface ForecastPrediction {
  white1: ForecastNumber;
  white2: ForecastNumber;
  white3: ForecastNumber;
  golden: ForecastNumber;
  blue: ForecastNumber;
}

export interface ForecastWeekState {
  id: string;
  weekNumber: number;
  startsAt: string;
  endsAt: string;
  participationOpensAt: string;
  participationClosesAt: string;
  currentState: 'scheduled' | 'open' | 'closed' | 'resolved';
  source: 'preview' | 'live';
  ownerPriceOverride?: number;
}

export interface ForecastParticipationQuote {
  id: string;
  mode: ForecastMode;
  beneficiary?: string;
  beneficiaryEligible?: boolean;
  isFanMember: boolean;
  fanStarLevel: 0 | 1 | 2 | 3 | 4;
  weeklyUsedEntries: number;
  weeklyEntryLimit?: number;
  usdFee?: number;
  paymentPerEntry?: Partial<Record<ForecastPaymentAsset, number>>;
  acceptedPaymentAssets: ForecastPaymentAsset[];
  quoteExpiresAt?: string;
  freeTicketEligible?: boolean;
  freeTicketAvailable?: boolean;
  freeTicketUsedThisWeek?: boolean;
  freeTicketActivatesAt?: string;
  freeTicketId?: string;
}

export interface ForecastTicket {
  id: string;
  source: 'earned' | 'qdrop' | 'gifted' | 'other';
  status: 'locked' | 'available' | 'used' | 'gifted' | 'expired';
  owned: boolean;
  activatesAt?: string;
  weekId?: string;
}

export interface ForecastTicketGiftQuote {
  id: string;
  version: number;
  ticketId: string;
  beneficiary: string;
  eligible: boolean;
  beneficiaryIsFan: boolean;
  beneficiaryStarLevel: 0 | 1 | 2 | 3 | 4;
  beneficiaryWeeklyUse: number;
  beneficiaryWeeklyLimit?: number;
  methods: { signature: boolean; transaction: boolean };
  costRequired: boolean;
  cost?: ForecastEntitlement;
  source: 'preview' | 'live';
}

export interface ForecastEntryRecord {
  id: string;
  weekId: string;
  mode: ForecastMode;
  beneficiary?: string;
  paymentAsset?: ForecastPaymentAsset;
  paymentAmount?: number;
  prediction: ForecastPrediction;
  submittedAt: string;
  status: 'active' | 'resolved' | 'won' | 'lost' | 'forfeited';
  result?: ForecastPrediction;
  prizeCategory?: number;
  grossPrizeETER?: number;
  taxETER?: number;
  netPrizeETER?: number;
}

export interface ForecastEntitlement { amount: number; token: 'ETER'; }
export type ForecastClaimScope = 'entry' | 'wallet-week' | 'savior' | 'contributor';
export interface ForecastClaimState {
  claimId: string;
  version: number;
  scope: ForecastClaimScope;
  entryId?: string;
  phase: 'check' | 'withdraw' | 'closed';
  status: 'unchecked' | 'checked' | 'withdrawable' | 'withdrawn' | 'forfeited' | 'not-winner';
  checkWindow: { opensAt: string; closesAt: string };
  withdrawWindow: { opensAt: string; closesAt: string };
  entitlement?: ForecastEntitlement;
  tax?: { totalETER: number; saviorPrizesETER: number; referrerOrQDropETER: number; destination: 'referrer' | 'QDrop' };
}

export interface ForecastClaimGuard {
  claimId: string;
  version: number;
  scope: ForecastClaimScope;
  entryId?: string;
  expectedEntitlement: ForecastEntitlement;
}

export interface ForecastPoolState {
  mainPoolETER: number;
  saviorPoolETER: number;
  saviorPrizesPoolETER: number;
  contributorPoolETER: number;
  rolloverETER: number;
  donationCapability: boolean;
  donationCapabilities: Record<ForecastDonationPool, boolean>;
  acceptedDonationAssets: ForecastPaymentAsset[];
}

export interface ForecastSaviorState {
  generalSavior: boolean;
  specialSavior: boolean;
  starredSavior: boolean;
  starAtParticipation: number;
  providerPosition?: string;
  entitlement?: ForecastEntitlement;
}

export interface ForecastContributorState {
  starLevel: number;
  ownPreviousPredictions: number;
  firstLinePreviousPredictions: number;
  combinedPredictions: number;
  eligible: boolean;
  points?: number;
  entitlement?: ForecastEntitlement;
  claim: ForecastClaimState;
}

export interface ForecastPreviousTreasurySnapshot {
  label: 'Previous Forecast Treasury';
  token: 'ETER';
  sourceMode: 'owner-reference-snapshot' | 'live-provider';
  rows: Array<{ category:1|2|3|4|5|6|7|8; match:string; amountETER:string }>;
  displayTotalETER: string;
  capturedLabel?: string;
}

export interface ForecastProtocolContext {
  source: 'preview' | 'live';
  week: ForecastWeekState;
  quote: ForecastParticipationQuote;
  quotes: Record<ForecastMode, ForecastParticipationQuote>;
  entries: ForecastEntryRecord[];
  claim: ForecastClaimState;
  pools: ForecastPoolState;
  savior: ForecastSaviorState;
  contributor: ForecastContributorState;
  previousTreasury?: ForecastPreviousTreasurySnapshot;
  freeTickets: number;
  tickets: ForecastTicket[];
  ticketProgress?: { entriesTowardNext: number; threshold: 25; usedThisWeek: boolean };
  ticketGiftCapabilities: { signature: boolean; transaction: boolean };
  activity?: Array<{ id: string; label: string; detail: string }>;
}

export interface ForecastEnterInput {
  mode: ForecastMode;
  predictions: ForecastPrediction[];
  paymentAsset?: ForecastPaymentAsset;
  paymentAmount?: number;
  beneficiary?: string;
  freeTicketId?: string;
  expectedQuote: { id: string; usdFee?: number; asset?: ForecastPaymentAsset; total?: number; beneficiary?: string };
}

export const FORECAST_PAYMENT_ASSETS: ForecastPaymentAsset[] = ['USDT', 'ETER', 'ET'];
export const FORECAST_PAYMENT_SPLIT = { burn:4, eternalGenerator:3, qDrop:3, provider:10, contributor:10 } as const;
export const FORECAST_SECONDARY_SPLIT = { forecastPools:85, saviorPrizes:5, era:4, stockholders:4, research:2 } as const;
export const FORECAST_PRIZE_MATRIX = [
  { category:1, percent:21, match:'W1 + W2 + W3 + Golden + Blue', maxETER:null },
  { category:2, percent:14, match:'W2 + W3 + Golden', maxETER:50 },
  { category:3, percent:12, match:'W3 + Golden', maxETER:40 },
  { category:4, percent:10, match:'W1 + W2 + W3 + Blue', maxETER:30 },
  { category:5, percent:8, match:'W1 + W2 + Golden', maxETER:20 },
  { category:6, percent:7, match:'W3 OR Golden', maxETER:10 },
  { category:7, percent:5, match:'W1 + W2 + Blue', maxETER:5 },
  { category:8, percent:8, match:'No category above', maxETER:1 },
] as const;

export function isForecastNumber(value: string): boolean {
  return /^\d{2}$/.test(value) && Number(value) >= 0 && Number(value) <= 99;
}

export function isForecastPrediction(value: ForecastPrediction): boolean {
  return Object.values(value).every(isForecastNumber);
}

export function standardWeeklyLimit(starLevel: number): number {
  return Math.min(25, 5 + Math.max(0, Math.min(4, Math.floor(starLevel))) * 5);
}

export function standardFeeUsd(isFanMember: boolean, hoursSinceParticipationOpen: number, ownerOverride?: number): number {
  if (ownerOverride !== undefined) return ownerOverride;
  const minimum = isFanMember ? 1 : 2;
  const maximum = isFanMember ? 3 : 4;
  if (hoursSinceParticipationOpen <= 24) return minimum;
  const increments = Math.floor((hoursSinceParticipationOpen - 24) / 6) + 1;
  return Math.min(maximum, Number((minimum + increments * 0.1).toFixed(1)));
}

export function contributorEligibility(value: Pick<ForecastContributorState,'starLevel'|'ownPreviousPredictions'|'firstLinePreviousPredictions'|'combinedPredictions'>): boolean {
  return value.starLevel >= 2 && value.ownPreviousPredictions >= 5 && value.firstLinePreviousPredictions >= 20 && value.combinedPredictions >= 100;
}

export function starredSaviorEligibility(value: Pick<ForecastSaviorState,'starAtParticipation'>): boolean { return value.starAtParticipation >= 3; }

export function validateForecastEntry(input: ForecastEnterInput, context?: ForecastProtocolContext, authoritativeQuote?: ForecastParticipationQuote): void {
  if (!context) throw new Error('Authoritative Forecast context is unavailable.');
  if (context.week.currentState !== 'open') throw new Error('Forecast participation window is closed.');
  if (!input.predictions.length || input.predictions.some((prediction) => !isForecastPrediction(prediction))) throw new Error('Every Forecast number must be 00 through 99.');
  const quote = authoritativeQuote ?? context.quotes[input.mode];
  if (!quote || quote.mode !== input.mode || input.expectedQuote.id !== quote.id || input.expectedQuote.usdFee !== quote.usdFee) throw new Error('Forecast quote changed. Review again.');
  if (input.mode === 'standard' && quote.weeklyEntryLimit !== undefined && quote.weeklyUsedEntries + input.predictions.length > quote.weeklyEntryLimit) throw new Error('Standard weekly entry limit reached.');
  if (input.mode === 'free') {
    if (input.predictions.length !== 1) throw new Error('One Forecast free ticket authorizes exactly one prediction.');
    if (!quote.freeTicketEligible || !quote.freeTicketAvailable || quote.freeTicketUsedThisWeek || !quote.freeTicketId || input.freeTicketId !== quote.freeTicketId) throw new Error('A currently available Forecast free ticket is required.');
  }
  if (input.mode === 'gift') {
    if (!input.beneficiary || input.beneficiary !== quote.beneficiary || input.expectedQuote.beneficiary !== quote.beneficiary || !quote.beneficiaryEligible) throw new Error('Forecast beneficiary is not eligible.');
    if (quote.weeklyEntryLimit !== undefined && quote.weeklyUsedEntries + input.predictions.length > quote.weeklyEntryLimit) throw new Error('Forecast beneficiary weekly entry limit reached.');
  }
  if (input.mode !== 'free') {
    if (!input.paymentAsset || !FORECAST_PAYMENT_ASSETS.includes(input.paymentAsset)) throw new Error('Forecast payment asset must be USDT, ETER, or ET.');
    const unit=quote.paymentPerEntry?.[input.paymentAsset];
    const required=unit===undefined?undefined:Number((unit*input.predictions.length).toFixed(6));
    if (required===undefined || input.expectedQuote.asset!==input.paymentAsset || input.expectedQuote.total===undefined || Math.abs(input.expectedQuote.total-required)>0.000001 || !Number.isFinite(input.paymentAmount) || Math.abs(Number(input.paymentAmount)-required)>0.000001) throw new Error('Forecast settlement amount does not match the provider quote.');
  }
}

export function isForecastEntitlement(value?: ForecastEntitlement): value is ForecastEntitlement {
  return Boolean(value?.token === 'ETER' && Number.isFinite(value.amount) && value.amount > 0);
}
