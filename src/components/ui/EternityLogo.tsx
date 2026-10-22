import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

export function EternityLogo({ className }: { className?: string }) {
  const { theme } = useTheme();
  return <img src={theme === 'dark' ? '/assets/ui/eternity-logo-dark.png' : '/assets/ui/eternity-logo-light.png'} alt="ETERNITY" className={cn('h-8 w-auto object-contain', className)} />;
}
