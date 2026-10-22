import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import type { Shield } from '../../lib/types';
import { shieldTierLabel } from '../../lib/utils';
import { ChevronRight } from '@icons';
import { shieldAssetKeyFor, shieldVisualFor } from '../../special3/products/shield/shieldVisuals';

interface ShieldCardProps {
  shield: Shield;
  compact?: boolean;
  onClick?: () => void;
}

const tierGradient: Record<string, string> = {
  starter: 'from-primary-500/20 to-primary-500/10',
  balanced: 'from-primary-500/20 to-primary-500/10',
  professional: 'from-primary-500/20 to-primary-500/10',
};

export function ShieldCard({ shield, compact = false, onClick }: ShieldCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const progress = shield.totalAmount > 0 ? (shield.paidAmount / shield.totalAmount) * 100 : 0;
  const visual = shieldVisualFor(shield);

  return (
    <button
      onClick={onClick}
      data-shield-asset-key={shieldAssetKeyFor(shield)}
      className={cn(
        'ds-ownership-card w-full text-left rounded-2xl overflow-hidden active:scale-[0.99]',
        isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm'
      )}
    >
      <div className={cn('bg-gradient-to-r p-4', tierGradient[shield.tier || 'starter'])}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <img src={visual.image} alt={`${visual.label} NFT ${shield.tokenId}`} width="96" height="96" loading="lazy" decoding="async" className="w-20 h-20 object-contain" />
            <div>
              <p className={cn('font-bold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
                SHIELD {shield.tokenId}
              </p>
              <p className="text-xs text-accent-DEFAULT">{visual.label} · {shieldTierLabel[shield.tier || 'starter']} Tier · {shield.batchCode}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-success-DEFAULT font-semibold">+{shield.growth}%</p>
            <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>growth</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-3">
        <div className="flex justify-between text-xs">
          <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Progress</span>
          <span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>
            {shield.paidAmount} / {shield.totalAmount} USDT
          </span>
        </div>
        <div className={cn('w-full rounded-full h-1.5', isDark ? 'bg-dark-border' : 'bg-light-border')}>
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-DEFAULT transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Remaining</p>
              <p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
                {shield.remainingAmount} USDT
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Matures</p>
              <p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
                {shield.maturityDate}
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Continent</p>
              <p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
                Canonical color · {shield.color}
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Inheritance</p>
              <p className={cn('font-semibold', shield.inheritanceSet ? 'text-success-DEFAULT' : 'text-warning-DEFAULT')}>
                {shield.inheritanceSet ? 'Set' : 'Not set'}
              </p>
            </div>
            <div>
              <p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Allocated ET</p>
              <p className="font-semibold text-primary-500">{Math.round(shield.totalAmount * 0.42).toLocaleString()} ET</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                isDark ? 'bg-dark-border text-dark-textSecondary' : 'bg-light-border text-light-textSecondary'
              )}
            >
              {shield.cShieldStatus === 'active' ? 'C-SHIELD Active' : 'C-SHIELD Locked'}
            </span>
          </div>
          <ChevronRight size={14} className="text-primary-500" />
        </div>
      </div>
    </button>
  );
}
