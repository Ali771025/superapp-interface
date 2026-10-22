import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { mockTokenRates } from '../../data/mockAssets';
import type { PaymentToken } from '../../lib/types';
import { Check } from '@icons';
import { TokenMark } from '../ui/TokenMark';

interface PaymentTokenSelectorProps {
  selected: PaymentToken;
  onChange: (token: PaymentToken) => void;
  usdAmount: number;
  tokens?: PaymentToken[];
  balances?: Partial<Record<PaymentToken, number>>;
  label?: string;
}

const tokenMeta: Record<PaymentToken, { name: string }> = {
  USDT: { name: 'Tether USD' },
  ETER: { name: 'ETERNITY Generator Token' },
  ET: { name: 'ETERNITY Token' },
  Q: { name: 'QORA Token' },
};

function tokenAmount(usdAmount: number, token: PaymentToken): number {
  const rate = mockTokenRates[token] || 1;
  return usdAmount > 0 ? parseFloat((usdAmount / rate).toFixed(4)) : 0;
}

export function PaymentTokenSelector({
  selected,
  onChange,
  usdAmount,
  tokens = ['USDT', 'ETER', 'ET', 'Q'],
  balances = {},
  label = 'Payment Token',
}: PaymentTokenSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const estAmount = tokenAmount(usdAmount, selected);
  const balance = balances[selected] ?? 0;
  const sufficient = balance === 0 || balance >= estAmount;

  return (
    <div className="ds-payment-selector space-y-2">
      <label className={cn('block text-sm font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
        {label}
      </label>

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={label}>
        {tokens.map((token) => {
          const est = tokenAmount(usdAmount, token);
          const bal = balances[token] ?? 0;
          const ok = bal === 0 || bal >= est;
          return (
            <button
              key={token}
              type="button"
              onClick={() => onChange(token)}
              disabled={!ok && bal > 0}
              role="radio"
              aria-checked={selected === token}
              className={cn(
                'ds-token-option relative flex min-h-14 items-center gap-3 border px-3 py-2 text-left focus-ring',
                selected === token
                  ? 'border-primary-500 bg-primary-500/10'
                  : isDark
                  ? 'border-dark-border bg-dark-card hover:border-primary-500/40'
                  : 'border-light-border bg-light-card hover:border-primary-light/40',
                !ok && bal > 0 && 'opacity-40 cursor-not-allowed'
              )}
            >
              <TokenMark token={token} size={32} />
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{token}</span>
                <span className={cn('block truncate text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{tokenMeta[token].name} · Polygon</span>
              </span>
              <span className="text-right">
                {bal > 0 && <span className={cn('block text-xs tabular-nums', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{bal.toLocaleString()}</span>}
                {selected === token && <Check size={15} className="ml-auto text-primary-500" aria-hidden="true" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Estimated amount */}
      {usdAmount > 0 && (
        <div className={cn('data-surface flex items-center justify-between p-3')}>
          <div className="flex items-center gap-2">
            <TokenMark token={selected} size={30} />
            <div>
              <p className="text-sm font-bold tabular-nums text-[var(--text)]">{estAmount} {selected}</p>
              <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>≈ ${usdAmount.toFixed(2)}</p>
            </div>
          </div>
          {balance > 0 && (
            <div className="text-right">
              <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Balance</p>
              <p className={cn('text-xs font-semibold', sufficient ? 'text-success-DEFAULT' : 'text-danger-DEFAULT')}>
                {balance} {selected}
              </p>
            </div>
          )}
        </div>
      )}

      {!sufficient && balance > 0 && (
        <p role="alert" className="text-xs text-danger-DEFAULT">Insufficient {selected} balance. Choose another token or reduce the amount.</p>
      )}
    </div>
  );
}
