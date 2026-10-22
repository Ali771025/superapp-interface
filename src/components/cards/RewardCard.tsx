import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import type { Reward } from '../../lib/types';
import { Gift, ChevronRight } from '@icons';

interface RewardCardProps {
  reward: Reward;
  onClaim?: (id: string) => void;
}

const typeLabel: Record<string, string> = {
  fan: 'FAN Reward',
  forecast: 'Forecast Prize',
  shield: 'SHIELD Growth',
  ees: 'STOCK Dividend',
  social: 'QORA Mission',
  achievement: 'Achievement',
};

const typeColor: Record<string, string> = {
  fan: 'text-primary-500',
  forecast: 'text-warning-DEFAULT',
  shield: 'text-accent-DEFAULT',
  ees: 'text-success-DEFAULT',
  social: 'text-accent-DEFAULT',
  achievement: 'text-warning-DEFAULT',
};

export function RewardCard({ reward, onClaim }: RewardCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        'ds-reward-card flex items-center gap-3 p-4 rounded-2xl',
        isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm'
      )}
    >
      <div className={cn('w-10 h-10 flex items-center justify-center flex-shrink-0', typeColor[reward.type])}>
        <Gift size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
          {typeLabel[reward.type]}
        </p>
        <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{reward.source}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-success-DEFAULT">
          +{reward.amount} {reward.token}
        </p>
        {reward.status === 'claimable' && onClaim ? (
          <button
            onClick={() => onClaim(reward.id)}
            className="text-xs text-primary-500 font-semibold hover:underline"
          >
            Claim
          </button>
        ) : (
          <p className={cn('text-xs capitalize', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            {reward.status}
          </p>
        )}
      </div>
    </div>
  );
}

interface AggregatedRewardBannerProps {
  rewards: Reward[];
  onClaimAll?: () => void;
}

export function AggregatedRewardBanner({ rewards, onClaimAll }: AggregatedRewardBannerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const claimable = rewards.filter((r) => r.status === 'claimable');
  const totalEter = claimable.filter((r) => r.token === 'ETER').reduce((s, r) => s + r.amount, 0);
  const totalQ = claimable.filter((r) => r.token === 'Q').reduce((s, r) => s + r.amount, 0);

  if (claimable.length === 0) return null;

  return (
    <button
      onClick={onClaimAll}
      className="ds-reward-banner w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-500/20 to-accent-DEFAULT/10 border border-primary-500/30 text-left active:scale-[0.99]"
    >
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <Gift size={20} className="text-primary-500" />
      </div>
      <div className="flex-1">
        <p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
          {claimable.length} rewards ready to claim
        </p>
        <p className="text-xs text-success-DEFAULT">
          {totalEter > 0 && `${totalEter.toFixed(1)} ETER`}
          {totalEter > 0 && totalQ > 0 && ' · '}
          {totalQ > 0 && `${totalQ.toFixed(1)} Q`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-primary-500">Claim All</span>
        <ChevronRight size={16} className="text-primary-500" />
      </div>
    </button>
  );
}
