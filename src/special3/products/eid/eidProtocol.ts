import type { PaymentToken } from "../../../lib/types";

export type EidAvailabilityStatus =
  | "available"
  | "taken"
  | "blocked"
  | "restricted"
  | "owned"
  | "invalid"
  | "unavailable";
export type EidFreshness = "fresh" | "stale" | "expired" | "unavailable";
export type EidNetworkFeeResponsibility = "user" | "owner-delegate-sponsored";
export type EidInviteStatus = "none" | "requested" | "available" | "unavailable";

export interface EidSourceTruth {
  source: "preview" | "live";
  label: string;
  freshness: EidFreshness;
  providerNow: string;
  detail: string;
}
export interface EidOwnedIdentity {
  id: string;
  name: string;
  tokenId: string;
  version: number;
  ownerWallet: string;
  active: boolean;
  originalMinter: string;
  originalMinterReferrer?: string;
  contractAddress?: string;
  inviteStatus: EidInviteStatus;
  inviteLink?: string;
  listable: boolean;
}
export interface EidDiscountLine {
  id: "fan-star" | "completed-stock" | "completed-shield";
  label: string;
  percent: number;
  qualified: boolean;
}
export interface EidSettlementLeg {
  destination: "ERA" | "Maintenance" | "QDrop" | "IC";
  percent: 50 | 30 | 10;
  asset: "Q" | "ETER";
  amount?: string;
}
export interface EidPaymentLeg {
  asset: PaymentToken;
  amount: string;
  label: string;
}
export interface EidAcquisitionQuote {
  quoteId: string;
  version: number;
  canonicalName: string;
  availability: EidAvailabilityStatus;
  acquisitionOrdinal: number;
  basePriceUsd: number | null;
  firstFreeApplied: boolean;
  surchargePercent: number;
  surchargeAmountUsd: number;
  discountBreakdown: EidDiscountLine[];
  totalDiscountPercent: number;
  finalPriceUsd: number;
  acceptedPaymentAssets: PaymentToken[];
  selectedPaymentAsset?: PaymentToken;
  paymentLegs: EidPaymentLeg[];
  settlementLegs: EidSettlementLeg[];
  networkFeeResponsibility: EidNetworkFeeResponsibility;
  authorizationSteps: string[];
  freshness: EidFreshness;
  expiresAt: string;
  providerNow: string;
  source: string;
}
export interface EidMarketplaceListing {
  id: string;
  version: number;
  eidId: string;
  name: string;
  tokenId: string;
  sellerWallet: string;
  originalMinter: string;
  originalMinterReferrer?: string;
  amount: number;
  paymentAsset: PaymentToken;
  status: "listed" | "sold";
}
export interface EidMarketplaceQuote {
  quoteId: string;
  version: number;
  listingId: string;
  listingVersion: number;
  eidId: string;
  tokenId: string;
  eidName: string;
  sellerWallet: string;
  originalMinter: string;
  originalMinterReferrer: string;
  amount: number;
  paymentAsset: PaymentToken;
  loyaltyPercent: 19;
  sellerNetPercent: 81;
  loyaltySplit: Array<{
    destination: "ERA" | "Original minter" | "Original minter referrer";
    percent: 8 | 3;
    recipient: string;
    amount: number;
  }>;
  freshness: EidFreshness;
  expiresAt: string;
  providerNow: string;
}
export interface EidProtocolContext {
  source: EidSourceTruth;
  user: {
    wallet: string;
    displayIdentity: string;
    activeEid?: string;
    acquisitionCount: number;
    nextAcquisitionOrdinal: number;
    fanMember: boolean;
    fanStars: number;
    completedStockQualified: boolean;
    completedShieldQualified: boolean;
    currentDiscountPercent: number;
  };
  policy: {
    lettersAndNumbersOnly: true;
    publicShortNameMinimum: 4;
    firstFreeEnabled: boolean;
    currentBasePriceUsd: number;
    thirdPlusSurchargePercent: number;
    acceptedPaymentAssets: PaymentToken[];
    paymentUsdRates: Record<PaymentToken, number>;
    loyaltyPercent: 19;
    progressionOwner: "Achievement";
  };
  owned: EidOwnedIdentity[];
  listings: EidMarketplaceListing[];
  marketplace: {
    canList: boolean;
    supportedListingPaymentAssets: PaymentToken[];
  };
}

export const canonicalEidName = (value: string) =>
  `${value.trim().toUpperCase().replace(/\.ETER$/i, "")}.ETER`;
export const eidPublicNameValid = (value: string) => /^[A-Za-z0-9]+$/.test(value.trim());
export const eidNameRoot = (value: string) =>
  value.trim().toUpperCase().replace(/\.ETER$/i, "");
export const eidDisplayIdentity = (context: EidProtocolContext) =>
  context.user.activeEid ?? context.user.wallet;
export const eidOwnedByCurrentWallet = (
  context: EidProtocolContext,
  eidId: string,
) =>
  context.owned.some(
    (eid) =>
      eid.id === eidId &&
      eid.ownerWallet.toLowerCase() === context.user.wallet.toLowerCase(),
  );
export const eidQuoteReviewable = (quote?: EidAcquisitionQuote) =>
  Boolean(
    quote &&
      quote.availability === "available" &&
      quote.freshness === "fresh" &&
      Number.isFinite(Date.parse(quote.providerNow)) &&
      Number.isFinite(Date.parse(quote.expiresAt)) &&
      Date.parse(quote.providerNow) < Date.parse(quote.expiresAt) &&
      quote.finalPriceUsd >= 0 &&
      (quote.finalPriceUsd === 0 ||
        (quote.selectedPaymentAsset &&
          quote.paymentLegs.length === 1 &&
          quote.paymentLegs[0]?.asset === quote.selectedPaymentAsset &&
          Number.isFinite(Number(quote.paymentLegs[0]?.amount)) &&
          Number(quote.paymentLegs[0]?.amount) > 0)),
  );
