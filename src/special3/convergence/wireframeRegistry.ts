import { runtimeBindings, runtimeUrl } from './runtimeBindings';

/** Route-grounded registry used by runtime audit surfaces. */
export const wireframeRuntimeRegistry = runtimeBindings.map((binding)=>({
  wireframe_id:binding.wireframeId,
  runtime_url:runtimeUrl(binding),
  runtime_state:binding.state,
  runtime_component:binding.component,
  provider_or_action_owner:binding.owner,
}));

export type CanonicalWireframe = typeof wireframeRuntimeRegistry[number]['wireframe_id'];
