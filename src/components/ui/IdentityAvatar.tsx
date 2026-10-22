import { cn } from '../../lib/utils';

export function IdentityAvatar({ identity, level, size = 80, className, showLevelBadge = true }: { identity: string; level: number; size?: number; className?: string; showLevelBadge?: boolean }) {
  const seed = Array.from(identity).reduce((total, character) => total + character.charCodeAt(0), 0);
  const cells = Array.from({ length: 15 }, (_, index) => ((seed >> (index % 8)) + index * 7) % 3 !== 0);
  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--panel-secondary)] p-1 border-2 border-[var(--border-strong)]', className)} style={{ width: size, height: size }} aria-label={`${identity} identity avatar, level ${level}`}>
      <svg viewBox="0 0 5 5" className="h-full w-full" role="img" aria-hidden="true">
        <rect width="5" height="5" fill="var(--panel-secondary)" />
        {cells.map((visible, index) => {
          if (!visible) return null;
          const x = index % 3;
          const y = Math.floor(index / 3);
          return <g key={index} fill={index % 2 ? 'var(--primary)' : 'var(--accent)'}><rect x={x} y={y} width="1" height="1" /><rect x={4 - x} y={y} width="1" height="1" /></g>;
        })}
      </svg>
      {showLevelBadge && <span className={`level-badge level-badge--${Math.max(1, Math.min(19, level))}`} aria-label={`Level ${level}`}>{level}</span>}
    </span>
  );
}
