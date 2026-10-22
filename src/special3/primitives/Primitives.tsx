import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import { CheckCircle2, CircleAlert, CircleDot, CircleX, Info } from '@icons';
import './primitives.css';

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
type TextVariant = 'body' | 'label' | 'caption' | 'numeric' | 'numeric-xl' | 'mono';

export function Text({ as: Component = 'p', variant = 'body', tone = 'primary', className = '', children, ...props }: {
  as?: ElementType; variant?: TextVariant; tone?: 'primary' | 'secondary' | 'muted'; className?: string; children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return <Component className={`s3-text s3-text--${variant} s3-text--${tone} ${className}`.trim()} {...props}>{children}</Component>;
}

export function Heading({ level = 2, display = false, className = '', children, ...props }: {
  level?: 1 | 2 | 3 | 4; display?: boolean; className?: string; children: ReactNode;
} & HTMLAttributes<HTMLHeadingElement>) {
  const Component = `h${level}` as ElementType;
  return <Component className={`s3-heading s3-heading--${display ? 'display' : `h${level}`} ${className}`.trim()} {...props}>{children}</Component>;
}

export function Icon({ children, label, size = 'md', className = '' }: { children: ReactNode; label?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  return <span className={`s3-icon s3-icon--${size} ${className}`.trim()} aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}>{children}</span>;
}

export function Surface({ as: Component = 'section', variant = 'default', elevation = 0, className = '', children, ...props }: {
  as?: ElementType; variant?: 'default' | 'raised' | 'interactive' | 'subtle'; elevation?: 0 | 1 | 2 | 3 | 4; className?: string; children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return <Component className={`s3-surface s3-surface--${variant} s3-elevation-${elevation} ${className}`.trim()} {...props}>{children}</Component>;
}

export function Divider({ orientation = 'horizontal', className = '' }: { orientation?: 'horizontal' | 'vertical'; className?: string }) {
  return <hr className={`s3-divider s3-divider--${orientation} ${className}`.trim()} aria-orientation={orientation} />;
}

export function Stack({ as: Component = 'div', gap = 4, align = 'stretch', className = '', children, ...props }: {
  as?: ElementType; gap?: Space; align?: 'start' | 'center' | 'end' | 'stretch'; className?: string; children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return <Component className={`s3-stack s3-gap-${gap} s3-align-${align} ${className}`.trim()} {...props}>{children}</Component>;
}

export function Inline({ as: Component = 'div', gap = 2, align = 'center', wrap = true, className = '', children, ...props }: {
  as?: ElementType; gap?: Space; align?: 'start' | 'center' | 'end' | 'stretch'; wrap?: boolean; className?: string; children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return <Component className={`s3-inline s3-gap-${gap} s3-align-${align} ${wrap ? 's3-wrap' : ''} ${className}`.trim()} {...props}>{children}</Component>;
}

export function Grid({ columns = 1, gap = 4, className = '', children, ...props }: {
  columns?: 1 | 2 | 3 | 4; gap?: Space; className?: string; children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return <div className={`s3-grid s3-grid--${columns} s3-gap-${gap} ${className}`.trim()} {...props}>{children}</div>;
}

export function Container({ size = 'standard', className = '', children, ...props }: {
  size?: 'reading' | 'standard' | 'wide' | 'max' | 'fluid'; className?: string; children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return <div className={`s3-container s3-container--${size} ${className}`.trim()} {...props}>{children}</div>;
}

export function ScrollRegion({ label, className = '', children, ...props }: { label: string; className?: string; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return <div className={`s3-scroll-region ${className}`.trim()} role="region" aria-label={label} tabIndex={0} {...props}>{children}</div>;
}

export function FocusRing({ className = '', children }: { className?: string; children: ReactNode }) {
  return <span className={`s3-focus-ring ${className}`.trim()}>{children}</span>;
}

export function Skeleton({ width = 'full', className = '', label = 'Loading content' }: { width?: 'quarter' | 'half' | 'three-quarter' | 'full'; className?: string; label?: string }) {
  return <span className={`s3-skeleton s3-skeleton--${width} ${className}`.trim()} role="status" aria-label={label}><span className="s3-visually-hidden">{label}</span></span>;
}

const statusIcon = { success: CheckCircle2, warning: CircleAlert, danger: CircleX, info: Info, neutral: CircleDot } as const;
export function StatusIndicator({ status, label, compact = false, className = '' }: { status: keyof typeof statusIcon; label: string; compact?: boolean; className?: string }) {
  const StatusIcon = statusIcon[status];
  return <span className={`s3-status s3-status--${status} ${compact ? 's3-status--compact' : ''} ${className}`.trim()} role="status"><StatusIcon aria-hidden="true" />{compact ? <span className="s3-visually-hidden">{label}</span> : label}</span>;
}

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'; children: ReactNode; className?: string }) {
  return <span className={`s3-badge s3-tone-${tone} ${className}`.trim()}>{children}</span>;
}

export function Chip({ selected = false, disabled = false, onClick, children, className = '' }: {
  selected?: boolean; disabled?: boolean; onClick?: () => void; children: ReactNode; className?: string;
}) {
  if (onClick) return <button type="button" className={`s3-chip s3-chip--interactive ${className}`.trim()} aria-pressed={selected} disabled={disabled} onClick={onClick}>{children}</button>;
  return <span className={`s3-chip ${selected ? 's3-chip--selected' : ''} ${className}`.trim()} aria-disabled={disabled || undefined}>{children}</span>;
}

export type Special3Style = CSSProperties & Record<`--s3-${string}`, string | number>;
