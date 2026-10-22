import { Check, Clock3, Loader2, PenLine, ShieldCheck, X } from '@icons';
import { cn } from '../../lib/utils';

export type TransactionPhase = 'review' | 'signature' | 'pending' | 'confirmed' | 'failed';

const steps = [
  { key: 'review', label: 'Review', icon: ShieldCheck },
  { key: 'signature', label: 'Wallet', icon: PenLine },
  { key: 'pending', label: 'Network', icon: Clock3 },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
] as const;

export function TransactionProgress({ phase, detail }: { phase: TransactionPhase; detail?: string }) {
  const failed = phase === 'failed';
  const currentIndex = failed ? 2 : steps.findIndex((step) => step.key === phase);
  return <section className="surface p-4" aria-live="polite" aria-label="Transaction progress"><div className="grid grid-cols-4 gap-1">{steps.map((step, index) => { const Icon = failed && index === currentIndex ? X : step.icon; const complete = !failed && index < currentIndex; const active = index === currentIndex; return <div key={step.key} className="relative text-center"><div className={cn('mx-auto grid h-9 w-9 place-items-center rounded-full border', complete ? 'border-success-DEFAULT bg-success-subtle text-success-DEFAULT' : active ? failed ? 'border-danger-DEFAULT bg-danger-subtle text-danger-DEFAULT' : 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-[var(--line)] text-[var(--dim)]')}>{active && phase === 'pending' ? <Loader2 size={16} className="animate-spin" /> : <Icon size={15} />}</div><p className={cn('mt-2 text-xs font-bold uppercase tracking-[.08em]', active ? failed ? 'text-danger-DEFAULT' : 'text-primary-500' : complete ? 'text-success-DEFAULT' : 'text-[var(--muted)]')}>{step.label}</p></div>; })}</div>{detail && <p className="mt-4 border-t border-[var(--line-subtle)] pt-3 text-center text-xs text-[var(--muted)]">{detail}</p>}</section>;
}
