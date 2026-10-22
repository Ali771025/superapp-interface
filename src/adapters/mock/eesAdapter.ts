import type { EESStock } from '../../lib/types';
import {
  STOCK_MULTIPLIERS,
  isStockIncomeEntitlement,
  validateStockPurchase,
  type StockProtocolContext,
  type StockIncomeEntitlement,
  type StockMultiplier,
  type StockPosition,
  stockPreviewContext,
  stockPreviewPositions,
} from '../../special3/products/stock/stockProtocol';

export interface BuyStocksInput {
  quantity: number;
  initialPaymentETER: number;
  recipient?: string;
}

export interface MintedStockResult {
  tokenId: string;
  multiplier: StockMultiplier;
  phase: 1 | 2;
  origin: 'Purchase' | 'Gift';
}

function previewFanStatus(address: string): boolean {
  const normalized = address.trim().toLowerCase();
  return /^0x[a-f0-9]{6,40}$/.test(normalized) && !normalized.includes('bad');
}

export const eesAdapter = {
  async getMyStocks(_address: string): Promise<EESStock[]> {
    return stockPreviewPositions;
  },

  async buyStock(params: { amount: number }): Promise<{ txHash: string; tokenId: string }> {
    const result = await this.buyStocks({ quantity: 1, initialPaymentETER: params.amount }, stockPreviewContext);
    return { txHash: result.txHash, tokenId: result.positions[0].tokenId };
  },

  async buyStocks(
    params: BuyStocksInput,
    authority?: StockProtocolContext,
  ): Promise<{ txHash: string; positions: MintedStockResult[] }> {
    if (!authority) throw new Error('Authoritative STOCK purchase context is unavailable.');
    const recipientVerified = params.recipient ? previewFanStatus(params.recipient) : true;
    validateStockPurchase({
      quantity:params.quantity,
      initialPaymentETER:params.initialPaymentETER,
      giftRequested:Boolean(params.recipient),
      recipientVerified,
    }, authority);
    const positions = Array.from({ length: params.quantity }, (_, index) => ({
      tokenId: `#EES-${String(901 + index).padStart(4, '0')}`,
      multiplier: STOCK_MULTIPLIERS[index % STOCK_MULTIPLIERS.length],
      phase: authority.currentPhase,
      origin: params.recipient ? 'Gift' as const : 'Purchase' as const,
    }));
    return { txHash: '0xpreview_stock_multi_buy', positions };
  },

  async completeStock(params: { tokenId: string; amount: number }, positions: StockPosition[]): Promise<{ txHash: string }> {
    const stock = positions.find((position) => position.tokenId === params.tokenId);
    if (!stock) throw new Error('Stock position is unavailable.');
    if (stock.remainingETER <= 0) throw new Error('Stock is already fully paid.');
    if (!Number.isFinite(params.amount) || params.amount <= 0) throw new Error('Funding amount must be positive.');
    if (params.amount > stock.remainingETER) throw new Error('Funding amount exceeds the remaining balance.');
    return { txHash: '0xmock_complete_ees_' + Date.now() };
  },

  async claimDividends(tokenId: string): Promise<{ txHash: string; amount: number }> {
    void tokenId;
    return { txHash: '0xmock_ees_divs_' + Date.now(), amount: 28.5 };
  },

  async transferStock(params: { tokenId: string; to: string }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_ees_transfer_' + Date.now() };
  },

  async transferStocks(tokenIds: string[] | { tokenIds: string[]; to: string }, to?: string): Promise<{ txHash: string }> {
    const normalized = Array.isArray(tokenIds) ? { tokenIds, to: to ?? '' } : tokenIds;
    if (!normalized.tokenIds.length) throw new Error('Select at least one Stock.');
    if (!previewFanStatus(normalized.to)) throw new Error('Receiver must be a verified Fan member.');
    return { txHash: '0xmock_ees_group_transfer_' + Date.now() };
  },

  async verifyFanMember(address: string): Promise<{ isFan: boolean; source: 'preview' }> {
    return { isFan: previewFanStatus(address), source: 'preview' };
  },

  async checkStockIncome(context: StockProtocolContext, positions: StockPosition[]): Promise<{ entitlement?: StockIncomeEntitlement; source: 'preview' }> {
    if (context.income?.window !== 'check') throw new Error('Stock income Check window is unavailable.');
    if (!positions.some((stock) => stock.fundingState === 'Fully paid' && stock.incomeEligibility === 'Eligible')) throw new Error('A fully-paid income-eligible Stock is required.');
    const entitlement = context.income.checkedEntitlement;
    if (!isStockIncomeEntitlement(entitlement)) throw new Error('Stock income entitlement is unavailable.');
    return { entitlement:{ ...entitlement }, source:'preview' };
  },

  async withdrawStockIncome(context: StockProtocolContext, positions: StockPosition[], expected?: { expectedAmount: number; expectedToken: string }): Promise<{ txHash: string; entitlement?: StockIncomeEntitlement }> {
    if (context.income?.window !== 'withdraw') throw new Error('Stock income Withdraw window is unavailable.');
    if (!positions.some((stock) => stock.fundingState === 'Fully paid' && stock.incomeEligibility === 'Eligible')) throw new Error('A fully-paid income-eligible Stock is required.');
    const entitlement = context.income.withdrawableEntitlement;
    if (!isStockIncomeEntitlement(entitlement)) throw new Error('Stock income entitlement is unavailable.');
    if (expected && (expected.expectedAmount !== entitlement.amount || expected.expectedToken !== entitlement.token)) throw new Error('Stock income entitlement changed. Review again.');
    return { txHash:'0xpreview_stock_income_withdraw', entitlement:{ ...entitlement } };
  },

  async getVotingPower(_address: string): Promise<number> {
    return stockPreviewPositions.reduce((sum, stock) => sum + stock.votingPower, 0);
  },
};
