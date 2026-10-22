import type {
  AchievementProduct, ProductVerifierCapability, ProgressionMode, ProgressionReadiness,
  ProgressionReadinessBlocker, ProgressionRuntimeCapabilities,
} from './types.ts';

export const ACHIEVEMENT_PRODUCTS: readonly AchievementProduct[] = [
  'Generator', 'FanCommunity', 'Forecast', 'SHIELD', 'STOCK/EES', 'ERA', 'EID',
];

const unavailableVerifier = (): ProductVerifierCapability => ({ production:false, preview:true, testFixture:true });

export function createPrototypeRuntimeCapabilities(environment: ProgressionRuntimeCapabilities['environment'] = 'preview'): ProgressionRuntimeCapabilities {
  return {
    environment,
    productVerifiers:Object.fromEntries(ACHIEVEMENT_PRODUCTS.map((product) => [product, unavailableVerifier()])) as ProgressionRuntimeCapabilities['productVerifiers'],
    persistence:{ valid:true, productionReady:false, atomic:false },
    registry:{ valid:true, ruleCount:79, protocolResolved:false },
    journey:{ integrationSafe:true, authoritativeMappingAvailable:false },
    qa:{ allowPreviewVerification:environment === 'preview', allowTestFixtureVerification:environment === 'test' },
  };
}

export const DEFAULT_RUNTIME_CAPABILITIES = createPrototypeRuntimeCapabilities(
  import.meta.env?.MODE === 'test' ? 'test' : import.meta.env?.PROD ? 'live' : 'preview',
);

export function resolveProgressionReadiness(requestedMode: ProgressionMode, capabilities: ProgressionRuntimeCapabilities): ProgressionReadiness {
  const blockers: ProgressionReadinessBlocker[] = [];
  if (!ACHIEVEMENT_PRODUCTS.every((product) => capabilities.productVerifiers[product]?.production)) blockers.push('product_verifier_unavailable');
  if (!capabilities.journey.integrationSafe || !capabilities.journey.authoritativeMappingAvailable) blockers.push('mission_mapping_unavailable');
  if (!capabilities.persistence.valid || !capabilities.persistence.productionReady || !capabilities.persistence.atomic) blockers.push('persistence_not_production_ready');
  if (!capabilities.registry.valid || capabilities.registry.ruleCount !== 79 || !capabilities.registry.protocolResolved) blockers.push('protocol_resolution_required');
  if (capabilities.environment !== 'live') blockers.push('unsupported_environment');
  const activeReady = blockers.length === 0;
  return {
    requestedMode,
    effectiveMode:requestedMode === 'active' && !activeReady ? 'legacy' : requestedMode,
    activeReady,
    blockers,
  };
}

export function createFullyApprovedActiveCapabilities(): ProgressionRuntimeCapabilities {
  return {
    environment:'live',
    productVerifiers:Object.fromEntries(ACHIEVEMENT_PRODUCTS.map((product) => [product, { production:true, preview:false, testFixture:false }])) as ProgressionRuntimeCapabilities['productVerifiers'],
    persistence:{ valid:true, productionReady:true, atomic:true },
    registry:{ valid:true, ruleCount:79, protocolResolved:true },
    journey:{ integrationSafe:true, authoritativeMappingAvailable:true },
    qa:{ allowPreviewVerification:false, allowTestFixtureVerification:false },
  };
}
