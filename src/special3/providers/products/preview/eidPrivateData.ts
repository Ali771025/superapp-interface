import type { PaymentToken } from "../../../../lib/types";
import type { EidProtocolContext } from "../../../products/eid/eidProtocol";

export interface EidPreviewPrivateState {
  blockedNames: readonly string[];
  sponsoredNames: readonly string[];
  staleQuoteNames: readonly string[];
  expiredQuoteNames: readonly string[];
  expiredMarketListingIds: readonly string[];
  quoteDelayMsByName: Readonly<Record<string, number>>;
  marketQuoteDelayMsByListingId: Readonly<Record<string, number>>;
  listingActionSupportedAssets: readonly PaymentToken[];
}

export interface EidPreviewExecutionContext {
  publicContext: EidProtocolContext;
  privateState: EidPreviewPrivateState;
}

const basePrivateState: EidPreviewPrivateState = {
  blockedNames: ["ADMIN", "ETERNITY"],
  sponsoredNames: ["SPONSOR"],
  staleQuoteNames: ["STALE"],
  expiredQuoteNames: [],
  expiredMarketListingIds: [],
  quoteDelayMsByName: {},
  marketQuoteDelayMsByListingId: {},
  listingActionSupportedAssets: ["USDT", "ETER", "ET", "Q"],
};

const clonePublicContext = (base: EidProtocolContext): EidProtocolContext => ({
  ...base,
  source: { ...base.source },
  user: { ...base.user },
  policy: { ...base.policy, acceptedPaymentAssets: [...base.policy.acceptedPaymentAssets], paymentUsdRates: { ...base.policy.paymentUsdRates } },
  owned: base.owned.map((item) => ({ ...item })),
  listings: base.listings.map((item) => ({ ...item })),
  marketplace: { ...base.marketplace, supportedListingPaymentAssets: [...base.marketplace.supportedListingPaymentAssets] },
});

const scenarioFromSearch = (search: string) => new URLSearchParams(search).get("capture") ?? "overview";

export function resolvePreviewEidPublicContext(base: EidProtocolContext, search: string): EidProtocolContext {
  const context = clonePublicContext(base);
  const scenario = scenarioFromSearch(search);
  if (["no-eid", "no-owned-market"].includes(scenario)) { context.user.activeEid = undefined; context.user.displayIdentity = context.user.wallet; context.owned = []; }
  if (["first-free", "free-review"].includes(scenario)) { context.user.acquisitionCount = 0; context.user.nextAcquisitionOrdinal = 1; context.policy.firstFreeEnabled = true; }
  if (scenario === "free-disabled-first") { context.user.acquisitionCount = 0; context.user.nextAcquisitionOrdinal = 1; context.policy.firstFreeEnabled = false; }
  if (["cumulative-discount", "paid-review", "four-payments"].includes(scenario)) { context.user.acquisitionCount = 1; context.user.nextAcquisitionOrdinal = 2; context.policy.firstFreeEnabled = false; }
  if (["third-plus", "sponsored", "stale-quote", "expired-acquisition"].includes(scenario)) { context.user.acquisitionCount = 2; context.user.nextAcquisitionOrdinal = 3; context.policy.firstFreeEnabled = false; }
  if (scenario === "invite-none") context.owned[0] = { ...context.owned[0], inviteStatus: "none", inviteLink: undefined };
  if (scenario === "market-race" && context.listings[1]) context.listings[1] = { ...context.listings[1], originalMinterReferrer: "0x7180f0057E08490063b27B221523e9B4cD0B4212" };
  return context;
}

export function resolvePreviewEidPrivateState(search: string): EidPreviewPrivateState {
  const scenario = scenarioFromSearch(search);
  return {
    ...basePrivateState,
    blockedNames: [...basePrivateState.blockedNames],
    sponsoredNames: [...basePrivateState.sponsoredNames],
    staleQuoteNames: [...basePrivateState.staleQuoteNames],
    expiredQuoteNames: scenario === "expired-acquisition" ? ["EXPIRED"] : [],
    expiredMarketListingIds: scenario === "expired-market" ? ["listing-001"] : [],
    quoteDelayMsByName: scenario === "search-race" ? { RACEA: 320, RACEB: 20 } : {},
    marketQuoteDelayMsByListingId: scenario === "market-race" ? { "listing-001": 320, "listing-002": 20 } : {},
    listingActionSupportedAssets: scenario === "unsupported-list-asset" ? ["USDT"] : [...basePrivateState.listingActionSupportedAssets],
  };
}
