import type { PaymentToken } from "../../lib/types";
import type { EidPreviewExecutionContext } from "../../special3/providers/products/preview/eidPrivateData";
import type { EidAcquisitionQuote, EidAvailabilityStatus, EidMarketplaceQuote, EidProtocolContext } from "../../special3/products/eid/eidProtocol";
import { canonicalEidName, eidNameRoot, eidOwnedByCurrentWallet, eidPublicNameValid, eidQuoteReviewable } from "../../special3/products/eid/eidProtocol";

const requireExecution = (execution?: EidPreviewExecutionContext) => {
  if (!execution) throw new Error("EID provider execution context is unavailable.");
  return execution;
};
const tx = (action: string, id: string) => ({ txHash: `0xpreview_eid_${action}_${id}_${Date.now()}` });
const fixed = (value: number) => Number(value.toFixed(2));
const providerTime = (context: EidProtocolContext) => {
  const value = Date.parse(context.source.providerNow);
  if (!Number.isFinite(value)) throw new Error("EID provider clock is invalid.");
  return value;
};
const expiry = (context: EidProtocolContext, expired = false) => new Date(providerTime(context) + (expired ? -1 : 5 * 60_000)).toISOString();
const fingerprint = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(36).toUpperCase();
};
const paymentAmount = (usd: number, asset: PaymentToken, rates: Readonly<Record<PaymentToken, number>>) => {
  if (!Number.isFinite(rates[asset]) || rates[asset] <= 0) throw new Error("EID provider payment conversion is unavailable.");
  return (usd / rates[asset]).toFixed(asset === "USDT" ? 2 : 6).replace(/\.?0+$/, "");
};
const delay = async (milliseconds = 0) => { if (milliseconds > 0) await new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds)); };

function availability(execution: EidPreviewExecutionContext, name: string): EidAvailabilityStatus {
  const { publicContext: context, privateState } = execution;
  const root = eidNameRoot(name);
  if (!root || !eidPublicNameValid(root)) return "invalid";
  if (root.length < context.policy.publicShortNameMinimum) return "restricted";
  if (privateState.blockedNames.includes(root)) return "blocked";
  const canonical = canonicalEidName(root);
  if (context.owned.some((eid) => eid.name === canonical)) return "owned";
  if (context.listings.some((listing) => listing.name === canonical)) return "taken";
  return "available";
}

export function buildEidAcquisitionQuote(execution: EidPreviewExecutionContext, name: string, selectedPaymentAsset?: PaymentToken): EidAcquisitionQuote {
  const { publicContext: context, privateState } = execution;
  const root = eidNameRoot(name), canonicalName = canonicalEidName(root), acquisitionOrdinal = context.user.nextAcquisitionOrdinal;
  const status = availability(execution, root);
  const firstFreeApplied = status === "available" && context.policy.firstFreeEnabled && context.user.fanMember && acquisitionOrdinal === 1;
  const surchargePercent = acquisitionOrdinal >= 3 ? context.policy.thirdPlusSurchargePercent : 0;
  const basePriceUsd = status === "available" ? context.policy.currentBasePriceUsd : null;
  const surchargeAmountUsd = basePriceUsd === null ? 0 : fixed((basePriceUsd * surchargePercent) / 100);
  const discountBreakdown = [
    { id: "fan-star" as const, label: `${context.user.fanStars}-Star FAN`, percent: context.user.fanStars * 5, qualified: context.user.fanMember && context.user.fanStars > 0 },
    { id: "completed-stock" as const, label: "Completed Electoral Stock", percent: 10, qualified: context.user.completedStockQualified },
    { id: "completed-shield" as const, label: "Completed SHIELD", percent: 5, qualified: context.user.completedShieldQualified },
  ];
  const totalDiscountPercent = discountBreakdown.filter((line) => line.qualified).reduce((total, line) => total + line.percent, 0);
  const beforeDiscount = (basePriceUsd ?? 0) + surchargeAmountUsd;
  const finalPriceUsd = firstFreeApplied ? 0 : fixed(Math.max(0, beforeDiscount * (1 - totalDiscountPercent / 100)));
  const acceptedPaymentAssets = [...context.policy.acceptedPaymentAssets];
  const paymentAsset = finalPriceUsd > 0 && selectedPaymentAsset && acceptedPaymentAssets.includes(selectedPaymentAsset) ? selectedPaymentAsset : undefined;
  const paymentLegs = paymentAsset ? [{ asset: paymentAsset, amount: paymentAmount(finalPriceUsd, paymentAsset, context.policy.paymentUsdRates), label: "User payment" }] : [];
  const settlementLegs = finalPriceUsd ? [
    { destination: "ERA" as const, percent: 50 as const, asset: "Q" as const, amount: paymentAmount(finalPriceUsd * 0.5, "Q", context.policy.paymentUsdRates) },
    { destination: "Maintenance" as const, percent: 30 as const, asset: "Q" as const, amount: paymentAmount(finalPriceUsd * 0.3, "Q", context.policy.paymentUsdRates) },
    { destination: "QDrop" as const, percent: 10 as const, asset: "Q" as const, amount: paymentAmount(finalPriceUsd * 0.1, "Q", context.policy.paymentUsdRates) },
    { destination: "IC" as const, percent: 10 as const, asset: "ETER" as const, amount: paymentAmount(finalPriceUsd * 0.1, "ETER", context.policy.paymentUsdRates) },
  ] : [];
  const isExpired = privateState.expiredQuoteNames.includes(root);
  const freshness = isExpired ? "expired" : privateState.staleQuoteNames.includes(root) ? "stale" : context.source.freshness;
  const expiresAt = expiry(context, isExpired);
  const networkFeeResponsibility = privateState.sponsoredNames.includes(root) ? "owner-delegate-sponsored" as const : "user" as const;
  const authorizationSteps = finalPriceUsd === 0 ? ["EID issuance authorization"] : ["Payment authorization", "Provider settlement", "EID issuance authorization"];
  const material = JSON.stringify({ canonicalName, status, acquisitionOrdinal, basePriceUsd, firstFreeApplied, surchargePercent, surchargeAmountUsd, discountBreakdown, totalDiscountPercent, finalPriceUsd, acceptedPaymentAssets, paymentAsset, paymentLegs, settlementLegs, networkFeeResponsibility, authorizationSteps, freshness, expiresAt });
  return {
    quoteId: `EID-V4-${fingerprint(material)}`, version: 4, canonicalName, availability: status, acquisitionOrdinal,
    basePriceUsd, firstFreeApplied, surchargePercent, surchargeAmountUsd, discountBreakdown, totalDiscountPercent,
    finalPriceUsd, acceptedPaymentAssets, selectedPaymentAsset: paymentAsset, paymentLegs, settlementLegs,
    networkFeeResponsibility, authorizationSteps,
    freshness, expiresAt, providerNow: context.source.providerNow, source: context.source.label,
  };
}

export function buildEidMarketQuote(execution: EidPreviewExecutionContext, listingId: string): EidMarketplaceQuote {
  const { publicContext: context, privateState } = execution;
  const listing = context.listings.find((item) => item.id === listingId);
  if (!listing || listing.status !== "listed") throw new Error("Listing unavailable.");
  if (!listing.originalMinterReferrer) throw new Error("Marketplace loyalty routing unavailable: original Minter referrer is unresolved.");
  const isExpired = privateState.expiredMarketListingIds.includes(listing.id);
  const freshness = isExpired ? "expired" : context.source.freshness;
  const expiresAt = expiry(context, isExpired), amount = listing.amount;
  const loyaltySplit = [
    { destination: "ERA" as const, percent: 8 as const, recipient: "protocol:ERA", amount: fixed(amount * 0.08) },
    { destination: "Original minter" as const, percent: 8 as const, recipient: listing.originalMinter, amount: fixed(amount * 0.08) },
    { destination: "Original minter referrer" as const, percent: 3 as const, recipient: listing.originalMinterReferrer, amount: fixed(amount * 0.03) },
  ];
  const material = JSON.stringify({ listingId, listingVersion: listing.version, eidId: listing.eidId, tokenId: listing.tokenId, eidName: listing.name, seller: listing.sellerWallet, originalMinter: listing.originalMinter, originalMinterReferrer: listing.originalMinterReferrer, amount, asset: listing.paymentAsset, loyaltySplit, freshness, expiresAt });
  return {
    quoteId: `EID-MARKET-${fingerprint(material)}`, version: 1, listingId: listing.id, listingVersion: listing.version,
    eidId: listing.eidId, tokenId: listing.tokenId, eidName: listing.name, sellerWallet: listing.sellerWallet,
    originalMinter: listing.originalMinter, originalMinterReferrer: listing.originalMinterReferrer,
    amount, paymentAsset: listing.paymentAsset,
    loyaltyPercent: 19, sellerNetPercent: 81,
    loyaltySplit,
    freshness, expiresAt, providerNow: context.source.providerNow,
  };
}

const assertFreshExpiry = (providerNow: string, currentExpiry: string, expectedExpiry: string) => {
  const now = Date.parse(providerNow), current = Date.parse(currentExpiry), expected = Date.parse(expectedExpiry);
  if (!Number.isFinite(now) || !Number.isFinite(current) || !Number.isFinite(expected) || currentExpiry !== expectedExpiry || now >= expected)
    throw new Error("Reviewed EID quote expired or provider time is invalid. Request a fresh quote.");
};

export const eidAdapter = {
  async searchEID(..._args: unknown[]): Promise<never> { throw new Error("Historical EID view is superseded by the current EID V4 protocol."); },
  async mintEID(..._args: unknown[]): Promise<never> { throw new Error("Historical EID view is superseded by the current EID V4 protocol."); },
  async setPrimaryEID(..._args: unknown[]): Promise<never> { throw new Error("Historical EID view is superseded by the current EID V4 protocol."); },
  async buyEID(..._args: unknown[]): Promise<never> { throw new Error("Historical EID view is superseded by the current EID V4 protocol."); },
  async checkEidAvailability(params: { name: string }, providerExecution?: EidPreviewExecutionContext) {
    const execution = requireExecution(providerExecution), root = eidNameRoot(params.name);
    await delay(execution.privateState.quoteDelayMsByName[root]);
    return { canonicalName: canonicalEidName(params.name), status: availability(execution, params.name), source: execution.publicContext.source.source, freshness: execution.publicContext.source.freshness };
  },
  async quoteEidAcquisition(params: { name: string; paymentAsset?: PaymentToken }, providerExecution?: EidPreviewExecutionContext) {
    const execution = requireExecution(providerExecution), root = eidNameRoot(params.name);
    await delay(execution.privateState.quoteDelayMsByName[root]);
    return buildEidAcquisitionQuote(execution, params.name, params.paymentAsset);
  },
  async acquireEid(params: { name: string; expectedQuoteId: string; expectedVersion: number; expectedExpiresAt: string; expectedAcquisitionOrdinal: number; paymentAsset?: PaymentToken; expectedPaymentLegs: EidAcquisitionQuote["paymentLegs"]; expectedFinalPriceUsd: number; expectedNetworkFeeResponsibility: "user" | "owner-delegate-sponsored" }, providerExecution?: EidPreviewExecutionContext) {
    const execution = requireExecution(providerExecution), current = buildEidAcquisitionQuote(execution, params.name, params.paymentAsset);
    assertFreshExpiry(current.providerNow, current.expiresAt, params.expectedExpiresAt);
    if (!eidQuoteReviewable(current) || current.quoteId !== params.expectedQuoteId || current.version !== params.expectedVersion || current.acquisitionOrdinal !== params.expectedAcquisitionOrdinal || current.finalPriceUsd !== params.expectedFinalPriceUsd || current.networkFeeResponsibility !== params.expectedNetworkFeeResponsibility || current.selectedPaymentAsset !== params.paymentAsset || JSON.stringify(current.paymentLegs) !== JSON.stringify(params.expectedPaymentLegs))
      throw new Error("EID acquisition quote or provider eligibility state changed.");
    return { ...tx("acquire", current.canonicalName), quoteId: current.quoteId, evidenceState: "acquisition-submitted" as const };
  },
  async setActiveEid(params: { eidId: string; expectedVersion: number }, providerExecution?: EidPreviewExecutionContext) {
    const context = requireExecution(providerExecution).publicContext, owned = context.owned.find((eid) => eid.id === params.eidId);
    if (!owned || !eidOwnedByCurrentWallet(context, params.eidId)) throw new Error("Current wallet does not own this EID.");
    if (owned.version !== params.expectedVersion) throw new Error("EID version changed.");
    return { ...tx("active", owned.id), activeEid: owned.name };
  },
  async requestEidInviteLink(params: { eidId: string; expectedVersion: number }, providerExecution?: EidPreviewExecutionContext) {
    const context = requireExecution(providerExecution).publicContext, owned = context.owned.find((eid) => eid.id === params.eidId);
    if (!owned || !eidOwnedByCurrentWallet(context, params.eidId)) throw new Error("Only the current EID owner may request an invite link.");
    if (owned.version !== params.expectedVersion) throw new Error("EID version changed.");
    if (owned.inviteStatus !== "none") throw new Error("Invite link request is unavailable for the current provider invite state.");
    return { ...tx("invite", owned.id), inviteLink: `https://invite.eternity.example/eid/${owned.id}`, status: "available" as const };
  },
  async listEidForSale(params: { eidId: string; amount: number; paymentAsset: PaymentToken; expectedVersion: number }, providerExecution?: EidPreviewExecutionContext) {
    const execution = requireExecution(providerExecution), context = execution.publicContext, owned = context.owned.find((eid) => eid.id === params.eidId);
    if (!context.marketplace.canList || !owned || !eidOwnedByCurrentWallet(context, params.eidId) || !owned.listable) throw new Error("EID is not listable by the current wallet.");
    if (context.listings.some((listing) => listing.eidId === owned.id && listing.status === "listed")) throw new Error("This EID already has an active marketplace listing.");
    if (owned.version !== params.expectedVersion || !Number.isFinite(params.amount) || params.amount <= 0 || !execution.privateState.listingActionSupportedAssets.includes(params.paymentAsset))
      throw new Error("Listing terms, supported payment asset, or EID version changed.");
    return { ...tx("list", owned.id), listingVersion: 1 };
  },
  async quoteEidMarketBuy(params: { listingId: string }, providerExecution?: EidPreviewExecutionContext) { const execution = requireExecution(providerExecution); await delay(execution.privateState.marketQuoteDelayMsByListingId[params.listingId]); return buildEidMarketQuote(execution, params.listingId); },
  async buyEid(params: { listingId: string; expectedListingVersion: number; expectedQuoteId: string; expectedQuoteVersion: number; expectedExpiresAt: string; expectedOwner: string; expectedAmount: number; expectedPaymentAsset: PaymentToken; expectedLoyaltySplit: EidMarketplaceQuote["loyaltySplit"] }, providerExecution?: EidPreviewExecutionContext) {
    const quote = buildEidMarketQuote(requireExecution(providerExecution), params.listingId);
    assertFreshExpiry(quote.providerNow, quote.expiresAt, params.expectedExpiresAt);
    if (quote.freshness !== "fresh" || quote.listingVersion !== params.expectedListingVersion || quote.quoteId !== params.expectedQuoteId || quote.version !== params.expectedQuoteVersion || quote.sellerWallet.toLowerCase() !== params.expectedOwner.toLowerCase() || quote.amount !== params.expectedAmount || quote.paymentAsset !== params.expectedPaymentAsset || JSON.stringify(quote.loyaltySplit) !== JSON.stringify(params.expectedLoyaltySplit))
      throw new Error("Marketplace quote or listing state changed.");
    return { ...tx("buy", quote.listingId), quoteId: quote.quoteId };
  },
};
