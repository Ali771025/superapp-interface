import { createContext, useContext } from 'react';

export type AppMode = 'qora' | 'workspace';
export type AppModeValue = { mode: AppMode; setMode: (mode: AppMode) => void; toggleMode: () => void };
export const AppModeContext = createContext<AppModeValue | null>(null);

export function useAppMode() {
  const value = useContext(AppModeContext);
  if (!value) throw new Error('useAppMode must be used within AppModeProvider.');
  return value;
}
