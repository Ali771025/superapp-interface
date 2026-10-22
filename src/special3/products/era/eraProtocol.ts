export type EraGrade = "A" | "B" | "C";
export type EraVoteChoice = "yes" | "no" | "report";
export type EraCodeMode =
  | "provided"
  | "team-development"
  | "deferred"
  | "not-required";
export type EraReviewDecision = "approve" | "request-amendment" | "reject";
export type EraReviewerRole = "OWNER" | "LEGEND" | "ELITE_A" | "NONE";
export type EraLifecycle =
  | "suggestion"
  | "qualification-review"
  | "amendment-requested"
  | "suggestion-rejected"
  | "preparation"
  | "advancement-blocked"
  | "proposal-cancelable"
  | "queued"
  | "voting"
  | "passed"
  | "passed-awaiting-code"
  | "rejected"
  | "executable"
  | "executed"
  | "cancelled";

export const ERA_GRADE_MEANING: Readonly<Record<EraGrade, string>> = {
  A: "Innovation · new Product",
  B: "Modification · existing feature",
  C: "Optimization · minor or no-code change",
};

export interface EraDocumentMetadata {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  providerReference?: string;
}
export interface EraSuggestionInput {
  name: string;
  challenge: string;
  aim: string;
  solution: string;
  description: string;
  requestedGrade: EraGrade;
  documents?: EraDocumentMetadata[];
  codeMode?: EraCodeMode;
  codeReference?: string;
}
export interface EraApprovalState {
  required: boolean;
  status:
    | "not-required"
    | "pending"
    | "approved"
    | "amendment-requested"
    | "rejected";
  eligibleRoles: EraReviewerRole[];
  reviewedBy?: EraReviewerRole;
  feedback?: string;
  qualificationDeadlineRequiredOnApproval: boolean;
  qualificationDeadlineMin?: string;
  qualificationDeadlineMax?: string;
  detail: string;
}
export interface EraCodePreparationState {
  requirement: "required" | "optional" | "not-required";
  mode: EraCodeMode;
  quoteStatus: "not-requested" | "pending" | "provided" | "not-applicable";
  quotedFeeAmount?: number;
  quotedFeeAsset?: string;
  estimatedTime?: string;
  depositProofState: "not-required" | "required" | "pending" | "verified";
  auditState: "not-required" | "pending" | "in-review" | "passed" | "failed";
  developmentState: "not-required" | "pending" | "in-progress" | "complete";
  codeReady: boolean;
  finalCodeReference?: string;
  firstVoteBeforeCodeReadyAllowed: boolean;
  requiresSecondVote: boolean;
  providerDetail: string;
}
export interface EraProposalAdvancementState {
  state:
    | "not-started"
    | "eligible"
    | "blocked-stocks"
    | "blocked-sanction"
    | "blocked-approval"
    | "blocked-preparation"
    | "finalized";
  requiredCompletedStocks: 5;
  currentCompletedStocks: number;
  qualificationDeadline?: string;
  ownerDiscretionAvailable: boolean;
  providerDetail: string;
}
export interface EraVotingRecord {
  eligibleVoterCount: number;
  participantCount: number;
  requiredParticipantCount: number;
  yes: number;
  no: number;
  report: number;
  effectiveNegative: number;
  requiredYesCount: number;
  quorumReached: boolean;
  successState: "open" | "passed" | "rejected";
  isOwnerProposal: boolean;
  ownerReportProtected: boolean;
  cancelUntil?: string;
  votingOpensAt?: string;
  votingClosesAt?: string;
  version: number;
}
export interface EraProposalRecord extends EraSuggestionInput {
  id: string;
  finalGrade?: EraGrade;
  lifecycle: EraLifecycle;
  lifecycleLabel: string;
  proposerId: string;
  proposerLabel: string;
  proposerIsOwner: boolean;
  completedStocksAtQualification: number;
  maintainsFiveCompletedStocks: boolean;
  attributionState:
    | "proposer"
    | "pending-maintenance"
    | "owner-discretion-available";
  approval: EraApprovalState;
  advancement: EraProposalAdvancementState;
  codePreparation: EraCodePreparationState;
  queuePosition?: number;
  ownerQueuePriority?: boolean;
  providerDetail: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  parentProposalId?: string;
  supersededByProposalId?: string;
  lineageLabel?: string;
  voting?: EraVotingRecord;
  reportOutcome?: {
    reportPercent: number;
    thresholdExceeded: boolean;
    resultingStrikeCount: number;
    sanction: "none" | "warning" | "six-month-ban" | "permanent-ban";
  };
  execution?: {
    public: true;
    executable: boolean;
    executed: boolean;
    executedAt?: string;
    providerDetail: string;
  };
}
export interface EraUserContext {
  actorId: string;
  actorLabel: string;
  isOwner: boolean;
  reviewerRole: EraReviewerRole;
  ownedElectoralStockCount: number;
  completedElectoralStockCount: number;
  votingEligibility: "eligible" | "ineligible" | "unknown";
  votingEligibilityReason: string;
  votingPower: number;
  votingCountAvailable: number;
  legend: boolean;
  eliteGrades: EraGrade[];
  successfulProposalPoints: Record<EraGrade, number>;
  proposerReportStrikes: number;
  submissionBan: "none" | "six-month" | "permanent";
  submissionBanUntil?: string;
}
export interface EraEliteGradeState {
  grade: EraGrade;
  successfulProposalCount: number;
  points: number;
  isElite: boolean;
  additionalShareBlocks: number;
  providerShareMultiplier: number;
  providerEntitlementLabel: string;
}
export interface EraTokenBalance {
  token: string;
  amount: string;
}
export interface EraEliteFundState {
  grade: EraGrade;
  label: string;
  version: number;
  balances: EraTokenBalance[];
  eesSaleFundingPrinciple: string;
  acceptsSeparateDonation: boolean;
  donationAssets: string[];
  memberCount: number;
  monthlyWindowLabel: string;
  distributionRuleLabel: string;
  withdrawAvailable: boolean;
  withdrawEntitlement?: { amount: number; token: string };
  providerDetail: string;
}
export interface EraStockholderFundState {
  version: number;
  allocationPercent: number;
  minimumAllocationPercent: 10;
  balances: EraTokenBalance[];
  completedStockholder: boolean;
  completedStockCount: number;
  donationAvailable: boolean;
  donationAssets: string[];
  providerDetail: string;
}
export interface EraGovernanceParameters {
  votingPeriodHours: number;
  quorumRuleLabel: string;
  successRuleLabel: string;
  oneActiveVote: true;
  parametersModifiableByProposal: Array<
    "voting-period" | "voting-power" | "voting-count"
  >;
}
export interface EraProtocolContext {
  source: "preview" | "live";
  sourceLabel: string;
  sourceFreshness: "fresh" | "stale" | "unavailable";
  sourceDetail: string;
  providerNow: string;
  governance: EraGovernanceParameters;
  governanceScope: string;
  user: EraUserContext;
  suggestions: EraProposalRecord[];
  activeVote?: EraProposalRecord;
  queue: EraProposalRecord[];
  history: EraProposalRecord[];
  elite: EraEliteGradeState[];
  eliteFunds: EraEliteFundState[];
  stockholderFund: EraStockholderFundState;
}

const parseProviderTime = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const preProposalLifecycles: ReadonlySet<EraLifecycle> = new Set([
  "suggestion",
  "qualification-review",
  "preparation",
  "advancement-blocked",
]);

export const eraProviderAtOrBefore = (
  providerNow: string,
  deadline: string | undefined,
) => {
  const now = parseProviderTime(providerNow);
  const until = parseProviderTime(deadline);
  return now !== undefined && until !== undefined && now <= until;
};
export const eraQualificationWindowOpen = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) => {
  if (!record) return false;
  const deadline = record.advancement.qualificationDeadline;
  if (deadline === undefined)
    return !record.approval.qualificationDeadlineRequiredOnApproval;
  return eraProviderAtOrBefore(context.providerNow, deadline);
};
export const eraRequiredQualificationDeadlineMissing = (
  record?: EraProposalRecord,
) =>
  Boolean(
    record?.approval.qualificationDeadlineRequiredOnApproval &&
      record.advancement.qualificationDeadline === undefined,
  );
export const eraQualificationWindowExpired = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) => {
  if (!record?.advancement.qualificationDeadline) return false;
  const now = parseProviderTime(context.providerNow);
  const deadline = parseProviderTime(
    record.advancement.qualificationDeadline,
  );
  return now !== undefined && deadline !== undefined && now > deadline;
};
export const eraProviderInsideVotingWindow = (
  providerNow: string,
  voting: EraVotingRecord | undefined,
) => {
  if (!voting) return false;
  const now = parseProviderTime(providerNow);
  if (now === undefined) return false;
  const opens =
    voting.votingOpensAt === undefined
      ? undefined
      : parseProviderTime(voting.votingOpensAt);
  const closes =
    voting.votingClosesAt === undefined
      ? undefined
      : parseProviderTime(voting.votingClosesAt);
  if (voting.votingOpensAt !== undefined && opens === undefined) return false;
  if (voting.votingClosesAt !== undefined && closes === undefined) return false;
  return (
    (opens === undefined || now >= opens) &&
    (closes === undefined || now < closes)
  );
};
export const eraProposalCanVote = (
  proposal: EraProposalRecord | undefined,
  providerNow?: string,
) =>
  Boolean(
    proposal?.lifecycle === "voting" &&
      proposal.voting?.successState === "open" &&
      (providerNow === undefined ||
        eraProviderInsideVotingWindow(providerNow, proposal.voting)),
  );
export const eraSuggestionEssentialsComplete = (input: EraSuggestionInput) =>
  [
    input.name,
    input.challenge,
    input.aim,
    input.solution,
    input.description,
  ].every((value) => value.trim()) &&
  (["A", "B", "C"] as EraGrade[]).includes(input.requestedGrade);
export const eraReviewerCanReview = (
  context: EraProtocolContext,
  grade: EraGrade,
) =>
  context.user.reviewerRole === "OWNER" ||
  context.user.reviewerRole === "LEGEND" ||
  (context.user.reviewerRole === "ELITE_A" && grade !== "A");
export const eraSuggestionCanReview = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) =>
  Boolean(
    record &&
      record.lifecycle === "qualification-review" &&
      record.approval.required &&
      record.approval.status === "pending" &&
      eraReviewerCanReview(context, record.requestedGrade),
  );
const eraPreparationAllowsFirstVote = (record: EraProposalRecord) =>
  record.codePreparation.codeReady ||
  Boolean(
    record.codePreparation.requirement === "required" &&
      record.codePreparation.mode === "deferred" &&
      record.codePreparation.firstVoteBeforeCodeReadyAllowed &&
      !record.codePreparation.requiresSecondVote,
  );
export const eraProposalAdvancementEligible = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) =>
  Boolean(
    record &&
      preProposalLifecycles.has(record.lifecycle) &&
      record.approval.status === "approved" &&
      record.advancement.state === "eligible" &&
      record.proposerId === context.user.actorId &&
      context.user.completedElectoralStockCount >= 5 &&
      record.advancement.currentCompletedStocks >= 5 &&
      context.user.submissionBan === "none" &&
      eraQualificationWindowOpen(context, record) &&
      eraPreparationAllowsFirstVote(record),
  );
export const eraProposalCancelable = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) =>
  Boolean(
    record &&
      record.lifecycle === "proposal-cancelable" &&
      record.proposerId === context.user.actorId &&
      eraProviderAtOrBefore(context.providerNow, record.voting?.cancelUntil),
  );
export const eraProposalVoteEligible = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) =>
  Boolean(
    record &&
      context.activeVote?.id === record.id &&
      context.activeVote.version === record.version &&
      eraProposalCanVote(record, context.providerNow) &&
      context.user.ownedElectoralStockCount > 0 &&
      context.user.votingEligibility === "eligible" &&
      context.user.votingPower > 0 &&
      context.user.votingCountAvailable > 0,
  );
export const eraProposalExecutable = (record?: EraProposalRecord) =>
  Boolean(
    record &&
      record.lifecycle === "executable" &&
      record.codePreparation.codeReady &&
      !record.codePreparation.requiresSecondVote &&
      record.execution?.public &&
      record.execution.executable &&
      !record.execution.executed &&
      record.voting?.successState === "passed",
  );
export const eraSuggestionAmendable = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) =>
  Boolean(
    record &&
      record.lifecycle === "amendment-requested" &&
      record.approval.status === "amendment-requested" &&
      record.proposerId === context.user.actorId,
  );
export const eraCodePreparationProofSubmittable = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) =>
  Boolean(
    record &&
      record.proposerId === context.user.actorId &&
      (record.codePreparation.mode === "provided" ||
        record.codePreparation.mode === "team-development") &&
      record.codePreparation.quoteStatus === "provided" &&
      record.codePreparation.depositProofState === "required",
  );
export const eraOwnerDiscretionSubmittable = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) =>
  Boolean(
    record &&
      context.user.isOwner &&
      record.advancement.ownerDiscretionAvailable &&
      preProposalLifecycles.has(record.lifecycle) &&
      record.advancement.state === "blocked-stocks" &&
      record.advancement.currentCompletedStocks < 5 &&
      eraQualificationWindowExpired(context, record) &&
      record.approval.status === "approved" &&
      context.user.submissionBan === "none" &&
      eraPreparationAllowsFirstVote(record),
  );
export const eraOwnerFinalCodeSubmittable = (
  context: EraProtocolContext,
  record?: EraProposalRecord,
) =>
  Boolean(
    record &&
      context.user.isOwner &&
      record.lifecycle === "passed-awaiting-code" &&
      record.voting?.successState === "passed" &&
      record.codePreparation.requirement === "required" &&
      !record.codePreparation.codeReady &&
      record.codePreparation.requiresSecondVote &&
      !record.execution?.executed,
  );
export const eraStockholderAllocationAdjustable = (
  context: EraProtocolContext,
) => context.user.isOwner;
