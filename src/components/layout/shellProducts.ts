import { EXPLORER_PRODUCTS } from '../../data/productRegistry';

const SHELL_HIDDEN_PRODUCT_IDS = new Set([
  'community', 'referral', 'levels-eq', 'readiness', 'safety-learning',
  'dao', 'voting', 'governance-history', 'qora-circles', 'qora-missions',
  'qora-history', 'qora-actions', 'passport', 'missions',
]);

/**
 * The shared list used by All Modules and workspace customization.
 * Keeping one source prevents a module from appearing in one surface but not the other.
 */
export const SHELL_PRODUCTS = EXPLORER_PRODUCTS.filter(
  (product) => !SHELL_HIDDEN_PRODUCT_IDS.has(product.id),
);
