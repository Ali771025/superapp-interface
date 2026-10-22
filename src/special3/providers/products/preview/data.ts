import {
  mockCurrentForecast,
  mockEcosystemStats,
  mockFanProfile,
  mockForecastEntries,
  mockOwnedEids,
  mockRewards,
  mockShields,
  mockTokenRates,
  mockUser,
} from "../../../../data/mockAssets";
import {
  STOCK_PHASE_ONE_SUPPLY,
  purchaseAllowance,
  stockPreviewContext,
  stockPreviewPositions,
  type StockProtocolContext,
} from "../../../products/stock/stockProtocol";
import { mockTransactionLogs } from "../../../../data/mockLogs";
import type { ProductPresentationData } from "../contracts";
import type {
  ForecastMode,
  ForecastProtocolContext,
} from "../../../products/forecast/forecastProtocol";
import { getPreviewFanProtocolContext } from "./fanData";
import type {
  EraEliteFundState,
  EraEliteGradeState,
  EraProposalRecord,
  EraProtocolContext,
  EraSuggestionInput,
  EraVotingRecord,
} from "../../../products/era/eraProtocol";
import type { EidProtocolContext } from "../../../products/eid/eidProtocol";
import {
  resolvePreviewEidPrivateState,
  resolvePreviewEidPublicContext,
  type EidPreviewExecutionContext,
} from "./eidPrivateData";

const previewRewardPools: ProductPresentationData["rewardPools"] = [
  {
    id: "shield-100",
    product: "SHIELD",
    title: "$100 Shareholders",
    cycle: "Quarterly",
    amount: 28400,
    token: "ETER",
  },
  {
    id: "shield-1000",
    product: "SHIELD",
    title: "$1,000 Shareholders",
    cycle: "Quarterly",
    amount: 64200,
    token: "ETER",
  },
  {
    id: "shield-10000",
    product: "SHIELD",
    title: "$10,000 Shareholders",
    cycle: "Quarterly",
    amount: 110800,
    token: "ETER",
  },
  {
    id: "stock-dividends",
    product: "Stock",
    title: "Electoral income",
    cycle: "Biannual distribution",
    amount: 84300,
    token: "ETER",
  },
  {
    id: "forecast-savior",
    product: "Forecast",
    title: "Savior",
    cycle: "Instant shared claim",
    amount: 18420,
    token: "ETER",
  },
  {
    id: "forecast-contributor",
    product: "Forecast",
    title: "Contributor",
    cycle: "Weekly CHECK / WITHDRAW",
    amount: 12100,
    token: "ETER",
  },
  {
    id: "elite-performance",
    product: "Elite",
    title: "Elite performance",
    cycle: "Monthly distribution",
    amount: 96500,
    token: "ETER",
  },
];

const previewRewardHistory: ProductPresentationData["rewardHistory"] = [
  {
    id: "history-forecast-27",
    title: "Forecast Week 27 prize",
    occurredAt: "2025-07-05T12:00:00Z",
    amount: 45,
    token: "ETER",
    status: "confirmed",
    productRef: "fc_001",
  },
  {
    id: "history-fan-direct",
    title: "Historical FAN direct reward · confirmed",
    occurredAt: "2025-07-03T12:00:00Z",
    amount: 12,
    token: "ETER",
    status: "confirmed",
  },
  {
    id: "history-stock-dividend",
    title: "STOCK income check",
    occurredAt: "2026-07-02T12:00:00Z",
    amount: 43.25,
    token: "ETER",
    status: "confirmed",
    productRef: "#EES-0044",
  },
];

const previewVotingPower = stockPreviewPositions.reduce(
  (total, stock) => total + stock.votingPower,
  0,
);

/** Preview-owned STOCK authority. UI receives this only through ProductPresentationData. */
export const previewStockProtocolContext: StockProtocolContext = {
  ...stockPreviewContext,
  weeklyDailySold: stockPreviewContext.weeklyDailySold.map((day) => ({
    ...day,
  })),
  income: stockPreviewContext.income
    ? {
        ...stockPreviewContext.income,
        checkedEntitlement: stockPreviewContext.income.checkedEntitlement
          ? { ...stockPreviewContext.income.checkedEntitlement }
          : undefined,
        withdrawableEntitlement: stockPreviewContext.income
          .withdrawableEntitlement
          ? { ...stockPreviewContext.income.withdrawableEntitlement }
          : undefined,
      }
    : undefined,
  stockActivity: stockPreviewContext.stockActivity?.map((event) => ({
    ...event,
  })),
  referralAwardHistory: stockPreviewContext.referralAwardHistory?.map(
    (award) => ({ ...award }),
  ),
};

function cloneStockContext(
  context: StockProtocolContext,
): StockProtocolContext {
  return {
    ...context,
    weeklyDailySold: context.weeklyDailySold.map((day) => ({ ...day })),
    income: context.income
      ? {
          ...context.income,
          checkedEntitlement: context.income.checkedEntitlement
            ? { ...context.income.checkedEntitlement }
            : undefined,
          withdrawableEntitlement: context.income.withdrawableEntitlement
            ? { ...context.income.withdrawableEntitlement }
            : undefined,
        }
      : undefined,
    stockActivity: context.stockActivity?.map((event) => ({ ...event })),
    referralAwardHistory: context.referralAwardHistory?.map((award) => ({
      ...award,
    })),
  };
}

/** Preview-only QA scenarios. Live providers never import or evaluate this resolver. */
export function resolvePreviewStockScenario(
  baseContext: StockProtocolContext,
  search: string,
): StockProtocolContext {
  const context = cloneStockContext(baseContext);
  const query = new URLSearchParams(search);
  const scenario = query.get("capture") ?? "normal";
  if (scenario === "zero-allowance") {
    const allowance = purchaseAllowance(context);
    return {
      ...context,
      phase1Purchased:
        context.currentPhase === 1 ? allowance : context.phase1Purchased,
      phase2Purchased:
        context.currentPhase === 2 ? allowance : context.phase2Purchased,
    };
  }
  if (scenario === "supply-limited")
    return {
      ...context,
      currentPhase: 1,
      rank: "3-Star",
      phase1Purchased: 0,
      phase1Sold: STOCK_PHASE_ONE_SUPPLY - 1,
    };
  if (scenario === "income-check")
    return {
      ...context,
      income: context.income
        ? { ...context.income, window: "check" }
        : undefined,
    };
  if (scenario === "income-withdraw")
    return {
      ...context,
      income: context.income
        ? { ...context.income, window: "withdraw" }
        : undefined,
    };
  if (scenario === "income-unavailable")
    return { ...context, income: undefined };
  if (scenario === "referrals-one-cycle")
    return {
      ...context,
      directReferralStockPurchases: 19,
      referralAwardedStocks: 1,
      referralAwardHistory: context.referralAwardHistory?.filter(
        (entry) => entry.cycle === 1,
      ),
    };
  if (scenario === "referrals-incomplete-history")
    return {
      ...context,
      directReferralStockPurchases: 38,
      referralAwardedStocks: 2,
      referralAwardHistory: context.referralAwardHistory?.filter(
        (entry) => entry.cycle === 1,
      ),
    };
  if (scenario === "activity-empty") return { ...context, stockActivity: [] };
  return context;
}

export function getPreviewStockProtocolContext(): StockProtocolContext {
  const search = typeof window === "undefined" ? "" : window.location.search;
  return resolvePreviewStockScenario(previewStockProtocolContext, search);
}

const prediction = (
  white1: string,
  white2: string,
  white3: string,
  golden: string,
  blue: string,
) => ({ white1, white2, white3, golden, blue });
const baseForecastQuote = {
  isFanMember: true,
  fanStarLevel: 2 as const,
  weeklyUsedEntries: 2,
  acceptedPaymentAssets: ["USDT", "ETER", "ET"] as Array<
    "USDT" | "ETER" | "ET"
  >,
};
const paymentPerEntry = (usd: number) => ({
  USDT: usd,
  ETER: Number((usd / mockTokenRates.ETER).toFixed(6)),
  ET: Number((usd / mockTokenRates.ET).toFixed(6)),
});

/** Preview-owned Forecast authority. All dates, prices, outcomes and eligibility originate here. */
export const previewForecastProtocolContext: ForecastProtocolContext = {
  source: "preview",
  week: {
    id: "forecast-2026-w33",
    weekNumber: 33,
    startsAt: "2026-08-14T12:00:00Z",
    endsAt: "2026-08-21T12:00:00Z",
    participationOpensAt: "2026-08-15T00:00:00Z",
    participationClosesAt: "2026-08-21T00:00:00Z",
    currentState: "open",
    source: "preview",
  },
  quote: {
    id: "q-standard-33",
    mode: "standard",
    ...baseForecastQuote,
    weeklyEntryLimit: 15,
    usdFee: 1.4,
    paymentPerEntry: paymentPerEntry(1.4),
  },
  quotes: {
    standard: {
      id: "q-standard-33",
      mode: "standard",
      ...baseForecastQuote,
      weeklyEntryLimit: 15,
      usdFee: 1.4,
      paymentPerEntry: paymentPerEntry(1.4),
    },
    special: {
      id: "q-special-33",
      mode: "special",
      ...baseForecastQuote,
      usdFee: 7,
      paymentPerEntry: paymentPerEntry(7),
    },
    free: {
      id: "q-free-33",
      mode: "free",
      ...baseForecastQuote,
      freeTicketEligible: true,
      freeTicketAvailable: true,
      freeTicketUsedThisWeek: false,
      freeTicketActivatesAt: "2026-08-16T00:00:00Z",
      freeTicketId: "FT-33-01",
    },
    gift: {
      id: "q-gift-33",
      mode: "gift",
      ...baseForecastQuote,
      beneficiary: "0xBene1904",
      beneficiaryEligible: true,
      usdFee: 1.4,
      paymentPerEntry: paymentPerEntry(1.4),
    },
  },
  entries: [
    {
      id: "FC-33-002",
      weekId: "forecast-2026-w33",
      mode: "standard",
      paymentAsset: "ETER",
      paymentAmount: 1.037,
      prediction: prediction("07", "14", "22", "05", "03"),
      submittedAt: "2026-08-16T09:14:00Z",
      status: "active",
    },
    {
      id: "FC-32-007",
      weekId: "forecast-2026-w32",
      mode: "special",
      paymentAsset: "USDT",
      paymentAmount: 7,
      prediction: prediction("09", "23", "44", "12", "06"),
      result: prediction("10", "23", "41", "15", "08"),
      submittedAt: "2026-08-09T10:00:00Z",
      status: "lost",
    },
  ],
  claim: {
    claimId: "FCL-32-007",
    version: 1,
    scope: "entry",
    entryId: "FC-32-007",
    phase: "closed",
    status: "not-winner",
    checkWindow: {
      opensAt: "2026-08-21T12:00:00Z",
      closesAt: "2026-08-24T12:00:00Z",
    },
    withdrawWindow: {
      opensAt: "2026-08-24T12:00:00Z",
      closesAt: "2026-08-28T12:00:00Z",
    },
  },
  pools: {
    mainPoolETER: 1599.223215,
    saviorPoolETER: 18420,
    saviorPrizesPoolETER: 920,
    contributorPoolETER: 12100,
    rolloverETER: 348.22,
    donationCapability: true,
    donationCapabilities: { main: true, savior: true, "savior-prizes": true },
    acceptedDonationAssets: ["USDT", "ETER", "ET"],
  },
  savior: {
    generalSavior: false,
    specialSavior: false,
    starredSavior: false,
    starAtParticipation: 2,
  },
  contributor: {
    starLevel: 2,
    ownPreviousPredictions: 12,
    firstLinePreviousPredictions: 64,
    combinedPredictions: 76,
    eligible: false,
    claim: {
      claimId: "FCC-32-WALLET",
      version: 1,
      scope: "contributor",
      phase: "check",
      status: "not-winner",
      checkWindow: {
        opensAt: "2026-08-21T12:00:00Z",
        closesAt: "2026-08-24T12:00:00Z",
      },
      withdrawWindow: {
        opensAt: "2026-08-24T12:00:00Z",
        closesAt: "2026-08-28T12:00:00Z",
      },
    },
  },
  previousTreasury: {
    label: "Previous Forecast Treasury",
    token: "ETER",
    sourceMode: "owner-reference-snapshot",
    capturedLabel: "Owner reference snapshot · read-only",
    displayTotalETER: "1599.223215",
    rows: [
      {
        category: 1,
        match: "W1 + W2 + W3 + Golden + Blue",
        amountETER: "1599.091842",
      },
      { category: 2, match: "W2 + W3 + Golden", amountETER: "0.028738" },
      { category: 3, match: "W3 + Golden", amountETER: "0.024633" },
      { category: 4, match: "W1 + W2 + W3 + Blue", amountETER: "0.020527" },
      { category: 5, match: "W1 + W2 + Golden", amountETER: "0.016422" },
      { category: 6, match: "W3 OR Golden", amountETER: "0.014369" },
      { category: 7, match: "W1 + W2 + Blue", amountETER: "0.010263" },
      { category: 8, match: "Non-winners", amountETER: "0.016422" },
    ],
  },
  freeTickets: 1,
  tickets: [
    {
      id: "FT-33-01",
      source: "earned",
      status: "available",
      owned: true,
      activatesAt: "2026-08-16T00:00:00Z",
      weekId: "forecast-2026-w33",
    },
    {
      id: "QD-33-08",
      source: "qdrop",
      status: "locked",
      owned: true,
      activatesAt: "2026-08-16T00:00:00Z",
    },
  ],
  ticketProgress: { entriesTowardNext: 18, threshold: 25, usedThisWeek: false },
  ticketGiftCapabilities: { signature: true, transaction: true },
  activity: [
    { id: "a1", label: "Standard entry", detail: "FC-33-002 · confirmed" },
    { id: "a2", label: "Free ticket", detail: "FT-33-01 · available" },
  ],
};

function cloneForecastContext(
  context: ForecastProtocolContext,
): ForecastProtocolContext {
  return {
    ...context,
    week: { ...context.week },
    quote: {
      ...context.quote,
      paymentPerEntry: { ...context.quote.paymentPerEntry },
    },
    quotes: Object.fromEntries(
      Object.entries(context.quotes).map(([key, value]) => [
        key,
        { ...value, paymentPerEntry: { ...value.paymentPerEntry } },
      ]),
    ) as Record<ForecastMode, typeof context.quote>,
    entries: context.entries.map((entry) => ({
      ...entry,
      prediction: { ...entry.prediction },
      result: entry.result ? { ...entry.result } : undefined,
    })),
    claim: {
      ...context.claim,
      checkWindow: { ...context.claim.checkWindow },
      withdrawWindow: { ...context.claim.withdrawWindow },
      entitlement: context.claim.entitlement
        ? { ...context.claim.entitlement }
        : undefined,
    },
    pools: {
      ...context.pools,
      donationCapabilities: { ...context.pools.donationCapabilities },
      acceptedDonationAssets: [...context.pools.acceptedDonationAssets],
    },
    savior: {
      ...context.savior,
      entitlement: context.savior.entitlement
        ? { ...context.savior.entitlement }
        : undefined,
    },
    contributor: {
      ...context.contributor,
      entitlement: context.contributor.entitlement
        ? { ...context.contributor.entitlement }
        : undefined,
      claim: {
        ...context.contributor.claim,
        checkWindow: { ...context.contributor.claim.checkWindow },
        withdrawWindow: { ...context.contributor.claim.withdrawWindow },
      },
    },
    previousTreasury: context.previousTreasury
      ? {
          ...context.previousTreasury,
          rows: context.previousTreasury.rows.map((row) => ({ ...row })),
        }
      : undefined,
    tickets: context.tickets.map((ticket) => ({ ...ticket })),
    ticketProgress: context.ticketProgress
      ? { ...context.ticketProgress }
      : undefined,
    ticketGiftCapabilities: { ...context.ticketGiftCapabilities },
    activity: context.activity?.map((item) => ({ ...item })),
  };
}

/** Preview-only QA resolver. Production React never interprets URL state as Forecast truth. */
export function resolvePreviewForecastScenario(
  base: ForecastProtocolContext,
  search: string,
): ForecastProtocolContext {
  const context = cloneForecastContext(base);
  const scenario =
    new URLSearchParams(search).get("forecast-scenario") ??
    "standard-fan-first24";
  const select = (
    mode: ForecastMode,
    patch: Partial<ForecastProtocolContext["quotes"][ForecastMode]> = {},
  ) => {
    const q = { ...context.quotes[mode], ...patch };
    context.quotes[mode] = q;
    context.quote = q;
  };
  if (scenario === "standard-nonfan-escalated")
    select("standard", {
      isFanMember: false,
      usdFee: 3.2,
      paymentPerEntry: paymentPerEntry(3.2),
    });
  else if (scenario === "standard-limit-reached")
    select("standard", { weeklyUsedEntries: 15, weeklyEntryLimit: 15 });
  else if (scenario === "special-unlimited") select("special");
  else if (scenario === "free-unavailable")
    select("free", {
      freeTicketAvailable: false,
      freeTicketUsedThisWeek: true,
    });
  else if (scenario === "free-locked") {
    select("free", {
      freeTicketAvailable: false,
      freeTicketActivatesAt: "2026-08-16T00:00:00Z",
    });
    context.tickets = context.tickets.map((ticket) =>
      ticket.id === "FT-33-01" ? { ...ticket, status: "locked" } : ticket,
    );
  } else if (scenario === "free-available") select("free");
  else if (scenario === "gift-eligible") select("gift");
  else if (scenario === "gift-ineligible")
    select("gift", { beneficiaryEligible: false });
  else if (scenario === "weekly-winner") {
    context.entries = context.entries.map((entry) =>
      entry.id === "FC-32-007"
        ? {
            ...entry,
            result: { ...entry.prediction },
            status: "won",
            prizeCategory: 1,
            grossPrizeETER: 50,
            taxETER: 5,
            netPrizeETER: 45,
          }
        : entry,
    );
    context.entries.push({
      id: "FC-32-009",
      weekId: "forecast-2026-w32",
      mode: "standard",
      paymentAsset: "ETER",
      paymentAmount: 1.037,
      prediction: prediction("12", "24", "48", "06", "03"),
      result: prediction("11", "24", "48", "06", "04"),
      submittedAt: "2026-08-09T11:00:00Z",
      status: "won",
      prizeCategory: 2,
      grossPrizeETER: 30,
      taxETER: 3,
      netPrizeETER: 27,
    });
    context.claim = {
      ...context.claim,
      claimId: "FCL-32-007",
      version: 2,
      scope: "entry",
      entryId: "FC-32-007",
      phase: "check",
      status: "unchecked",
      entitlement: { amount: 45, token: "ETER" },
      tax: {
        totalETER: 5,
        saviorPrizesETER: 2.5,
        referrerOrQDropETER: 2.5,
        destination: "referrer",
      },
    };
    context.savior = {
      ...context.savior,
      generalSavior: true,
      providerPosition: "General Savior · all five sections verified",
      entitlement: { amount: 12, token: "ETER" },
    };
  } else if (scenario === "check-open")
    context.claim = {
      ...context.claim,
      phase: "check",
      status: "unchecked",
      entitlement: { amount: 45, token: "ETER" },
    };
  else if (scenario === "withdraw-open")
    context.claim = {
      ...context.claim,
      phase: "withdraw",
      status: "withdrawable",
      entitlement: { amount: 45, token: "ETER" },
    };
  else if (scenario === "forfeited")
    context.claim = { ...context.claim, phase: "closed", status: "forfeited" };
  else if (scenario === "savior")
    context.savior = {
      ...context.savior,
      generalSavior: true,
      providerPosition: "General Savior",
      entitlement: { amount: 12, token: "ETER" },
    };
  else if (scenario === "special-savior") {
    context.entries.push({
      id: "FC-32-011",
      weekId: "forecast-2026-w32",
      mode: "special",
      paymentAsset: "USDT",
      paymentAmount: 7,
      prediction: prediction("02", "23", "44", "12", "91"),
      result: prediction("17", "23", "44", "12", "06"),
      submittedAt: "2026-08-09T11:30:00Z",
      status: "won",
      prizeCategory: 2,
      grossPrizeETER: 50,
      taxETER: 5,
      netPrizeETER: 45,
    });
    context.savior = {
      ...context.savior,
      generalSavior: false,
      specialSavior: true,
      starredSavior: false,
      providerPosition: "Special Savior · W2 + W3 + Golden verified",
      entitlement: { amount: 10, token: "ETER" },
    };
  } else if (scenario === "starred-savior")
    context.savior = {
      ...context.savior,
      starredSavior: true,
      starAtParticipation: 3,
      providerPosition: "3-Star Savior",
      entitlement: { amount: 24, token: "ETER" },
    };
  else if (scenario === "contributor-ineligible")
    context.contributor = {
      ...context.contributor,
      eligible: false,
      points: undefined,
      entitlement: undefined,
      claim: {
        ...context.contributor.claim,
        status: "not-winner",
        entitlement: undefined,
      },
    };
  else if (scenario === "contributor-eligible")
    context.contributor = {
      ...context.contributor,
      firstLinePreviousPredictions: 92,
      combinedPredictions: 104,
      eligible: true,
      points: 142,
      entitlement: { amount: 18.4, token: "ETER" },
      claim: {
        ...context.contributor.claim,
        status: "unchecked",
        entitlement: { amount: 18.4, token: "ETER" },
      },
    };
  else if (scenario === "contributor-withdraw")
    context.contributor = {
      ...context.contributor,
      firstLinePreviousPredictions: 92,
      combinedPredictions: 104,
      eligible: true,
      points: 142,
      entitlement: { amount: 18.4, token: "ETER" },
      claim: {
        ...context.contributor.claim,
        version: 2,
        phase: "withdraw",
        status: "withdrawable",
        entitlement: { amount: 18.4, token: "ETER" },
      },
    };
  else if (scenario === "history") context.week.currentState = "resolved";
  else if (scenario === "pools-donation")
    context.pools.donationCapability = true;
  return context;
}

export function getPreviewForecastProtocolContext(): ForecastProtocolContext {
  return resolvePreviewForecastScenario(
    previewForecastProtocolContext,
    typeof window === "undefined" ? "" : window.location.search,
  );
}

const eraDocument = {
  id: "doc-era-001",
  name: "governance-impact.pdf",
  mimeType: "application/pdf",
  sizeBytes: 284000,
  providerReference: "preview://era/doc-era-001",
};
const eraInput: EraSuggestionInput = {
  name: "Adaptive Treasury Routing for Public Goods",
  challenge: "Public-goods funding lacks an isolated Product path.",
  aim: "Create transparent, auditable routing.",
  solution: "Use a proposal-governed Product with isolated permissions.",
  description:
    "Introduce provider-governed routing with explicit execution and audit boundaries.",
  requestedGrade: "A",
  documents: [eraDocument],
  codeMode: "provided",
  codeReference: "ipfs://bafy-era-innovation-v1",
};
const codeReady: EraProposalRecord["codePreparation"] = {
  requirement: "required",
  mode: "provided",
  quoteStatus: "provided",
  estimatedTime: "Provider audit estimate · 5 business days",
  depositProofState: "verified",
  auditState: "passed",
  developmentState: "not-required",
  codeReady: true,
  finalCodeReference: "ipfs://bafy-era-audited-v1",
  firstVoteBeforeCodeReadyAllowed: false,
  requiresSecondVote: false,
  providerDetail: "DevOps audit and deposit proof are provider-confirmed.",
};
const noCode: EraProposalRecord["codePreparation"] = {
  requirement: "not-required",
  mode: "not-required",
  quoteStatus: "not-applicable",
  depositProofState: "not-required",
  auditState: "not-required",
  developmentState: "not-required",
  codeReady: true,
  firstVoteBeforeCodeReadyAllowed: false,
  requiresSecondVote: false,
  providerDetail: "Provider confirms that no code is required.",
};
const advancement = (
  patch: Partial<EraProposalRecord["advancement"]> = {},
): EraProposalRecord["advancement"] => ({
  state: "finalized",
  requiredCompletedStocks: 5,
  currentCompletedStocks: 5,
  ownerDiscretionAvailable: false,
  providerDetail: "Provider confirms proposal inscription requirements.",
  ...patch,
});
const approval = (
  patch: Partial<EraProposalRecord["approval"]> = {},
): EraProposalRecord["approval"] => ({
  required: true,
  status: "approved",
  eligibleRoles: ["OWNER", "LEGEND", "ELITE_A"],
  reviewedBy: "ELITE_A",
  qualificationDeadlineRequiredOnApproval: false,
  detail: "A-grade ELITE approved this Grade B/C suggestion.",
  ...patch,
});
const eraRecord = (
  id: string,
  patch: Partial<EraProposalRecord> = {},
): EraProposalRecord => ({
  ...eraInput,
  id,
  finalGrade: "A",
  lifecycle: "queued",
  lifecycleLabel: "Queued",
  proposerId: "EID-ALEX-01",
  proposerLabel: "ALEX.ETER",
  proposerIsOwner: false,
  completedStocksAtQualification: 5,
  maintainsFiveCompletedStocks: true,
  attributionState: "proposer",
  approval: approval(),
  advancement: advancement(),
  codePreparation: codeReady,
  queuePosition: 2,
  providerDetail: "Preview provider lifecycle state.",
  createdAt: "2026-08-12T12:00:00Z",
  updatedAt: "2026-08-13T12:00:00Z",
  version: 1,
  ...patch,
});
const voting = (patch: Partial<EraVotingRecord> = {}): EraVotingRecord => ({
  eligibleVoterCount: 100,
  participantCount: 64,
  requiredParticipantCount: 51,
  yes: 38,
  no: 18,
  report: 8,
  effectiveNegative: 26,
  requiredYesCount: 33,
  quorumReached: true,
  successState: "open",
  isOwnerProposal: false,
  ownerReportProtected: false,
  votingOpensAt: "2026-08-13T12:00:00Z",
  votingClosesAt: "2026-08-15T12:00:00Z",
  version: 4,
  ...patch,
});
const activeEraVote = eraRecord("ERA-ACT-101", {
  lifecycle: "voting",
  lifecycleLabel: "Voting · active",
  queuePosition: undefined,
  voting: voting(),
  providerDetail: "Exactly one provider-owned active vote.",
  version: 4,
});
const cancelableEraProposal = eraRecord("ERA-CAN-006", {
  name: "Optimize Governance Indexing",
  requestedGrade: "C",
  finalGrade: "C",
  codeMode: "not-required",
  codeReference: undefined,
  codePreparation: noCode,
  lifecycle: "proposal-cancelable",
  lifecycleLabel: "Cancelable · first 6 hours",
  voting: voting({
    participantCount: 0,
    yes: 0,
    no: 0,
    report: 0,
    effectiveNegative: 0,
    requiredYesCount: 1,
    quorumReached: false,
    cancelUntil: "2026-08-13T18:00:00Z",
    version: 2,
  }),
  version: 2,
});
const ownerQueuedEraProposal = eraRecord("ERA-OWN-009", {
  name: "Owner Safety Parameter Update",
  requestedGrade: "B",
  finalGrade: "B",
  proposerId: "OWNER",
  proposerLabel: "ETERNITY Owner",
  proposerIsOwner: true,
  approval: approval({
    required: false,
    status: "not-required",
    reviewedBy: undefined,
    detail: "Owner-origin suggestion requires no approval.",
  }),
  ownerQueuePriority: true,
  queuePosition: 1,
  lifecycle: "queued",
  lifecycleLabel: "Queued · Owner priority",
});
const regularQueuedEraProposal = eraRecord("ERA-QUE-010", {
  name: "Modify Contributor Evidence View",
  requestedGrade: "B",
  finalGrade: "B",
});
const reviewSuggestion = eraRecord("ERA-SUG-014", {
  name: "Governance Archive Optimization",
  requestedGrade: "B",
  finalGrade: undefined,
  codeMode: "deferred",
  codeReference: undefined,
  codePreparation: {
    ...codeReady,
    mode: "deferred",
    quoteStatus: "not-requested",
    estimatedTime: undefined,
    depositProofState: "not-required",
    auditState: "not-required",
    codeReady: false,
    finalCodeReference: undefined,
    providerDetail: "Code is optional at initial suggestion recording.",
  },
  lifecycle: "qualification-review",
  lifecycleLabel: "Qualification review",
  approval: approval({
    status: "pending",
    reviewedBy: undefined,
    detail: "Owner, Legend or A-grade ELITE review is required.",
  }),
  advancement: advancement({ state: "blocked-approval" }),
  queuePosition: undefined,
  version: 3,
});
const amendmentSuggestion = eraRecord("ERA-SUG-AMEND-015", {
  ...reviewSuggestion,
  id: "ERA-SUG-AMEND-015",
  name: "Contributor Evidence Amendment",
  lifecycle: "amendment-requested",
  lifecycleLabel: "Amendment requested",
  approval: approval({
    status: "amendment-requested",
    reviewedBy: "ELITE_A",
    feedback: "Clarify the affected evidence window before resubmission.",
    detail: "Correctable issues were returned to the proposer.",
  }),
  version: 4,
});
const providedCodeSuggestion = eraRecord("ERA-SUG-CODE-016", {
  ...reviewSuggestion,
  id: "ERA-SUG-CODE-016",
  name: "ABI Treasury Guard",
  requestedGrade: "B",
  codeMode: "provided",
  codeReference: "ipfs://bafy-era-abi-v2",
  codePreparation: {
    requirement: "required",
    mode: "provided",
    quoteStatus: "provided",
    estimatedTime: "Provider audit estimate · 5 business days",
    depositProofState: "pending",
    auditState: "pending",
    developmentState: "not-required",
    codeReady: false,
    firstVoteBeforeCodeReadyAllowed: false,
    requiresSecondVote: false,
    providerDetail:
      "DevOps proof is pending provider verification. Initial submission cannot be replayed.",
  },
  approval: approval(),
  advancement: advancement({ state: "blocked-preparation" }),
  version: 5,
});
const teamCodeSuggestion = eraRecord("ERA-SUG-DEV-017", {
  ...reviewSuggestion,
  id: "ERA-SUG-DEV-017",
  name: "Community Routing Module",
  requestedGrade: "A",
  codeMode: "team-development",
  codePreparation: {
    requirement: "required",
    mode: "team-development",
    quoteStatus: "provided",
    estimatedTime: "Provider development estimate · 3 delivery cycles",
    depositProofState: "required",
    auditState: "not-required",
    developmentState: "pending",
    codeReady: false,
    firstVoteBeforeCodeReadyAllowed: false,
    requiresSecondVote: false,
    providerDetail:
      "DevOps development quote issued; fee amount and asset are not supplied in this Preview source.",
  },
  approval: approval({
    reviewedBy: "OWNER",
    detail: "Owner approved Grade A preparation.",
  }),
  advancement: advancement({ state: "blocked-preparation" }),
  version: 5,
});
const underFiveSuggestion = eraRecord("ERA-SUG-STOCK-018", {
  ...reviewSuggestion,
  id: "ERA-SUG-STOCK-018",
  name: "Optimization Suggestion · Stock Pending",
  requestedGrade: "C",
  approval: approval(),
  codeMode: "not-required",
  codePreparation: noCode,
  advancement: advancement({
    state: "blocked-stocks",
    currentCompletedStocks: 3,
    qualificationDeadline: "2026-09-30T23:59:59Z",
    ownerDiscretionAvailable: true,
    providerDetail:
      "Suggestion is recorded. Five Completed Stocks are required only for proposal inscription.",
  }),
  lifecycle: "advancement-blocked",
  lifecycleLabel: "Suggestion recorded · advancement blocked",
  version: 6,
});
const expiredUnderFiveSuggestion = eraRecord("ERA-SUG-STOCK-EXPIRED-025", {
  ...underFiveSuggestion,
  id: "ERA-SUG-STOCK-EXPIRED-025",
  name: "Optimization Suggestion · CEES Deadline Expired",
  advancement: advancement({
    state: "blocked-stocks",
    currentCompletedStocks: 3,
    qualificationDeadline: "2026-08-12T23:59:59Z",
    ownerDiscretionAvailable: true,
    providerDetail:
      "The proposer qualification window expired below five Completed Stocks. Owner discretionary submission is now provider-eligible.",
  }),
  version: 7,
});
const eligibleAdvanceSuggestion = eraRecord("ERA-SUG-ADV-019", {
  ...reviewSuggestion,
  id: "ERA-SUG-ADV-019",
  name: "Optimization Suggestion · Ready to Advance",
  requestedGrade: "C",
  approval: approval(),
  codeMode: "not-required",
  codePreparation: noCode,
  advancement: advancement({
    state: "eligible",
    providerDetail:
      "Provider confirms proposer qualification and preparation readiness.",
  }),
  lifecycle: "preparation",
  lifecycleLabel: "Suggestion · ready for proposal inscription",
  version: 6,
});
const expiredAdvanceSuggestion = eraRecord("ERA-SUG-ADV-EXPIRED-026", {
  ...eligibleAdvanceSuggestion,
  id: "ERA-SUG-ADV-EXPIRED-026",
  name: "Optimization Suggestion · Advancement Deadline Expired",
  advancement: advancement({
    state: "eligible",
    currentCompletedStocks: 5,
    qualificationDeadline: "2026-08-12T23:59:59Z",
    providerDetail:
      "The approver-set CEES deadline has expired. Normal proposer inscription is blocked.",
  }),
  version: 7,
});
const deadlineBoundaryAdvanceSuggestion = eraRecord(
  "ERA-SUG-ADV-DEADLINE-027",
  {
    ...eligibleAdvanceSuggestion,
    id: "ERA-SUG-ADV-DEADLINE-027",
    name: "Optimization Suggestion · Deadline Boundary",
    advancement: advancement({
      state: "eligible",
      currentCompletedStocks: 5,
      qualificationDeadline: "2026-08-13T13:00:00Z",
      providerDetail:
        "Provider confirms five Completed Stocks at the exact qualification deadline.",
    }),
    version: 7,
  },
);
const requiredDeadlineMissingAdvanceSuggestion = eraRecord(
  "ERA-SUG-ADV-DEADLINE-MISSING-028",
  {
    ...eligibleAdvanceSuggestion,
    id: "ERA-SUG-ADV-DEADLINE-MISSING-028",
    name: "Optimization Suggestion · Provider Deadline Unavailable",
    approval: approval({
      qualificationDeadlineRequiredOnApproval: true,
      detail:
        "Approval requires an approver-set CEES deadline, but provider advancement state omits it.",
    }),
    advancement: advancement({
      state: "eligible",
      currentCompletedStocks: 5,
      qualificationDeadline: undefined,
      providerDetail:
        "Provider state is malformed: the required qualification deadline is unavailable.",
    }),
    lifecycle: "preparation",
    lifecycleLabel: "Suggestion · provider deadline unavailable",
    version: 8,
  },
);
const finalizedAdvanceSuggestion = eraRecord("ERA-SUG-FINAL-020", {
  ...eligibleAdvanceSuggestion,
  id: "ERA-SUG-FINAL-020",
  name: "Finalized Proposal Advancement",
  advancement: advancement({
    state: "finalized",
    providerDetail: "Provider confirms this advancement already finalized.",
  }),
  lifecycle: "advancement-blocked",
  lifecycleLabel: "Advancement finalized · replay blocked",
  version: 7,
});
const deferredCodeAllowed = eraRecord("ERA-DEFER-022", {
  ...reviewSuggestion,
  id: "ERA-DEFER-022",
  name: "Deferred Code · First Vote Allowed",
  requestedGrade: "A",
  approval: approval({
    reviewedBy: "OWNER",
    detail: "Owner approved Grade A preparation.",
  }),
  codeMode: "deferred",
  codePreparation: {
    requirement: "required",
    mode: "deferred",
    quoteStatus: "provided",
    estimatedTime: "Code completion follows a successful first vote.",
    depositProofState: "not-required",
    auditState: "pending",
    developmentState: "pending",
    codeReady: false,
    firstVoteBeforeCodeReadyAllowed: true,
    requiresSecondVote: false,
    providerDetail:
      "Provider explicitly allows the first vote before required code is ready.",
  },
  advancement: advancement({
    state: "eligible",
    providerDetail:
      "All normal qualifications pass; provider deferred-code capability permits first-vote inscription.",
  }),
  lifecycle: "preparation",
  lifecycleLabel: "Ready · first vote before code",
  version: 7,
});
const deferredCodeBlocked = eraRecord("ERA-DEFER-023", {
  ...deferredCodeAllowed,
  id: "ERA-DEFER-023",
  name: "Deferred Code · First Vote Not Allowed",
  codePreparation: {
    ...deferredCodeAllowed.codePreparation,
    firstVoteBeforeCodeReadyAllowed: false,
    providerDetail:
      "Provider does not allow first vote before required code is ready.",
  },
  advancement: advancement({
    state: "eligible",
    providerDetail:
      "Normal qualifications pass, but required code remains incomplete and provider capability is false.",
  }),
});
const deadlineReviewSuggestion = eraRecord("ERA-SUG-DEADLINE-024", {
  ...reviewSuggestion,
  id: "ERA-SUG-DEADLINE-024",
  name: "Qualification Deadline Binding",
  approval: approval({
    status: "pending",
    reviewedBy: undefined,
    qualificationDeadlineRequiredOnApproval: true,
    qualificationDeadlineMin: "2026-08-14T00:00:00Z",
    qualificationDeadlineMax: "2026-09-30T23:59:59Z",
    detail: "Approver must set the CEES qualification deadline when approving.",
  }),
  version: 4,
});
const awaitingCodeProposal = eraRecord("ERA-CODE-WAIT-020", {
  name: "New Access Verification Product",
  requestedGrade: "A",
  finalGrade: "A",
  codeMode: "deferred",
  codePreparation: {
    requirement: "required",
    mode: "deferred",
    quoteStatus: "provided",
    estimatedTime: "Provider completion window open",
    depositProofState: "verified",
    auditState: "pending",
    developmentState: "in-progress",
    codeReady: false,
    firstVoteBeforeCodeReadyAllowed: true,
    requiresSecondVote: true,
    providerDetail:
      "First vote passed, but required code is incomplete. Execute is unavailable.",
  },
  lifecycle: "passed-awaiting-code",
  lifecycleLabel: "Passed · awaiting code",
  voting: voting({
    participantCount: 70,
    yes: 46,
    no: 18,
    report: 6,
    effectiveNegative: 24,
    requiredYesCount: 36,
    successState: "passed",
    version: 8,
  }),
  execution: {
    public: true,
    executable: false,
    executed: false,
    providerDetail:
      "Owner final code creates a linked successor that must enter a second vote.",
  },
  lineageLabel: "Original vote · code incomplete",
  version: 8,
});
const completedCodeRevote = eraRecord("ERA-CODE-REVOTE-021", {
  name: "New Access Verification Product · code-complete",
  requestedGrade: "A",
  finalGrade: "A",
  parentProposalId: "ERA-CODE-WAIT-020",
  lineageLabel: "Code-completed successor · new vote required",
  codePreparation: {
    ...codeReady,
    finalCodeReference: "ipfs://bafy-era-final-code-v2",
  },
  lifecycle: "queued",
  lifecycleLabel: "Queued · linked second vote",
  queuePosition: 2,
  version: 1,
});
const executableEraProposal = eraRecord("ERA-EXEC-007", {
  name: "Modify Verified Reward Evidence",
  requestedGrade: "B",
  finalGrade: "B",
  lifecycle: "executable",
  lifecycleLabel: "Passed · execution available",
  voting: voting({
    participantCount: 72,
    yes: 48,
    no: 18,
    report: 6,
    effectiveNegative: 24,
    requiredYesCount: 37,
    successState: "passed",
    version: 7,
  }),
  execution: {
    public: true,
    executable: true,
    executed: false,
    providerDetail:
      "Public Execute Proposal is available after provider revalidation.",
  },
  version: 7,
});
const executedEraProposal = eraRecord("ERA-HIS-004", {
  name: "Optimize Transaction Indexing",
  requestedGrade: "C",
  finalGrade: "C",
  codeMode: "not-required",
  codePreparation: noCode,
  lifecycle: "executed",
  lifecycleLabel: "Executed",
  voting: voting({
    participantCount: 80,
    yes: 55,
    no: 20,
    report: 5,
    effectiveNegative: 25,
    requiredYesCount: 41,
    successState: "passed",
    version: 9,
  }),
  execution: {
    public: true,
    executable: false,
    executed: true,
    executedAt: "2026-08-10T09:00:00Z",
    providerDetail: "Provider confirms execution and indexing.",
  },
  version: 9,
});
const reportWarningEraProposal = eraRecord("ERA-REP-003", {
  name: "Reported Proposal Outcome",
  requestedGrade: "B",
  finalGrade: "B",
  lifecycle: "rejected",
  lifecycleLabel: "Rejected · report sanction",
  voting: voting({
    participantCount: 70,
    yes: 12,
    no: 18,
    report: 40,
    effectiveNegative: 58,
    requiredYesCount: 36,
    successState: "rejected",
    version: 6,
  }),
  reportOutcome: {
    reportPercent: 57.14,
    thresholdExceeded: true,
    resultingStrikeCount: 1,
    sanction: "warning",
  },
  version: 6,
});
const eraElite: EraEliteGradeState[] = [
  {
    grade: "A",
    successfulProposalCount: 8,
    points: 8,
    isElite: true,
    additionalShareBlocks: 1,
    providerShareMultiplier: 1.5,
    providerEntitlementLabel: "Provider-confirmed A share · 150%",
  },
  {
    grade: "B",
    successfulProposalCount: 2,
    points: 2,
    isElite: false,
    additionalShareBlocks: 0,
    providerShareMultiplier: 1,
    providerEntitlementLabel: "Not ELITE in B",
  },
  {
    grade: "C",
    successfulProposalCount: 4,
    points: 4,
    isElite: true,
    additionalShareBlocks: 0,
    providerShareMultiplier: 1,
    providerEntitlementLabel: "Provider-confirmed C share · 100%",
  },
];
const eraFunds: EraEliteFundState[] = (["A", "B", "C"] as const).map(
  (grade, index) => ({
    grade,
    label: `${grade} · ${grade === "A" ? "Innovation" : grade === "B" ? "Modification" : "Optimization"} Fund`,
    version: 3,
    balances: [
      { token: "ETER", amount: String(12400 - index * 1820) },
      { token: "USDT", amount: String(5800 - index * 640) },
    ],
    eesSaleFundingPrinciple:
      "Electoral Stock sale funding is divided equally among A, B and C funds.",
    acceptsSeparateDonation: true,
    donationAssets: ["ETER", "USDT", "ET"],
    memberCount: index === 0 ? 3 : 5,
    monthlyWindowLabel: "August 2026 · provider monthly window",
    distributionRuleLabel:
      index === 0
        ? "25% per member until at least four members"
        : "Full provider amount divided among participants",
    withdrawAvailable: index === 0,
    withdrawEntitlement:
      index === 0 ? { amount: 3100, token: "ETER" } : undefined,
    providerDetail:
      "Provider owns exact entitlement, rounding and monthly window.",
  }),
);
export const previewEraProtocolContext: EraProtocolContext = {
  source: "preview",
  sourceLabel: "Preview · ERA provider fixture",
  sourceFreshness: "fresh",
  sourceDetail:
    "Provider-owned Preview scenarios. No live or on-chain freshness is asserted.",
  providerNow: "2026-08-13T13:00:00Z",
  governance: {
    votingPeriodHours: 48,
    quorumRuleLabel: "50% + 1 of eligible voters participate",
    successRuleLabel: "Quorum + 50% + 1 YES of participants",
    oneActiveVote: true,
    parametersModifiableByProposal: [
      "voting-period",
      "voting-power",
      "voting-count",
    ],
  },
  governanceScope:
    "ERA is the ecosystem governance and contract-owner body after required ownership transfer.",
  user: {
    actorId: "EID-ALEX-01",
    actorLabel: "ALEX.ETER",
    isOwner: false,
    reviewerRole: "ELITE_A",
    ownedElectoralStockCount: 4,
    completedElectoralStockCount: 5,
    votingEligibility: "eligible",
    votingEligibilityReason:
      "At least one provider-confirmed Electoral Stock is owned.",
    votingPower: 4,
    votingCountAvailable: 2,
    legend: false,
    eliteGrades: ["A", "C"],
    successfulProposalPoints: { A: 8, B: 2, C: 4 },
    proposerReportStrikes: 0,
    submissionBan: "none",
  },
  suggestions: [reviewSuggestion, cancelableEraProposal],
  activeVote: activeEraVote,
  queue: [ownerQueuedEraProposal, regularQueuedEraProposal],
  history: [
    executableEraProposal,
    executedEraProposal,
    reportWarningEraProposal,
  ],
  elite: eraElite,
  eliteFunds: eraFunds,
  stockholderFund: {
    version: 5,
    allocationPercent: 12,
    minimumAllocationPercent: 10,
    balances: [
      { token: "ETER", amount: "84200" },
      { token: "USDT", amount: "18800" },
      { token: "ET", amount: "420000" },
    ],
    completedStockholder: true,
    completedStockCount: 5,
    donationAvailable: true,
    donationAssets: ["ETER", "USDT", "ET", "Q"],
    providerDetail:
      "All-token ecosystem ownership income enters ERA; allocation cannot fall below 10%. No stockholder withdrawal action is defined.",
  },
};
const cloneEraContext = (context: EraProtocolContext): EraProtocolContext =>
  JSON.parse(JSON.stringify(context)) as EraProtocolContext;
export function resolvePreviewEraScenario(
  base: EraProtocolContext,
  search: string,
): EraProtocolContext {
  const context = cloneEraContext(base);
  const scenario = new URLSearchParams(search).get("era-scenario") ?? "active";
  if (scenario === "no-active") context.activeVote = undefined;
  else if (scenario === "review-grade-b") {
    context.user.reviewerRole = "ELITE_A";
    context.suggestions = [reviewSuggestion];
  } else if (scenario === "review-grade-a") {
    context.user.reviewerRole = "ELITE_A";
    context.suggestions = [
      {
        ...teamCodeSuggestion,
        approval: approval({
          status: "pending",
          reviewedBy: undefined,
          detail: "A-grade ELITE cannot review Grade A.",
        }),
      },
    ];
  } else if (scenario === "amendment-request")
    context.suggestions = [amendmentSuggestion];
  else if (scenario === "code-provided")
    context.suggestions = [providedCodeSuggestion];
  else if (scenario === "team-development")
    context.suggestions = [teamCodeSuggestion];
  else if (scenario === "suggestion-under-five") {
    context.user.completedElectoralStockCount = 3;
    context.suggestions = [underFiveSuggestion];
  } else if (scenario === "sanction-advancement") {
    context.user.submissionBan = "six-month";
    context.user.submissionBanUntil = "2027-02-13T00:00:00Z";
    context.suggestions = [
      {
        ...underFiveSuggestion,
        advancement: advancement({
          state: "blocked-sanction",
          currentCompletedStocks: 5,
        }),
      },
    ];
  } else if (scenario === "advance-eligible")
    context.suggestions = [eligibleAdvanceSuggestion];
  else if (scenario === "advance-finalized")
    context.suggestions = [finalizedAdvanceSuggestion];
  else if (scenario === "advance-nonproposer") {
    context.user.actorId = "EID-OTHER-77";
    context.suggestions = [eligibleAdvanceSuggestion];
  } else if (scenario === "cancel-expired") {
    context.providerNow = "2026-08-13T18:00:01Z";
    context.suggestions = [cancelableEraProposal];
  } else if (scenario === "vote-window-stale")
    context.providerNow = "2026-08-15T12:00:00Z";
  else if (scenario === "passed-awaiting-code")
    context.history = [awaitingCodeProposal, ...context.history];
  else if (scenario === "code-completed-revote") {
    context.queue = [completedCodeRevote, ...context.queue];
    context.history = [awaitingCodeProposal, ...context.history];
  } else if (scenario === "modified-voting-period")
    context.governance.votingPeriodHours = 72;
  else if (scenario === "owner-report-protected") {
    context.activeVote = {
      ...ownerQueuedEraProposal,
      lifecycle: "voting",
      lifecycleLabel: "Voting · Owner proposal",
      queuePosition: undefined,
      voting: voting({
        isOwnerProposal: true,
        ownerReportProtected: true,
        version: 3,
      }),
      version: 3,
    };
  } else if (scenario === "owner-discretion-report-protected") {
    context.activeVote = {
      ...ownerQueuedEraProposal,
      id: "ERA-SUG-STOCK-EXPIRED-025-OWNER",
      name: "Owner Discretion · CEES Deadline Successor",
      proposerId: "OWNER",
      proposerLabel: "ETERNITY Owner",
      proposerIsOwner: true,
      attributionState: "owner-discretion-available",
      parentProposalId: "ERA-SUG-STOCK-EXPIRED-025",
      lineageLabel: "Owner-submitted successor · original suggestion preserved",
      ownerQueuePriority: true,
      lifecycle: "voting",
      lifecycleLabel: "Voting · Owner-submitted priority",
      queuePosition: undefined,
      voting: voting({
        isOwnerProposal: true,
        ownerReportProtected: true,
        version: 1,
      }),
      version: 1,
    };
  } else if (scenario === "non-proposer-cancel") {
    context.user.actorId = "EID-OTHER-77";
    context.suggestions = [cancelableEraProposal];
  } else if (scenario === "fund-withdraw")
    context.eliteFunds = context.eliteFunds.map((fund) =>
      fund.grade === "A"
        ? {
            ...fund,
            withdrawAvailable: true,
            withdrawEntitlement: { amount: 3100, token: "ETER" },
          }
        : fund,
    );
  else if (scenario === "deferred-code-allowed")
    context.suggestions = [deferredCodeAllowed];
  else if (scenario === "deferred-code-blocked")
    context.suggestions = [deferredCodeBlocked];
  else if (scenario === "owner-origin-create") {
    context.user = {
      ...context.user,
      actorId: "OWNER",
      actorLabel: "ETERNITY Owner",
      isOwner: true,
      reviewerRole: "OWNER",
    };
  } else if (scenario === "approval-deadline") {
    context.user.reviewerRole = "OWNER";
    context.suggestions = [deadlineReviewSuggestion];
  } else if (scenario === "owner-discretion") {
    context.user = {
      ...context.user,
      actorId: "OWNER",
      actorLabel: "ETERNITY Owner",
      isOwner: true,
      reviewerRole: "OWNER",
    };
    context.providerNow = "2026-10-01T00:00:00Z";
    context.suggestions = [underFiveSuggestion];
  } else if (scenario === "owner-discretion-before-deadline") {
    context.user = {
      ...context.user,
      actorId: "OWNER",
      actorLabel: "ETERNITY Owner",
      isOwner: true,
      reviewerRole: "OWNER",
    };
    context.suggestions = [underFiveSuggestion];
  } else if (scenario === "owner-discretion-after-deadline") {
    context.user = {
      ...context.user,
      actorId: "OWNER",
      actorLabel: "ETERNITY Owner",
      isOwner: true,
      reviewerRole: "OWNER",
    };
    context.suggestions = [expiredUnderFiveSuggestion];
  } else if (scenario === "advance-deadline-expired") {
    context.suggestions = [expiredAdvanceSuggestion];
  } else if (scenario === "advance-at-deadline") {
    context.suggestions = [deadlineBoundaryAdvanceSuggestion];
  } else if (scenario === "advance-required-deadline-missing") {
    context.suggestions = [requiredDeadlineMissingAdvanceSuggestion];
  } else if (scenario === "advance-deadline-not-required") {
    context.suggestions = [eligibleAdvanceSuggestion];
  } else if (scenario === "owner-final-code") {
    context.user = {
      ...context.user,
      actorId: "OWNER",
      actorLabel: "ETERNITY Owner",
      isOwner: true,
      reviewerRole: "OWNER",
    };
    context.history = [awaitingCodeProposal, ...context.history];
  } else if (scenario === "owner-allocation")
    context.user = {
      ...context.user,
      actorId: "OWNER",
      actorLabel: "ETERNITY Owner",
      isOwner: true,
      reviewerRole: "OWNER",
    };
  return context;
}
export function getPreviewEraProtocolContext() {
  return resolvePreviewEraScenario(
    previewEraProtocolContext,
    typeof window === "undefined" ? "" : window.location.search,
  );
}

const previewEidProtocolContext: EidProtocolContext = {
  source: {
    source: "preview",
    label: "Preview · EID V4 provider",
    freshness: "fresh",
    providerNow: "2026-08-13T14:00:00.000Z",
    detail: "Provider-owned Preview fixture; no signature or chain finality is asserted.",
  },
  user: {
    wallet: mockUser.walletAddress,
    displayIdentity: "ALEX.ETER",
    activeEid: "ALEX.ETER",
    acquisitionCount: 2,
    nextAcquisitionOrdinal: 3,
    fanMember: true,
    fanStars: 2,
    completedStockQualified: true,
    completedShieldQualified: true,
    currentDiscountPercent: 25,
  },
  policy: {
    lettersAndNumbersOnly: true,
    publicShortNameMinimum: 4,
    firstFreeEnabled: true,
    currentBasePriceUsd: 5,
    thirdPlusSurchargePercent: 25,
    acceptedPaymentAssets: ["USDT", "ETER", "ET", "Q"],
    paymentUsdRates: { USDT: 1, ETER: 1.35, ET: 0.18, Q: 0.05 },
    loyaltyPercent: 19,
    progressionOwner: "Achievement",
  },
  owned: [
    {
      id: "eid_001", name: "ALEX.ETER", tokenId: "#EID-0042", version: 4,
      ownerWallet: mockUser.walletAddress, active: true,
      originalMinter: mockUser.walletAddress,
      originalMinterReferrer: "0x3905F16a8498b715AAf9bC6bCaA88A8e2E7710B4",
      contractAddress: "0xE1D0000000000000000000000000000000000042",
      inviteStatus: "available", inviteLink: "https://invite.eternity.example/eid/eid_001", listable: true,
    },
    {
      id: "eid_002", name: "ALEXR.ETER", tokenId: "#EID-0108", version: 3,
      ownerWallet: mockUser.walletAddress, active: false,
      originalMinter: mockUser.walletAddress,
      inviteStatus: "none", listable: true,
    },
  ],
  listings: [
    {
      id: "listing-001", version: 7, eidId: "eid_market_001", name: "MOON.ETER", tokenId: "#EID-0921",
      sellerWallet: "0x9051f3852Af58A3E6D657C45a9B62b9b69115670",
      originalMinter: "0xA4819f3194E476d84f8760db1E9607C664514293",
      originalMinterReferrer: "0xD0f1b469a17CB65E9235Ed9c37cDB80d70771D27",
      amount: 45, paymentAsset: "USDT", status: "listed",
    },
    {
      id: "listing-002", version: 2, eidId: "eid_market_002", name: "NOVA8.ETER", tokenId: "#EID-1107",
      sellerWallet: "0x164bd73379eBC7246B70a9Fd4D58B76609A76195",
      originalMinter: "0x164bd73379eBC7246B70a9Fd4D58B76609A76195",
      amount: 72, paymentAsset: "ETER", status: "listed",
    },
  ],
  marketplace: {
    canList: true,
    supportedListingPaymentAssets: ["USDT", "ETER", "ET", "Q"],
  },
};

export function getPreviewEidProtocolContext(): EidProtocolContext {
  const search = typeof window === "undefined" ? "" : window.location.search;
  return resolvePreviewEidPublicContext(previewEidProtocolContext, search);
}

export function getPreviewEidExecutionContext(): EidPreviewExecutionContext {
  const search = typeof window === "undefined" ? "" : window.location.search;
  return {
    publicContext: resolvePreviewEidPublicContext(previewEidProtocolContext, search),
    privateState: resolvePreviewEidPrivateState(search),
  };
}

/** Preview-only fixture projection into the neutral Product read model. */
export const previewProductData: ProductPresentationData = {
  user: mockUser,
  tokenRates: mockTokenRates,
  fanProfile: mockFanProfile,
  ownedEids: mockOwnedEids,
  currentForecast: mockCurrentForecast,
  forecastEntries: mockForecastEntries,
  shields: mockShields,
  stocks: stockPreviewPositions,
  proposals: [],
  rewards: mockRewards.filter((reward) => reward.type !== "fan"),
  rewardPools: previewRewardPools,
  rewardHistory: previewRewardHistory,
  eraVotingEligibility: {
    state: previewVotingPower > 0 ? "eligible" : "ineligible",
    votingPower: previewVotingPower,
    reason:
      previewVotingPower > 0
        ? "Derived from provider-owned Preview Electoral Stock holdings."
        : "No eligible Electoral Stock voting power is available.",
    source: "preview",
  },
  ecosystemStats: mockEcosystemStats,
  transactionLogs: mockTransactionLogs,
  shieldProtocolContext: {
    source: "preview",
    quoteAt: "2026-08-15T00:00:00Z",
    activityWeek: 12,
    ecEterBalance: 60000,
    isFanMember: true,
    directReferredShieldWallets: mockShields[0]?.eitsReferrals,
    tokenUsdRates: {
      USDT: mockTokenRates.USDT,
      ETER: mockTokenRates.ETER,
      ET: mockTokenRates.ET,
    },
  },
  // Phase08.2 static baseline was `stockProtocolContext: previewStockProtocolContext`;
  // the getter now preserves that authority while applying Preview-only scenarios.
  get stockProtocolContext() {
    return getPreviewStockProtocolContext();
  },
  get forecastProtocolContext() {
    return getPreviewForecastProtocolContext();
  },
  get fanProtocolContext() {
    return getPreviewFanProtocolContext();
  },
  get eraProtocolContext() {
    return getPreviewEraProtocolContext();
  },
  get eidProtocolContext() {
    return getPreviewEidProtocolContext();
  },
};
