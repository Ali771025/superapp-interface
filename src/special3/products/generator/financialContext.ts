export type GeneratorFinancialValueSource =
  | 'product-display-copy'
  | 'review-configuration'
  | 'product-calculation'
  | 'unavailable';

export type GeneratorFinancialAvailability = 'available' | 'display-only' | 'review-only' | 'unavailable';

export interface GeneratorFinancialContextField {
  id: 'protocol-fee' | 'network-fee' | 'gas-token' | 'network' | 'estimate-source' | 'freshness';
  label: string;
  value: string;
  source: GeneratorFinancialValueSource;
  availability: GeneratorFinancialAvailability;
  detail: string;
}

/**
 * Presentation-only classification of the financial copy already present in
 * the accepted Generator and Review surfaces. It does not calculate fees and
 * is never passed to the Product adapter.
 */
export const GENERATOR_FINANCIAL_CONTEXT: readonly GeneratorFinancialContextField[] = [
  {
    id:'protocol-fee',
    label:'Protocol fee',
    value:'3%',
    source:'product-display-copy',
    availability:'display-only',
    detail:'Existing Generator Product copy; the current adapter does not expose a calculated fee value.',
  },
  {
    id:'network-fee',
    label:'Network fee',
    value:'Available at Review',
    source:'review-configuration',
    availability:'review-only',
    detail:'No authoritative Product-owned network-fee value is available before Review.',
  },
  {
    id:'gas-token',
    label:'Gas token',
    value:'POL',
    source:'review-configuration',
    availability:'review-only',
    detail:'The current Transaction Review configuration supplies POL.',
  },
  {
    id:'network',
    label:'Network',
    value:'Polygon',
    source:'review-configuration',
    availability:'available',
    detail:'The current Transaction Review and wallet stack are configured for Polygon.',
  },
  {
    id:'estimate-source',
    label:'Estimate source',
    value:'Transaction Review',
    source:'review-configuration',
    availability:'review-only',
    detail:'The estimate becomes visible only inside the protected Review boundary.',
  },
  {
    id:'freshness',
    label:'Fee freshness',
    value:'Unavailable before Review',
    source:'unavailable',
    availability:'unavailable',
    detail:'No Product quote timestamp or live gas freshness source exists on the Action form.',
  },
] as const;

export function generatorFinancialContextById(id: GeneratorFinancialContextField['id']) {
  return GENERATOR_FINANCIAL_CONTEXT.find((field) => field.id === id)!;
}
