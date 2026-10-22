import React from 'react';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
  badge?: string;
  disabled?: boolean;
}

const accentBg = {
  primary: 'bg-primary-500/10',
  success: 'bg-success-DEFAULT/10',
  warning: 'bg-warning-DEFAULT/10',
  danger: 'bg-danger-DEFAULT/10',
  accent: 'bg-accent-DEFAULT/10',
};

const accentText = {
  primary: 'text-primary-500',
  success: 'text-success-DEFAULT',
  warning: 'text-warning-DEFAULT',
  danger: 'text-danger-DEFAULT',
  accent: 'text-accent-DEFAULT',
};

export function ActionCard({
  icon,
  label,
  description,
  onClick,
  accent = 'primary',
  size = 'md',
  badge,
  disabled = false,
}: ActionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'ds-action-card action-surface flex min-h-28 flex-col items-center gap-2 p-3 text-center w-full focus-ring',
        isDark
          ? 'hover:border-primary-500/50'
          : 'hover:border-primary-light/50',
        disabled && 'opacity-50 cursor-not-allowed',
        size === 'sm' ? 'p-2' : 'p-3'
      )}
    >
      <div className={cn('ds-action-icon relative flex items-center justify-center', accentBg[accent], size === 'sm' ? 'w-8 h-8' : 'w-10 h-10')}>
        <span className={accentText[accent]}>{icon}</span>
        {badge && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-danger-DEFAULT text-white text-xs font-bold flex items-center justify-center px-1">
            {badge}
          </span>
        )}
      </div>
      <span
        className={cn(
          'font-medium leading-tight',
          size === 'sm' ? 'text-xs' : 'text-xs',
          isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'
        )}
      >
        {label}
      </span>
      {description && (
        <span className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
          {description}
        </span>
      )}
    </button>
  );
}
