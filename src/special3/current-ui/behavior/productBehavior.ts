import { productActions, productData, productPresentationProvider } from '../../providers/products';
import type { PaymentToken } from '../../../lib/types';
import type { EidAcquisitionQuote, EidAvailabilityStatus } from '../../products/eid/eidProtocol';
import type { EraSuggestionInput, EraVoteChoice } from '../../products/era/eraProtocol';

export type BehaviorKey =
  | 'generator.generate' | 'generator.sell' | 'generator.burn' | 'generator.donate' | 'generator.transfer'
  | 'economy.swap'
  | 'fan.join' | 'fan.upgrade' | 'fan.renewal'
  | 'forecast.enter'
  | 'shield.mint' | 'shield.buyback' | 'shield.inheritance' | 'shield.detail-action'
  | 'stock.buy' | 'stock.transfer' | 'stock.complete'
  | 'era.vote';

export interface BehaviorDraft {
  key: BehaviorKey;
  amount: number;
  token: string;
  secondary?: string;
  receiveToken?: string;
  metadata?: Record<string, unknown>;
}

export interface PreparedBehaviorIntent extends BehaviorDraft {
  providerMode: 'preview' | 'live';
  providerSource: string;
  reviewRows: Array<{ label: string; value: string }>;
  providerPayload?: Record<string, unknown>;
}

export interface BehaviorExecutionResult {
  txHash?: string;
  resultLabel: string;
  raw: unknown;
}

const payment = (value: string): PaymentToken => value as PaymentToken;

export async function prepareBehaviorIntent(draft: BehaviorDraft): Promise<PreparedBehaviorIntent> {
  const base: PreparedBehaviorIntent = {
    ...draft,
    providerMode: productPresentationProvider.mode,
    providerSource: productPresentationProvider.available
      ? `${productPresentationProvider.mode} Product provider`
      : productPresentationProvider.reason ?? 'Product provider unavailable',
    reviewRows: [
      { label: 'Amount', value: String(draft.amount) },
      { label: 'Token', value: draft.token },
      ...(draft.secondary ? [{ label: 'Target', value: draft.secondary }] : []),
      ...(draft.receiveToken ? [{ label: 'Receive token', value: draft.receiveToken }] : []),
    ],
  };

  if (!productPresentationProvider.available) throw new Error(base.providerSource);

  if (draft.key === 'economy.swap') {
    const toToken = payment(draft.receiveToken ?? draft.secondary ?? 'ETER');
    const quote = await productActions.swap.getQuote(payment(draft.token), toToken, draft.amount);
    return {
      ...base,
      providerPayload: { toToken, quote },
      reviewRows: [...base.reviewRows, { label: 'Provider quote', value: `${quote.toAmount} ${toToken}` }, { label: 'Price impact', value: `${quote.priceImpact}%` }],
    };
  }

  if (draft.key.startsWith('fan.')) {
    const operation = draft.key === 'fan.join' ? 'join' : draft.key === 'fan.upgrade' ? 'upgrade' : 'renew';
    const context = productData.fanProtocolContext;
    if (!context) throw new Error('FanCommunity provider context is unavailable.');
    const target = operation === 'join' ? (draft.metadata?.indie ? 'indie' : 1) : operation === 'upgrade' ? Math.min(4, context.membership.fanStar + 1) as 1 | 2 | 3 | 4 : context.membership.fanStar;
    const referralCode = typeof draft.secondary === 'string' && draft.secondary.trim() ? draft.secondary.trim() : null;
    const { quote } = await productActions.fan.quoteFanMembership({ operation, target, referralCode });
    if (!quote.eligible) throw new Error(quote.reason ?? 'FanCommunity provider reports this action as ineligible.');
    return {
      ...base,
      amount: quote.amountETER,
      token: 'ETER',
      providerPayload: { quote, target, referralCode },
      reviewRows: [
        { label: 'Provider quote', value: `${quote.amountETER} ETER` },
        { label: 'Quote identity', value: `${quote.id} · v${quote.version}` },
        { label: 'Target', value: String(target) },
      ],
    };
  }

  return base;
}

export async function executePreparedIntent(intent: PreparedBehaviorIntent): Promise<BehaviorExecutionResult> {
  const { key, amount, token, secondary, receiveToken, providerPayload, metadata } = intent;
  let raw: unknown;

  if (key === 'generator.generate') raw = await productActions.generator.buyETER({ amount, paymentToken: payment(token) });
  else if (key === 'generator.sell') raw = await productActions.generator.sellETER({ amount });
  else if (key === 'generator.burn') raw = await productActions.generator.burnETER({ amount });
  else if (key === 'generator.donate') raw = await productActions.generator.donate({ amount, token: payment(token) });
  else if (key === 'generator.transfer') raw = await productActions.generator.transferETER({ to: secondary ?? '', amount });
  else if (key === 'economy.swap') raw = await productActions.swap.swap(payment(token), payment(String(providerPayload?.toToken ?? receiveToken ?? 'ETER')), amount);
  else if (key === 'fan.join') {
    const quote = providerPayload?.quote as { id: string; version: number; amountETER: number };
    raw = await productActions.fan.joinFan({ expectedQuoteId: quote.id, expectedQuoteVersion: quote.version, expectedAmountETER: quote.amountETER, target: providerPayload?.target as 1 | 2 | 3 | 'indie', referralCode: providerPayload?.referralCode as string | null });
  } else if (key === 'fan.upgrade') {
    const quote = providerPayload?.quote as { id: string; version: number; amountETER: number };
    raw = await productActions.fan.upgradeFanRank({ expectedQuoteId: quote.id, expectedQuoteVersion: quote.version, expectedAmountETER: quote.amountETER });
  } else if (key === 'fan.renewal') {
    const quote = providerPayload?.quote as { id: string; version: number; amountETER: number };
    raw = await productActions.fan.renewFan({ expectedQuoteId: quote.id, expectedQuoteVersion: quote.version, expectedAmountETER: quote.amountETER });
  } else if (key === 'forecast.enter') {
    const context = productData.forecastProtocolContext;
    if (!context) throw new Error('Forecast provider context is unavailable.');
    const values = Array.isArray(metadata?.numbers) ? metadata.numbers.map(String) : [];
    if (values.length !== 5) throw new Error('Five provider-valid prediction values are required.');
    const quote = context.quote;
    raw = await productActions.forecast.enterForecast({
      mode: 'standard',
      predictions: [{ white1: values[0], white2: values[1], white3: values[2], golden: values[3], blue: values[4] }],
      paymentAsset: payment(token) as 'USDT' | 'ETER' | 'ET',
      paymentAmount: amount,
      expectedQuote: { id: quote.id, usdFee: quote.usdFee, asset: payment(token) as 'USDT' | 'ETER' | 'ET', total: amount },
    });
  } else if (key === 'shield.mint') raw = await productActions.shield.buyShield({ tier: String(metadata?.tier ?? 'balanced'), amount, paymentToken: payment(token) });
  else if (key === 'shield.buyback') raw = await productActions.shield.runShieldAction({ tokenId: String(metadata?.tokenId ?? '1042'), action: 'buyback', paymentToken: payment(token), receiveToken: payment(receiveToken ?? 'ETER') });
  else if (key === 'shield.inheritance') raw = await productActions.shield.setInheritance({ tokenId: String(metadata?.tokenId ?? '1042'), beneficiary: secondary ?? '' });
  else if (key === 'shield.detail-action') raw = await productActions.shield.runShieldAction({ tokenId: String(metadata?.tokenId ?? '1042'), action: String(metadata?.action ?? 'reserve'), receiver: secondary, amount, paymentToken: payment(token), receiveToken: receiveToken ? payment(receiveToken) : undefined });
  else if (key === 'stock.buy') raw = await productActions.stock.buyStocks({ quantity: Math.max(1, Number(metadata?.quantity ?? 1)), initialPaymentETER: amount, recipient: secondary || undefined });
  else if (key === 'stock.transfer') raw = await productActions.stock.transferStocks({ tokenIds: Array.isArray(metadata?.tokenIds) ? metadata.tokenIds.map(String) : [productData.stocks[0]?.tokenId ?? '#EES-0044'], to: secondary ?? '' });
  else if (key === 'stock.complete') raw = await productActions.stock.completeStock({ tokenId: String(metadata?.tokenId ?? productData.stocks[0]?.tokenId ?? '#EES-0044'), amountETER: amount });
  else if (key === 'era.vote') {
    const context = productData.eraProtocolContext;
    const proposal = context?.activeVote ?? context?.queue[0];
    if (!context || !proposal) throw new Error('ERA provider has no active proposal for this action.');
    raw = await productActions.era.vote({ proposalId: proposal.id, vote: token.toLowerCase() as EraVoteChoice, expectedVersion: proposal.version, expectedVotingPower: context.user.votingPower, expectedVotingCountAvailable: context.user.votingCountAvailable });
  } else throw new Error(`No authoritative behavior adapter is registered for ${key}.`);

  const txHash = typeof raw === 'object' && raw && 'txHash' in raw ? String((raw as { txHash?: unknown }).txHash ?? '') : undefined;
  return { txHash, resultLabel: txHash ? `Provider accepted · ${txHash}` : 'Provider accepted the action.', raw };
}

export async function checkAndQuoteEid(name: string, paymentAsset: PaymentToken): Promise<{
  canonicalName: string;
  status: EidAvailabilityStatus;
  source: string;
  freshness: string;
  quote?: EidAcquisitionQuote;
}> {
  if (!productPresentationProvider.available) throw new Error(productPresentationProvider.reason ?? 'EID provider unavailable.');
  const availability = await productActions.eid.checkEidAvailability({ name });
  if (availability.status !== 'available') return availability;
  const quote = await productActions.eid.quoteEidAcquisition({ name, paymentAsset });
  return { ...availability, quote };
}

export async function acquireQuotedEid(quote: EidAcquisitionQuote, paymentAsset: PaymentToken) {
  return productActions.eid.acquireEid({
    name: quote.canonicalName,
    expectedQuoteId: quote.quoteId,
    expectedVersion: quote.version,
    expectedExpiresAt: quote.expiresAt,
    expectedAcquisitionOrdinal: quote.acquisitionOrdinal,
    paymentAsset,
    expectedPaymentLegs: quote.paymentLegs,
    expectedFinalPriceUsd: quote.finalPriceUsd,
    expectedNetworkFeeResponsibility: quote.networkFeeResponsibility,
  });
}

export async function sendFanMessage(recipientId: string, body: string) {
  const context = productData.fanProtocolContext;
  if (!context) throw new Error('FanCommunity provider context is unavailable.');
  if (context.network.messagingCapability === 'unavailable') throw new Error('FanCommunity messaging is unavailable from this provider.');
  return productActions.fan.sendFanCommunityMessage({ recipientId, body, expectedNetworkSource: context.network.source });
}

export async function submitEraSuggestion(input: EraSuggestionInput) {
  return productActions.era.createSuggestion(input);
}

export function influenceFromAuthoritativeState(): { invest: number; develop: number; learn: number; score: number; source: string } | null {
  const progress = productData.user.achievementProgress as (typeof productData.user.achievementProgress & { influence?: { invest?: number; develop?: number; learn?: number } }) | undefined;
  const axes = progress?.influence;
  if (!axes || ![axes.invest, axes.develop, axes.learn].every((value) => typeof value === 'number' && Number.isFinite(value))) return null;
  const invest = Number(axes.invest);
  const develop = Number(axes.develop);
  const learn = Number(axes.learn);
  return { invest, develop, learn, score: Math.round((invest + develop + learn) / 3), source: 'Achievement/Influence provider' };
}

export const behaviorAuthority = {
  providerMode: productPresentationProvider.mode,
  available: productPresentationProvider.available,
  sources: {
    generator: 'useGeneratorProductController / productActions.generator',
    shield: 'productActions.shield',
    eid: 'productActions.eid',
    fan: 'productActions.fan',
    forecast: 'productActions.forecast',
    stock: 'productActions.stock',
    era: 'productActions.era',
    economy: 'productActions.swap + Product read model',
  },
} as const;
