import type { AchievementProduct, ProductEventEnvelope, ProgressionRuntimeCapabilities, VerifierCapabilityKind } from './types.ts';

export type VerifierAdapterResult =
  | { status: 'verified'; event: ProductEventEnvelope; verifierKind: VerifierCapabilityKind; label: string }
  | { status: 'verifier_unavailable'; product: AchievementProduct; verifierKind: VerifierCapabilityKind; label: string };

export interface ProgressionVerifierAdapter {
  product: AchievementProduct;
  kind: VerifierCapabilityKind;
  label: string;
  verify(event: ProductEventEnvelope): Promise<VerifierAdapterResult>;
}

export function unavailableProductionVerifier(product: AchievementProduct): ProgressionVerifierAdapter {
  return {
    product,
    kind:'production',
    label:`Production verifier unavailable · ${product}`,
    async verify() { return { status:'verifier_unavailable', product, verifierKind:'production', label:`Production verifier unavailable · ${product}` }; },
  };
}

export function controlledFixtureVerifier(input: {
  product: AchievementProduct;
  kind: 'preview' | 'test-fixture';
  capabilities: ProgressionRuntimeCapabilities;
  qaCapabilityEnabled: boolean;
}): ProgressionVerifierAdapter {
  const label = `${input.kind === 'preview' ? 'Preview Mock' : 'Test Fixture'} verifier · ${input.product}`;
  return {
    product:input.product,
    kind:input.kind,
    label,
    async verify(event) {
      const environmentAllowed = input.kind === 'preview'
        ? input.capabilities.environment === 'preview' && input.capabilities.qa.allowPreviewVerification
        : input.capabilities.environment === 'test' && input.capabilities.qa.allowTestFixtureVerification;
      const adapterAllowed = input.kind === 'preview'
        ? input.capabilities.productVerifiers[input.product].preview
        : input.capabilities.productVerifiers[input.product].testFixture;
      if (!input.qaCapabilityEnabled || !environmentAllowed || !adapterAllowed || event.source !== 'mock' || event.status !== 'verified') {
        return { status:'verifier_unavailable', product:input.product, verifierKind:input.kind, label };
      }
      return { status:'verified', event, verifierKind:input.kind, label };
    },
  };
}
