import { runtimeBindings, runtimeUrl } from './runtimeBindings';

export const canonicalRuntimeEvidenceRegistry = runtimeBindings.map((binding) => ({
  ...binding,
  url: runtimeUrl(binding),
}));

declare global {
  interface Window {
    __ETERNITY_CANONICAL_RUNTIME_BINDINGS__?: typeof canonicalRuntimeEvidenceRegistry;
  }
}

if (typeof window !== 'undefined') {
  window.__ETERNITY_CANONICAL_RUNTIME_BINDINGS__ = canonicalRuntimeEvidenceRegistry;
}
