import { Sun, Moon } from '@icons';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center justify-center w-11 h-11 transition-colors focus-ring',
        isDark ? 'hover:bg-dark-card text-dark-textSecondary' : 'hover:bg-light-border text-light-textSecondary'
      )}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
