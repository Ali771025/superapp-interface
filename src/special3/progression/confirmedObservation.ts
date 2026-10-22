import { deriveStableEventId } from './eventIdentity.ts';
import type { ProgressionImpact, ProgressionMode } from './types.ts';

export interface ConfirmedProductActionObservation {
  sourceProductId: string;
  action: string;
  accountKey?: string;
  chainId?: number;
  txHash?: string;
  logIndex?: number;
  blockNumber?: number;
  requestId?: string;
  preview: boolean;
  observedAt?: string;
  mode?: ProgressionMode;
}

function zeroImpact(eventId: string, status: string, rejectionReason: ProgressionImpact['rejectionReason']): ProgressionImpact {
  return { eventId, verificationStatus:status, achievements:[], personalEqDelta:0, referralEqDelta:0, journeyImpact:{ status:'not-committed' }, rejectionReason };
}

/**
 * Records the Transaction Review boundary without treating confirmation as a
 * verified Product Event. Verification adapters deliberately enter through
 * processProductEvent instead.
 */
export function observeConfirmedProductAction(input: ConfirmedProductActionObservation): ProgressionImpact {
  const eventType = `${input.sourceProductId}.transaction.confirmed`;
  const sourceRef = { txHash:input.txHash, logIndex:input.logIndex, blockNumber:input.blockNumber, requestId:input.requestId };
  const eventId = deriveStableEventId({ eventType, chainId:input.chainId, sourceRef });
  if (!eventId || !input.accountKey) return zeroImpact('unavailable:missing-evidence', input.preview ? 'simulation' : 'confirmed', 'missing_required_evidence');
  return zeroImpact(eventId, input.preview ? 'simulation' : 'confirmed', input.preview ? 'simulation_only' : 'event_not_verified');
}
