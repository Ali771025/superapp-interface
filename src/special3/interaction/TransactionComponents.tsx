import { Check, ClipboardPaste, Copy, ExternalLink, Loader2, X } from '@icons';
import { useId, useState, type ChangeEvent, type ReactNode } from 'react';
import { Badge, Heading, Inline, Stack, StatusIndicator, Surface, Text } from '../primitives';
import { formatFinancialText, shortenIdentifier } from './format';
import { DataSyncState, Field, FieldDescription, FieldError, FieldHint, FieldLabel, FieldStatus, FreshnessIndicator, LifecycleStatus, PrimaryAction, RiskNotice, SecondaryAction, SourceDisclosure } from './SharedComponents';
import type { FieldState, ProgressionPresentation, QuotePresentation, ReceiptStage, ReviewField, SourceFreshness } from './types';

export interface FinancialInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
  balance?: string;
  min?: string;
  max?: string;
  precision?: number;
  state?: FieldState;
  error?: string;
  hint?: string;
  feeContext?: string;
  conversionContext?: string;
  source?: SourceFreshness;
  onMax?: () => void;
  disabled?: boolean;
  quoteLoading?: boolean;
  quoteStale?: boolean;
}

export function FinancialInput({ id: providedId, label, value, onChange, unit, balance, min, max, precision, state = 'default', error, hint, feeContext, conversionContext, source, onMax, disabled, quoteLoading, quoteStale }: FinancialInputProps) {
  const generatedId = useId();
  const id = providedId ?? `s3-financial-${generatedId}`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const effectiveState = disabled ? 'disabled' : quoteLoading ? 'loading' : quoteStale ? 'warning' : error ? 'invalid' : state;
  return <Field id={id} state={effectiveState} className="s3-financial-input">
    <Inline gap={2}><FieldLabel htmlFor={id} required>{label}</FieldLabel>{balance !== undefined && <Text as="span" variant="caption" tone="muted">Balance {balance} {unit}</Text>}</Inline>
    <div className="s3-input-shell"><input id={id} type="text" inputMode="decimal" autoComplete="off" spellCheck={false} value={value} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ''}`} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} placeholder="0.00"/><span className="s3-input-unit">{unit}</span>{onMax && <button type="button" className="s3-input-action" onClick={onMax} disabled={disabled}>MAX</button>}</div>
    <div id={descriptionId} className="s3-field-meta"><FieldDescription id={`${descriptionId}-limits`}>{[min && `Min ${min}`, max && `Max ${max}`, precision !== undefined && `Precision ${precision}`].filter(Boolean).join(' · ') || 'Product validation controls accepted values.'}</FieldDescription>{source && <Inline gap={2}><SourceDisclosure value={source} compact/><FreshnessIndicator value={source}/></Inline>}</div>
    {value && <FieldHint id={`${id}-formatted`}>Display: {formatFinancialText(value)} {unit}{conversionContext ? ` · ${conversionContext}` : ''}{feeContext ? ` · ${feeContext}` : ''}</FieldHint>}
    {quoteLoading && <FieldStatus state="loading" label="Loading quote"/>}{quoteStale && <FieldStatus state="warning" label="Quote is stale; refresh before Review"/>}{error && <FieldError id={errorId}>{error}</FieldError>}{hint && !error && <FieldHint id={`${id}-hint`}>{hint}</FieldHint>}
  </Field>;
}

export interface WalletAddressInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  state?: FieldState;
  error?: string;
  hint?: string;
  identityHint?: string;
  disabled?: boolean;
  onPaste?: () => Promise<string>;
  onCopy?: (fullValue: string) => Promise<void> | void;
}

async function defaultCopy(value: string) { await navigator.clipboard.writeText(value); }
async function defaultPaste() { return navigator.clipboard.readText(); }

export function WalletAddressInput({ id: providedId, label, value, onChange, state = 'default', error, hint, identityHint, disabled, onPaste = defaultPaste, onCopy = defaultCopy }: WalletAddressInputProps) {
  const generatedId = useId();
  const id = providedId ?? `s3-address-${generatedId}`;
  const [copyState, setCopyState] = useState<'idle'|'copied'>('idle');
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const copy = async () => { if (!value) return; await onCopy(value); setCopyState('copied'); window.setTimeout(() => setCopyState('idle'), 1200); };
  const paste = async () => onChange(await onPaste());
  return <Field id={id} state={disabled ? 'disabled' : error ? 'invalid' : state} className="s3-address-input">
    <FieldLabel htmlFor={id} required>{label}</FieldLabel>
    <div className="s3-input-shell"><input id={id} type="text" inputMode="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={value} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ''}`} onChange={(event) => onChange(event.target.value)} placeholder="0x…"/>
      <button type="button" className="s3-icon-action" aria-label="Paste full wallet address" onClick={paste} disabled={disabled}><ClipboardPaste aria-hidden="true"/></button>
      <button type="button" className="s3-icon-action" aria-label="Clear wallet address" onClick={() => onChange('')} disabled={disabled || !value}><X aria-hidden="true"/></button>
      <button type="button" className="s3-icon-action" aria-label="Copy full wallet address" onClick={copy} disabled={!value}><Copy aria-hidden="true"/></button>
    </div>
    <div id={descriptionId} className="s3-field-meta"><FieldDescription id={`${descriptionId}-copy`}>Review shows the full underlying value; copy never uses the shortened display.</FieldDescription>{identityHint && <Badge tone="info">EID · {identityHint}</Badge>}</div>
    {copyState === 'copied' && <FieldStatus state="valid" label="Full address copied"/>}{error && <FieldError id={errorId}>{error}</FieldError>}{hint && !error && <FieldHint id={`${id}-hint`}>{hint}</FieldHint>}
  </Field>;
}

export function AddressValue({ value, label = 'identifier', copyable = true, showFull = false, onCopy = defaultCopy }: { value: string; label?: string; copyable?: boolean; showFull?: boolean; onCopy?: (fullValue: string) => Promise<void> | void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await onCopy(value); setCopied(true); window.setTimeout(() => setCopied(false), 1200); };
  return <span className={`s3-address-value ${showFull ? 'is-full' : ''}`} style={showFull ? { inlineSize:'100%', flexWrap:'wrap', overflowWrap:'anywhere' } : undefined} title={value}><Text as="span" variant="mono">{showFull ? value : shortenIdentifier(value)}</Text>{copyable && <button type="button" className="s3-icon-action" aria-label={`Copy full ${label}`} onClick={copy}>{copied ? <Check aria-hidden="true"/> : <Copy aria-hidden="true"/>}</button>}</span>;
}

export function QuoteStateView({ quote }: { quote: QuotePresentation }) {
  const status = quote.state === 'fresh' ? 'success' : quote.state === 'loading' ? 'info' : ['stale','expired'].includes(quote.state) ? 'warning' : quote.state === 'error' ? 'danger' : 'neutral';
  return <Surface className={`s3-quote-state is-${quote.state}`}><Stack gap={2}><Inline gap={2}>{quote.state === 'loading' && <Loader2 className="s3-spin" aria-hidden="true"/>}<StatusIndicator status={status} label={`Quote ${quote.state}`}/>{quote.quoteId && <Badge>#{quote.quoteId}</Badge>}</Inline><Inline gap={2}><SourceDisclosure value={quote.source}/><FreshnessIndicator value={quote.source}/></Inline>{quote.expiresAt && <Text variant="caption" tone="muted">Expires {quote.expiresAt}</Text>}{quote.message && <Text tone="secondary">{quote.message}</Text>}</Stack></Surface>;
}

export function ReviewFieldList({ fields }: { fields: readonly ReviewField[] }) {
  const visible = fields.filter((field) => field.value !== undefined && field.value !== null && field.value !== '');
  return <dl className="s3-review-fields">{visible.map((field) => <div key={field.id} className={`s3-review-field s3-review-field--${field.tone ?? 'neutral'}`}><dt>{field.label}</dt><dd>{field.fullValue ? <AddressValue value={field.fullValue} label={field.label} copyable={field.copyable !== false} showFull={field.showFullValue}/> : <span className={field.mono ? 's3-review-field__mono' : ''}>{field.value}</span>}</dd></div>)}</dl>;
}

export function ProgressionReview({ value }: { value: ProgressionPresentation }) {
  const status = value.state === 'committed' ? 'success' : value.state === 'grounded' ? 'info' : value.state === 'pending' ? 'warning' : 'neutral';
  return <Surface className="s3-progression-review"><Stack gap={2}><Inline gap={2}><Heading level={3}>Progression impact</Heading><StatusIndicator status={status} label={value.label}/></Inline>{value.achievementId && <Text variant="caption">Achievement {value.achievementId}</Text>}{value.personalEq && <Text variant="numeric">{value.personalEq}</Text>}{value.referralEq && <Text variant="caption">Referral EQ: {value.referralEq}</Text>}{value.journeyImpact && <Text tone="secondary">Journey: {value.journeyImpact}</Text>}{value.evidence && <Text variant="caption" tone="muted">Evidence: {value.evidence}</Text>}</Stack></Surface>;
}

export function Special3TransactionReview({ fields, source, progression, risk, preview, onCancel, onConfirm, confirmLabel = 'Confirm in wallet', confirmDisabled = false, children }: { fields: readonly ReviewField[]; source: SourceFreshness; progression: ProgressionPresentation; risk?: ReactNode; preview?: boolean; onCancel?: () => void; onConfirm?: () => void; confirmLabel?: string; confirmDisabled?: boolean; children?: ReactNode }) {
  const essentials = fields.filter((field) => !field.detail);
  const details = fields.filter((field) => field.detail);
  return <section className="s3-transaction-review" aria-label="Transaction Review" data-s3-wallet-boundary="user-and-wallet"><Stack gap={4}>
    <div className="s3-review-environment"><Badge tone={preview ? 'warning' : 'info'}>{preview ? 'Preview' : 'Wallet authorization'}</Badge><Text variant="caption" tone="muted">{preview ? 'No signature or real transaction.' : 'Your wallet must authorize this action.'}</Text></div>
    {preview && <RiskNotice>Preview only. No wallet signature or transaction will be submitted.</RiskNotice>}
    <ReviewFieldList fields={essentials}/>{risk && <RiskNotice level="danger">{risk}</RiskNotice>}
    <details className="s3-qora-transaction s3-review-more"><summary><Text as="span" variant="label">More Details</Text></summary><div className="s3-qora-transaction__detail"><Stack gap={3}><div className="s3-review-environment"><SourceDisclosure value={source}/><FreshnessIndicator value={source}/></div>{details.length > 0 && <ReviewFieldList fields={details}/>}<ProgressionReview value={progression}/>{children}</Stack></div></details>
    <Text variant="caption" tone="muted">QORA may explain this Review, but only you and your wallet can authorize the protected action.</Text>
    {(onCancel || onConfirm) && <div className="s3-review-actions">{onCancel && <SecondaryAction onClick={onCancel}>Back to edit</SecondaryAction>}{onConfirm && <PrimaryAction onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</PrimaryAction>}</div>}
  </Stack></section>;
}

export function TransactionLifecycle({ stages }: { stages: readonly ReceiptStage[] }) {
  return <ol className="s3-lifecycle" aria-label="Transaction lifecycle">{stages.map((stage) => <LifecycleStatus key={stage.id} label={stage.label} detail={stage.detail ?? stage.state} state={stage.state}/>)}</ol>;
}

export function ActionReceipt({ title, productResult, evidence, progression, stages, source, nextAction, syncState }: { title: string; productResult: ReactNode; evidence?: readonly ReviewField[]; progression: ProgressionPresentation; stages: readonly ReceiptStage[]; source: SourceFreshness; nextAction?: ReactNode; syncState?: 'syncing'|'delayed'|'indexed'|'unavailable' }) {
  return <section className="s3-action-receipt" aria-label="Action receipt"><Stack gap={4}><Inline gap={2}><Heading level={2}>{title}</Heading><SourceDisclosure value={source}/></Inline><Surface><Stack gap={2}><Heading level={3}>Product result</Heading>{productResult}</Stack></Surface>{evidence && <Surface><Stack gap={2}><Heading level={3}>Evidence</Heading><ReviewFieldList fields={evidence}/></Stack></Surface>}<TransactionLifecycle stages={stages}/>{syncState && <DataSyncState state={syncState}/>}<ProgressionReview value={progression}/>{nextAction && <div className="s3-receipt-next">{nextAction}</div>}</Stack></section>;
}

export function QoraTransactionDisclosure({ mode }: { mode: 'form'|'review'|'result' }) {
  const config = {
    form:{ label:'QORA · Explain this action', copy:'Open contextual help for fields, eligibility, fees, risk and Product mechanics. QORA cannot submit this form.' },
    review:{ label:'QORA · Explain this review', copy:'Open contextual help for the exact Review data and wallet boundary. QORA cannot confirm, approve or invoke a signer.' },
    result:{ label:'Ask QORA about this result', copy:'Open contextual help for evidence and the next safe action. QORA cannot claim or mutate progression.' },
  }[mode];
  return <details className={`s3-qora-transaction s3-qora-transaction--${mode}`} data-s3-qora-surface="compact" data-s3-qora-execution="blocked">
    <summary><Badge tone="primary">QORA</Badge><Text as="span" variant="label">{config.label}</Text></summary>
    <div className="s3-qora-transaction__detail"><Text tone="secondary">{config.copy}</Text></div>
  </details>;
}

export function ExternalEvidenceLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="s3-evidence-link" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink aria-hidden="true"/></a>;
}
