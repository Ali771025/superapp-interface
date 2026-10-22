import type { ProgressionMode } from './types.ts';
import { DEFAULT_RUNTIME_CAPABILITIES, resolveProgressionReadiness } from './readiness.ts';

export const SPECIAL3_PROGRESSION_MODE_FLAG = 'VITE_SPECIAL3_PROGRESSION_MODE';
export const DEFAULT_PROGRESSION_MODE: ProgressionMode = 'legacy';

export function resolveProgressionMode(value?: string): ProgressionMode {
  return value === 'shadow' || value === 'active' || value === 'legacy' ? value : DEFAULT_PROGRESSION_MODE;
}

export function getConfiguredProgressionMode(): ProgressionMode {
  return resolveProgressionMode(import.meta.env?.VITE_SPECIAL3_PROGRESSION_MODE);
}

export function getConfiguredProgressionReadiness() {
  return resolveProgressionReadiness(getConfiguredProgressionMode(), DEFAULT_RUNTIME_CAPABILITIES);
}

export function authoritativeWriter(mode: ProgressionMode) {
  return mode === 'active' ? 'special3' : 'legacy';
}

export function canSpecial3MutateProgression(mode: ProgressionMode) {
  return authoritativeWriter(mode) === 'special3';
}
