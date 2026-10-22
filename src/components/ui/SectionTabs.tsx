import { cn } from '../../lib/utils';
import type { LucideIcon } from '@icons';

export type SectionTab<T extends string> = { key: T; label: string; icon?: LucideIcon };

export function SectionTabs<T extends string>({ items, active, onChange, label, className }: { items: SectionTab<T>[]; active: T; onChange: (key: T) => void; label: string; className?: string }) {
  return <div className={cn('ds-section-tabs special-tabs nexus-tabs flex h-12 w-full max-w-full gap-1 overflow-x-auto scrollbar-none', className)} role="tablist" aria-label={label}>{items.map((item) => { const Icon = item.icon; return <button key={item.key} type="button" role="tab" aria-selected={active === item.key} onClick={() => onChange(item.key)} className={cn('nexus-tab relative flex h-full min-w-[108px] flex-1 items-center justify-center gap-2 px-3 text-sm font-semibold whitespace-nowrap focus-ring', active === item.key ? 'special-tab-active text-primary-500' : 'text-[var(--muted)] hover:text-[var(--text)]')}>{Icon && <Icon size={16} strokeWidth={1.8} aria-hidden="true" />}{item.label}</button>; })}</div>;
}
