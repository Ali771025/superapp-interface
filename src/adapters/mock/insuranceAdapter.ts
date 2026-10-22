import { mockShields } from '../../data/mockAssets';
import type { PaymentToken, Shield } from '../../lib/types';

export const insuranceAdapter = {
  async getMyShields(_address: string): Promise<Shield[]> {
    return mockShields;
  },

  async getShieldById(tokenId: string): Promise<Shield | undefined> {
    return mockShields.find((s) => s.tokenId === tokenId);
  },

  async buyShield(params: { tier: string; amount: number; paymentToken: PaymentToken }): Promise<{ txHash: string; tokenId: string }> {
    void params;
    return { txHash: '0xmock_buy_shield_' + Date.now(), tokenId: '#' + Math.floor(Math.random() * 9000 + 1000) };
  },

  async completePayment(params: { tokenId: string; amount: number }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_shield_pay_' + Date.now() };
  },

  async setInheritance(params: { tokenId: string; beneficiary: string }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_inherit_' + Date.now() };
  },

  async setInheritanceAllocation(params: { tokenId: string; heirs: Array<{ wallet: string; sharePercent: number }>; feeToken: PaymentToken; expectedFeeTokenAmount?: number }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_inherit_allocation_' + Date.now() };
  },

  async redeemShield(tokenId: string): Promise<{ txHash: string; amount: number }> {
    void tokenId;
    return { txHash: '0xmock_redeem_' + Date.now(), amount: 500 };
  },

  async claimShieldRewards(tokenId: string): Promise<{ txHash: string; amount: number }> {
    void tokenId;
    return { txHash: '0xmock_shield_rewards_' + Date.now(), amount: 12.5 };
  },

  async runShieldAction(params: { tokenId: string; action: string; receiver?: string; amount?: number; paymentToken?: PaymentToken; receiveToken?: PaymentToken; reservePercent?: number; unlockDate?: string; receiveAllocatedET?: boolean }): Promise<{ txHash: string }> {
    void params;
    return { txHash: `0xmock_shield_${params.action}_${Date.now()}` };
  },

  async runGroupAction(params: { tokenIds: string[]; action: string }): Promise<{ txHash: string }> {
    void params;
    return { txHash: `0xmock_shield_group_${params.action.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}` };
  },
};
