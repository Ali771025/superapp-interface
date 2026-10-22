import React from 'react';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="ds-empty-state flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
      {icon && (
        <div className="w-14 h-14 flex items-center justify-center">
          <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>{icon}</span>
        </div>
      )}
      <p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{title}</p>
      {description && (
        <p className={cn('text-sm max-w-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="ds-button ds-button-primary mt-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
