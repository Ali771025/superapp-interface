import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

interface ReadinessCardProps {
  label: string;
  description: string;
  progress: number;
  status: 'locked' | 'in-progress' | 'complete';
  certificateType?: string;
  onAction?: () => void;
}

export function ReadinessCard({ label, description, progress, status, onAction }: ReadinessCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const statusColor = {
    locked: 'text-dark-textSecondary',
    'in-progress': 'text-warning-DEFAULT',
    complete: 'text-success-DEFAULT',
  }[status];

  const statusLabel = {
    locked: 'Locked',
    'in-progress': 'In Progress',
    complete: 'Complete',
  }[status];

  return (
    <div
      className={cn(
        'ds-readiness-card rounded-2xl p-4 space-y-3',
        isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={cn('text-sm font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
            {label}
          </p>
          <p className={cn('text-xs mt-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            {description}
          </p>
        </div>
        <span className={cn('text-xs font-semibold flex-shrink-0', statusColor)}>{statusLabel}</span>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Progress</span>
          <span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>{progress}%</span>
        </div>
        <div className={cn('w-full rounded-full h-1.5', isDark ? 'bg-dark-border' : 'bg-light-border')}>
          <div
            className={cn('h-1.5 rounded-full transition-all', progress === 100 ? 'bg-success-DEFAULT' : 'bg-primary-500')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {status !== 'complete' && onAction && (
        <button
          onClick={onAction}
          className="ds-inline-action w-full py-2 rounded-xl bg-primary-500/10 text-primary-500 text-xs font-semibold"
        >
          {status === 'locked' ? 'Unlock' : 'Continue'}
        </button>
      )}
    </div>
  );
}
