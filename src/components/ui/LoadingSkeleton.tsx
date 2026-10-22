import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

export function LoadingSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-xl h-4 shimmer',
            isDark ? 'bg-dark-card' : 'bg-light-border',
            i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        'rounded-2xl p-4 space-y-3',
        isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl shimmer', isDark ? 'bg-dark-border' : 'bg-light-border')} />
        <div className="flex-1 space-y-2">
          <div className={cn('h-3 rounded-lg w-1/3 shimmer', isDark ? 'bg-dark-border' : 'bg-light-border')} />
          <div className={cn('h-2 rounded-lg w-2/3 shimmer', isDark ? 'bg-dark-border' : 'bg-light-border')} />
        </div>
      </div>
      <div className={cn('h-2 rounded-lg w-full shimmer', isDark ? 'bg-dark-border' : 'bg-light-border')} />
      <div className={cn('h-2 rounded-lg w-4/5 shimmer', isDark ? 'bg-dark-border' : 'bg-light-border')} />
    </div>
  );
}
