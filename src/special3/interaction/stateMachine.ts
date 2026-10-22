import type { ActionLifecycleState } from './types';

export const ACTION_LIFECYCLE_STATES: readonly ActionLifecycleState[] = Object.freeze([
  'idle', 'editing', 'validating', 'ready', 'reviewing', 'awaiting-wallet', 'submitted', 'confirming', 'indexing', 'verifying', 'result',
  'validation-failure', 'wallet-rejected', 'insufficient-funds', 'network-failure', 'reverted', 'replaced', 'indexing-delay', 'verification-unavailable',
]);

const transitions: Readonly<Record<ActionLifecycleState, readonly ActionLifecycleState[]>> = Object.freeze({
  idle:['editing'], editing:['validating','idle'], validating:['ready','validation-failure','insufficient-funds','editing'], ready:['reviewing','editing'],
  reviewing:['awaiting-wallet','editing'], 'awaiting-wallet':['submitted','wallet-rejected','network-failure'], submitted:['confirming','replaced','network-failure'],
  confirming:['indexing','reverted','replaced','network-failure'], indexing:['verifying','indexing-delay','network-failure'],
  verifying:['result','verification-unavailable'], result:['idle'], 'validation-failure':['editing'], 'wallet-rejected':['reviewing','editing'],
  'insufficient-funds':['editing'], 'network-failure':['reviewing','editing'], reverted:['editing'], replaced:['confirming'],
  'indexing-delay':['indexing','verifying'], 'verification-unavailable':['result','verifying'],
});

export function canTransitionAction(from: ActionLifecycleState, to: ActionLifecycleState): boolean {
  return transitions[from].includes(to);
}

export function progressionCommitAllowed(lifecycle: ActionLifecycleState, verification: 'pending' | 'verified' | 'committed' | 'unavailable'): boolean {
  return lifecycle === 'result' && verification === 'committed';
}

export function lifecycleHasZeroProgression(state: ActionLifecycleState): boolean {
  return state !== 'result';
}
