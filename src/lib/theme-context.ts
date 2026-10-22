import { createContext, useContext } from 'react';
import type { ThemeMode } from './types';

export interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => undefined,
});

export function useTheme() {
  return useContext(ThemeContext);
}
