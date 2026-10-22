import { mockTokenAssets, mockEcosystemStats } from '../../data/mockAssets';
import type { PaymentToken, TokenAsset } from '../../lib/types';

// Generator Contract Adapter
// Replace mock methods with real ethers.js calls to the Generator contract

export const generatorAdapter = {
  async getETERBalance(address: string): Promise<number> {
    void address;
    return mockTokenAssets.find((t) => t.symbol === 'ETER')?.balance ?? 0;
  },

  async getETERPrice(): Promise<number> {
    return mockEcosystemStats.eterPrice;
  },

  async getAllBalances(_address: string): Promise<TokenAsset[]> {
    return mockTokenAssets;
  },

  async buyETER(params: { amount: number; paymentToken: PaymentToken; slippage?: number }): Promise<{ txHash: string }> {
    void params;
    // real: await contract.buy({ value: parseEther(params.amount.toString()) })
    return { txHash: '0xmock_buy_' + Date.now() };
  },

  async sellETER(params: { amount: number }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_sell_' + Date.now() };
  },

  async burnETER(params: { amount: number }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_burn_' + Date.now() };
  },

  async donate(params: { amount: number; token: PaymentToken }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_donate_' + Date.now() };
  },

  async transferETER(params: { to: string; amount: number }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_transfer_' + Date.now() };
  },

  listenToGeneratorEvents(_callback: (event: unknown) => void): () => void {
    // real: contract.on('ETERPurchased', callback); return () => contract.off(...)
    return () => {};
  },
};
