import { AlertTriangle, CheckCircle2, Clock3, Info, XCircle } from '@icons';
import { cn } from '../../lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const styles: Record<StatusTone, string> = {
  success: 'text-success-DEFAULT bg-success-subtle border-success-DEFAULT/35',
  warning: 'text-warning-DEFAULT bg-warning-subtle border-warning-DEFAULT/35',
  danger: 'text-danger-DEFAULT bg-danger-subtle border-danger-DEFAULT/35',
  info: 'text-primary-500 bg-primary-500/10 border-primary-500/30',
  neutral: 'text-[var(--muted)] bg-[var(--panel-secondary)] border-[var(--line)]',
};

const icons = { success: CheckCircle2, warning: Clock3, danger: XCircle, info: Info, neutral: AlertTriangle };

export function StatusBadge({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  const Icon = icons[tone];
  return <span className={cn('ds-status-badge inline-flex min-h-7 items-center gap-1.5 border px-2.5 text-xs font-semibold', styles[tone], className)}><Icon size={13} aria-hidden="true" />{children}</span>;
}
