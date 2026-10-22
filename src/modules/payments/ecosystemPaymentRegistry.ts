import type { PaymentToken } from '../../lib/types';

export type EcosystemPaymentRegistry = {
  enabledPaymentAssets: readonly PaymentToken[];
  source: 'ecosystem-token-registry';
  freshness: 'fresh';
};

const ENABLED_ECOSYSTEM_PAYMENT_ASSETS: readonly PaymentToken[] = Object.freeze([
  'USDT',
  'ETER',
  'ET',
  'Q',
]);

export function readEcosystemPaymentRegistry(): EcosystemPaymentRegistry {
  return {
    enabledPaymentAssets: ENABLED_ECOSYSTEM_PAYMENT_ASSETS,
    source: 'ecosystem-token-registry',
    freshness: 'fresh',
  };
}

export function isEcosystemPaymentAsset(value: PaymentToken): value is PaymentToken {
  return ENABLED_ECOSYSTEM_PAYMENT_ASSETS.includes(value);
}
