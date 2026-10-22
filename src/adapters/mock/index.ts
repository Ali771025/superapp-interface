export { eesAdapter } from './eesAdapter';
export { eidAdapter } from './eidAdapter';
export { eraAdapter } from './eraAdapter';
export { fanAdapter } from './fanAdapter';
export { forecastAdapter } from './forecastAdapter';
export { generatorAdapter } from './generatorAdapter';
export { insuranceAdapter } from './insuranceAdapter';
export { qoraAdapter } from './qoraAdapter';
export { swapAdapter } from './swapAdapter';

export const mockAdapterDescriptor = {
  mode: 'mock',
  audited: false,
  sourceOfTruth: 'fixture',
} as const;
