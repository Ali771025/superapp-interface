import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function IconButton({ label, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button type="button" aria-label={label} title={label} className={cn('ds-icon-button icon-button focus-ring disabled:cursor-not-allowed disabled:opacity-40', className)} {...props}>{children}</button>;
}
