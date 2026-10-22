import { ProgressionAccountQueue } from './accountQueue.ts';
import { observeConfirmedProductAction, type ConfirmedProductActionObservation } from './confirmedObservation.ts';
import { mappingAuthorizesHandoff, MISSION_ACHIEVEMENT_MAPPINGS, type MissionAchievementMapping } from './missionAchievementMappings.ts';
import { getConfiguredProgressionMode } from './mode.ts';
import { createEmptyProgressionState, type ProgressionPersistence } from './persistence.ts';
import { DEFAULT_RUNTIME_CAPABILITIES, resolveProgressionReadiness } from './readiness.ts';
import { processProductEvent } from './runtime.ts';
import type {
  JourneyImpactStatus, JourneyProgressionHandoff, ProductEventEnvelope, ProgressionImpact, ProgressionMode,
  ProgressionReadiness, ProgressionRuntimeCapabilities, ReferralContext, VerifierCapabilityKind,
} from './types.ts';

export interface RuntimeJourneyBridge {
  applyProgressionHandoff(handoff: JourneyProgressionHandoff): { status: JourneyImpactStatus };
}

export interface RuntimeEventInput {
  event: ProductEventEnvelope;
  accountKey: string;
  verifierKind: VerifierCapabilityKind;
  expectedChainId?: number;
  activeMissionId?: string;
  referralContext?: ReferralContext;
}

export interface RuntimeDiagnosticRecord {
  recordType: 'runtime-observed-confirmation' | 'verified-adapter-event' | 'verifier-unavailable' | 'shadow-parity' | 'active-blocked';
  eventId: string;
  requestedMode: ProgressionMode;
  effectiveMode: ProgressionMode;
  verifierKind?: VerifierCapabilityKind;
  writesApplied: boolean;
  impact: ProgressionImpact;
  journeyDecisions: Array<{ progressionCommitId: string; status: JourneyImpactStatus }>;
  timestamp: string;
}

export interface RuntimeCoordinationResult {
  readiness: ProgressionReadiness;
  status: 'observed-zero' | 'processed' | 'verifier_unavailable' | 'active_blocked';
  writesApplied: boolean;
  impact: ProgressionImpact;
  handoffs: JourneyProgressionHandoff[];
  journeyDecisions: Array<{ progressionCommitId: string; status: JourneyImpactStatus }>;
}

function unavailableImpact(event: ProductEventEnvelope): ProgressionImpact {
  return { eventId:event.eventId, verificationStatus:event.status, achievements:[], personalEqDelta:0, referralEqDelta:0, journeyImpact:{ status:'not-committed' }, rejectionReason:'verifier_unavailable' };
}

export class ProgressionRuntimeCoordinator {
  private readonly queue = new ProgressionAccountQueue();
  private readonly diagnostics: RuntimeDiagnosticRecord[] = [];
  private readonly options: {
    persistence: ProgressionPersistence;
    referralPersistence?: ProgressionPersistence;
    capabilities?: ProgressionRuntimeCapabilities;
    requestedMode?: ProgressionMode;
    journeyBridge?: RuntimeJourneyBridge;
    missionMappings?: readonly MissionAchievementMapping[];
  };

  constructor(options: {
    persistence: ProgressionPersistence;
    referralPersistence?: ProgressionPersistence;
    capabilities?: ProgressionRuntimeCapabilities;
    requestedMode?: ProgressionMode;
    journeyBridge?: RuntimeJourneyBridge;
    missionMappings?: readonly MissionAchievementMapping[];
  }) { this.options = options; }

  get capabilities() { return this.options.capabilities ?? DEFAULT_RUNTIME_CAPABILITIES; }
  get readiness() { return resolveProgressionReadiness(this.options.requestedMode ?? getConfiguredProgressionMode(), this.capabilities); }
  getDiagnostics() { return structuredClone(this.diagnostics); }

  observeTransaction(input: ConfirmedProductActionObservation): RuntimeCoordinationResult {
    const readiness = this.readiness;
    const impact = observeConfirmedProductAction(input);
    const result: RuntimeCoordinationResult = { readiness, status:readiness.requestedMode === 'active' && !readiness.activeReady ? 'active_blocked' : 'observed-zero', writesApplied:false, impact, handoffs:[], journeyDecisions:[] };
    this.record(readiness.requestedMode === 'active' && !readiness.activeReady ? 'active-blocked' : 'runtime-observed-confirmation', input.preview ? 'simulation' : impact.eventId, result);
    return result;
  }

  async process(input: RuntimeEventInput): Promise<RuntimeCoordinationResult> {
    const readiness = this.readiness;
    const keys = [input.accountKey, input.referralContext?.sponsorAccountKey].filter((value): value is string => Boolean(value));
    return this.queue.run(keys, async () => {
      if (!this.verifierAvailable(input)) {
        const impact = unavailableImpact(input.event);
        const result: RuntimeCoordinationResult = { readiness, status:'verifier_unavailable', writesApplied:false, impact, handoffs:[], journeyDecisions:[] };
        this.record('verifier-unavailable', input.event.eventId, result, input.verifierKind);
        return result;
      }

      const pipeline = await processProductEvent({
        event:input.event,
        accountKey:input.accountKey,
        persistence:this.options.persistence,
        referralPersistence:this.options.referralPersistence,
        referralContext:input.referralContext,
        mode:readiness.effectiveMode,
        expectedChainId:input.expectedChainId,
        activeMissionId:input.activeMissionId,
        allowMockVerification:input.verifierKind !== 'production',
      });

      const journeyDecisions = pipeline.handoffs.map((handoff) => this.handleJourneyHandoff(handoff, input.activeMissionId, readiness));
      const activeBlocked = readiness.requestedMode === 'active' && !readiness.activeReady;
      const result: RuntimeCoordinationResult = {
        readiness,
        status:activeBlocked ? 'active_blocked' : 'processed',
        writesApplied:pipeline.writesApplied,
        impact:pipeline.impact,
        handoffs:pipeline.handoffs,
        journeyDecisions,
      };
      this.record(activeBlocked ? 'active-blocked' : readiness.effectiveMode === 'shadow' ? 'shadow-parity' : 'verified-adapter-event', input.event.eventId, result, input.verifierKind);
      return result;
    });
  }

  private verifierAvailable(input: RuntimeEventInput) {
    const capability = this.capabilities.productVerifiers[input.event.product];
    if (!capability || input.event.status !== 'verified') return false;
    if (input.verifierKind === 'production') return capability.production && input.event.source !== 'mock' && input.event.source !== 'simulation';
    if (input.verifierKind === 'preview') return this.capabilities.environment === 'preview' && this.capabilities.qa.allowPreviewVerification && capability.preview && input.event.source === 'mock';
    return this.capabilities.environment === 'test' && this.capabilities.qa.allowTestFixtureVerification && capability.testFixture && input.event.source === 'mock';
  }

  private handleJourneyHandoff(handoff: JourneyProgressionHandoff, activeMissionId: string | undefined, readiness: ProgressionReadiness) {
    const mapping = (this.options.missionMappings ?? MISSION_ACHIEVEMENT_MAPPINGS).find((item) => item.missionId === activeMissionId);
    if (!mappingAuthorizesHandoff(mapping, handoff)) return { progressionCommitId:handoff.progressionCommitId, status:'mapping-unresolved' as const };
    if (readiness.effectiveMode !== 'active' || !readiness.activeReady || !this.options.journeyBridge) return { progressionCommitId:handoff.progressionCommitId, status:'not-committed' as const };
    const decision = this.options.journeyBridge.applyProgressionHandoff(handoff);
    return { progressionCommitId:handoff.progressionCommitId, status:decision.status };
  }

  private record(recordType: RuntimeDiagnosticRecord['recordType'], eventId: string, result: RuntimeCoordinationResult, verifierKind?: VerifierCapabilityKind) {
    this.diagnostics.push({ recordType, eventId, requestedMode:result.readiness.requestedMode, effectiveMode:result.readiness.effectiveMode, verifierKind, writesApplied:result.writesApplied, impact:result.impact, journeyDecisions:result.journeyDecisions, timestamp:new Date().toISOString() });
  }
}

export function createUnavailableRuntimeResult(event: ProductEventEnvelope, requestedMode: ProgressionMode, capabilities = DEFAULT_RUNTIME_CAPABILITIES): RuntimeCoordinationResult {
  const readiness = resolveProgressionReadiness(requestedMode, capabilities);
  return { readiness, status:'verifier_unavailable', writesApplied:false, impact:unavailableImpact(event), handoffs:[], journeyDecisions:[] };
}

export async function loadOrCreateRuntimeState(persistence: ProgressionPersistence, accountKey: string, observedAt: string) {
  return await persistence.load(accountKey) ?? createEmptyProgressionState(accountKey, observedAt);
}
