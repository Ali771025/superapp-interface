import React, { useState, useEffect } from 'react';
import type { ThemeMode } from './types';
import { ThemeContext } from './theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('eternity-theme');
    return (stored as ThemeMode) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.classList.add('light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.remove('light');
    }
    localStorage.setItem('eternity-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
