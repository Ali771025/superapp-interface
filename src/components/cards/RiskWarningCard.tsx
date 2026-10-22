import { useTheme } from '../../lib/theme-context';
import { AlertTriangle, X } from '@icons';
import { cn } from '../../lib/utils';

interface RiskWarningCardProps {
  message: string;
  level?: 'info' | 'warning' | 'danger';
  onDismiss?: () => void;
}

const levelConfig = {
  info: {
    bg: 'bg-primary-500/10 border-primary-500/30',
    icon: 'text-primary-500',
    text: 'text-primary-500',
  },
  warning: {
    bg: 'bg-warning-DEFAULT/10 border-warning-DEFAULT/30',
    icon: 'text-warning-DEFAULT',
    text: 'text-warning-DEFAULT',
  },
  danger: {
    bg: 'bg-danger-DEFAULT/10 border-danger-DEFAULT/30',
    icon: 'text-danger-DEFAULT',
    text: 'text-danger-DEFAULT',
  },
};

export function RiskWarningCard({ message, level = 'warning', onDismiss }: RiskWarningCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const config = levelConfig[level];

  return (
    <div className={cn('ds-callout flex items-start gap-3 p-3 rounded-xl border', `is-${level}`, config.bg)}>
      <AlertTriangle size={16} className={cn('flex-shrink-0 mt-0.5', config.icon)} />
      <p className={cn('flex-1 text-xs leading-relaxed', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
        {message}
      </p>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss notice" className={cn('ds-callout-close flex-shrink-0', config.text)}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}
