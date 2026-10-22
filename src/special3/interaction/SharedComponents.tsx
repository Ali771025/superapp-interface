import { AlertTriangle, CheckCircle2, CircleAlert, CircleX, Clock3, Database, Info, Loader2, RefreshCw, ShieldAlert } from '@icons';
import { cloneElement, forwardRef, useEffect, useId, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { NavLink } from 'react-router-dom';
import { Badge, Heading, Inline, Skeleton, Stack, StatusIndicator, Surface, Text } from '../primitives';
import { formatFreshness } from './format';
import { revealLocalNavSelection } from './localNavReveal';
import type { FieldState, FreshnessState, NoticeTone, PageTitleOwner, SourceFreshness } from './types';
import './interaction.css';

export { revealLocalNavSelection } from './localNavReveal';

export function Special3Page({ children, className = '', ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section data-special3 className={`s3-page ${className}`.trim()} {...props}>{children}</section>;
}

export interface LocalNavItem {
  id: string;
  label: string;
  to?: string;
  disabledReason?: string;
}

export function LocalNav({ label, mode = 'navigation', items, activeId, onChange, panels }: {
  label: string;
  mode?: 'navigation' | 'tabs';
  items: readonly LocalNavItem[];
  activeId: string;
  onChange?: (id: string) => void;
  panels?: Readonly<Record<string, ReactNode>>;
}) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const navigationRef = useRef<HTMLElement | null>(null);
  const tabListRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const container = mode === 'navigation' ? navigationRef.current : tabListRef.current;
    if (!container) return;
    const selector = mode === 'navigation' ? '[aria-current="page"]' : '[role="tab"][aria-selected="true"]';
    const frame = window.requestAnimationFrame(() => revealLocalNavSelection(container, selector));
    return () => window.cancelAnimationFrame(frame);
  }, [activeId, mode]);
  if (mode === 'navigation') return <nav ref={navigationRef} className="s3-local-nav" aria-label={label}>{items.map((item) => item.to
    ? <NavLink key={item.id} to={item.to} aria-current={activeId === item.id ? 'page' : false}>{item.label}</NavLink>
    : <button key={item.id} type="button" aria-current={activeId === item.id ? 'page' : undefined} disabled={Boolean(item.disabledReason)} title={item.disabledReason} onClick={() => onChange?.(item.id)}>{item.label}</button>)}</nav>;

  const enabled = items.filter((item) => !item.disabledReason);
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length;
    const nextId = enabled[target]?.id;
    if (!nextId) return;
    onChange?.(nextId);
    const originalIndex = items.findIndex((item) => item.id === nextId);
    tabRefs.current[originalIndex]?.focus();
  };
  return <div className="s3-local-tabs"><div ref={tabListRef} role="tablist" aria-label={label}>{items.map((item, index) => <button
    key={item.id}
    ref={(node) => { tabRefs.current[index] = node; }}
    type="button"
    role="tab"
    id={`${baseId}-tab-${item.id}`}
    aria-controls={`${baseId}-panel-${item.id}`}
    aria-selected={activeId === item.id}
    tabIndex={activeId === item.id ? 0 : -1}
    disabled={Boolean(item.disabledReason)}
    title={item.disabledReason}
    onClick={() => onChange?.(item.id)}
    onKeyDown={(event) => move(event, enabled.findIndex((entry) => entry.id === item.id))}
  >{item.label}</button>)}</div>{panels && items.map((item) => <section key={item.id} role="tabpanel" id={`${baseId}-panel-${item.id}`} aria-labelledby={`${baseId}-tab-${item.id}`} hidden={activeId !== item.id} tabIndex={0}>{panels[item.id]}</section>)}</div>;
}

export function PageHeader({ eyebrow, title, titleOwner = 'template', status, children }: { eyebrow?: string; title: string; titleOwner?: PageTitleOwner; status?: ReactNode; children?: ReactNode }) {
  return <header className="s3-page-header" data-s3-title-owner={titleOwner} data-s3-page-title={title}><Stack gap={2}><Inline gap={2}>{eyebrow && <Badge tone="primary">{eyebrow}</Badge>}{status}</Inline>{titleOwner === 'template' && <Heading level={1}>{title}</Heading>}{children}</Stack></header>;
}

export function PageIntro({ children }: { children: ReactNode }) {
  return <Text tone="secondary" className="s3-page-intro">{children}</Text>;
}

export function PageActions({ children }: { children: ReactNode }) {
  return <div className="s3-page-actions">{children}</div>;
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return <div className="s3-metric-grid">{children}</div>;
}

export function MetricCard({ label, value, detail, status }: { label: string; value: ReactNode; detail?: string; status?: ReactNode }) {
  return <Surface className="s3-metric-card"><Stack gap={2}><Inline gap={2}><Text variant="label" tone="secondary">{label}</Text>{status}</Inline><Text as="div" variant="numeric">{value}</Text>{detail && <Text variant="caption" tone="muted">{detail}</Text>}</Stack></Surface>;
}

export function StatusCard({ title, status, detail, children }: { title: string; status: ReactNode; detail?: string; children?: ReactNode }) {
  return <Surface className="s3-status-card"><Stack gap={3}><Inline gap={2}><Heading level={3}>{title}</Heading>{status}</Inline>{detail && <Text tone="secondary">{detail}</Text>}{children}</Stack></Surface>;
}

export function ActionCard({ title, detail, action, meta }: { title: string; detail?: string; action: ReactNode; meta?: ReactNode }) {
  return <Surface variant="interactive" className="s3-action-card"><Stack gap={3}><Stack gap={1}><Heading level={3}>{title}</Heading>{detail && <Text tone="secondary">{detail}</Text>}</Stack>{meta}<div className="s3-action-card__action">{action}</div></Stack></Surface>;
}

export function DataCard({ title, children, disclosure }: { title: string; children: ReactNode; disclosure?: ReactNode }) {
  return <Surface className="s3-data-card"><Stack gap={3}><Inline gap={2}><Heading level={3}>{title}</Heading>{disclosure}</Inline>{children}</Stack></Surface>;
}

const stateIcon = { empty:Database, error:CircleX, recovery:RefreshCw } as const;
function OperationalState({ kind, title, detail, action }: { kind: keyof typeof stateIcon; title: string; detail: string; action?: ReactNode }) {
  const StateIcon = stateIcon[kind];
  return <Surface className={`s3-operational-state is-${kind}`}><Stack gap={3} align="center"><StateIcon aria-hidden="true"/><Heading level={3}>{title}</Heading><Text tone="secondary">{detail}</Text>{action}</Stack></Surface>;
}
export function EmptyState(props: { title: string; detail: string; action?: ReactNode }) { return <OperationalState kind="empty" {...props}/>; }
export function ErrorState(props: { title: string; detail: string; action?: ReactNode }) { return <OperationalState kind="error" {...props}/>; }
export function RecoveryState(props: { title: string; detail: string; action?: ReactNode }) { return <OperationalState kind="recovery" {...props}/>; }

export function LoadingState({ label = 'Loading verified data' }: { label?: string }) {
  return <Surface aria-busy="true" aria-label={label}><Stack gap={3}><Skeleton width="half"/><Skeleton/><Skeleton width="three-quarter"/></Stack></Surface>;
}

const sourceTone: Record<SourceFreshness['source'], 'neutral'|'success'|'warning'|'info'> = {
  live:'success', preview:'warning', mock:'warning', test:'info', testnet:'info', indexed:'info', 'direct-chain':'success', backend:'neutral', 'off-chain':'neutral',
};

export function SourceDisclosure({ value, compact = false }: { value: SourceFreshness; compact?: boolean }) {
  const sourceLabel = value.label ?? value.source.split('-').map((part) => `${part.slice(0,1).toUpperCase()}${part.slice(1)}`).join(' ');
  return <span className="s3-source-disclosure" aria-label={`Source ${sourceLabel}. ${value.detail ?? ''}`}><Badge tone={sourceTone[value.source]}>{sourceLabel}</Badge>{!compact && <Text as="span" variant="caption" tone="muted">{value.detail}</Text>}</span>;
}

const freshnessStatus: Record<FreshnessState, 'success'|'warning'|'danger'|'info'|'neutral'> = { live:'success', fresh:'success', syncing:'info', stale:'warning', unknown:'neutral', unavailable:'neutral' };
export function FreshnessIndicator({ value, now }: { value: SourceFreshness; now?: number }) {
  const label = value.freshness === 'syncing' ? 'Syncing' : value.freshness === 'stale' ? 'Stale' : value.freshness === 'unknown' ? 'Unknown freshness' : value.freshness === 'unavailable' ? 'Unavailable' : formatFreshness(value.updatedAt ?? value.fetchedAt, now);
  return <StatusIndicator status={freshnessStatus[value.freshness]} label={label}/>;
}

const noticeIcon = { neutral:Info, info:Info, success:CheckCircle2, warning:AlertTriangle, danger:ShieldAlert } as const;
export function SemanticNotice({ tone = 'neutral', title, children, action, role }: { tone?: NoticeTone; title: string; children: ReactNode; action?: ReactNode; role?: 'status'|'alert' }) {
  const NoticeIcon = noticeIcon[tone];
  return <div className={`s3-notice s3-notice--${tone}`} role={role ?? (tone === 'danger' ? 'alert' : 'status')}><NoticeIcon aria-hidden="true"/><div><Text variant="label">{title}</Text><Text tone="secondary">{children}</Text>{action}</div></div>;
}
export function EligibilityNotice({ eligible, children }: { eligible: boolean | 'unknown'; children: ReactNode }) {
  const tone = eligible === true ? 'success' : eligible === false ? 'danger' : 'warning';
  return <SemanticNotice tone={tone} title={eligible === true ? 'Eligible' : eligible === false ? 'Not eligible' : 'Eligibility pending'}>{children}</SemanticNotice>;
}
export function RiskNotice({ level = 'warning', children }: { level?: 'warning'|'danger'; children: ReactNode }) {
  return <SemanticNotice tone={level} title={level === 'danger' ? 'Irreversible action' : 'Review risk'}>{children}</SemanticNotice>;
}

export function PrimaryAction({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button type="button" className={`s3-primary-action ${className}`.trim()} {...props}>{props['aria-busy'] && <Loader2 aria-hidden="true"/>}{children}</button>;
}

export function SecondaryAction({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button type="button" className={`s3-secondary-action ${className}`.trim()} {...props}>{children}</button>;
}

export function Field({ id, state = 'default', children, className = '' }: { id: string; state?: FieldState; children: ReactNode; className?: string }) {
  return <div className={`s3-field s3-field--${state} ${className}`.trim()} data-field-id={id}>{children}</div>;
}
export function FieldLabel({ htmlFor, children, required, optional }: { htmlFor: string; children: ReactNode; required?: boolean; optional?: boolean }) {
  return <label className="s3-field__label" htmlFor={htmlFor}>{children}{required && <span aria-label="required"> *</span>}{optional && <span className="s3-field__optional">Optional</span>}</label>;
}
export function FieldDescription({ id, children }: { id: string; children: ReactNode }) { return <Text id={id} variant="caption" tone="muted">{children}</Text>; }
export function FieldHint({ id, children }: { id: string; children: ReactNode }) { return <Text id={id} variant="caption" tone="secondary">{children}</Text>; }
export function FieldError({ id, children }: { id: string; children: ReactNode }) { return <p id={id} className="s3-field__error" role="alert"><CircleAlert aria-hidden="true"/>{children}</p>; }
export function FieldStatus({ state, label }: { state: FieldState; label: string }) {
  const status = state === 'valid' ? 'success' : state === 'invalid' ? 'danger' : state === 'warning' ? 'warning' : state === 'loading' ? 'info' : 'neutral';
  return <StatusIndicator status={status} label={label}/>;
}

type CanonicalFieldControl = ReactElement<{
  id?: string;
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}>;

/** Shared complete Field anatomy for ordinary Product data-entry controls. */
export function FieldCarrier({ id, label, description, hint, error, statusLabel, state = error ? 'invalid' : 'default', required, optional, children, className = '' }: {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  statusLabel?: string;
  state?: FieldState;
  required?: boolean;
  optional?: boolean;
  children: CanonicalFieldControl;
  className?: string;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [children.props['aria-describedby'], descriptionId, hintId, errorId].filter(Boolean).join(' ') || undefined;
  const control = cloneElement(children, {
    id,
    required: required || children.props.required || undefined,
    'aria-describedby': describedBy,
    'aria-invalid': state === 'invalid' || children.props['aria-invalid'] || undefined,
  });
  return <Field id={id} state={state} className={className}>
    <FieldLabel htmlFor={id} required={required} optional={optional}>{label}</FieldLabel>
    {description && <FieldDescription id={descriptionId!}>{description}</FieldDescription>}
    {control}
    {error ? <FieldError id={errorId!}>{error}</FieldError> : hint ? <FieldHint id={hintId!}>{hint}</FieldHint> : null}
    {statusLabel && <FieldStatus state={state} label={statusLabel}/>} 
  </Field>;
}

export const FieldInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function FieldInput({ className='', ...props }, ref) {
  return <input ref={ref} className={`s3-field__control ${className}`.trim()} {...props}/>;
});
export const FieldSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function FieldSelect({ className='', children, ...props }, ref) {
  return <select ref={ref} className={`s3-field__control ${className}`.trim()} {...props}>{children}</select>;
});
export const FieldTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function FieldTextarea({ className='', ...props }, ref) {
  return <textarea ref={ref} className={`s3-field__control ${className}`.trim()} {...props}/>;
});

export function DataSyncState({ state, detail, onRefresh }: { state: 'syncing'|'delayed'|'indexed'|'unavailable'; detail?: string; onRefresh?: () => void }) {
  const config = {
    syncing:{ tone:'info' as const, title:'ETERNITY data is syncing' }, delayed:{ tone:'warning' as const, title:'Indexer delay' },
    indexed:{ tone:'success' as const, title:'Data indexed' }, unavailable:{ tone:'neutral' as const, title:'Verification unavailable' },
  }[state];
  return <SemanticNotice tone={config.tone} title={config.title} action={onRefresh ? <SecondaryAction onClick={onRefresh}><RefreshCw aria-hidden="true"/>Refresh status</SecondaryAction> : undefined}>
    {detail ?? (state === 'indexed' ? 'The confirmed transaction is available in the indexed Product state.' : 'Transaction status and progression verification remain separate.')}
  </SemanticNotice>;
}

export function LifecycleStatus({ label, detail, state }: { label: string; detail: string; state: 'pending'|'success'|'warning'|'failed'|'unavailable' }) {
  const Icon = state === 'success' ? CheckCircle2 : state === 'failed' ? CircleX : state === 'warning' ? AlertTriangle : state === 'pending' ? Clock3 : Info;
  return <li className={`s3-lifecycle-status is-${state}`}><Icon aria-hidden="true"/><div><Text variant="label">{label}</Text><Text variant="caption" tone="muted">{detail}</Text></div></li>;
}
