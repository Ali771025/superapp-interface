import React from 'react';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  icon?: React.ReactNode;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
}

const accentColors = {
  primary: 'text-primary-500',
  success: 'text-success-DEFAULT',
  warning: 'text-warning-DEFAULT',
  danger: 'text-danger-DEFAULT',
  accent: 'text-accent-DEFAULT',
};

export function StatCard({ label, value, sub, trend, icon, accent = 'primary', size = 'md' }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        'ds-stat-card data-surface p-4 flex flex-col gap-1',
        isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm'
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-medium', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
          {label}
        </span>
        {icon && <span className={accentColors[accent]}>{icon}</span>}
      </div>
      <div className={cn('ds-stat-value font-bold tabular-nums', size === 'sm' ? 'text-lg' : 'text-2xl', accent === 'primary' ? (isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary') : accentColors[accent])}>{value}</div>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2">
          {sub && (
            <span className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{sub}</span>
          )}
          {trend !== undefined && (
            <span className={cn('text-xs font-medium', trend >= 0 ? 'text-success-DEFAULT' : 'text-danger-DEFAULT')}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(2)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
