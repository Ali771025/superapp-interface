import { useMemo, useState, type ReactNode } from 'react';
import { AppModeContext, type AppMode, type AppModeValue } from './app-mode-context';

const STORAGE_KEY = 'eternity-app-mode-v1';
function initialMode(): AppMode {
  if (typeof window === 'undefined') return 'qora';
  return window.localStorage.getItem(STORAGE_KEY) === 'workspace' ? 'workspace' : 'qora';
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [modeState, setModeState] = useState<AppMode>(initialMode);
  const value = useMemo<AppModeValue>(() => ({
    mode: modeState,
    setMode: (nextMode) => {
      setModeState(nextMode);
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    },
    toggleMode: () => setModeState((current) => {
      const next = current === 'qora' ? 'workspace' : 'qora';
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    }),
  }), [modeState]);
  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}
