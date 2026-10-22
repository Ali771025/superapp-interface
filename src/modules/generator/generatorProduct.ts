import { useMemo, useState } from 'react';
import { isAddress } from 'ethers';
import { productActions } from '../../special3/providers/products';
import { mockEcosystemStats, mockTokenAssets, mockTokenRates, mockUser } from '../../data/mockAssets';
import type { PaymentToken } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

export type GeneratorAction = 'buy' | 'sell' | 'burn' | 'donate' | 'transfer';

export const GENERATOR_ACTION_COPY: Readonly<Record<GeneratorAction, { title: string; description: string }>> = {
  buy:{ title:'Generate ETER', description:'Generate ETER with a token selected from the canonical ecosystem registry.' },
  sell:{ title:'Sell ETER', description:'Convert your ETER to USDT.' },
  burn:{ title:'Burn ETER', description:'Permanently remove ETER from supply. This is irreversible.' },
  donate:{ title:'Donate', description:'Donate with a token selected from the canonical ecosystem registry.' },
  transfer:{ title:'Transfer ETER', description:'Send ETER to another wallet.' },
};

export const GENERATOR_PAYMENT_TOKENS: readonly PaymentToken[] = ['USDT', 'ETER', 'ET', 'Q'];
export const generatorEterAsset = mockTokenAssets.find((token) => token.symbol === 'ETER')!;

export interface GeneratorCompletion {
  transactionHash?: string;
  requestId?: string;
  indexerDelayed: boolean;
}

export function validateGeneratorRecipient(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid:false, error:'Enter the full recipient wallet address.' };
  if (!isAddress(value)) return { valid:false, error:'Enter a valid EVM wallet address for the configured Polygon network.' };
  return { valid:true };
}

export function useGeneratorProductController(action: GeneratorAction) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [paymentToken, setPaymentToken] = useState<PaymentToken>('USDT');
  const [completion, setCompletion] = useState<GeneratorCompletion | null>(null);
  const amountNumber = Number(amount || 0);
  const amountValid = Boolean(amount) && Number.isFinite(amountNumber) && amountNumber > 0;
  const amountError = amount && !amountValid ? 'Enter an amount greater than zero.' : undefined;
  const recipientValidation = useMemo(() => action === 'transfer' ? validateGeneratorRecipient(recipient) : { valid:true }, [action, recipient]);
  const ready = amountValid && recipientValidation.valid;
  const paymentUSD = amountNumber * (mockTokenRates[paymentToken] || 1);
  const selectedPaymentAction = action === 'buy' || action === 'donate';
  const estimatedReceived = action === 'buy'
    ? amount ? `${(paymentUSD / mockEcosystemStats.eterPrice).toFixed(4)} ETER` : '—'
    : action === 'sell'
      ? amount ? formatCurrency(amountNumber * mockEcosystemStats.eterPrice) : '—'
      : action === 'donate'
        ? amount ? `${amount} ${paymentToken} donation` : '—'
        : amount ? `${amount} ETER` : '—';
  const availableBalance = selectedPaymentAction
    ? paymentToken === 'USDT' ? mockUser.usdtBalance : paymentToken === 'Q' ? mockUser.qBalance : paymentToken === 'ET' ? mockUser.etBalance : generatorEterAsset.balance
    : generatorEterAsset.balance;

  const confirm = async () => {
    if (action === 'buy') return productActions.generator.buyETER({ amount:amountNumber, paymentToken });
    if (action === 'sell') return productActions.generator.sellETER({ amount:amountNumber });
    if (action === 'burn') return productActions.generator.burnETER({ amount:amountNumber });
    if (action === 'donate') return productActions.generator.donate({ amount:amountNumber, token:paymentToken });
    return productActions.generator.transferETER({ to:recipient, amount:amountNumber });
  };

  return {
    action,
    copy:GENERATOR_ACTION_COPY[action],
    amount, setAmount, amountNumber, amountValid, amountError,
    recipient, setRecipient, recipientValidation,
    paymentToken, setPaymentToken,
    paymentUSD, estimatedReceived, availableBalance,
    ready, reviewOpen, setReviewOpen,
    completion, setCompletion,
    confirm,
    formState:{ amount, recipient:action === 'transfer' ? recipient : undefined, paymentToken:selectedPaymentAction ? paymentToken : undefined },
  } as const;
}
