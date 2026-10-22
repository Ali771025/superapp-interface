import type { ProductEventEnvelope, ProductEventSourceRef } from './types.ts';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export interface EventIdentityEvidence {
  eventType: string;
  chainId?: number;
  sourceRef?: ProductEventSourceRef;
}

export function deriveStableEventId(evidence: EventIdentityEvidence): string | null {
  const eventType = normalize(evidence.eventType);
  const ref = evidence.sourceRef;
  if (evidence.chainId !== undefined && ref?.txHash && ref.logIndex !== undefined) {
    return `chain:${evidence.chainId}:${normalize(ref.txHash)}:${ref.logIndex}:${eventType}`;
  }
  if (ref?.indexerId) return `indexer:${normalize(ref.indexerId)}:${eventType}`;
  if (ref?.backendEventId) return `backend:${normalize(ref.backendEventId)}:${eventType}`;
  if (ref?.requestId) return `request:${normalize(ref.requestId)}:${eventType}`;
  return null;
}

export function hasStableEventIdentity(event: ProductEventEnvelope) {
  const derived = deriveStableEventId(event);
  return Boolean(derived && derived === normalize(event.eventId));
}

export function evidenceReference(event: ProductEventEnvelope) {
  const ref = event.sourceRef;
  if (!ref) return undefined;
  if (ref.txHash) return `${event.chainId ?? 'chain'}:${normalize(ref.txHash)}:${ref.logIndex ?? 'log-unresolved'}`;
  return ref.indexerId ?? ref.backendEventId ?? ref.requestId;
}
