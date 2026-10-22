import { useTheme } from '../../lib/theme-context';
import { ChevronRight, AlertTriangle } from '@icons';
import { cn } from '../../lib/utils';
import type { NextAction } from '../../lib/types';

interface NextActionCardProps {
  action: NextAction;
  onClick?: () => void;
}

const priorityBorder = {
  high: 'border-l-danger-DEFAULT',
  medium: 'border-l-warning-DEFAULT',
  low: 'border-l-primary-500',
};

const priorityIcon = {
  high: 'text-danger-DEFAULT',
  medium: 'text-warning-DEFAULT',
  low: 'text-primary-500',
};

export function NextActionCard({ action, onClick }: NextActionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      className={cn(
        'ds-next-action w-full flex items-center gap-3 p-4 rounded-2xl border-l-2 text-left active:scale-[0.99]',
        priorityBorder[action.priority],
        isDark ? 'bg-dark-card border-t border-r border-b border-dark-border' : 'bg-light-card border-t border-r border-b border-light-border shadow-sm'
      )}
    >
      <div className={cn('flex-shrink-0', priorityIcon[action.priority])}>
        {action.priority === 'high' && <AlertTriangle size={18} />}
        {action.priority === 'medium' && <AlertTriangle size={18} />}
        {action.priority === 'low' && <AlertTriangle size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
          {action.title}
        </p>
        <p className={cn('text-xs mt-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
          {action.description}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs font-semibold text-primary-500 whitespace-nowrap">{action.cta}</span>
        <ChevronRight size={14} className="text-primary-500" />
      </div>
    </button>
  );
}
