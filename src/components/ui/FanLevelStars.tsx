import { cn } from '../../lib/utils';

type FanLevelStarsProps = {
  stars: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
};

const sizes = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
};

export function FanLevelStars({ stars, size = 'sm', animated = false, className }: FanLevelStarsProps) {
  const normalized = Math.max(0, Math.min(Math.floor(stars), 12));
  const label = normalized === 0 ? 'FAN level zero' : `FAN level with ${normalized} ${normalized === 1 ? 'star' : 'stars'}`;

  if (normalized === 0) {
    return (
      <span className={cn('inline-flex items-center', className)} role="img" aria-label={label} title={label}>
        <img src="/assets/ui/fan-zero-star.png" alt="" className={cn(sizes[size], 'object-contain')} draggable={false} />
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center -space-x-0.5', className)} role="img" aria-label={label} title={label}>
      {Array.from({ length: normalized }).map((_, index) => (
        <img
          key={index}
          src="/assets/ui/fan-star.png"
          alt=""
          className={cn(sizes[size], 'fan-star-item object-contain drop-shadow-sm', animated && 'fan-star-enter')}
          style={animated ? { animationDelay: `${index * 45}ms` } : undefined}
          draggable={false}
        />
      ))}
    </span>
  );
}
