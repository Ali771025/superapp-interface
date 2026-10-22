import type { Special3Theme } from '../tokens/generated';

export const SPECIAL3_THEME_ATTRIBUTE = 'data-theme';

export function resolveSpecial3Theme(theme: Special3Theme, prefersDark = false): Exclude<Special3Theme, 'system'> {
  return theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
}

export function applySpecial3Theme(root: HTMLElement, theme: Special3Theme, prefersDark = false) {
  const resolved = resolveSpecial3Theme(theme, prefersDark);
  root.setAttribute(SPECIAL3_THEME_ATTRIBUTE, resolved);
  return resolved;
}
