import type { ReactNode } from 'react';

export type Special3Environment = 'live' | 'preview' | 'mock' | 'test' | 'testnet' | 'indexed' | 'direct-chain' | 'backend' | 'off-chain';
export type FreshnessState = 'live' | 'fresh' | 'syncing' | 'stale' | 'unknown' | 'unavailable';
export type FieldState = 'default' | 'loading' | 'valid' | 'invalid' | 'warning' | 'read-only' | 'disabled';
export type NoticeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type ProgressionPresentationState = 'pending' | 'grounded' | 'committed' | 'unavailable' | 'unresolved';
export type QoraSurfaceMode = 'shell' | 'compact' | 'none';
export type PageTitleOwner = 'shell' | 'template';
export type ProductPageTemplate = 'overview' | 'browse' | 'detail' | 'action' | 'verify' | 'result' | 'learning' | 'system';
export type ProductContentWidth = 'narrow' | 'standard' | 'wide' | 'full';
export type LocalNavMode = 'none' | 'navigation' | 'tabs' | 'contextual';
export type QoraOwnership = 'shell' | 'compact' | 'none';
export type SourceDisclosurePolicy = 'global-only' | 'product' | 'contextual';
export type VerifyModel = 'none' | 'financial' | 'governance' | 'identity' | 'product-specific';
export type ResultModel = 'none' | 'receipt' | 'status' | 'credential' | 'product-specific';

/** Read-only presentation metadata. It must never contain Product eligibility, validation, pricing or execution rules. */
export interface ProductPresentationContract {
  pageTemplate: ProductPageTemplate;
  shellMode: import('../shell/modes').Special3ShellMode;
  contentWidth: ProductContentWidth;
  localNav: LocalNavMode;
  qoraOwnership: QoraOwnership;
  titleOwnership: 'shell' | 'surface';
  sourceDisclosure: SourceDisclosurePolicy;
  verifyModel: VerifyModel;
  resultModel: ResultModel;
  accentGroup?: string;
}

export interface GroundedReviewContext {
  product: string;
  action: string;
  amount?: { value: string; token?: string; source: string };
  network?: { name: string; gasToken?: string; source: string };
  fee?: { display: string; token?: string; source: string; status: 'known' | 'estimated' | 'unavailable' };
  approval?: { required: boolean; asset?: string; source: string };
  quote?: { id?: string; fetchedAt?: string; expiresAt?: string; source?: string };
  warnings?: string[];
}
export type ActionLifecycleState =
  | 'idle'
  | 'editing'
  | 'validating'
  | 'ready'
  | 'reviewing'
  | 'awaiting-wallet'
  | 'submitted'
  | 'confirming'
  | 'indexing'
  | 'verifying'
  | 'result'
  | 'validation-failure'
  | 'wallet-rejected'
  | 'insufficient-funds'
  | 'network-failure'
  | 'reverted'
  | 'replaced'
  | 'indexing-delay'
  | 'verification-unavailable';

export type QuoteState = 'idle' | 'loading' | 'fresh' | 'stale' | 'expired' | 'error';

export interface SourceFreshness {
  source: Special3Environment;
  label?: string;
  freshness: FreshnessState;
  updatedAt?: string;
  fetchedAt?: string;
  detail?: string;
}

/** Shared read-only provenance contract. It labels presentation truth and never changes Product data semantics. */
export type DataProvenance = SourceFreshness;

export interface ProgressionPresentation {
  state: ProgressionPresentationState;
  label: string;
  achievementId?: string;
  personalEq?: string;
  referralEq?: string;
  journeyImpact?: string;
  evidence?: string;
}

export interface ReviewField {
  id: string;
  label: string;
  value?: string | null;
  fullValue?: string;
  copyable?: boolean;
  mono?: boolean;
  tone?: NoticeTone;
  detail?: boolean;
  showFullValue?: boolean;
}

export interface ActionContextInput {
  pathname: string;
  search: string;
  product: string;
  action?: string;
  formState?: Readonly<Record<string, unknown>>;
  source: Special3Environment;
  mode: 'legacy' | 'shadow' | 'active';
}

export interface ResolvedActionContext extends ActionContextInput {
  action: string;
  query: Readonly<Record<string, string | string[]>>;
  contextKey: string;
}

export interface QuotePresentation {
  state: QuoteState;
  source: SourceFreshness;
  quoteId?: string;
  fetchedAt?: string;
  expiresAt?: string;
  message?: string;
}

export interface PageTemplateProps {
  title: string;
  titleOwner?: PageTitleOwner;
  eyebrow?: string;
  intro?: string;
  actions?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export interface ReceiptStage {
  id: string;
  label: string;
  state: 'success' | 'pending' | 'warning' | 'failed' | 'unavailable';
  detail?: string;
}
