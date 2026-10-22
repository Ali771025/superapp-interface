import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, GraduationCap, HelpCircle, Loader2, MessageCircle, RotateCcw, X } from '@icons';
import { useState } from 'react';
import type { QoraActionSchema } from '../../qora/types';
import { cn } from '../../lib/utils';
import { QoraOrb, type QoraOrbState } from './QoraOrb';
import { isSpecial3ShellEnabled } from '../../special3/shell/featureFlag';

const kindLabel: Record<QoraActionSchema['kind'], string> = {
  recommendation: 'Recommended', mission: 'Mission', learning: 'Learn', transaction: 'Transaction', asset: 'Asset', product: 'Action', risk: 'Risk', progress: 'Progress', achievement: 'Achievement', certificate: 'Certificate', report: 'Report', vote: 'Vote', referral: 'Community', identity: 'Identity', wallet: 'Wallet', confirmation: 'Confirm', success: 'Complete', recovery: 'Recovery',
};

export function QoraActionCard({ action, onOpen, onAsk, onDismiss, compact = false }: { action: QoraActionSchema; onOpen: () => void; onAsk: () => void; onDismiss?: () => void; compact?: boolean }) {
  const [details, setDetails] = useState(false);
  const pending = action.status === 'loading' || action.status === 'pending';
  const orbState: QoraOrbState = pending ? 'thinking' : action.status === 'success' ? 'success' : action.status === 'failure' ? 'warning' : action.risk ? 'warning' : 'action-ready';
  return <article className={cn('s3-qora-action-card s3-qora-action-card', compact && 'is-compact', details && 'is-expanded')} aria-label={`${kindLabel[action.kind]}: ${action.title}`}>
    <header><span><QoraOrb size="micro" pixelSize={22} state={orbState} decorative/>{kindLabel[action.kind]}</span><div>{action.eqReward && !isSpecial3ShellEnabled() ? <em>+{action.eqReward} EQ</em> : null}<button onClick={() => setDetails((value) => !value)} aria-expanded={details} aria-label={`Information about ${action.title}`}><HelpCircle size={17}/></button>{onDismiss && <button onClick={onDismiss} aria-label="Dismiss"><X size={16}/></button>}</div></header>
    <div className="s3-qora-action-core ds-agent-action-core"><h3>{action.title}</h3><small className={`is-${action.status}`}>{pending ? 'In progress' : action.status === 'failure' ? 'Needs attention' : action.status === 'success' ? 'Complete' : 'Ready'}</small></div>
    {details && <div className="s3-qora-action-details"><p>{action.summary}</p><dl>{action.rows?.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>{action.risk && <div className="s3-qora-action-risk"><AlertTriangle size={15}/>{action.risk}</div>}<div className="s3-qora-action-outcome"><CheckCircle2 size={15}/>{action.expectedOutcome}</div><button onClick={onAsk}><MessageCircle size={15}/>Explain this</button></div>}
    <footer><button type="button" onClick={onOpen} disabled={pending}>{pending ? <Loader2 size={17} className="animate-spin"/> : null}{action.primaryLabel}<ArrowRight size={16}/></button></footer>
    {action.status === 'failure' && <div className="s3-qora-action-error"><span>Action paused</span><button type="button" onClick={onOpen}><RotateCcw size={14}/>Retry</button></div>}
  </article>;
}

export function LearningNudge({ onStart }: { onStart: () => void }) { return <button onClick={onStart} className="s3-qora-learning-nudge s3-qora-learning-nudge"><GraduationCap size={19}/><span><strong>EDGE primer</strong><small>{isSpecial3ShellEnabled() ? '3 min · EQ unavailable without verified Achievement' : '3 min · illustrative reward'}</small></span><ChevronRight size={17}/></button>; }
