export const SPECIAL3_SHELL_FLAG = 'VITE_SPECIAL3_SHELL_ENABLED';

export function resolveSpecial3ShellEnabled(value: string | undefined, allowDevelopmentRollback = true) {
  return allowDevelopmentRollback ? value !== 'false' : true;
}

export function isSpecial3ShellEnabled() {
  return resolveSpecial3ShellEnabled(import.meta.env.VITE_SPECIAL3_SHELL_ENABLED, import.meta.env.DEV);
}
