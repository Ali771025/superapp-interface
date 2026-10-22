import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from '@icons';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function Button({ variant = 'secondary', size = 'md', fullWidth = false, loading, loadingLabel = 'Working…', children, className, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        'ds-button inline-flex items-center justify-center gap-2 font-bold focus-ring disabled:cursor-not-allowed disabled:opacity-45',
        size === 'sm' && 'min-h-11 px-3 text-xs',
        size === 'md' && 'min-h-11 px-4 text-sm',
        size === 'lg' && 'min-h-12 px-5 text-base',
        fullWidth && 'w-full',
        variant === 'primary' && 'ds-button-primary cut-button cut-button--primary',
        variant === 'secondary' && 'ds-button-secondary button-secondary',
        variant === 'danger' && 'ds-button-danger button-danger',
        variant === 'ghost' && 'ds-button-ghost text-primary-500',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {loading ? loadingLabel : children}
    </button>
  );
}
