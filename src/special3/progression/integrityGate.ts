import { hasStableEventIdentity } from './eventIdentity.ts';
import type { AchievementRuleRegistry } from './ruleRegistry.ts';
import type { IntegrityDecision, ProductEventEnvelope, ProgressionState, RejectionReason } from './types.ts';

export interface IntegrityGateContext {
  accountKey: string;
  expectedChainId?: number;
  supportedPayloadVersions: readonly string[];
  registry: AchievementRuleRegistry;
  state: ProgressionState;
  allowMockVerification?: boolean;
}

function reject(reason: RejectionReason, detail: string): IntegrityDecision {
  return { accepted:false, reason, detail };
}

function accountMatches(event: ProductEventEnvelope, accountKey: string) {
  const eventAccount = event.walletAddress ?? event.userId ?? event.eid;
  return Boolean(eventAccount && eventAccount.toLowerCase() === accountKey.toLowerCase());
}

function requiredEvidencePresent(event: ProductEventEnvelope, allowMockVerification: boolean) {
  const ref = event.sourceRef;
  if (event.source === 'chain') return event.chainId !== undefined && Boolean(ref?.txHash) && ref?.logIndex !== undefined;
  if (event.source === 'indexer') return Boolean(ref?.indexerId || (ref?.txHash && ref.logIndex !== undefined));
  if (event.source === 'backend' || event.source === 'offchain') return Boolean(ref?.backendEventId || ref?.requestId);
  if (event.source === 'mock') return allowMockVerification && Boolean(ref?.requestId);
  return false;
}

export function evaluateEventIntegrity(event: ProductEventEnvelope, context: IntegrityGateContext): IntegrityDecision {
  if (!event || typeof event !== 'object' || !event.eventId || !event.eventType || !event.product || !event.observedAt) {
    return reject('malformed_event', 'The normalized event envelope is incomplete.');
  }
  if (event.status === 'pending') return reject('event_pending', 'Pending events cannot enter progression.');
  if (event.status === 'failed') return reject('event_failed', 'Failed events cannot enter progression.');
  if (event.status === 'rejected') return reject('event_rejected', 'Rejected events cannot enter progression.');
  if (event.status === 'duplicate') return reject('duplicate_event', 'Duplicate events produce zero additional progression.');
  if (event.status === 'simulation' || event.source === 'simulation') return reject('simulation_only', 'Simulation produces zero real progression.');
  if (event.status !== 'verified' || !event.verifiedAt) return reject('event_not_verified', `${event.status} is not equivalent to verified.`);
  if (!accountMatches(event, context.accountKey)) return reject('wrong_account', 'Event evidence does not belong to the active progression account.');
  if (context.expectedChainId !== undefined && event.chainId !== undefined && event.chainId !== context.expectedChainId) {
    return reject('wrong_network', 'Event chain does not match the active supported chain.');
  }
  if (!context.supportedPayloadVersions.includes(event.payloadVersion)) return reject('unsupported_payload', 'Payload version is not supported.');
  if (!event.payload || typeof event.payload !== 'object') return reject('unsupported_payload', 'Progression payload must be a normalized object.');
  if (!requiredEvidencePresent(event, Boolean(context.allowMockVerification))) return reject('missing_required_evidence', 'Verified status is not backed by the required source evidence.');
  if (!hasStableEventIdentity(event)) return reject('malformed_event', 'Event ID does not match canonical evidence identity.');
  if (context.state.processedEventIds.includes(event.eventId)) return reject('duplicate_event', 'Stable event identity was already processed.');
  if (context.state.activationWatermark) {
    const eventTime = Date.parse(event.occurredAt ?? event.verifiedAt);
    if (!Number.isFinite(eventTime) || eventTime < Date.parse(context.state.activationWatermark)) {
      return reject('before_activation_watermark', 'Forward-only event predates the SPECIAL activation watermark.');
    }
  }
  if (!context.registry.byProductEvent(event.product, event.eventType).length) {
    return reject('unsupported_product_event', 'No locked Achievement mapping exists for this Product event.');
  }
  return { accepted:true, detail:'Event passed the verification, account, network, version, evidence and idempotency gates.' };
}
