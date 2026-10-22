import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import {
  Bell, Bot, ChevronDown, ChevronLeft, CircleHelp, Compass, Fingerprint, GraduationCap,
  Landmark, Menu, MessageCircle, Network, Search, Send, Settings2, ShieldCheck, Sparkles, Target, UserRound, X,
} from '@icons';
import { EternityLogo } from '../../components/ui/EternityLogo';
import { ContextHelp, ContextHelpTrigger } from '../../components/ui/ContextHelp';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { WalletButton } from '../../components/ui/WalletButton';
import { QoraOrb } from '../../components/qora/QoraOrb';
import { productData } from '../providers/products';
const { user: productUser } = productData;
import { getPageTopic } from '../../design-system/pageTopics';
import type { ProductDefinition } from '../../data/productRegistry';
import type { UserProgressSnapshot } from '../../lib/userState';
import type { WalletContextValue } from '../../lib/wallet-context';
import { useAppLanguage } from '../../lib/useAppLanguage';
import { Badge, Heading, Icon, Inline, Stack, StatusIndicator, Surface, Text } from '../primitives';
import { LevelBadge, LevelProgress } from '../progression-ui';
import { describeContextValue, type QoraContextContract, type QoraOutputMode } from './qoraContext';

const systemLinks = [
  { to:'/journey', label:'Journey', icon:Target }, { to:'/qora', label:'QORA', icon:Bot },
  { to:'/journey?passport=overview', label:'Passport', icon:Fingerprint }, { to:'/notifications', label:'Notifications', icon:Bell },
  { to:'/settings', label:'Settings', icon:Settings2 },
];
const domainLinks = [
  { to:'/journey?view=economy', label:'Economy', icon:Landmark }, { to:'/fan', label:'Community', icon:Network },
  { to:'/shield', label:'Protection', icon:ShieldCheck }, { to:'/forecast', label:'Prediction', icon:Compass },
  { to:'/era', label:'Governance', icon:UserRound }, { to:'/readiness', label:'Learning', icon:GraduationCap },
];

export function Special3Header({ title, showBack, onOpenNavigation }: { title?: string; showBack: boolean; onOpenNavigation: () => void }) {
  const navigate = useNavigate();
  const goBack = () => (window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/journey', { replace:true });
  return <header className={`s3-shell-header ${showBack ? 'has-back' : ''}`} aria-label={`${title ?? 'Workspace'} global controls`}>
    <Inline gap={3} align="center" className="s3-shell-header__start">
      {showBack && <button type="button" className="s3-shell-icon-button" onClick={goBack} aria-label="Go back"><ChevronLeft /></button>}
      <NavLink to="/journey" className="s3-shell-brand" aria-label="ETERNITY Journey"><EternityLogo /></NavLink>
    </Inline>
    <Inline gap={2} align="center" className="s3-shell-header__actions">
      <NavLink to="/notifications" className="s3-shell-icon-button s3-shell-desktop-only" aria-label="Notifications"><Bell /></NavLink>
      <span className="s3-shell-desktop-only"><ThemeToggle/></span>
      <WalletButton/>
      <button type="button" className="s3-shell-icon-button" onClick={onOpenNavigation} aria-label="Explore ETERNITY" aria-haspopup="dialog"><Menu /></button>
    </Inline>
  </header>;
}

export function Special3Navigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerReturn = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    triggerReturn.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])') ?? []);
    window.requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables(); if (!items.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKey); triggerReturn.current?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  const LinkGroup = ({ label, links }: { label: string; links: typeof systemLinks }) => <section><Text variant="label" tone="muted">{label}</Text><nav aria-label={label}>{links.map(({to,label:linkLabel,icon:LinkIcon}) => <NavLink key={to} to={to} onClick={onClose}><LinkIcon aria-hidden="true"/><span>{linkLabel}</span></NavLink>)}</nav></section>;
  return <div className="s3-shell-nav-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialogRef} className="s3-shell-nav-dialog" role="dialog" aria-modal="true" aria-labelledby="s3-navigation-title">
      <header><Stack gap={1}><Text variant="label" tone="muted">ETERNITY MAP</Text><Heading level={2} id="s3-navigation-title">Explore the ecosystem</Heading></Stack><button type="button" className="s3-shell-icon-button" onClick={onClose} aria-label="Close navigation"><X/></button></header>
      <LinkGroup label="Systems" links={systemLinks}/><LinkGroup label="Domains" links={domainLinks}/>
      <footer><StatusIndicator status="info" label="Preview data"/><ThemeToggle/></footer>
    </div>
  </div>;
}

export function PassportRibbon({ user, wallet }: { user: UserProgressSnapshot; wallet: WalletContextValue }) {
  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const identity = user.hasEid ? productUser.primaryEid : wallet.isConnected ? wallet.formattedAddress : 'Guest explorer';
  const level = Math.min(19, Math.max(1, user.level || 1)) as 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19;
  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setExpanded(false); buttonRef.current?.focus(); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);
  return <section className={`s3-passport ${expanded ? 'is-expanded' : ''}`} aria-label="ETERNITY Passport">
    <button ref={buttonRef} type="button" className="s3-passport-ribbon" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-controls="s3-passport-disclosure">
      <span className="s3-passport-identity"><Fingerprint aria-hidden="true"/><span><strong>{identity}</strong><small>{wallet.isConnected ? wallet.isCorrectNetwork ? 'Polygon connected' : 'Wrong network' : 'Wallet not connected'}</small></span></span>
      <span className="s3-passport-metric"><small>Level</small><strong>{user.isGuest ? '—' : user.level}</strong></span>
      <span className="s3-passport-metric"><small>Rank</small><strong>{user.isGuest ? '—' : `${user.starLevel} Star`}</strong></span>
      <span className="s3-passport-metric"><small>EQ</small><strong>{user.isGuest ? '—' : user.eq.toLocaleString()}</strong></span>
      <ChevronDown className="s3-passport-chevron" aria-hidden="true"/>
    </button>
    {expanded && <div id="s3-passport-disclosure" className="s3-passport-disclosure" role="region" aria-label="Passport details">
      <GridSummary user={user} wallet={wallet} level={level}/>
    </div>}
  </section>;
}

function GridSummary({ user, wallet, level }: { user: UserProgressSnapshot; wallet: WalletContextValue; level: 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19 }) {
  return <div className="s3-passport-summary">
    <Surface variant="subtle"><Stack gap={2}><Text variant="label">Identity</Text><Text variant="mono">{wallet.address ?? 'Unavailable'}</Text><Badge tone={user.hasEid ? 'success' : 'warning'}>{user.hasEid ? productUser.primaryEid : 'EID unavailable'}</Badge></Stack></Surface>
    <Surface variant="subtle"><Stack gap={2}><Text variant="label">Progression summary</Text><LevelBadge level={level} name={user.isGuest ? 'Unavailable' : productUser.achievementProgress?.title ?? `Level ${level}`} state="current"/><LevelProgress level={level} levelName={`Level ${level}`} value={user.isGuest ? 0 : productUser.achievementProgress?.progressPercent ?? 0} currentLabel={user.isGuest ? 'EQ unavailable' : `${user.eq.toLocaleString()} EQ`} nextLabel={user.isGuest ? 'Unavailable' : `${productUser.achievementProgress?.nextLevelRequired.toLocaleString()} EQ`}/></Stack></Surface>
    <Surface variant="subtle"><Stack gap={2}><Text variant="label">Access and alerts</Text><StatusIndicator status={user.safetyReady ? 'success' : 'warning'} label={user.safetyReady ? 'Safety ready' : 'Safety readiness required'}/><StatusIndicator status={wallet.isCorrectNetwork ? 'success' : wallet.isConnected ? 'danger' : 'neutral'} label={wallet.isCorrectNetwork ? 'Polygon network' : wallet.isConnected ? 'Wrong network' : 'Wallet unavailable'}/><Text variant="caption" tone="muted">Passport contains identity and progression summaries only. Journey owns Missions and Tasks.</Text></Stack></Surface>
  </div>;
}

const outputCopy: Record<QoraOutputMode, { label: string; description: string }> = {
  explain:{label:'Explain',description:'Understand the current context.'}, recommend:{label:'Recommend',description:'Review one grounded next action.'},
  prepare:{label:'Prepare',description:'Prepare an action for your review.'}, simulate:{label:'Simulate',description:'Preview an estimate with no real progression.'},
};

export function QoraContext({ context, compact = false }: { context: QoraContextContract; compact?: boolean }) {
  const navigate = useNavigate();
  const mode = outputCopy[context.outputMode];
  const transactionRelevant = context.outputMode === 'prepare' || context.outputMode === 'simulate';
  const progressionRelevant = context.system === 'Journey' || context.relatedAchievement.status === 'available';
  return <aside className={`s3-qora-context ${compact ? 'is-compact' : ''}`} aria-label="QORA contextual intelligence" data-output-mode={context.outputMode}>
    <header><Inline gap={3} align="center"><QoraOrb size="compact" decorative/><Stack gap={0}><Text variant="label">QORA · {mode.label}</Text><Text variant="caption" tone="muted">{mode.description}</Text></Stack></Inline><Badge tone="info">{context.dataSource}</Badge></header>
    <div className="s3-qora-recommendation"><Text variant="label">Next best explanation</Text><Heading level={3}>{context.recommendation}</Heading><Text tone="secondary">{context.rationale}</Text></div>
    <details><summary><CircleHelp aria-hidden="true"/>Why this recommendation?</summary><div className="s3-qora-disclosure">
      <ContextRow label="Based on" value={`${context.system} · ${describeContextValue(context.product)}`}/>
      <ContextRow label="Data source" value={context.dataSource}/><ContextRow label="Freshness" value={describeContextValue(context.freshness)}/>
      {(transactionRelevant || context.eligibility.status === 'available') && <ContextRow label="Eligibility" value={describeContextValue(context.eligibility)}/>}<ContextRow label="Risk" value={context.riskLevel}/>
      <ContextRow label="What happens" value={context.outputMode === 'prepare' ? 'The Product review step opens; QORA does not submit.' : 'No protected action is executed.'}/>
      {transactionRelevant && <><ContextRow label="Reversible" value={describeContextValue(context.reversible)}/><ContextRow label="Wallet confirmation" value={describeContextValue(context.walletConfirmation)}/></>}
      {progressionRelevant && <><ContextRow label="Achievement" value={describeContextValue(context.relatedAchievement)}/><ContextRow label="Estimated EQ" value={describeContextValue(context.estimatedEqEffect)}/></>}
      <ContextRow label="Journey" value={describeContextValue(context.journeyState)}/>
    </div></details>
    <button type="button" className="s3-qora-open" onClick={() => navigate('/qora', { state:{ contextPath:context.pathname } })}><MessageCircle aria-hidden="true"/>Open QORA</button>
  </aside>;
}

function ContextRow({ label, value }: { label: string; value: string }) { return <div><Text variant="caption" tone="muted">{label}</Text><Text variant="label">{value}</Text></div>; }

export function QoraContextChip({ context, onExpand }: { context: QoraContextContract; onExpand: () => void }) {
  return <button type="button" className="s3-qora-chip" onClick={onExpand} aria-label={`Open QORA ${context.outputMode} context`}><QoraOrb size="compact" decorative/><span><small>QORA · {context.outputMode}</small><strong>{context.recommendation}</strong></span><ChevronDown aria-hidden="true"/></button>;
}

export function QoraContextSheet({ open, context, onClose }: { open: boolean; context: QoraContextContract; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerReturn = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    triggerReturn.current = document.activeElement as HTMLElement;
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button,[href],summary,[tabindex]:not([tabindex="-1"])') ?? []);
    window.requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables(); if (!items.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); triggerReturn.current?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="s3-mobile-qora-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialogRef} className="s3-mobile-qora-sheet" role="dialog" aria-modal="true" aria-labelledby="s3-mobile-qora-title">
      <header><span><Text variant="label" id="s3-mobile-qora-title">QORA context</Text><Text variant="caption" tone="muted">Explanation only · no protected execution</Text></span><button type="button" className="s3-shell-icon-button" onClick={onClose} aria-label="Close QORA context"><X/></button></header>
      <QoraContext context={context} compact/>
    </div>
  </div>;
}

export function QoraComposer() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const submit = (event: FormEvent) => { event.preventDefault(); if (!message.trim()) return; setMessage(''); navigate('/qora', { state:{ initialPrompt:message.trim(), contextPath:`${location.pathname}${location.search}` } }); };
  return <form className="s3-qora-composer" onSubmit={submit} aria-label="Message QORA"><Icon label="QORA intelligence"><Sparkles/></Icon><input value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask QORA to explain or prepare…" aria-label="Message QORA"/><button type="submit" disabled={!message.trim()} aria-label="Open QORA with this message"><Send/></button></form>;
}

export function WorkspaceHeader({ title, product, mode, showHelp = true }: { title?: string; product?: ProductDefinition; mode: string; showHelp?: boolean }) {
  const location = useLocation();
  const { language } = useAppLanguage();
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpAnchor, setHelpAnchor] = useState<HTMLButtonElement | null>(null);
  const pageTitle = title ?? product?.label ?? 'Workspace';
  const topic = getPageTopic(location.pathname, pageTitle, language);
  return <>
    <header className="s3-workspace-header" data-s3-title-owner="shell"><Stack gap={1}><Text variant="label" tone="muted">{product?.area ?? 'system'} · {mode}</Text><Heading level={1}>{pageTitle}</Heading></Stack><Inline gap={2} className="s3-workspace-header__actions">{showHelp && <ContextHelpTrigger label={pageTitle} onClick={(element) => { setHelpAnchor(element); setHelpOpen(true); }}/>}<button type="button" className="s3-shell-icon-button" aria-label="Search this workspace"><Search/></button></Inline></header>
    {showHelp && <ContextHelp title={pageTitle} description={topic.details} open={helpOpen} anchor={helpAnchor} onClose={() => setHelpOpen(false)}/>}
  </>;
}

const workspaceScrollPositions = new Map<string, number>();

export function WorkspaceFrame({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigationType = useNavigationType();
  const entryKey = location.key || `${location.pathname}${location.search}`;
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const restoredPosition = navigationType === 'POP' ? workspaceScrollPositions.get(entryKey) : undefined;
    element.scrollTo({ top:restoredPosition ?? 0, behavior:'auto' });
    return () => {
      workspaceScrollPositions.set(entryKey, element.scrollTop);
      if (workspaceScrollPositions.size > 40) workspaceScrollPositions.delete(workspaceScrollPositions.keys().next().value as string);
    };
  }, [entryKey, navigationType]);
  return <main ref={ref} id="main-content" tabIndex={-1} className="s3-workspace-scroll" aria-label={label} data-s3-canonical-scroll-start={navigationType === 'POP' ? 'restored-or-top' : 'top'}>{children}</main>;
}
export function WorkspaceActionDock({ children }: { children?: ReactNode }) { return <div className="s3-workspace-action-dock" aria-label="Workspace actions">{children}</div>; }
export function FocusModeFrame({ children }: { children: ReactNode }) { return <div className="s3-focus-mode-frame">{children}</div>; }
