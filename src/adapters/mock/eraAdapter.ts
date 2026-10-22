import type {
  EraGrade,
  EraProposalRecord,
  EraProtocolContext,
  EraReviewDecision,
  EraSuggestionInput,
  EraVoteChoice,
} from "../../special3/products/era/eraProtocol";
import {
  eraCodePreparationProofSubmittable,
  eraOwnerDiscretionSubmittable,
  eraOwnerFinalCodeSubmittable,
  eraProposalAdvancementEligible,
  eraProposalCancelable,
  eraProposalExecutable,
  eraProposalVoteEligible,
  eraReviewerCanReview,
  eraStockholderAllocationAdjustable,
  eraSuggestionAmendable,
  eraSuggestionEssentialsComplete,
} from "../../special3/products/era/eraProtocol";

const unavailable =
  "ERA provider context is required. Preview fixtures are unavailable outside the Preview provider.";
const tx = (action: string, id: string) => ({
  txHash: `0xpreview_era_${action}_${id.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
});
const records = (context: EraProtocolContext) => [
  ...context.suggestions,
  ...(context.activeVote ? [context.activeVote] : []),
  ...context.queue,
  ...context.history,
];
const find = (context: EraProtocolContext, id: string) =>
  records(context).find((item) => item.id === id);
const requireContext = (context?: EraProtocolContext) => {
  if (!context) throw new Error(unavailable);
  return context;
};
const requireVersion = (
  record: EraProposalRecord | undefined,
  expected: number,
) => {
  if (!record) throw new Error("ERA record is unavailable.");
  if (record.version !== expected)
    throw new Error("ERA record version changed; refresh provider state.");
  return record;
};
const validAmount = (amount: number) => Number.isFinite(amount) && amount > 0;
const validChoice = (choice: string): choice is EraVoteChoice =>
  choice === "yes" || choice === "no" || choice === "report";
const providerTime = (value: string | undefined) => {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : undefined;
};

function validateSuggestion(input: EraSuggestionInput) {
  if (!eraSuggestionEssentialsComplete(input))
    throw new Error(
      "Name, Challenge, Aim, Solution, Description and Grade are required.",
    );
  if (input.documents?.some((item) => !item.name || !item.mimeType))
    throw new Error("Attachment metadata is invalid.");
  if (input.codeMode === "provided" && !input.codeReference?.trim())
    throw new Error("Provided ABI code requires an artifact or reference.");
}

export const eraAdapter = {
  async getProposals(): Promise<never[]> {
    return [];
  },
  async getProposalById(): Promise<undefined> {
    return undefined;
  },
  async createSuggestion(
    input: EraSuggestionInput,
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    validateSuggestion(input);
    return {
      id: "ERA-SUG-PREVIEW-1101",
      version: 1,
      lifecycle: context.user.isOwner ? "preparation" : "qualification-review",
      requestId: "ERA-REQ-PREVIEW-1101",
      approvalStatus: context.user.isOwner
        ? ("not-required" as const)
        : ("pending" as const),
    };
  },
  async reviewSuggestion(
    params: {
      suggestionId: string;
      decision: EraReviewDecision;
      feedback?: string;
      qualificationDeadline?: string;
      expectedVersion: number;
    },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const record = requireVersion(
      find(context, params.suggestionId),
      params.expectedVersion,
    );
    if (
      record.lifecycle !== "qualification-review" ||
      !record.approval.required ||
      record.approval.status !== "pending"
    )
      throw new Error(
        "Suggestion is not in a provider-reviewable pending state.",
      );
    if (!eraReviewerCanReview(context, record.requestedGrade))
      throw new Error(
        "Current provider actor is not qualified to review this grade.",
      );
    if (
      !(
        ["approve", "request-amendment", "reject"] as EraReviewDecision[]
      ).includes(params.decision)
    )
      throw new Error("Invalid review decision.");
    if (
      (params.decision === "request-amendment" ||
        params.decision === "reject") &&
      !params.feedback?.trim()
    )
      throw new Error("Provider review feedback is required.");
    if (
      params.decision === "approve" &&
      record.approval.qualificationDeadlineRequiredOnApproval
    ) {
      const now = providerTime(context.providerNow);
      const deadline = providerTime(params.qualificationDeadline);
      if (now === undefined || deadline === undefined)
        throw new Error(
          "A parseable provider clock and approver-set qualification deadline are required.",
        );
      const min = providerTime(record.approval.qualificationDeadlineMin);
      const max = providerTime(record.approval.qualificationDeadlineMax);
      if (
        (record.approval.qualificationDeadlineMin !== undefined &&
          min === undefined) ||
        (record.approval.qualificationDeadlineMax !== undefined &&
          max === undefined)
      )
        throw new Error("Provider qualification deadline bounds are invalid.");
      if (min !== undefined && deadline < min)
        throw new Error(
          "Qualification deadline is earlier than the provider minimum.",
        );
      if (max !== undefined && deadline > max)
        throw new Error(
          "Qualification deadline is later than the provider maximum.",
        );
      if (deadline <= now)
        throw new Error(
          "Qualification deadline must be strictly after providerNow.",
        );
    }
    return {
      ...tx(`review-${params.decision}`, record.id),
      qualificationDeadline:
        params.decision === "approve" &&
        record.approval.qualificationDeadlineRequiredOnApproval
          ? params.qualificationDeadline
          : undefined,
    };
  },
  async amendSuggestion(
    params: {
      suggestionId: string;
      expectedVersion: number;
      input: EraSuggestionInput;
    },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const record = requireVersion(
      find(context, params.suggestionId),
      params.expectedVersion,
    );
    if (!eraSuggestionAmendable(context, record))
      throw new Error(
        "Only the current proposer may amend a provider amendment-requested suggestion.",
      );
    validateSuggestion(params.input);
    return {
      ...tx("amend", record.id),
      id: record.id,
      version: record.version + 1,
      lifecycle: "qualification-review",
      approvalStatus: "pending",
    };
  },
  async advanceSuggestion(
    params: { suggestionId: string; expectedVersion: number },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const record = requireVersion(
      find(context, params.suggestionId),
      params.expectedVersion,
    );
    if (!eraProposalAdvancementEligible(context, record)) {
      if (record.advancement.state === "finalized")
        throw new Error("Finalized proposal advancement cannot be replayed.");
      if (record.proposerId !== context.user.actorId)
        throw new Error(
          "Only the actual proposer may advance this suggestion.",
        );
      if (
        !(
          [
            "suggestion",
            "qualification-review",
            "preparation",
            "advancement-blocked",
          ] as string[]
        ).includes(record.lifecycle)
      )
        throw new Error("Only a provider pre-proposal suggestion may advance.");
      if (record.approval.status !== "approved")
        throw new Error(
          "Suggestion approval is required before proposal advancement.",
        );
      if (
        record.approval.qualificationDeadlineRequiredOnApproval &&
        record.advancement.qualificationDeadline === undefined
      )
        throw new Error(
          "Qualification deadline is unavailable from the provider.",
        );
      if (context.user.completedElectoralStockCount < 5)
        throw new Error(
          "Five Completed Electoral Stocks are required to finalize the proposal.",
        );
      if (context.user.submissionBan !== "none")
        throw new Error("Provider sanction blocks proposal advancement.");
      throw new Error("Provider code/preparation state is not ready.");
    }
    return tx("advance", record.id);
  },
  async cancelProposal(
    params: { proposalId: string; expectedVersion: number },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const record = requireVersion(
      find(context, params.proposalId),
      params.expectedVersion,
    );
    if (record.proposerId !== context.user.actorId)
      throw new Error(
        "Only the actual proposer may cancel during the first 6 hours.",
      );
    if (!eraProposalCancelable(context, record))
      throw new Error(
        "Proposal is not inside the provider cancel window or the provider clock is stale.",
      );
    return tx("cancel", record.id);
  },
  async vote(
    params: {
      proposalId: string;
      vote: EraVoteChoice;
      expectedVersion?: number;
      expectedVotingPower?: number;
      expectedVotingCountAvailable?: number;
    },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const active = context.activeVote;
    if (!validChoice(params.vote)) throw new Error("Invalid ERA vote choice.");
    if (
      !active ||
      active.id !== params.proposalId ||
      !eraProposalVoteEligible(context, active)
    )
      throw new Error(
        "Only the provider active proposal inside the open voting window accepts votes.",
      );
    const voting = active.voting;
    if (!voting) throw new Error("Provider voting state is unavailable.");
    if (
      params.expectedVersion === undefined ||
      active.version !== params.expectedVersion ||
      voting.version !== params.expectedVersion
    )
      throw new Error(
        "ERA active vote version changed; refresh provider state.",
      );
    if (
      context.user.ownedElectoralStockCount < 1 ||
      context.user.votingEligibility !== "eligible" ||
      context.user.votingPower <= 0
    )
      throw new Error(
        "An Electoral Stock owner with provider voting eligibility is required.",
      );
    if (params.expectedVotingPower !== context.user.votingPower)
      throw new Error("Provider voting power changed; refresh Review.");
    if (
      params.expectedVotingCountAvailable !==
        context.user.votingCountAvailable ||
      context.user.votingCountAvailable <= 0
    )
      throw new Error(
        "Provider voting count is unavailable, changed or exhausted.",
      );
    if (params.vote === "report" && voting.ownerReportProtected)
      throw new Error("Owner proposal cannot be reported.");
    return tx(`vote-${params.vote}`, active.id);
  },
  async executeProposal(
    params: { proposalId: string; expectedVersion: number },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const record = requireVersion(
      find(context, params.proposalId),
      params.expectedVersion,
    );
    if (!eraProposalExecutable(record))
      throw new Error(
        "Proposal is not provider-executable or its provider vote result is not passed.",
      );
    return tx("execute", record.id);
  },
  async submitEraCodePreparationProof(
    params: {
      recordId: string;
      expectedVersion: number;
      proofReference: string;
    },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const record = requireVersion(
      find(context, params.recordId),
      params.expectedVersion,
    );
    if (!params.proofReference.trim())
      throw new Error(
        "A non-empty DevOps deposit proof or evidence reference is required.",
      );
    if (!eraCodePreparationProofSubmittable(context, record))
      throw new Error(
        "Code preparation proof is not required for this actor or provider state.",
      );
    return {
      ...tx("code-proof", record.id),
      recordId: record.id,
      version: record.version + 1,
      depositProofState: "pending",
      verificationState: "provider-pending",
    };
  },
  async submitOwnerDiscretionProposal(
    params: { suggestionId: string; expectedVersion: number },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const record = requireVersion(
      find(context, params.suggestionId),
      params.expectedVersion,
    );
    if (!eraOwnerDiscretionSubmittable(context, record))
      throw new Error(
        "Owner discretionary proposal submission is unavailable for this provider state.",
      );
    return {
      ...tx("owner-discretion", record.id),
      proposalId: `${record.id}-OWNER`,
      version: 1,
      lifecycle: "queued",
      attributionState: "owner-discretion" as const,
      submittedBy: "OWNER" as const,
      submittedByOwner: true as const,
      proposerId: "OWNER" as const,
      proposerIsOwner: true as const,
      ownerQueuePriority: true as const,
      ownerReportProtected: true as const,
      originalSuggestionId: record.id,
      originalSuggestionProposerId: record.proposerId,
    };
  },
  async submitOwnerFinalCode(
    params: {
      proposalId: string;
      expectedVersion: number;
      codeReference: string;
    },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const record = requireVersion(
      find(context, params.proposalId),
      params.expectedVersion,
    );
    if (!params.codeReference.trim())
      throw new Error("A non-empty final code reference is required.");
    if (!eraOwnerFinalCodeSubmittable(context, record))
      throw new Error(
        "Owner final-code submission is unavailable for this provider state.",
      );
    return {
      ...tx("owner-final-code", record.id),
      originalProposalId: record.id,
      originalExecutable: false,
      successorProposalId: `${record.id}-CODE-V2`,
      successorVersion: 1,
      successorLifecycle: "queued",
      requiresNewVote: true,
    };
  },
  async donateEliteFund(
    params: {
      grade: EraGrade;
      asset: string;
      amount: number;
      expectedVersion: number;
    },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const fund = context.eliteFunds.find((item) => item.grade === params.grade);
    if (
      !fund ||
      fund.version !== params.expectedVersion ||
      !fund.acceptsSeparateDonation ||
      !fund.donationAssets.includes(params.asset) ||
      !validAmount(params.amount)
    )
      throw new Error(
        "ELITE fund donation parameters are unavailable or stale.",
      );
    return tx("elite-donate", params.grade);
  },
  async withdrawEliteFund(
    params: {
      grade: EraGrade;
      expectedVersion: number;
      expectedAmount: number;
      expectedToken: string;
    },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const fund = context.eliteFunds.find((item) => item.grade === params.grade);
    const entitlement = fund?.withdrawEntitlement;
    if (
      !fund ||
      fund.version !== params.expectedVersion ||
      !fund.withdrawAvailable ||
      !entitlement ||
      entitlement.amount !== params.expectedAmount ||
      entitlement.token !== params.expectedToken
    )
      throw new Error("ELITE monthly entitlement is unavailable or stale.");
    if (
      !context.user.eliteGrades.includes(params.grade) ||
      context.user.isOwner
    )
      throw new Error("Provider ELITE grade eligibility is required.");
    return tx("elite-withdraw", params.grade);
  },
  async donateStockholderFund(
    params: { asset: string; amount: number; expectedVersion: number },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const fund = context.stockholderFund;
    if (
      fund.version !== params.expectedVersion ||
      fund.allocationPercent < fund.minimumAllocationPercent ||
      !fund.donationAvailable ||
      !fund.donationAssets.includes(params.asset) ||
      !validAmount(params.amount)
    )
      throw new Error(
        "Stockholder fund donation parameters are unavailable or stale.",
      );
    return tx("stockholder-donate", params.asset);
  },
  async adjustStockholderAllocation(
    params: { allocationPercent: number; expectedVersion: number },
    providerContext?: EraProtocolContext,
  ) {
    const context = requireContext(providerContext);
    const fund = context.stockholderFund;
    if (!eraStockholderAllocationAdjustable(context))
      throw new Error("Only Owner may adjust the stockholder allocation.");
    if (fund.version !== params.expectedVersion)
      throw new Error(
        "Stockholder fund version changed; refresh provider state.",
      );
    if (
      !Number.isFinite(params.allocationPercent) ||
      params.allocationPercent <
        Math.max(
          10,
          Number.isFinite(fund.minimumAllocationPercent)
            ? fund.minimumAllocationPercent
            : 10,
        ) ||
      params.allocationPercent > 100
    )
      throw new Error(
        "Stockholder allocation must be between 10 and 100 percent.",
      );
    return {
      ...tx("stockholder-allocation", String(params.allocationPercent)),
      allocationPercent: params.allocationPercent,
      version: fund.version + 1,
    };
  },
};
