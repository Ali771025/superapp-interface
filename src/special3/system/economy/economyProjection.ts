import type { PaymentToken } from '../../../lib/types';
import { special3SystemProvider, type SpecialTransaction } from '../../providers';
import { productData, productPresentationProvider } from '../../providers/products';
import type { ForecastClaimGuard } from '../../products/forecast/forecastProtocol';
import { normalizeShieldTokenId } from '../../products/shield/shieldVisuals';

export type EconomyMode = 'preview' | 'live';
export type EconomyClass = 'prize' | 'reward' | 'income' | 'distribution' | 'progression' | 'campaign' | 'periodic-seasonal';
export type EconomyCapability = 'none' | 'navigate' | 'check' | 'review' | 'claim' | 'withdraw' | 'transfer' | 'manage' | 'swap';
export type EconomyExecutor = 'Generator' | 'EID' | 'FAN' | 'Forecast' | 'SHIELD' | 'STOCK' | 'Swap' | 'none';
export type SegmentState = 'ready' | 'unavailable';

export type EconomyDelegatedOperation =
  | { kind:'forecast-prize-check' }
  | { kind:'forecast-prize-withdraw'; guard:ForecastClaimGuard }
  | { kind:'forecast-contributor-check' }
  | { kind:'forecast-contributor-withdraw'; guard:ForecastClaimGuard }
  | { kind:'shield-reward-claim'; tokenId:string; compoundIdentity:string }
  | { kind:'stock-income-check' }
  | { kind:'stock-income-withdraw'; expected:{ expectedAmount:number; expectedToken:string } };

export interface EconomySourceSegment {
  id: 'portfolio' | 'tokens' | 'eid' | 'shield' | 'stock' | 'prize' | 'reward' | 'activity';
  state: SegmentState;
  source: string;
  detail: string;
}

export interface EconomyTokenAsset {
  symbol: PaymentToken;
  name: string;
  balance: number;
  usdValue: number;
  operationRoute: string;
  operationLabel: string;
}

export interface EconomyNftAsset {
  id: string;
  kind: 'EID' | 'SHIELD' | 'STOCK';
  label: string;
  detail: string;
  owningProductRoute: string;
  capability: Extract<EconomyCapability, 'manage' | 'navigate'>;
  executorOwner: Extract<EconomyExecutor, 'EID' | 'SHIELD' | 'STOCK'>;
  image?: string;
}

export interface EconomyClassifiedItem {
  id: string;
  economicClass: EconomyClass;
  product: string;
  title: string;
  status: string;
  eligibility: 'eligible' | 'ineligible' | 'unknown' | 'unavailable';
  amount?: number;
  token?: string;
  cycle?: string;
  checkDeadline?: string;
  withdrawDeadline?: string;
  providerReference?: string;
  sourceMode: EconomyMode;
  sourceEvidence: string;
  owningProductRoute: string;
  capability: EconomyCapability;
  executorOwner: EconomyExecutor;
  operation?: EconomyDelegatedOperation;
}

export interface EconomyProgramAvailability {
  economicClass: Extract<EconomyClass, 'campaign' | 'periodic-seasonal'>;
  state: 'unavailable';
  detail: string;
}

export interface EconomyProjection {
  mode: EconomyMode;
  portfolioValue: number | null;
  tokenAssets: EconomyTokenAsset[];
  nftAssets: EconomyNftAsset[];
  prizeItems: EconomyClassifiedItem[];
  rewardItems: EconomyClassifiedItem[];
  unavailablePrograms: EconomyProgramAvailability[];
  activity: SpecialTransaction[];
  sources: EconomySourceSegment[];
  actionableItems: number | null;
}

const unavailable = (id: EconomySourceSegment['id'], detail: string): EconomySourceSegment => ({ id, state:'unavailable', source:'Live provider', detail });
const ready = (id: EconomySourceSegment['id'], source: string, detail: string): EconomySourceSegment => ({ id, state:'ready', source, detail });
const actionCapabilities = new Set<EconomyCapability>(['check','review','claim','withdraw']);
const claimGuard = (claim: { claimId:string; version:number; scope:ForecastClaimGuard['scope']; entryId?:string; entitlement?:ForecastClaimGuard['expectedEntitlement'] }): ForecastClaimGuard | undefined => claim.entitlement ? ({ claimId:claim.claimId, version:claim.version, scope:claim.scope, entryId:claim.entryId, expectedEntitlement:claim.entitlement }) : undefined;

export function economyShieldIdentity(shield: { priceGroup:number; batchCode?:string; tokenId:string }): string {
  return `${shield.priceGroup}:${shield.batchCode?.trim() || 'batch-unavailable'}:${normalizeShieldTokenId(shield.tokenId)}`;
}

export function buildEconomyProjection(mode: EconomyMode): EconomyProjection {
  if (mode === 'live' || !productPresentationProvider.available) {
    const detail = 'Verified Economy segment provider is not configured. Preview fixtures are never promoted into Live truth.';
    return {
      mode:'live', portfolioValue:null, tokenAssets:[], nftAssets:[], prizeItems:[], rewardItems:[], activity:[], actionableItems:null,
      unavailablePrograms:[
        { economicClass:'campaign', state:'unavailable', detail:'No authoritative Campaign Reward provider is connected.' },
        { economicClass:'periodic-seasonal', state:'unavailable', detail:'No authoritative Periodic or Seasonal Reward provider is connected.' },
      ],
      sources:['portfolio','tokens','eid','shield','stock','prize','reward','activity'].map((id) => unavailable(id as EconomySourceSegment['id'], detail)),
    };
  }

  const economy = special3SystemProvider.economy();
  const activity = special3SystemProvider.transactions();
  const eidContext = productData.eidProtocolContext;
  const fanContext = productData.fanProtocolContext;
  const forecastContext = productData.forecastProtocolContext;
  const stockContext = productData.stockProtocolContext;
  const shieldTokenCounts = new Map<string,number>();
  for (const shield of productData.shields ?? []) shieldTokenCounts.set(shield.tokenId, (shieldTokenCounts.get(shield.tokenId) ?? 0) + 1);
  const tokenAssets: EconomyTokenAsset[] = (economy.data?.tokens ?? []).map((token) => ({
    symbol:token.symbol as PaymentToken,
    name:token.name,
    balance:token.balance,
    usdValue:token.usdValue,
    operationRoute:token.symbol === 'ETER' ? '/generator' : `/swap?from=${token.symbol}`,
    operationLabel:token.symbol === 'ETER' ? 'Open Generator operations' : 'Open Swap',
  }));

  const nftAssets: EconomyNftAsset[] = [
    ...(eidContext?.owned ?? []).map((eid) => ({ id:eid.id, kind:'EID' as const, label:eid.name, detail:`Token ${eid.tokenId} · ${eid.active ? 'Active identity' : 'Owned identity'}`, owningProductRoute:'/eid/my-names', capability:'manage' as const, executorOwner:'EID' as const })),
    ...(productData.shields ?? []).map((shield) => { const identity=economyShieldIdentity(shield); return ({ id:`shield-${identity}`, kind:'SHIELD' as const, label:`SHIELD ${normalizeShieldTokenId(shield.tokenId)}`, detail:`$${shield.priceGroup.toLocaleString()} · ${shield.batchCode ?? 'Batch unavailable'} · ${shield.lifecycleState ?? shield.status}`, owningProductRoute:'/shield/my-shields', capability:'manage' as const, executorOwner:'SHIELD' as const }); }),
    ...(productData.stocks ?? []).map((stock) => ({ id:`stock-${stock.tokenId}`, kind:'STOCK' as const, label:`STOCK ${stock.tokenId}`, detail:`${stock.multiplier}X · ${stock.fundingState}`, owningProductRoute:`/stock/my-stock?tokenId=${encodeURIComponent(stock.tokenId)}`, capability:'manage' as const, executorOwner:'STOCK' as const })),
  ];

  const prizeItems: EconomyClassifiedItem[] = [];
  for (const pool of fanContext?.rewards.prizePools ?? []) prizeItems.push({
    id:`fan-${pool.id}`, economicClass:'prize', product:'FAN', title:pool.name, status:pool.qualification,
    eligibility:pool.qualification === 'qualified' ? 'eligible' : pool.qualification === 'not-qualified' ? 'ineligible' : 'unknown',
    amount:pool.entitlementETER, token:pool.entitlementETER === undefined ? undefined : 'ETER', cycle:`${pool.sharePercent}% source pool`,
    sourceMode:'preview', sourceEvidence:'FAN provider prizePools classification', owningProductRoute:'/fan/prize-pools', capability:'navigate', executorOwner:'FAN',
  });
  if (forecastContext) {
    const claim = forecastContext.claim;
    const guard = claimGuard(claim);
    const operation: EconomyDelegatedOperation | undefined = claim.phase === 'check' && claim.status === 'unchecked' ? { kind:'forecast-prize-check' } : claim.phase === 'withdraw' && claim.status === 'withdrawable' && guard ? { kind:'forecast-prize-withdraw', guard } : undefined;
    const capability: EconomyCapability = operation?.kind === 'forecast-prize-check' ? 'check' : operation?.kind === 'forecast-prize-withdraw' ? 'withdraw' : 'navigate';
    prizeItems.push({
      id:`forecast-${claim.claimId}`, economicClass:'prize', product:'Forecast', title:'Weekly Prize', status:claim.status,
      eligibility:claim.status === 'not-winner' || claim.status === 'forfeited' ? 'ineligible' : claim.entitlement ? 'eligible' : 'unknown',
      amount:claim.entitlement?.amount, token:claim.entitlement?.token, cycle:`Week ${forecastContext.week.weekNumber}`,
      checkDeadline:claim.checkWindow.closesAt, withdrawDeadline:claim.withdrawWindow.closesAt, providerReference:`${claim.claimId} · v${claim.version}`,
      sourceMode:'preview', sourceEvidence:'Forecast provider claim object explicitly identifies Prize', owningProductRoute:'/forecast/rewards', capability, executorOwner:'Forecast', operation,
    });
  }
  for (const shield of productData.shields ?? []) {
    const identity = economyShieldIdentity(shield);
    if (shield.olympicPrize === undefined && shield.eternalPrize === undefined) continue;
    if (shield.olympicPrize !== undefined) prizeItems.push({ id:`shield-olympic-${identity}`, economicClass:'prize', product:'SHIELD', title:'OLYMPIC Prize', status:'provider projection', eligibility:'unknown', amount:shield.olympicPrize, token:'ETER', providerReference:identity, sourceMode:'preview', sourceEvidence:'SHIELD olympicPrize field', owningProductRoute:'/shield/rewards', capability:'navigate', executorOwner:'SHIELD' });
    if (shield.eternalPrize !== undefined) prizeItems.push({ id:`shield-eternal-${identity}`, economicClass:'prize', product:'SHIELD', title:'ETERNAL Prize', status:'provider projection', eligibility:'unknown', amount:shield.eternalPrize, token:'ETER', providerReference:identity, sourceMode:'preview', sourceEvidence:'SHIELD eternalPrize field', owningProductRoute:'/shield/rewards', capability:'navigate', executorOwner:'SHIELD' });
  }

  const rewardItems: EconomyClassifiedItem[] = [{
    id:'achievement-personal-eq', economicClass:'progression', product:'Achievement', title:'Verified Personal EQ', status:'ledger-only · not wallet-claimable', eligibility:'unavailable', sourceMode:'preview', sourceEvidence:'Achievement progression ledger; exact committed entries remain provider-owned', owningProductRoute:'/achievements', capability:'navigate', executorOwner:'none',
  },{
    id:'achievement-non-eq-resolution', economicClass:'reward', product:'Achievement', title:'Non-EQ Achievement Reward', status:'requires-protocol-resolution', eligibility:'unavailable', sourceMode:'preview', sourceEvidence:'Reward resolution ledger has no authoritative effect mapping', owningProductRoute:'/achievements', capability:'none', executorOwner:'none',
  }];
  if (forecastContext) {
    const contributor = forecastContext.contributor;
    const guard = claimGuard(contributor.claim);
    const operation: EconomyDelegatedOperation | undefined = contributor.eligible && contributor.claim.phase === 'check' && contributor.claim.status === 'unchecked' ? { kind:'forecast-contributor-check' } : contributor.eligible && contributor.claim.phase === 'withdraw' && contributor.claim.status === 'withdrawable' && guard ? { kind:'forecast-contributor-withdraw', guard } : undefined;
    const capability: EconomyCapability = operation?.kind === 'forecast-contributor-check' ? 'check' : operation?.kind === 'forecast-contributor-withdraw' ? 'withdraw' : 'navigate';
    rewardItems.push({ id:`forecast-contributor-${contributor.claim.claimId}`, economicClass:'reward', product:'Forecast', title:'Contributor Reward', status:contributor.claim.status, eligibility:contributor.eligible ? 'eligible' : 'ineligible', amount:contributor.claim.entitlement?.amount ?? contributor.entitlement?.amount, token:contributor.claim.entitlement?.token ?? contributor.entitlement?.token, providerReference:`${contributor.claim.claimId} · v${contributor.claim.version}`, sourceMode:'preview', sourceEvidence:'Forecast contributor provider state explicitly identifies Reward', owningProductRoute:'/forecast/contributor', capability, executorOwner:'Forecast', operation });
  }
  for (const shield of productData.shields ?? []) if (shield.claimableReward !== undefined || shield.rewardState) {
    const identity = economyShieldIdentity(shield);
    const exactExecutor = shield.rewardState === 'claimable' && shield.claimableReward !== undefined && shieldTokenCounts.get(shield.tokenId) === 1;
    rewardItems.push({ id:`shield-reward-${identity}`, economicClass:'reward', product:'SHIELD', title:`SHIELD ${normalizeShieldTokenId(shield.tokenId)} Reward`, status:shield.rewardState ?? 'unavailable', eligibility:shield.rewardState === 'eligible' || shield.rewardState === 'claimable' ? 'eligible' : shield.rewardState === 'unavailable' ? 'unavailable' : 'unknown', amount:shield.claimableReward, token:shield.claimableReward === undefined ? undefined : 'ETER', providerReference:identity, sourceMode:'preview', sourceEvidence:'SHIELD rewardState / claimableReward provider fields', owningProductRoute:'/shield/rewards', capability:exactExecutor ? 'claim' : 'navigate', executorOwner:'SHIELD', operation:exactExecutor ? { kind:'shield-reward-claim', tokenId:shield.tokenId, compoundIdentity:identity } : undefined });
  }
  if (stockContext?.income) {
    const entitlement = stockContext.income.withdrawableEntitlement ?? stockContext.income.checkedEntitlement;
    const operation: EconomyDelegatedOperation | undefined = stockContext.income.window === 'check' ? { kind:'stock-income-check' } : stockContext.income.window === 'withdraw' && entitlement ? { kind:'stock-income-withdraw', expected:{ expectedAmount:entitlement.amount, expectedToken:entitlement.token } } : undefined;
    rewardItems.push({ id:'stock-income', economicClass:'income', product:'STOCK', title:'Biannual Stock Income', status:stockContext.income.window, eligibility:stockContext.income.window === 'closed' ? 'unavailable' : 'eligible', amount:entitlement?.amount, token:entitlement?.token, cycle:'Biannual income', sourceMode:'preview', sourceEvidence:'STOCK income provider context; never reclassified as Prize', owningProductRoute:'/stock/income', capability:operation?.kind === 'stock-income-check' ? 'check' : operation?.kind === 'stock-income-withdraw' ? 'withdraw' : 'navigate', executorOwner:'STOCK', operation });
  }

  const actionableItems = [...prizeItems, ...rewardItems].filter((item) => actionCapabilities.has(item.capability)).length;
  return {
    mode:'preview', portfolioValue:economy.data?.portfolio.total ?? null, tokenAssets, nftAssets, prizeItems, rewardItems,
    unavailablePrograms:[
      { economicClass:'campaign', state:'unavailable', detail:'No authoritative Campaign Reward provider is connected. No campaign data is fabricated.' },
      { economicClass:'periodic-seasonal', state:'unavailable', detail:'No authoritative Periodic or Seasonal Reward provider is connected. No schedule or amount is fabricated.' },
    ],
    activity:activity.data ?? [], actionableItems,
    sources:[
      economy.data ? ready('portfolio','System portfolio provider',economy.detail) : unavailable('portfolio',economy.detail),
      tokenAssets.length ? ready('tokens','System token registry/provider','Enabled liquid assets with source balances.') : unavailable('tokens','Token provider returned no records.'),
      eidContext ? ready('eid','EID V4 Product provider',eidContext.source.detail) : unavailable('eid','EID Product projection unavailable.'),
      ready('shield','Frozen SHIELD Product provider','Owned SHIELD positions composed without generic transfer.'),
      ready('stock','Frozen STOCK Product provider','Owned Stock positions use productData.stocks; legacy mockEESStocks is not read.'),
      ready('prize','Explicit Product Prize projection','Only FAN, Forecast and SHIELD sources with explicit Prize semantics are classified.'),
      ready('reward','Achievement/Product Reward projection','Reward, progression and income retain distinct machine-readable classes.'),
      activity.data ? ready('activity','System economic activity provider',activity.detail) : unavailable('activity',activity.detail),
    ],
  };
}
