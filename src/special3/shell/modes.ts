export type Special3ShellMode = 'guide' | 'compact' | 'focus' | 'verify' | 'result';
import { getPresentationContractForRoute } from '../products/presentationRegistry';

export function resolveSpecial3ShellMode(pathname: string, search: string): Special3ShellMode {
  const params = new URLSearchParams(search);
  if (params.has('result') || params.get('state') === 'result') return 'result';
  if (params.has('review') || params.get('mode') === 'verify') return 'verify';
  return getPresentationContractForRoute(pathname).shellMode;
}
