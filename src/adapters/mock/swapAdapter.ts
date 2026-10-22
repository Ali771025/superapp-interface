import type { PaymentToken, PaymentQuote } from '../../lib/types';
import { mockTokenRates } from '../../data/mockAssets';

function calcOutput(fromAmount: number, fromToken: PaymentToken, toToken: PaymentToken): number {
  const fromUSD = fromAmount * (mockTokenRates[fromToken] || 1);
  const toRate = mockTokenRates[toToken] || 1;
  return parseFloat((fromUSD / toRate).toFixed(6));
}

function exactOutputQuote(fromToken: PaymentToken, toToken: PaymentToken, targetUsdAmount: number) {
  const fromRate = mockTokenRates[fromToken];
  const toRate = mockTokenRates[toToken];
  if (!fromRate || !toRate || targetUsdAmount <= 0) throw new Error('Conversion route unavailable');
  const paymentAmount = parseFloat((targetUsdAmount / fromRate).toFixed(6));
  const targetAmount = parseFloat((targetUsdAmount / toRate).toFixed(6));
  const fee = parseFloat((paymentAmount * 0.003).toFixed(6));
  return {
    paymentToken: fromToken,
    usdAmount: targetUsdAmount,
    tokenAmount: paymentAmount,
    rate: parseFloat((targetAmount / paymentAmount).toFixed(8)),
    fee,
    toAmount: targetAmount,
    priceImpact: 0.05,
    quoteSource: 'swapAdapter-controlled-preview',
  };
}

export const swapAdapter = {
  async getQuote(fromToken: PaymentToken, toToken: PaymentToken, fromAmount: number): Promise<PaymentQuote & { toAmount: number; priceImpact: number }> {
    const toAmount = calcOutput(fromAmount, fromToken, toToken);
    const fee = parseFloat((fromAmount * 0.003).toFixed(6));
    return {
      paymentToken: fromToken,
      usdAmount: fromAmount * (mockTokenRates[fromToken] || 1),
      tokenAmount: fromAmount,
      rate: (mockTokenRates[toToken] || 1) / (mockTokenRates[fromToken] || 1),
      fee,
      toAmount,
      priceImpact: 0.05,
    };
  },

  async getExactOutputQuote(fromToken: PaymentToken, toToken: PaymentToken, targetUsdAmount: number) {
    return exactOutputQuote(fromToken, toToken, targetUsdAmount);
  },

  async swap(fromToken: PaymentToken, toToken: PaymentToken, fromAmount: number): Promise<{ txHash: string; toAmount: number }> {
    void fromToken; void toToken;
    const toAmount = calcOutput(fromAmount, fromToken, toToken);
    return { txHash: '0xmock_swap_' + Date.now(), toAmount };
  },

  async buyQ(usdtAmount: number): Promise<{ txHash: string; qAmount: number }> {
    const qAmount = calcOutput(usdtAmount, 'USDT', 'Q');
    void usdtAmount;
    return { txHash: '0xmock_buyQ_' + Date.now(), qAmount };
  },

  async sellQ(qAmount: number): Promise<{ txHash: string; usdtAmount: number }> {
    const usdtAmount = calcOutput(qAmount, 'Q', 'USDT');
    void qAmount;
    return { txHash: '0xmock_sellQ_' + Date.now(), usdtAmount };
  },

  async buyETER(usdtAmount: number): Promise<{ txHash: string; eterAmount: number }> {
    const eterAmount = calcOutput(usdtAmount, 'USDT', 'ETER');
    void usdtAmount;
    return { txHash: '0xmock_buyETER_' + Date.now(), eterAmount };
  },

  async sellETER(eterAmount: number): Promise<{ txHash: string; usdtAmount: number }> {
    const usdtAmount = calcOutput(eterAmount, 'ETER', 'USDT');
    void eterAmount;
    return { txHash: '0xmock_sellETER_' + Date.now(), usdtAmount };
  },

  async getSwapHistory(_wallet: string) {
    return [];
  },
};
