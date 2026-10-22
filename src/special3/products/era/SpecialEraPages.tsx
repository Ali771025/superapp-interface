import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Gavel,
  PlusCircle,
  ShieldAlert,
  Vote,
} from "@icons";
import { AppShell } from "../../../components/layout/AppShell";
import { TransactionReviewModal } from "../../../components/modals/TransactionReviewModal";
import {
  productActions,
  productPresentationProvider,
} from "../../providers/products";
import { ProductProviderGate } from "../../providers/products/ProductProviderGate";
import {
  FieldCarrier,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  LocalNav,
  PrimaryAction,
  SecondaryAction,
  SourceDisclosure,
} from "../../interaction";
import { ProductHeroActions } from "../ProductHeroActions";
import type {
  EraCodeMode,
  EraGrade,
  EraProposalRecord,
  EraProtocolContext,
  EraReviewDecision,
  EraSuggestionInput,
  EraVoteChoice,
} from "./eraProtocol";
import {
  ERA_GRADE_MEANING,
  eraCodePreparationProofSubmittable,
  eraOwnerDiscretionSubmittable,
  eraOwnerFinalCodeSubmittable,
  eraProposalAdvancementEligible,
  eraProposalCancelable,
  eraProposalVoteEligible,
  eraProposalExecutable,
  eraQualificationWindowExpired,
  eraRequiredQualificationDeadlineMissing,
  eraStockholderAllocationAdjustable,
  eraSuggestionAmendable,
  eraSuggestionCanReview,
  eraSuggestionEssentialsComplete,
} from "./eraProtocol";
import "../phase06-products.css";
import "./era.css";

export type EraSpecialView =
  | "overview"
  | "proposals"
  | "detail"
  | "create"
  | "funds";
type ProposalTab = "active" | "queue" | "suggestions" | "history";
type FundTab = "elite" | "funds" | "stockholders";
type ReviewAction =
  | "vote"
  | "cancel"
  | "approve"
  | "request-amendment"
  | "reject"
  | "advance"
  | "execute"
  | "amend"
  | "proof"
  | "owner-discretion"
  | "final-code"
  | null;

const context = () => productPresentationProvider.data.eraProtocolContext;
const disclosure = (data: EraProtocolContext) => ({
  source: data.source,
  label: data.sourceLabel,
  freshness: data.sourceFreshness,
  detail: data.sourceDetail,
  updatedAt: data.providerNow,
});
const gradeLabel = (grade: EraGrade) =>
  `${grade} · ${ERA_GRADE_MEANING[grade]}`;
const allRecords = (data: EraProtocolContext) => [
  ...(data.activeVote ? [data.activeVote] : []),
  ...data.queue,
  ...data.suggestions,
  ...data.history,
];
const percent = (part: number, total: number) =>
  total ? Math.round((part / total) * 100) : 0;

export function SpecialEraPresentation({ view }: { view: EraSpecialView }) {
  return (
    <ProductProviderGate title="ERA Governance">
      <EraRouter view={view} />
    </ProductProviderGate>
  );
}
function EraRouter({ view }: { view: EraSpecialView }) {
  const data = context();
  if (!data) return <Unavailable />;
  if (view === "detail") return <ProposalDetail data={data} />;
  if (view === "create") return <CreateSuggestion data={data} />;
  if (view === "funds") return <Funds data={data} />;
  if (view === "proposals")
    return (
      <EraFrame data={data}>
        <Proposals data={data} />
      </EraFrame>
    );
  return (
    <EraFrame data={data}>
      <Overview data={data} />
    </EraFrame>
  );
}
function Unavailable() {
  return (
    <AppShell title="ERA Governance" showBack wide>
      <section data-special3 className="s3-product s3-product--era s3-era">
        <section className="s3-product__panel s3-era__empty">
          <ShieldAlert />
          <h2>ERA provider unavailable</h2>
          <p>
            No lifecycle, eligibility, vote, sanction or fund state is inferred.
          </p>
        </section>
      </section>
    </AppShell>
  );
}

function EraFrame({
  data,
  children,
}: {
  data: EraProtocolContext;
  children: ReactNode;
}) {
  const route = useLocation();
  const path = route.pathname;
  const active =
    route.hash === "#history"
      ? "history"
      : path === "/era"
        ? "overview"
        : path === "/era/create"
          ? "submit"
          : path === "/era/elite"
            ? "funds"
            : "proposals";
  const vote = data.activeVote?.voting;
  const metrics = [
    ["Active Vote", data.activeVote?.id ?? "None"],
    [
      "Turnout / Quorum",
      vote
        ? `${vote.participantCount} / ${vote.requiredParticipantCount}`
        : "—",
    ],
    [
      "My Voting Power",
      `${data.user.votingPower}× · ${data.user.votingCountAvailable} count`,
    ],
    [
      "My ERA Status",
      data.user.eliteGrades.length
        ? `ELITE ${data.user.eliteGrades.join(" · ")}`
        : "Stock owner",
    ],
  ];
  const nav = [
    { id: "overview", label: "Overview", to: "/era" },
    { id: "proposals", label: "Proposals", to: "/era/proposals" },
    { id: "submit", label: "Submit", to: "/era/create" },
    { id: "funds", label: "Funds", to: "/era/elite" },
    { id: "history", label: "History", to: "/era/proposals#history" },
  ];
  return (
    <AppShell title="ERA Governance" showBack wide>
      <section data-special3 className="s3-product s3-product--era s3-era">
        <header className="s3-product__hero s3-era__hero">
          <div className="s3-product__hero-row">
            <div>
              <p className="s3-product__eyebrow">ERA Governance Protocol</p>
              <h2>ERA</h2>
              <p className="s3-product__muted">
                Eternity Rules Assembly · transparent proposals and community votes.
              </p>
            </div>
            <ProductHeroActions product="ERA" />
          </div>
        </header>
        <section
          className="s3-product__metrics s3-era__metrics"
          aria-label="ERA shared metrics"
        >
          {metrics.map(([label, value]) => (
            <article className="s3-product__metric" key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
            </article>
          ))}
        </section>
        <div className="s3-era__local-nav">
          <LocalNav label="ERA" activeId={active} items={nav} />
        </div>
        {children}
        <SourceDisclosure value={disclosure(data)} />
      </section>
    </AppShell>
  );
}
function GradePill({ grade, final }: { grade: EraGrade; final?: boolean }) {
  return (
    <span className={`s3-era__grade is-${grade.toLowerCase()}`}>
      {final ? "Final" : "Requested"} {grade}
    </span>
  );
}
function Lifecycle({ record }: { record: EraProposalRecord }) {
  return (
    <span className="s3-era__lifecycle">
      <i />
      {record.lifecycleLabel}
    </span>
  );
}
function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function Panel({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`s3-product__panel ${className}`}>
      {eyebrow && <p className="s3-product__eyebrow">{eyebrow}</p>}
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}
function VoteBars({ record }: { record: EraProposalRecord }) {
  const v = record.voting;
  if (!v) return null;
  return (
    <div className="s3-era__vote-summary">
      <div className="s3-era__ratio">
        <i
          className="is-yes"
          style={{ width: `${percent(v.yes, v.participantCount)}%` }}
        />
        <i
          className="is-no"
          style={{ width: `${percent(v.no, v.participantCount)}%` }}
        />
        <i
          className="is-report"
          style={{ width: `${percent(v.report, v.participantCount)}%` }}
        />
      </div>
      <div>
        <span className="is-yes">YES {v.yes}</span>
        <span className="is-no">NO {v.no}</span>
        <span className="is-report">REPORT {v.report}</span>
      </div>
    </div>
  );
}
function ProposalCard({
  record,
  onOpen,
}: {
  record: EraProposalRecord;
  onOpen: () => void;
}) {
  return (
    <button className="s3-era__proposal" onClick={onOpen}>
      <header>
        <div>
          <GradePill grade={record.requestedGrade} />
          {record.finalGrade && <GradePill grade={record.finalGrade} final />}
        </div>
        <Lifecycle record={record} />
      </header>
      <h3>{record.name}</h3>
      <p>{record.description}</p>
      {record.ownerQueuePriority && (
        <strong className="s3-era__owner-priority">
          Owner queue priority after current vote
        </strong>
      )}
      <VoteBars record={record} />
      <footer>
        <span>{record.proposerLabel}</span>
        <span>v{record.version}</span>
      </footer>
    </button>
  );
}

function Overview({ data }: { data: EraProtocolContext }) {
  const nav = useNavigate();
  const active = data.activeVote;
  return (
    <main className="s3-era__workspace">
      <Panel eyebrow="Protocol authority" title="ERA owns ecosystem governance">
        <p className="s3-product__muted">{data.governanceScope}</p>
      </Panel>
      {active ? (
        <Panel
          eyebrow="Current provider vote"
          title={active.name}
          className="s3-era__feature"
        >
          <p>{active.description}</p>
          <div className="s3-era__facts">
            <Fact
              label="Window"
              value={`${data.governance.votingPeriodHours} hours · provider`}
            />
            <Fact
              label="Quorum"
              value={active.voting?.quorumReached ? "Reached" : "Not reached"}
            />
            <Fact
              label="Required YES"
              value={active.voting?.requiredYesCount ?? "—"}
            />
            <Fact
              label="My voting count"
              value={data.user.votingCountAvailable}
            />
          </div>
          <VoteBars record={active} />
          <PrimaryAction onClick={() => nav(`/era/proposals/${active.id}`)}>
            Review active proposal <ArrowRight size={16} />
          </PrimaryAction>
        </Panel>
      ) : (
        <Panel className="s3-era__empty">
          <Clock3 />
          <h2>No active vote</h2>
          <p>
            Provider queue controls the next start. No device-time transition is
            inferred.
          </p>
        </Panel>
      )}
      <section className="s3-era__actions">
        <button onClick={() => nav("/era/proposals")}>
          <Vote />
          <span>
            <strong>Proposal workspace</strong>
            <small>Active, queue, suggestions and history</small>
          </span>
        </button>
        <button onClick={() => nav("/era/create")}>
          <PlusCircle />
          <span>
            <strong>Create suggestion</strong>
            <small>Record essentials before advancement</small>
          </span>
        </button>
        <button onClick={() => nav("/era/elite")}>
          <CircleDollarSign />
          <span>
            <strong>ELITE & Funds</strong>
            <small>Grade points and independent funds</small>
          </span>
        </button>
      </section>
      <section className="s3-era__protocol">
        <article>
          <strong>One active vote</strong>
          <span>Provider owns the clock and queue.</span>
        </article>
        <article>
          <strong>YES / NO / REPORT</strong>
          <span>NO + REPORT are effective negative votes.</span>
        </article>
        <article>
          <strong>Public Execute</strong>
          <span>Only after passed, code-ready provider state.</span>
        </article>
      </section>
    </main>
  );
}

function Proposals({ data }: { data: EraProtocolContext }) {
  const nav = useNavigate();
  const route = useLocation();
  const [tab, setTab] = useState<ProposalTab>(
    route.hash === "#history" ? "history" : "active",
  );
  useEffect(() => {
    if (route.hash === "#history") setTab("history");
    else setTab((current) => (current === "history" ? "active" : current));
  }, [route.hash]);
  const selectTab = (item: ProposalTab) => {
    setTab(item);
    if (item === "history") nav("/era/proposals#history", { replace: true });
    else if (route.hash) nav("/era/proposals", { replace: true });
  };
  const records =
    tab === "history"
      ? data.history
      : tab === "active"
        ? data.activeVote
          ? [data.activeVote]
          : []
        : tab === "queue"
          ? data.queue
          : data.suggestions;
  return (
    <main className="s3-era__workspace">
      <Panel
        eyebrow="ERA proposal workspace"
        title="Active / Queue / Suggestions / History"
      >
        <div className="s3-era__tabs" role="tablist">
          {(["active", "queue", "suggestions", "history"] as ProposalTab[]).map(
            (item) => (
              <button
                key={item}
                role="tab"
                aria-selected={tab === item}
                onClick={() => selectTab(item)}
              >
                {item[0].toUpperCase() + item.slice(1)} ·{" "}
                {item === "active"
                  ? data.activeVote
                    ? 1
                    : 0
                  : item === "queue"
                    ? data.queue.length
                    : item === "suggestions"
                      ? data.suggestions.length
                      : data.history.length}
              </button>
            ),
          )}
        </div>
      </Panel>
      <aside className="s3-era__notice">
        Lifecycle, queue, clock, quorum, result and sanctions are
        provider-owned. Exactly one active voting proposal is allowed.
      </aside>
      <section className="s3-era__proposal-list">
        {records.length ? (
          records.map((record) => (
            <ProposalCard
              key={record.id}
              record={record}
              onOpen={() => nav(`/era/proposals/${record.id}`)}
            />
          ))
        ) : (
          <Panel className="s3-era__empty">
            <Activity />
            <h2>No records in this provider state</h2>
          </Panel>
        )}
      </section>
    </main>
  );
}

function DetailSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3>{label}</h3>
      {children}
    </section>
  );
}
function CodePreparation({
  record,
  canSubmitProof,
  canSubmitFinalCode,
  proofReference,
  finalCodeReference,
  onProofChange,
  onFinalCodeChange,
  onReviewProof,
  onReviewFinalCode,
}: {
  record: EraProposalRecord;
  canSubmitProof: boolean;
  canSubmitFinalCode: boolean;
  proofReference: string;
  finalCodeReference: string;
  onProofChange: (value: string) => void;
  onFinalCodeChange: (value: string) => void;
  onReviewProof: () => void;
  onReviewFinalCode: () => void;
}) {
  const c = record.codePreparation;
  return (
    <Panel
      eyebrow="Code preparation"
      title={
        c.mode === "provided"
          ? "Provided ABI / code audit"
          : c.mode === "team-development"
            ? "ETERNITY team development"
            : c.mode === "deferred"
              ? "Code deferred"
              : "No code required"
      }
      className="s3-era__code"
    >
      <div className="s3-era__facts">
        <Fact label="Quote" value={c.quoteStatus} />
        <Fact label="Deposit proof" value={c.depositProofState} />
        <Fact label="Audit" value={c.auditState} />
        <Fact label="Development" value={c.developmentState} />
        <Fact
          label="First vote before code"
          value={
            c.firstVoteBeforeCodeReadyAllowed
              ? "Provider allowed"
              : "Not allowed"
          }
        />
      </div>
      <p>{c.estimatedTime ?? "No provider time estimate supplied."}</p>
      <small>{c.providerDetail}</small>
      {c.finalCodeReference && <code>{c.finalCodeReference}</code>}
      {c.depositProofState === "pending" && (
        <aside className="s3-era__notice">
          Proof pending provider verification · initial proof submission cannot
          be replayed.
        </aside>
      )}
      {canSubmitProof && (
        <>
          <FieldCarrier
            id="era-code-proof-reference"
            label="Deposit proof / evidence reference"
            description="Reference only; provider verification remains pending."
            required
          >
            <FieldInput
              value={proofReference}
              onChange={(event) => onProofChange(event.target.value)}
              placeholder="Receipt, provider ticket or evidence reference"
            />
          </FieldCarrier>
          <SecondaryAction
            disabled={!proofReference.trim()}
            onClick={onReviewProof}
          >
            Review proof submission
          </SecondaryAction>
        </>
      )}
      {canSubmitFinalCode && (
        <>
          <FieldCarrier
            id="era-final-code-reference"
            label="Owner final code reference"
            description="Creates a linked code-complete successor for a second vote."
            required
          >
            <FieldInput
              value={finalCodeReference}
              onChange={(event) => onFinalCodeChange(event.target.value)}
              placeholder="Repository, IPFS or provider artifact reference"
            />
          </FieldCarrier>
          <PrimaryAction
            disabled={!finalCodeReference.trim()}
            onClick={onReviewFinalCode}
          >
            Review Owner final code submission
          </PrimaryAction>
        </>
      )}
    </Panel>
  );
}
function ProposalDetail({ data }: { data: EraProtocolContext }) {
  const { id } = useParams();
  const route = useLocation();
  const record =
    allRecords(data).find((item) => item.id === id) ??
    (route.pathname === "/era/vote" ? data.activeVote : undefined);
  const requestedChoice = new URLSearchParams(route.search).get("decision");
  const [choice, setChoice] = useState<EraVoteChoice>(
    requestedChoice === "no" || requestedChoice === "report" ? requestedChoice : "yes",
  );
  const [action, setAction] = useState<ReviewAction>(null);
  const [feedback, setFeedback] = useState(
    "Clarify provider evidence and resubmit.",
  );
  const [proofReference, setProofReference] = useState("");
  const [finalCodeReference, setFinalCodeReference] = useState(
    "ipfs://bafy-era-owner-final-code-v2",
  );
  const [qualificationDeadline, setQualificationDeadline] =
    useState("2026-09-15T12:00");
  const [done, setDone] = useState("");
  const [amendForm, setAmendForm] = useState(() => ({
    name: record?.name ?? "",
    challenge: record?.challenge ?? "",
    aim: record?.aim ?? "",
    solution: record?.solution ?? "",
    description: record?.description ?? "",
    requestedGrade: record?.requestedGrade ?? ("B" as EraGrade),
    codeMode: record?.codeMode ?? ("deferred" as EraCodeMode),
    codeReference: record?.codeReference ?? "",
    documents: record?.documents ?? [],
  }));
  if (!record)
    return (
      <EraFrame data={data}>
        <Panel className="s3-era__empty">
          <ShieldAlert />
          <h2>Proposal unavailable</h2>
        </Panel>
      </EraFrame>
    );
  const voting = record.voting;
  const canVote = eraProposalVoteEligible(data, record);
  const canReview = eraSuggestionCanReview(data, record);
  const canAdvance = eraProposalAdvancementEligible(data, record);
  const canCancel = eraProposalCancelable(data, record);
  const canExecute = eraProposalExecutable(record);
  const canAmend = eraSuggestionAmendable(data, record);
  const canSubmitProof = eraCodePreparationProofSubmittable(data, record);
  const canOwnerDiscretion = eraOwnerDiscretionSubmittable(data, record);
  const canSubmitFinalCode = eraOwnerFinalCodeSubmittable(data, record);
  const amendedInput: EraSuggestionInput = {
    name: amendForm.name,
    challenge: amendForm.challenge,
    aim: amendForm.aim,
    solution: amendForm.solution,
    description: amendForm.description,
    requestedGrade: amendForm.requestedGrade,
    documents: amendForm.documents.length ? amendForm.documents : undefined,
    codeMode: amendForm.codeMode,
    codeReference:
      amendForm.codeMode === "provided" ? amendForm.codeReference : undefined,
  };
  const amendmentReady =
    eraSuggestionEssentialsComplete(amendedInput) &&
    (amendForm.codeMode !== "provided" ||
      Boolean(amendForm.codeReference.trim()));
  const updateAmend = (key: keyof typeof amendForm, value: unknown) =>
    setAmendForm((current) => ({ ...current, [key]: value }));
  const confirm = async () => {
    if (action === "vote")
      await productActions.era.vote({
        proposalId: record.id,
        vote: choice,
        expectedVersion: record.version,
        expectedVotingPower: data.user.votingPower,
        expectedVotingCountAvailable: data.user.votingCountAvailable,
      });
    else if (action === "cancel")
      await productActions.era.cancelProposal({
        proposalId: record.id,
        expectedVersion: record.version,
      });
    else if (action === "advance")
      await productActions.era.advanceSuggestion({
        suggestionId: record.id,
        expectedVersion: record.version,
      });
    else if (action === "execute")
      await productActions.era.executeProposal({
        proposalId: record.id,
        expectedVersion: record.version,
      });
    else if (action === "amend")
      await productActions.era.amendSuggestion({
        suggestionId: record.id,
        expectedVersion: record.version,
        input: amendedInput,
      });
    else if (action === "proof")
      await productActions.era.submitEraCodePreparationProof({
        recordId: record.id,
        expectedVersion: record.version,
        proofReference,
      });
    else if (action === "owner-discretion")
      await productActions.era.submitOwnerDiscretionProposal({
        suggestionId: record.id,
        expectedVersion: record.version,
      });
    else if (action === "final-code")
      await productActions.era.submitOwnerFinalCode({
        proposalId: record.id,
        expectedVersion: record.version,
        codeReference: finalCodeReference,
      });
    else if (action)
      await productActions.era.reviewSuggestion({
        suggestionId: record.id,
        decision: action as EraReviewDecision,
        feedback: action === "approve" ? undefined : feedback,
        qualificationDeadline:
          action === "approve" &&
          record.approval.qualificationDeadlineRequiredOnApproval
            ? new Date(qualificationDeadline).toISOString()
            : undefined,
        expectedVersion: record.version,
      });
    setDone(action ?? "action");
    setAction(null);
  };
  return (
    <EraFrame data={data}>
      <main className="s3-era__workspace">
        <article className="s3-product__panel s3-era__detail">
          <header>
            <div>
              <GradePill grade={record.requestedGrade} />
              {record.finalGrade && (
                <GradePill grade={record.finalGrade} final />
              )}
            </div>
            <Lifecycle record={record} />
          </header>
          <h2>{record.name}</h2>
          <p>{record.description}</p>
          <div className="s3-era__detail-grid">
            <DetailSection label="Challenge">
              <p>{record.challenge}</p>
            </DetailSection>
            <DetailSection label="Aim">
              <p>{record.aim}</p>
            </DetailSection>
            <DetailSection label="Solution">
              <p>{record.solution}</p>
            </DetailSection>
            <DetailSection label="Optional attachments">
              {record.documents?.length ? (
                record.documents.map((doc) => (
                  <p key={doc.id}>
                    <FileText size={15} />
                    {doc.name}
                  </p>
                ))
              ) : (
                <p>None supplied · valid initial suggestion</p>
              )}
            </DetailSection>
            <DetailSection label="Approval">
              <p>
                {record.approval.status} · {record.approval.detail}
              </p>
              {record.approval.feedback && (
                <small>{record.approval.feedback}</small>
              )}
            </DetailSection>
            <DetailSection label="Advancement">
              <p>{record.advancement.state}</p>
              <small>{record.advancement.providerDetail}</small>
              {record.advancement.qualificationDeadline && (
                <small>
                  CEES qualification deadline · {record.advancement.qualificationDeadline}
                </small>
              )}
            </DetailSection>
            <DetailSection label="Proposer">
              <p>
                {record.proposerLabel} · {record.completedStocksAtQualification}{" "}
                Completed Stocks
              </p>
              <small>
                Actor {record.proposerId} · v{record.version}
              </small>
            </DetailSection>
            <DetailSection label="Lifecycle">
              <p>{record.lifecycleLabel}</p>
              <small>{record.providerDetail}</small>
            </DetailSection>
          </div>
          {record.parentProposalId && (
            <aside className="s3-era__lineage">
              <strong>Linked successor</strong>
              <span>
                {record.parentProposalId} · {record.lineageLabel}
              </span>
            </aside>
          )}
          {record.supersededByProposalId && (
            <aside className="s3-era__lineage">
              <strong>Code-incomplete original</strong>
              <span>
                Successor {record.supersededByProposalId} · new vote required
              </span>
            </aside>
          )}
          <VoteBars record={record} />
          {voting && (
            <div className="s3-era__facts">
              <Fact label="Eligible voters" value={voting.eligibleVoterCount} />
              <Fact label="Participants" value={voting.participantCount} />
              <Fact
                label="Effective negative"
                value={voting.effectiveNegative}
              />
              <Fact label="Provider result" value={voting.successState} />
            </div>
          )}
          {record.execution && (
            <aside
              className={`s3-era__execution ${record.execution.executable ? "is-ready" : ""}`}
            >
              <Gavel />
              <div>
                <strong>
                  {record.execution.executable
                    ? "Public Execute available"
                    : "Execute unavailable"}
                </strong>
                <span>{record.execution.providerDetail}</span>
              </div>
            </aside>
          )}
        </article>
        <CodePreparation
          record={record}
          canSubmitProof={canSubmitProof}
          canSubmitFinalCode={canSubmitFinalCode}
          proofReference={proofReference}
          finalCodeReference={finalCodeReference}
          onProofChange={setProofReference}
          onFinalCodeChange={setFinalCodeReference}
          onReviewProof={() => setAction("proof")}
          onReviewFinalCode={() => setAction("final-code")}
        />
        {canReview && (
          <Panel
            eyebrow="Qualified review"
            title={`${data.user.reviewerRole} may review requested Grade ${record.requestedGrade}`}
          >
            {record.approval.qualificationDeadlineRequiredOnApproval && (
              <FieldCarrier
                id="era-qualification-deadline"
                label="Approver-set CEES qualification deadline"
                description={`${record.approval.qualificationDeadlineMin ?? "Provider minimum not supplied"} · ${record.approval.qualificationDeadlineMax ?? "Provider maximum not supplied"}`}
                required
              >
                <FieldInput
                  type="datetime-local"
                  value={qualificationDeadline}
                  onChange={(event) =>
                    setQualificationDeadline(event.target.value)
                  }
                />
              </FieldCarrier>
            )}
            <div className="s3-era__review-actions">
              <PrimaryAction
                disabled={
                  record.approval.qualificationDeadlineRequiredOnApproval &&
                  !Number.isFinite(Date.parse(qualificationDeadline))
                }
                onClick={() => setAction("approve")}
              >
                Approve
              </PrimaryAction>
              <SecondaryAction onClick={() => setAction("request-amendment")}>
                Request amendment
              </SecondaryAction>
              <SecondaryAction onClick={() => setAction("reject")}>
                Reject
              </SecondaryAction>
            </div>
            <FieldCarrier
              id="era-review-feedback"
              label="Feedback for amendment or rejection"
              optional
            >
              <FieldTextarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </FieldCarrier>
          </Panel>
        )}
        {record.approval.status === "pending" && !canReview && (
          <aside className="s3-era__blocked">
            <ShieldAlert />
            <div>
              <strong>Review unavailable</strong>
              <span>
                {data.user.reviewerRole === "ELITE_A" &&
                record.requestedGrade === "A"
                  ? "A-grade ELITE may review only Grade B or C."
                  : "Owner, Legend or qualified A-grade ELITE is required."}
              </span>
            </div>
          </aside>
        )}
        {record.lifecycle === "voting" && (
          <Panel
            eyebrow="Bound vote review"
            title="Choose one explicit governance decision"
          >
            <section className="s3-era__eligibility">
              <Fact label="Voting power" value={`${data.user.votingPower}×`} />
              <Fact
                label="Voting count"
                value={data.user.votingCountAvailable}
              />
              <Fact label="Proposal version" value={record.version} />
              <Fact
                label="Window"
                value={
                  canVote
                    ? `${data.governance.votingPeriodHours} hours · open`
                    : "Provider window unavailable or stale"
                }
              />
            </section>
            <div className="s3-era__choice" role="radiogroup">
              {(["yes", "no", "report"] as EraVoteChoice[]).map((item) => (
                <button
                  key={item}
                  role="radio"
                  aria-checked={choice === item}
                  disabled={
                    !canVote ||
                    (item === "report" && voting?.ownerReportProtected)
                  }
                  className={`is-${item}`}
                  onClick={() => setChoice(item)}
                >
                  {item.toUpperCase()}
                  {item === "report" && voting?.ownerReportProtected
                    ? " · Owner protected"
                    : ""}
                </button>
              ))}
            </div>
            <PrimaryAction
              disabled={
                !canVote ||
                (choice === "report" && voting?.ownerReportProtected)
              }
              onClick={() => setAction("vote")}
            >
              Review {choice.toUpperCase()} vote
            </PrimaryAction>
          </Panel>
        )}
        {canAmend && (
          <form
            className="s3-product__form s3-era__form"
            onSubmit={(event) => {
              event.preventDefault();
              if (amendmentReady) setAction("amend");
            }}
          >
            <Panel
              eyebrow="Proposer amendment"
              title="Correct and return to qualification review"
            >
              <aside className="s3-era__notice">
                <strong>Reviewer feedback</strong>
                <br />
                {record.approval.feedback}
              </aside>
              <FieldCarrier id="era-amend-name" label="Name" required>
                <FieldInput
                  value={amendForm.name}
                  onChange={(event) => updateAmend("name", event.target.value)}
                />
              </FieldCarrier>
              {(
                [
                  ["challenge", "Challenge"],
                  ["aim", "Aim"],
                  ["solution", "Solution"],
                  ["description", "Description"],
                ] as const
              ).map(([key, label]) => (
                <FieldCarrier
                  key={key}
                  id={`era-amend-${key}`}
                  label={label}
                  required
                >
                  <FieldTextarea
                    rows={key === "description" ? 4 : 3}
                    value={amendForm[key]}
                    onChange={(event) => updateAmend(key, event.target.value)}
                  />
                </FieldCarrier>
              ))}
              <FieldCarrier
                id="era-amend-grade"
                label="Requested Grade"
                required
              >
                <FieldSelect
                  value={amendForm.requestedGrade}
                  onChange={(event) =>
                    updateAmend(
                      "requestedGrade",
                      event.target.value as EraGrade,
                    )
                  }
                >
                  {(["A", "B", "C"] as EraGrade[]).map((grade) => (
                    <option key={grade} value={grade}>
                      {gradeLabel(grade)}
                    </option>
                  ))}
                </FieldSelect>
              </FieldCarrier>
              <FieldCarrier
                id="era-amend-documents"
                label="Optional attachments"
                optional
                hint={
                  amendForm.documents.map((item) => item.name).join(" · ") ||
                  "No attachment supplied."
                }
              >
                <FieldInput
                  type="file"
                  multiple
                  onChange={(event) =>
                    updateAmend(
                      "documents",
                      Array.from(event.target.files ?? []).map(
                        (file, index) => ({
                          id: `amend-${index + 1}`,
                          name: file.name,
                          mimeType: file.type || "application/octet-stream",
                          sizeBytes: file.size,
                        }),
                      ),
                    )
                  }
                />
              </FieldCarrier>
              <FieldCarrier
                id="era-amend-code-mode"
                label="Code preparation mode"
              >
                <FieldSelect
                  value={amendForm.codeMode}
                  onChange={(event) =>
                    updateAmend("codeMode", event.target.value as EraCodeMode)
                  }
                >
                  {(
                    [
                      "provided",
                      "team-development",
                      "deferred",
                      "not-required",
                    ] as EraCodeMode[]
                  ).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </FieldSelect>
              </FieldCarrier>
              {amendForm.codeMode === "provided" && (
                <FieldCarrier
                  id="era-amend-code-reference"
                  label="Code artifact / reference"
                  required
                >
                  <FieldInput
                    value={amendForm.codeReference}
                    onChange={(event) =>
                      updateAmend("codeReference", event.target.value)
                    }
                  />
                </FieldCarrier>
              )}
              <PrimaryAction
                disabled={!amendmentReady}
                onClick={() => setAction("amend")}
              >
                Review amended suggestion
              </PrimaryAction>
            </Panel>
          </form>
        )}
        {record.advancement.state === "finalized" &&
          (
            [
              "suggestion",
              "qualification-review",
              "preparation",
              "advancement-blocked",
            ] as string[]
          ).includes(record.lifecycle) && (
            <aside className="s3-era__blocked">
              <ShieldAlert />
              <div>
                <strong>Advancement replay blocked</strong>
                <span>
                  Provider state is already finalized; no repeat advance action
                  is exposed.
                </span>
              </div>
            </aside>
          )}
        {record.advancement.state === "eligible" && !canAdvance && (
          <aside className="s3-era__blocked">
            <ShieldAlert />
            <div>
              <strong>
                {eraQualificationWindowExpired(data, record)
                  ? "Qualification deadline expired"
                  : eraRequiredQualificationDeadlineMissing(record)
                    ? "Qualification deadline unavailable from provider"
                  : record.codePreparation.mode === "deferred" &&
                !record.codePreparation.codeReady
                  ? "First vote before code not allowed"
                  : "Advancement unavailable to this actor"}
              </strong>
              <span>
                {eraQualificationWindowExpired(data, record)
                  ? "The approver-set CEES window is closed; normal proposer inscription is blocked."
                  : eraRequiredQualificationDeadlineMissing(record)
                    ? "The approval requires an approver-set CEES deadline, but no deadline is present in provider state. Advancement fails closed."
                  : record.codePreparation.mode === "deferred" &&
                !record.codePreparation.codeReady
                  ? "Provider capability is false; required code must be ready before first-vote inscription."
                  : "Normal advancement is bound to the recorded proposer and current provider qualification."}
              </span>
            </div>
          </aside>
        )}
        {record.lifecycle === "proposal-cancelable" && !canCancel && (
          <aside className="s3-era__blocked">
            <ShieldAlert />
            <div>
              <strong>Cancellation unavailable</strong>
              <span>
                The acting proposer or provider cancel deadline is no longer
                valid.
              </span>
            </div>
          </aside>
        )}
        <div className="s3-era__detail-actions">
          {canCancel && (
            <SecondaryAction onClick={() => setAction("cancel")}>
              Review proposer cancellation
            </SecondaryAction>
          )}
          {canAdvance && (
            <SecondaryAction onClick={() => setAction("advance")}>
              Review proposal advancement
            </SecondaryAction>
          )}
          {canOwnerDiscretion && (
            <PrimaryAction onClick={() => setAction("owner-discretion")}>
              Review Owner discretionary submission
            </PrimaryAction>
          )}
          {canExecute && (
            <PrimaryAction onClick={() => setAction("execute")}>
              Review public Execute Proposal
            </PrimaryAction>
          )}
        </div>
        {done && (
          <p className="s3-era__result" role="status">
            <CheckCircle2 />
            Preview {done} submitted. Provider indexing remains separate.
          </p>
        )}
        <TransactionReviewModal
          open={Boolean(action)}
          onClose={() => setAction(null)}
          onConfirm={confirm}
          action={
            action === "vote"
              ? `Vote ${choice.toUpperCase()} on ERA proposal`
              : action === "request-amendment"
                ? "Request suggestion amendment"
                : action === "reject"
                  ? "Reject ERA suggestion"
                  : action === "approve"
                    ? "Approve ERA suggestion"
                    : action === "advance"
                      ? "Advance suggestion to proposal"
                      : action === "cancel"
                        ? "Cancel ERA proposal"
                        : action === "amend"
                          ? "Submit amended ERA suggestion"
                          : action === "proof"
                            ? "Submit DevOps deposit proof reference"
                            : action === "owner-discretion"
                              ? "Submit proposal by Owner discretion"
                              : action === "final-code"
                                ? "Submit Owner final code and create successor"
                                : "Execute ERA proposal"
          }
          additionalReviewFields={[
            { id: "record", label: "Record", value: record.id },
            {
              id: "version",
              label: "Bound version",
              value: String(record.version),
            },
            {
              id: "power",
              label: "Bound voting power",
              value: String(data.user.votingPower),
            },
            {
              id: "count",
              label: "Bound voting count",
              value: String(data.user.votingCountAvailable),
            },
            {
              id: "deadline",
              label: "Qualification deadline",
              value:
                action === "approve" &&
                record.approval.qualificationDeadlineRequiredOnApproval
                  ? qualificationDeadline
                  : "Not applicable",
            },
            {
              id: "proof",
              label: "Proof / code reference",
              value:
                action === "proof"
                  ? proofReference
                  : action === "final-code"
                    ? finalCodeReference
                    : "Not applicable",
            },
          ]}
          expectedResult={
            action === "amend"
              ? "Provider re-review / pending"
              : action === "proof"
                ? "Submitted / pending provider verification"
                : action === "owner-discretion"
                  ? "Owner-submitted priority proposal enters provider queue · Report protected"
                  : action === "final-code"
                    ? "Linked code-complete successor enters queue for second vote"
                    : "Provider-validated ERA action"
          }
          riskWarning={
            action === "proof"
              ? "This submits evidence only. It does not create a payment or mark verification, audit or development complete."
              : action === "final-code"
                ? "The original remains non-executable. The linked successor must pass a second vote."
                : "Identity, role, lifecycle, version, voting power and voting count are revalidated by the provider."
          }
        />
      </main>
    </EraFrame>
  );
}

function CreateSuggestion({ data }: { data: EraProtocolContext }) {
  const [form, setForm] = useState({
    name: "Transparent provider evidence index",
    challenge: "Evidence can drift between proposal versions.",
    aim: "Bind review evidence to one provider-owned version.",
    solution:
      "Add a version-bound evidence index and explicit freshness state.",
    description:
      "Restore a clear provider-truth review path without changing frozen product behavior.",
    grade: "B" as EraGrade,
    codeMode: "deferred" as EraCodeMode,
    codeReference: "",
  });
  const [documents, setDocuments] = useState<
    Array<{ id: string; name: string; mimeType: string; sizeBytes?: number }>
  >([]);
  const [review, setReview] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const input: EraSuggestionInput = {
    name: form.name,
    challenge: form.challenge,
    aim: form.aim,
    solution: form.solution,
    description: form.description,
    requestedGrade: form.grade,
    documents: documents.length ? documents : undefined,
    codeMode: form.codeMode,
    codeReference:
      form.codeMode === "provided" ? form.codeReference : undefined,
  };
  const ready =
    eraSuggestionEssentialsComplete(input) &&
    (form.codeMode !== "provided" || Boolean(form.codeReference.trim()));
  const submit = async () => {
    const result = await productActions.era.createSuggestion(input);
    setSubmitted(
      `${result.id} · ${result.lifecycle} · approval ${result.approvalStatus}`,
    );
  };
  return (
    <EraFrame data={data}>
      <main className="s3-era__workspace">
        <Panel eyebrow="Initial suggestion" title="Record the six essentials">
          <p className="s3-product__muted">
            A suggestion may be recorded during a sanction and before five
            Completed Stocks. Those rules apply later, when advancing or
            finalizing a proposal.
          </p>
        </Panel>
        <form
          className="s3-product__form s3-era__form"
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) setReview(true);
          }}
        >
          <Panel eyebrow="Essential fields" title="Suggestion truth">
            <FieldCarrier id="era-name" label="Name" required>
              <FieldInput
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </FieldCarrier>
            {(
              [
                ["challenge", "Challenge"],
                ["aim", "Aim"],
                ["solution", "Solution"],
                ["description", "Description"],
              ] as const
            ).map(([key, label]) => (
              <FieldCarrier key={key} id={`era-${key}`} label={label} required>
                <FieldTextarea
                  rows={key === "description" ? 4 : 3}
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              </FieldCarrier>
            ))}
            <FieldCarrier
              id="era-grade"
              label="Requested Grade"
              description="Requested grade is not final provider grade."
              required
            >
              <FieldSelect
                value={form.grade}
                onChange={(e) => update("grade", e.target.value as EraGrade)}
              >
                {(["A", "B", "C"] as EraGrade[]).map((grade) => (
                  <option key={grade} value={grade}>
                    {gradeLabel(grade)}
                  </option>
                ))}
              </FieldSelect>
            </FieldCarrier>
          </Panel>
          <Panel eyebrow="Optional evidence" title="Documents / attachments">
            <FieldCarrier
              id="era-documents"
              label="Attachments"
              optional
              hint={
                documents.map((item) => item.name).join(" · ") ||
                "No attachment selected; initial recording remains valid."
              }
            >
              <FieldInput
                type="file"
                multiple
                onChange={(e) =>
                  setDocuments(
                    Array.from(e.target.files ?? []).map((file, index) => ({
                      id: `upload-${index + 1}`,
                      name: file.name,
                      mimeType: file.type || "application/octet-stream",
                      sizeBytes: file.size,
                    })),
                  )
                }
              />
            </FieldCarrier>
          </Panel>
          <Panel eyebrow="Optional code path" title="Preparation mode">
            <div className="s3-era__code-modes" role="radiogroup">
              {(
                [
                  ["provided", "Provided ABI / code"],
                  ["team-development", "ETERNITY team development"],
                  ["deferred", "Decide after review"],
                  ["not-required", "No code required"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={form.codeMode === id}
                  onClick={() =>
                    setForm((current) => ({ ...current, codeMode: id }))
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {form.codeMode === "provided" && (
              <>
                <FieldCarrier
                  id="era-code-reference"
                  label="Code artifact / reference"
                  required
                >
                  <FieldInput
                    value={form.codeReference}
                    onChange={(e) => update("codeReference", e.target.value)}
                    placeholder="Repository, IPFS or provider artifact reference"
                  />
                </FieldCarrier>
                <aside className="s3-era__notice">
                  DevOps must supply audit quote, time estimate, deposit proof
                  state and audit result. No fee amount or token is invented.
                </aside>
              </>
            )}
            {form.codeMode === "team-development" && (
              <aside className="s3-era__notice">
                DevOps must supply development quote, delivery estimate, deposit
                proof state and final development result. No fee amount or token
                is invented.
              </aside>
            )}
            {form.codeMode === "deferred" && (
              <aside className="s3-era__notice">
                Code is optional at initial recording. The provider may require
                preparation before advancement or execution.
              </aside>
            )}
          </Panel>
          <Panel eyebrow="Readiness" title="Record now · advance later">
            <div className="s3-era__facts">
              <Fact
                label="Completed Stocks"
                value={`${data.user.completedElectoralStockCount} · advancement gate`}
              />
              <Fact
                label="Sanction"
                value={`${data.user.submissionBan} · advancement gate`}
              />
              <Fact
                label="Attachments"
                value={
                  documents.length ? "Optional · supplied" : "Optional · none"
                }
              />
              <Fact
                label="Essentials"
                value={ready ? "Complete" : "Incomplete"}
              />
            </div>
            <PrimaryAction type="submit" disabled={!ready}>Continue to Review</PrimaryAction>
          </Panel>
        </form>
        {submitted && (
          <p className="s3-era__result" role="status">
            <CheckCircle2 />
            Suggestion recorded · {submitted}. No blockchain finality, EQ or
            Journey progression is implied.
          </p>
        )}
        <TransactionReviewModal
          open={review}
          onClose={() => setReview(false)}
          onConfirm={submit}
          action={`Record requested Grade ${form.grade} ERA suggestion`}
          additionalReviewFields={[
            { id: "name", label: "Name", value: form.name },
            {
              id: "grade",
              label: "Requested grade",
              value: gradeLabel(form.grade),
            },
            {
              id: "attachments",
              label: "Attachments",
              value: documents.length
                ? documents.map((item) => item.name).join(", ")
                : "None · optional",
            },
            { id: "code", label: "Code path", value: form.codeMode },
          ]}
          expectedResult={
            data.user.isOwner
              ? "Owner suggestion enters preparation · approval not required"
              : "Suggestion enters provider qualification review"
          }
          riskWarning="Five Completed Stocks and sanction clearance are advancement/finalization gates, not initial-recording gates."
        />
      </main>
    </EraFrame>
  );
}

function Funds({ data }: { data: EraProtocolContext }) {
  const [tab, setTab] = useState<FundTab>("elite");
  const [grade, setGrade] = useState<EraGrade>("A");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("ETER");
  const [allocation, setAllocation] = useState(
    String(data.stockholderFund.allocationPercent),
  );
  const [review, setReview] = useState<
    | "donate-elite"
    | "withdraw-elite"
    | "donate-stockholder"
    | "adjust-stockholder"
    | null
  >(null);
  const numeric = Number(amount);
  const allocationNumeric = Number(allocation);
  const fund = data.eliteFunds.find((item) => item.grade === grade)!;
  const submit = () =>
    review === "donate-elite"
      ? productActions.era.donateEliteFund({
          grade,
          asset,
          amount: numeric,
          expectedVersion: fund.version,
        })
      : review === "withdraw-elite"
        ? productActions.era.withdrawEliteFund({
            grade,
            expectedVersion: fund.version,
            expectedAmount: fund.withdrawEntitlement!.amount,
            expectedToken: fund.withdrawEntitlement!.token,
          })
        : review === "adjust-stockholder"
          ? productActions.era.adjustStockholderAllocation({
              allocationPercent: allocationNumeric,
              expectedVersion: data.stockholderFund.version,
            })
          : productActions.era.donateStockholderFund({
              asset,
              amount: numeric,
              expectedVersion: data.stockholderFund.version,
            });
  return (
    <EraFrame data={data}>
      <main className="s3-era__workspace">
        <Panel eyebrow="Provider-owned finance state" title="ELITE & Funds">
          <div className="s3-era__tabs" role="tablist">
            {(
              [
                ["elite", "My ELITE"],
                ["funds", "ELITE Funds"],
                ["stockholders", "Stockholder Fund"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </Panel>
        {tab === "elite" && (
          <section className="s3-era__elite-grid">
            {data.elite.map((item) => (
              <Panel key={item.grade}>
                <GradePill grade={item.grade} />
                <h3>{item.isElite ? "ELITE" : "Not ELITE"}</h3>
                <Fact label="Successful points" value={item.points} />
                <Fact
                  label="Complete groups after first 4"
                  value={item.additionalShareBlocks}
                />
                <Fact
                  label="Provider share"
                  value={item.providerEntitlementLabel}
                />
                <small>
                  {data.user.isOwner
                    ? "Owner can never become ELITE."
                    : "Each grade qualifies independently at 4 successful points; each additional complete group of four adds 50%."}
                </small>
              </Panel>
            ))}
          </section>
        )}
        {tab === "funds" && (
          <>
            <div className="s3-era__grade-tabs">
              {(["A", "B", "C"] as EraGrade[]).map((item) => (
                <button
                  key={item}
                  aria-pressed={grade === item}
                  onClick={() => {
                    setGrade(item);
                    setAsset("ETER");
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <Panel
              eyebrow="Independent ELITE fund"
              title={fund.label}
              className="s3-era__fund"
            >
              <div className="s3-era__balances">
                {fund.balances.map((balance) => (
                  <Fact
                    key={balance.token}
                    label={balance.token}
                    value={balance.amount}
                  />
                ))}
              </div>
              <p>{fund.eesSaleFundingPrinciple}</p>
              <div className="s3-era__facts">
                <Fact label="Members" value={fund.memberCount} />
                <Fact label="Monthly window" value={fund.monthlyWindowLabel} />
                <Fact label="Distribution" value={fund.distributionRuleLabel} />
                <Fact
                  label="Entitlement"
                  value={
                    fund.withdrawEntitlement
                      ? `${fund.withdrawEntitlement.amount} ${fund.withdrawEntitlement.token}`
                      : "Unavailable"
                  }
                />
              </div>
              <div className="s3-era__fund-actions">
                <FieldInput
                  aria-label="ELITE fund donation amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^\d.]/g, ""))
                  }
                />
                <FieldSelect
                  aria-label="ELITE fund donation asset"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                >
                  {fund.donationAssets.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </FieldSelect>
                <SecondaryAction
                  disabled={!fund.acceptsSeparateDonation || !(numeric > 0)}
                  onClick={() => setReview("donate-elite")}
                >
                  Review donation
                </SecondaryAction>
                <PrimaryAction
                  disabled={
                    !fund.withdrawAvailable || !fund.withdrawEntitlement
                  }
                  onClick={() => setReview("withdraw-elite")}
                >
                  Review withdrawal
                </PrimaryAction>
              </div>
            </Panel>
          </>
        )}
        {tab === "stockholders" && (
          <Panel
            eyebrow={`${data.stockholderFund.allocationPercent}% allocation · minimum ${data.stockholderFund.minimumAllocationPercent}%`}
            title="Completed Electoral Stockholder Fund"
            className="s3-era__fund"
          >
            <p>{data.stockholderFund.providerDetail}</p>
            <div className="s3-era__balances">
              {data.stockholderFund.balances.map((balance) => (
                <Fact
                  key={balance.token}
                  label={balance.token}
                  value={balance.amount}
                />
              ))}
            </div>
            <div className="s3-era__fund-actions">
              <FieldInput
                aria-label="Stockholder donation amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^\d.]/g, ""))
                }
              />
              <FieldSelect
                aria-label="Stockholder donation asset"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
              >
                {data.stockholderFund.donationAssets.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </FieldSelect>
              <PrimaryAction
                disabled={
                  !data.stockholderFund.donationAvailable || !(numeric > 0)
                }
                onClick={() => setReview("donate-stockholder")}
              >
                Review direct donation
              </PrimaryAction>
              {eraStockholderAllocationAdjustable(data) && (
                <>
                  <FieldInput
                    aria-label="Owner stockholder allocation percent"
                    inputMode="numeric"
                    value={allocation}
                    onChange={(event) =>
                      setAllocation(event.target.value.replace(/[^\d]/g, ""))
                    }
                  />
                  <SecondaryAction
                    disabled={allocationNumeric < 10 || allocationNumeric > 100}
                    onClick={() => setReview("adjust-stockholder")}
                  >
                    Review Owner allocation adjustment
                  </SecondaryAction>
                </>
              )}
            </div>
            <small>No stockholder withdrawal action is exposed.</small>
          </Panel>
        )}
        <TransactionReviewModal
          open={Boolean(review)}
          onClose={() => setReview(null)}
          onConfirm={submit}
          action={
            review === "withdraw-elite"
              ? `Withdraw Grade ${grade} ELITE entitlement`
              : review === "donate-elite"
                ? `Donate to Grade ${grade} ELITE Fund`
                : review === "adjust-stockholder"
                  ? "Adjust Owner stockholder allocation"
                  : "Donate to Stockholder Fund"
          }
          amount={
            review === "withdraw-elite"
              ? fund.withdrawEntitlement?.amount
              : review === "adjust-stockholder"
                ? allocationNumeric
                : numeric
          }
          token={
            review === "withdraw-elite"
              ? fund.withdrawEntitlement?.token
              : review === "adjust-stockholder"
                ? "%"
                : asset
          }
          additionalReviewFields={
            review === "adjust-stockholder"
              ? [
                  {
                    id: "allocation-current",
                    label: "Provider current allocation",
                    value: `${data.stockholderFund.allocationPercent}%`,
                  },
                  {
                    id: "allocation-next",
                    label: "Reviewed allocation",
                    value: `${allocationNumeric}%`,
                  },
                  {
                    id: "fund-version",
                    label: "Bound fund version",
                    value: String(data.stockholderFund.version),
                  },
                ]
              : undefined
          }
          expectedResult={
            review === "adjust-stockholder"
              ? "Provider-validated allocation 10–100%"
              : "Provider-validated ERA fund action"
          }
          riskWarning="Provider revalidates fund, grade, token, amount, version and entitlement."
        />
      </main>
    </EraFrame>
  );
}
