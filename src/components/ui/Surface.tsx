import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type SurfaceVariant = 'brand' | 'data' | 'action' | 'safety' | 'default' | 'subtle' | 'elevated';

const variants: Record<SurfaceVariant, string> = {
  brand: 'brand-surface',
  data: 'data-surface',
  action: 'action-surface',
  safety: 'safety-surface',
  default: 'surface',
  subtle: 'surface-subtle',
  elevated: 'surface-elevated',
};

export function Surface({ variant = 'default', className, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: SurfaceVariant }) {
  return <div className={cn('ds-surface', `ds-surface-${variant}`, variants[variant], className)} {...props} />;
}
