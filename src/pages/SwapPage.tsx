import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { ArrowUpDown, ChevronDown, Zap } from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { TransactionReviewModal } from '../components/modals/TransactionReviewModal';
import { useTheme } from '../lib/theme-context';
import { cn } from '../lib/utils';
import { swapAdapter } from '../adapters/mock/swapAdapter';
import { mockTokenRates, mockUser } from '../data/mockAssets';
import type { PaymentToken } from '../lib/types';
import { TokenMark } from '../components/ui/TokenMark';
import { readEcosystemPaymentRegistry } from '../modules/payments/ecosystemPaymentRegistry';
import { isSpecialProductPresentationEnabled } from '../special3/products/presentationRegistry';

const TOKENS: PaymentToken[] = [...readEcosystemPaymentRegistry().enabledPaymentAssets];

const BALANCES: Record<PaymentToken, number> = {
  USDT: mockUser.usdtBalance,
  ETER: mockUser.eterBalance,
  ET: mockUser.etBalance,
  Q: mockUser.qBalance,
};

const TOKEN_NAMES: Record<PaymentToken, string> = { USDT: 'Tether USD', ETER: 'ETERNITY Generator', ET: 'ETERNITY Token', Q: 'QORA Token' };

function TokenPicker({
  value,
  onChange,
  exclude,
  label,
}: {
  value: PaymentToken;
  onChange: (t: PaymentToken) => void;
  exclude: PaymentToken;
  label: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  return (
    <div ref={pickerRef} className="swap-token-picker relative">
      <p className={cn('text-xs font-semibold mb-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-ring',
          isDark ? 'bg-dark-card border-dark-border text-dark-textPrimary' : 'bg-light-card border-light-border text-light-textPrimary shadow-sm'
        )}
      >
        <TokenMark token={value} size={24} />
        <span className="text-left"><span className="block">{value}</span><span className="block text-xs font-normal text-[var(--muted)]">Polygon</span></span>
        <ChevronDown size={14} className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} />
      </button>

      {open && (
        <div className="surface-elevated absolute left-0 top-full z-30 mt-1 min-w-64 overflow-hidden">
          {TOKENS.filter((t) => t !== exclude).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => { onChange(t); setOpen(false); }}
              className={cn(
                'flex min-h-12 items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold transition-colors focus-ring',
                t === value ? 'text-primary-500 bg-primary-500/10' : isDark ? 'text-dark-textPrimary hover:bg-dark-card' : 'text-light-textPrimary hover:bg-light-bg'
              )}
            >
              <TokenMark token={t} size={28} />
              <span className="text-left"><span className="block">{t}</span><span className="block text-xs font-normal text-[var(--muted)]">{TOKEN_NAMES[t]} · Polygon</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LegacySwapPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [fromToken, setFromToken] = useState<PaymentToken>('USDT');
  const [toToken, setToToken] = useState<PaymentToken>('ETER');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [priceImpact, setPriceImpact] = useState(0.05);
  const [rate, setRate] = useState(0);
  const [fee, setFee] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const parsedFrom = parseFloat(fromAmount) || 0;
  const balance = BALANCES[fromToken];
  const insufficient = parsedFrom > 0 && parsedFrom > balance;

  useEffect(() => {
    if (parsedFrom <= 0) { setToAmount(''); setRate(0); return; }
    swapAdapter.getQuote(fromToken, toToken, parsedFrom).then((q) => {
      setToAmount(q.toAmount.toFixed(6).replace(/\.?0+$/, ''));
      setRate(q.rate);
      setFee(q.fee ?? 0);
      setPriceImpact(q.priceImpact ?? 0.05);
    });
  }, [fromToken, toToken, parsedFrom]);

  const flipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  const handleSwap = async () => {
    await swapAdapter.swap(fromToken, toToken, parsedFrom);
  };

  const feeUSD = fee * (mockTokenRates[fromToken] || 1);

  return (
    <AppShell title="Swap" showBack>
      <div className="space-y-4 pb-4">

        {/* Swap card */}
        <div className="action-surface p-4 space-y-3">

          {/* From */}
          <div className="surface-subtle p-3">
            <div className="flex items-center justify-between mb-2">
              <TokenPicker value={fromToken} onChange={setFromToken} exclude={toToken} label="From" />
              <div className="text-right">
                <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                  Balance: <span className={cn('font-semibold', insufficient ? 'text-danger-DEFAULT' : isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{balance} {fromToken}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setFromAmount(String(balance))}
                  className="min-h-11 px-2 text-xs text-primary-500 font-semibold focus-ring"
                >
                  MAX
                </button>
              </div>
            </div>
            <label htmlFor="swap-amount" className="mb-1 block text-sm font-semibold text-[var(--text)]">Amount to swap</label>
            <input
              id="swap-amount"
              type="number"
              min="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              aria-invalid={insufficient}
              aria-describedby={insufficient ? 'swap-amount-error' : 'swap-amount-hint'}
              className={cn('field-control px-3 text-2xl font-bold tabular-nums', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}
            />
            {insufficient && <p id="swap-amount-error" role="alert" className="mt-2 text-xs text-danger-DEFAULT">Insufficient balance. Use Max or enter a smaller amount.</p>}
            {parsedFrom > 0 && (
              <p id="swap-amount-hint" className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                ≈ ${(parsedFrom * (mockTokenRates[fromToken] || 1)).toFixed(2)} USD
              </p>
            )}
          </div>

          {/* Flip button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={flipTokens}
              className={cn('w-11 h-11 flex items-center justify-center transition-colors focus-ring', isDark ? 'text-dark-textSecondary hover:text-primary-500' : 'text-light-textSecondary hover:text-primary-500')}
              aria-label="Switch input and output tokens"
            >
              <ArrowUpDown size={16} />
            </button>
          </div>

          {/* To */}
          <div className="surface-subtle p-3">
            <div className="flex items-center justify-between mb-2">
              <TokenPicker value={toToken} onChange={setToToken} exclude={fromToken} label="To" />
              <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                Balance: {BALANCES[toToken]} {toToken}
              </p>
            </div>
            <p className={cn('text-2xl font-bold tabular-nums', toAmount ? (isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary') : isDark ? 'text-dark-border' : 'text-light-border')}>
              {toAmount || '0.00'}
            </p>
            {toAmount && (
              <p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                ≈ ${(parseFloat(toAmount || '0') * (mockTokenRates[toToken] || 1)).toFixed(2)} USD
              </p>
            )}
          </div>

          {/* Rate info */}
          {rate > 0 && (
            <div className="data-surface p-3 space-y-2">
              {[
                { label: 'Rate', value: `1 ${fromToken} = ${rate.toFixed(4)} ${toToken}` },
                { label: 'Fee (0.3%)', value: `${fee.toFixed(4)} ${fromToken} ≈ $${feeUSD.toFixed(2)}` },
                { label: 'Price Impact', value: `${priceImpact}%`, color: priceImpact > 1 ? 'text-danger-DEFAULT' : 'text-success-DEFAULT' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{r.label}</p>
                  <p className={cn('text-xs font-semibold', r.color || (isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'))}>{r.value}</p>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={!parsedFrom || insufficient || parsedFrom <= 0}
            onClick={() => setShowReview(true)}
            className={cn(
              'cut-button cut-button--primary w-full px-4 font-bold text-sm',
              !parsedFrom || insufficient || parsedFrom <= 0
                ? 'opacity-40 cursor-not-allowed'
                : ''
            )}
          >
            {insufficient ? `Insufficient ${fromToken}` : 'Confirm Swap'}
          </button>
        </div>

        {/* Info */}
        <div className="safety-surface flex items-start gap-2 p-3 text-warning-DEFAULT">
          <Zap size={14} className="text-warning-DEFAULT mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--muted)]">
            Swaps are executed on-chain via the ETERNITY protocol. A 0.3% fee is distributed to the ecosystem.
          </p>
        </div>
      </div>

      <TransactionReviewModal
        open={showReview}
        onClose={() => setShowReview(false)}
        onConfirm={handleSwap}
        action={`Swap ${fromToken} → ${toToken}`}
        amount={parsedFrom}
        token={fromToken}
        estimatedReceive={toAmount ? `${toAmount} ${toToken}` : undefined}
        fee={0.01}
        network="Polygon PoS"
        approvalRequired={fromToken === 'USDT' || fromToken === 'Q'}
        riskWarning={priceImpact > 1 ? `High price impact: ${priceImpact}%` : undefined}
      />
    </AppShell>
  );
}

const SpecialSwapPage = lazy(async () => {
  const module = await import('../special3/products/swap/SpecialSwapPage');
  return { default:module.SpecialSwapPage };
});

export function SwapPage() {
  if (!isSpecialProductPresentationEnabled('Swap')) return <LegacySwapPage/>;
  return <Suspense fallback={<AppShell title="Swap"><div data-special3 role="status">Loading Swap presentation…</div></AppShell>}><SpecialSwapPage/></Suspense>;
}
