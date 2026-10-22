import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from '@icons';
import { cn } from '../../lib/utils';

export type CalloutTone = 'info' | 'success' | 'warning' | 'danger';

const styles: Record<CalloutTone, string> = {
  info: 'border-primary-500 text-primary-500',
  success: 'border-success-DEFAULT text-success-DEFAULT',
  warning: 'border-warning-DEFAULT text-warning-DEFAULT',
  danger: 'border-danger-DEFAULT text-danger-DEFAULT',
};
const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle };

export function Callout({ tone = 'info', title, children, action }: { tone?: CalloutTone; title: string; children: ReactNode; action?: ReactNode }) {
  const Icon = icons[tone];
  return <aside className={cn('surface border-l-2 p-4', styles[tone])} role={tone === 'danger' ? 'alert' : 'note'}><div className="flex items-start gap-3"><Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[var(--text)]">{title}</p><div className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{children}</div>{action && <div className="mt-3">{action}</div>}</div></div></aside>;
}
