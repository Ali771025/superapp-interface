export const PROGRESSION_SCHEMA_VERSION = '1.0.0' as const;
export const UNRESOLVED_SOURCE = 'UNRESOLVED — SOURCE REQUIRED' as const;

export type ProgressionMode = 'legacy' | 'shadow' | 'active';
export type ProgressionReadinessBlocker =
  | 'product_verifier_unavailable'
  | 'mission_mapping_unavailable'
  | 'persistence_not_production_ready'
  | 'protocol_resolution_required'
  | 'unsupported_environment';

export interface ProgressionReadiness {
  requestedMode: ProgressionMode;
  effectiveMode: ProgressionMode;
  activeReady: boolean;
  blockers: ProgressionReadinessBlocker[];
}

export type RuntimeEnvironment = 'live' | 'preview' | 'test';
export type VerifierCapabilityKind = 'production' | 'preview' | 'test-fixture';

export interface ProductVerifierCapability {
  production: boolean;
  preview: boolean;
  testFixture: boolean;
}

export interface ProgressionRuntimeCapabilities {
  environment: RuntimeEnvironment;
  productVerifiers: Record<AchievementProduct, ProductVerifierCapability>;
  persistence: { valid: boolean; productionReady: boolean; atomic: boolean };
  registry: { valid: boolean; ruleCount: number; protocolResolved: boolean };
  journey: { integrationSafe: boolean; authoritativeMappingAvailable: boolean };
  qa: { allowPreviewVerification: boolean; allowTestFixtureVerification: boolean };
}
export type ProductEventSource = 'chain' | 'indexer' | 'backend' | 'offchain' | 'mock' | 'simulation';
export type ProductEventStatus = 'observed' | 'pending' | 'confirmed' | 'indexed' | 'verified' | 'failed' | 'rejected' | 'duplicate' | 'simulation';
export type AchievementProduct = 'Generator' | 'FanCommunity' | 'Forecast' | 'SHIELD' | 'STOCK/EES' | 'ERA' | 'EID';

export interface ProductEventSourceRef {
  txHash?: string;
  logIndex?: number;
  blockNumber?: number;
  indexerId?: string;
  backendEventId?: string;
  requestId?: string;
  contractAddress?: string;
}

export interface NormalizedProgressionPayload {
  eligible: boolean;
  cumulativeValue?: number;
  milestoneValue?: number;
  achievementId?: string;
  ruleFamily?: string;
  missionCandidates?: string[];
  evidenceContract?: string;
  [key: string]: unknown;
}

export interface ProductEventEnvelope<TPayload = unknown> {
  schemaVersion: string;
  eventId: string;
  product: AchievementProduct;
  eventType: string;
  userId?: string;
  walletAddress?: string;
  eid?: string;
  chainId?: number;
  source: ProductEventSource;
  sourceRef?: ProductEventSourceRef;
  occurredAt?: string;
  observedAt: string;
  confirmedAt?: string;
  indexedAt?: string;
  verifiedAt?: string;
  status: ProductEventStatus;
  payloadVersion: string;
  payload: TPayload;
  dataFreshness?: string;
}

export interface LockedMilestone {
  label: string;
  threshold: number;
  unit: string;
}

export interface LockedAchievementRule {
  product: AchievementProduct;
  achievementId: string;
  eventType: string;
  milestone: LockedMilestone;
  prerequisite: string;
  qualificationRule: string;
  eqDelta: number;
  rewardEffect: string;
  repeatability: string;
  cap: number | string | { count: number; totalEq: number };
  forwardOnly: boolean;
  referralEligibility: string;
  referralEqAffectsPersonalLevelEq: boolean;
  evidence: string[];
  journeyImpactCategory: string;
}

export interface LockedAchievementMap {
  schemaVersion: number;
  ruleCount: number;
  levels: { count: number; thresholds: number[] };
  integrityContract: {
    zeroProgressionStatuses: string[];
    referral: {
      rate: number;
      recursiveCompounding: boolean;
      affectsPersonalLevelEq: boolean;
    };
    eid: { rewardedPurchaseCap: number; eqPerPurchase: number; totalEqCap: number };
  };
  unresolvedPolicy: string;
  rules: LockedAchievementRule[];
}

export type RejectionReason =
  | 'event_pending'
  | 'event_failed'
  | 'event_rejected'
  | 'duplicate_event'
  | 'simulation_only'
  | 'event_not_verified'
  | 'malformed_event'
  | 'wrong_account'
  | 'wrong_network'
  | 'unsupported_payload'
  | 'unsupported_product_event'
  | 'missing_required_evidence'
  | 'before_activation_watermark'
  | 'protocol_mapping_missing'
  | 'verified_but_ineligible'
  | 'verifier_unavailable'
  | 'legacy_mode_authoritative';

export interface IntegrityDecision {
  accepted: boolean;
  reason?: RejectionReason;
  detail: string;
}

export type AchievementEvaluationStatus = 'completed' | 'already-completed' | 'ineligible' | 'requires-protocol-resolution' | 'mapping-unresolved' | 'capped';

export interface AchievementEvaluation {
  achievementId: string;
  product: AchievementProduct;
  eventType: string;
  status: AchievementEvaluationStatus;
  eqDelta: number;
  journeyImpactCategory: string;
  referralEligible: boolean;
  unresolved: string[];
}

export type EqClassification = 'personal' | 'referral' | 'migration-snapshot';

export interface EqLedgerEntry {
  ledgerEntryId: string;
  eventId: string;
  achievementId: string;
  accountKey: string;
  userId?: string;
  walletAddress?: string;
  product: AchievementProduct | 'Migration';
  eqDelta: number;
  classification: EqClassification;
  source: ProductEventSource | 'legacy-opening-snapshot';
  evidenceRef?: string;
  createdAt: string;
  status: 'committed';
  referralEligible: boolean;
}

export interface RewardLedgerEntry {
  rewardEntryId: string;
  eventId: string;
  achievementId: string;
  accountKey: string;
  effect: typeof UNRESOLVED_SOURCE;
  status: 'requires-protocol-resolution';
  createdAt: string;
}

export interface MigrationOpeningSnapshot {
  snapshotId: string;
  accountKey: string;
  personalEq: number;
  level: number;
  rank?: string;
  capturedAt: string;
  activationWatermark: string;
  referralEligible: false;
  journeyEligible: false;
}

export interface ProgressionImpact {
  eventId: string;
  verificationStatus: string;
  achievements: Array<{ achievementId: string; status: AchievementEvaluationStatus; eqDelta?: number }>;
  personalEqDelta: number;
  referralEqDelta: number;
  levelBefore?: number;
  levelAfter?: number;
  rankBefore?: string;
  rankAfter?: string;
  accessChanges?: unknown[];
  journeyImpact?: { status: JourneyImpactStatus; missionId?: string };
  unresolved?: string[];
  rejectionReason?: RejectionReason;
}

export interface ProgressionState {
  schemaVersion: typeof PROGRESSION_SCHEMA_VERSION;
  accountKey: string;
  activationWatermark?: string;
  processedEventIds: string[];
  achievementAwardCounts: Record<string, number>;
  completedAchievementIds: string[];
  eqLedger: EqLedgerEntry[];
  referralEqLedger: EqLedgerEntry[];
  rewardLedger: RewardLedgerEntry[];
  appliedJourneyCommitIds: string[];
  openingSnapshot?: MigrationOpeningSnapshot;
  lastImpact?: ProgressionImpact;
  updatedAt: string;
}

export interface ReferralContext {
  isLineOne: boolean;
  sponsorAccountKey: string;
  sponsorLevel: number;
  directLevel: number;
  sourceClassification: EqClassification;
}

export type JourneyImpactStatus = 'applied' | 'duplicate' | 'no-matching-journey-impact' | 'mapping-unresolved' | 'not-committed';

export interface JourneyProgressionHandoff {
  eventId: string;
  product: AchievementProduct;
  achievementId?: string;
  impactCategory: string;
  eqDelta: number;
  personalEqDelta: number;
  referralEqDelta?: number;
  verified: true;
  progressionCommitId: string;
  missionCandidates?: string[];
  unresolved?: string[];
}

export type ProgressionAnalyticsName =
  | 'progression_event_observed'
  | 'progression_event_rejected'
  | 'progression_event_verified'
  | 'achievement_evaluated'
  | 'achievement_completed'
  | 'eq_committed'
  | 'referral_eq_committed'
  | 'level_changed'
  | 'journey_progress_applied'
  | 'journey_unlock_applied'
  | 'progression_duplicate_ignored'
  | 'progression_rule_unresolved';

export interface ProgressionAnalyticsEvent {
  name: ProgressionAnalyticsName;
  timestamp: string;
  eventId: string;
  product?: AchievementProduct;
  achievementId?: string;
  reason?: string;
}

export interface ShadowParityRecord {
  fixtureId: string;
  product: AchievementProduct;
  legacyOutcome: string;
  specialEventStatus: ProductEventStatus;
  verificationOutcome: string;
  achievementResult: string;
  eqResult: number;
  journeyResult: string;
  parityStatus: 'match' | 'difference';
  classification: 'expected integrity correction' | 'missing event mapping' | 'unresolved protocol rule' | 'genuine regression' | 'legacy generic behavior' | 'unsupported source evidence';
}
