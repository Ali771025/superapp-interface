import { isSpecial3ShellEnabled } from '../shell/featureFlag';
import type { ProductPresentationContract } from '../interaction/types';
import { resolveProductPresentationEnabled } from './presentationConfig';
export { resolveProductPresentationEnabled } from './presentationConfig';

export type ProductPresentationStatus = 'legacy' | 'pilot' | 'special-candidate' | 'special-approved';
export type ProductParityStatus = 'legacy-baseline' | 'candidate' | 'verified' | 'approved';

export const PRODUCT_PRESENTATION_IDS = [
  'Generator', 'SHIELD', 'STOCK/EES', 'Forecast', 'FanCommunity', 'ERA', 'EID', 'EDGE', 'Swap',
] as const;

export type ProductPresentationId = typeof PRODUCT_PRESENTATION_IDS[number];

export interface ProductPresentationRegistration {
  product: ProductPresentationId;
  status: ProductPresentationStatus;
  specialPresentationAvailable: boolean;
  rollbackAvailable: boolean;
  approvedVisualReferenceVersion: string | null;
  parityStatus: ProductParityStatus;
}

export const PRODUCT_PRESENTATION_REGISTRY: Readonly<Record<ProductPresentationId, ProductPresentationRegistration>> = {
  Generator: {
    product:'Generator', status:'special-approved', specialPresentationAvailable:true, rollbackAvailable:true,
    approvedVisualReferenceVersion:'phase-05.1-generator-approved', parityStatus:'approved',
  },
  SHIELD: approved('SHIELD', 'phase-06.2-shield-stock-approved'),
  'STOCK/EES': approved('STOCK/EES', 'phase-06.2-shield-stock-approved'),
  Forecast: { product:'Forecast', status:'special-candidate', specialPresentationAvailable:true, rollbackAvailable:true, approvedVisualReferenceVersion:null, parityStatus:'verified' },
  FanCommunity: { product:'FanCommunity', status:'special-candidate', specialPresentationAvailable:true, rollbackAvailable:false, approvedVisualReferenceVersion:null, parityStatus:'verified' },
  ERA: { product:'ERA', status:'special-candidate', specialPresentationAvailable:true, rollbackAvailable:false, approvedVisualReferenceVersion:null, parityStatus:'verified' },
  EID: { product:'EID', status:'special-candidate', specialPresentationAvailable:true, rollbackAvailable:false, approvedVisualReferenceVersion:null, parityStatus:'verified' },
  EDGE: approved('EDGE', 'phase-08.3-edge-approved-final'),
  Swap: approved('Swap', 'phase-08.2-swap-approved'),
};

function approved(product: ProductPresentationId, reference: string): ProductPresentationRegistration {
  return { product, status:'special-approved', specialPresentationAvailable:true, rollbackAvailable:true, approvedVisualReferenceVersion:reference, parityStatus:'approved' };
}

export function getProductPresentationRegistration(product: ProductPresentationId) {
  return PRODUCT_PRESENTATION_REGISTRY[product];
}

export function isSpecialProductPresentationEnabled(product: ProductPresentationId) {
  const registration = getProductPresentationRegistration(product);
  if (!isSpecial3ShellEnabled() || !registration.specialPresentationAvailable) return false;
  if (product === 'Generator') return resolveProductPresentationEnabled(true, import.meta.env.VITE_SPECIAL3_GENERATOR_PRESENTATION);
  if (product === 'SHIELD') return resolveProductPresentationEnabled(true, import.meta.env.VITE_SPECIAL3_SHIELD_PRESENTATION);
  if (product === 'STOCK/EES') return resolveProductPresentationEnabled(true, import.meta.env.VITE_SPECIAL3_STOCK_PRESENTATION);
  if (product === 'Forecast') return resolveProductPresentationEnabled(true, import.meta.env.VITE_SPECIAL3_FORECAST_PRESENTATION);
  if (product === 'FanCommunity') return true; // Phase10.4: SPECIAL shell cannot roll current Fan truth back to stale legacy finance.
  if (product === 'ERA') return true; // Phase11: owner protocol truth cannot roll back to stale legacy governance.
  if (product === 'EID') return true; // Phase12: EID v4 truth cannot roll back to stale legacy pricing, invite, or marketplace semantics.
  if (product === 'Swap') return resolveProductPresentationEnabled(true, import.meta.env.VITE_SPECIAL3_SWAP_PRESENTATION);
  if (product === 'EDGE') return resolveProductPresentationEnabled(true, import.meta.env.VITE_SPECIAL3_EDGE_PRESENTATION);
  return false;
}

export interface PresentationRouteRegistration {
  route: string;
  contract: ProductPresentationContract;
}

const overview = (accentGroup?: string): ProductPresentationContract => ({
  pageTemplate:'overview', shellMode:'compact', contentWidth:'wide', localNav:'navigation', qoraOwnership:'shell',
  titleOwnership:'shell', sourceDisclosure:'product', verifyModel:'none', resultModel:'status', accentGroup,
});
const action = (accentGroup?: string, verifyModel: ProductPresentationContract['verifyModel'] = 'product-specific'): ProductPresentationContract => ({
  pageTemplate:'action', shellMode:'focus', contentWidth:'standard', localNav:'contextual', qoraOwnership:'compact',
  titleOwnership:'shell', sourceDisclosure:'contextual', verifyModel, resultModel:'receipt', accentGroup,
});
const system = (pageTemplate: ProductPresentationContract['pageTemplate'] = 'system'): ProductPresentationContract => ({
  pageTemplate, shellMode:'compact', contentWidth:pageTemplate === 'learning' ? 'narrow' : 'wide', localNav:'contextual', qoraOwnership:'shell',
  titleOwnership:'shell', sourceDisclosure:'global-only', verifyModel:'none', resultModel:'none',
});

/** Explicit route metadata. Parameter segments use :name and are matched one path segment at a time. */
export const PRESENTATION_ROUTE_CONTRACTS: readonly PresentationRouteRegistration[] = [
  { route:'/', contract:{ ...system('overview'), shellMode:'guide' } },
  { route:'/welcome', contract:{ ...system('overview'), shellMode:'guide' } },
  { route:'/journey', contract:{ ...system('overview'), shellMode:'guide' } },
  { route:'/qora', contract:{ ...system('system'), shellMode:'guide', qoraOwnership:'none' } },
  ...['/economy','/assets','/progress','/transactions','/notifications','/settings','/leaderboard','/earn','/help','/contract-details'].map((route) => ({ route, contract:system() })),
  { route:'/generator', contract:overview('generator') },
  ...['/generator/generate','/generator/sell','/generator/burn','/generator/donate','/generator/transfer'].map((route) => ({ route, contract:action('generator','financial') })),
  { route:'/generator/history', contract:overview('generator') },
  ...['/fan','/fan/referrals','/fan/network','/fan/status','/fan/income','/fan/rewards','/fan/prize-pools','/fan/legion','/fan/indie','/fan/access'].map((route) => ({ route, contract:overview('fan') })),
  ...['/fan/join','/fan/upgrade','/fan/renewal'].map((route) => ({ route, contract:action('fan','financial') })),
  ...['/forecast','/forecast/my-forecasts','/forecast/rewards','/forecast/contributor','/forecast/pools','/forecast/tickets','/forecast/results','/forecast/current','/forecast/history','/forecast/treasury','/forecast/claim','/forecast/savior'].map((route) => ({ route, contract:overview('forecast') })),
  { route:'/forecast/enter', contract:action('forecast','financial') },
  ...['/shield','/shield/my-shields','/shield/:id','/shield/rewards','/shield/activity','/shield/status'].map((route) => ({ route, contract:overview('shield') })),
  ...['/shield/mint','/shield/inheritance','/shield/buyback'].map((route) => ({ route, contract:action('shield','financial') })),
  ...['/stock','/stock/my-stock','/stock/status','/stock/history','/stock/metadata','/stock/prize','/stock/dividends','/stock/income'].map((route) => ({ route, contract:overview('stock') })),
  ...['/stock/buy','/stock/transfer'].map((route) => ({ route, contract:action('stock','financial') })),
  ...['/era','/era/proposals','/era/proposals/:id','/era/elite'].map((route) => ({ route, contract:overview('era') })),
  ...['/era/create','/era/vote'].map((route) => ({ route, contract:action('era','governance') })),
  ...['/eid','/eid/my-names','/eid/active','/eid/invite','/eid/settings','/eid/market','/eid/:eidName'].map((route) => ({ route, contract:overview('eid') })),
  ...['/eid/search','/eid/mint'].map((route) => ({ route, contract:action('eid','identity') })),
  { route:'/swap', contract:action('swap','financial') },
  ...['/readiness','/certificates','/trust-score','/profile/certificates','/profile/trust-score'].map((route) => ({ route, contract:{ ...system('learning'), accentGroup:'edge' } })),
] as const;

const fallbackContract: ProductPresentationContract = system();

function routeMatches(pattern: string, pathname: string) {
  const expected = pattern.split('/').filter(Boolean);
  const actual = pathname.split('/').filter(Boolean);
  return expected.length === actual.length && expected.every((part, index) => part.startsWith(':') || part === actual[index]);
}

export function getPresentationContractForRoute(pathname: string): ProductPresentationContract {
  return PRESENTATION_ROUTE_CONTRACTS.find((entry) => routeMatches(entry.route, pathname))?.contract ?? fallbackContract;
}
