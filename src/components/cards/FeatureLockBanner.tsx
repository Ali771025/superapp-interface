import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from '@icons';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { ACCESS_LEVELS, fanLevelToAccessKey, getNewlyUnlockedFeatures, type AccessLevelKey } from '../../data/accessMatrix';
import type { FanLevel } from '../../lib/types';
import { FanLevelStars } from '../ui/FanLevelStars';

interface FeatureLockBannerProps {
  featureLabel: string;
  requiredLevel: AccessLevelKey;
  currentFanLevel: FanLevel;
  newBenefits?: string[];
}

export function FeatureLockBanner({ featureLabel, requiredLevel, currentFanLevel, newBenefits }: FeatureLockBannerProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentLevelKey = fanLevelToAccessKey(currentFanLevel);
  const required = ACCESS_LEVELS.find((l) => l.key === requiredLevel)!;
  const current = ACCESS_LEVELS.find((l) => l.key === currentLevelKey)!;
  const unlocks = newBenefits ?? getNewlyUnlockedFeatures(currentLevelKey, requiredLevel).map((f) => f.label).slice(0, 4);

  return (
    <div className={cn(
      'ds-feature-lock rounded-2xl p-5 border-2 border-dashed',
      isDark ? 'border-dark-border bg-dark-card' : 'border-light-border bg-light-card shadow-sm'
    )}>
      {/* Lock icon + headline */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          <Lock size={20} className="text-warning-DEFAULT" />
        </div>
        <div>
          <p className={cn('font-bold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
            {featureLabel} is locked
          </p>
          <p className={cn('text-xs mt-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            Required FAN access
          </p>
        </div>
      </div>

      {/* Level comparison */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('flex-1 rounded-xl p-3 text-center', isDark ? 'bg-dark-surface' : 'bg-light-bg')}>
          <p className={cn('text-xs mb-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Your Level</p>
          <FanLevelStars stars={current.stars} size="sm" className="justify-center" />
        </div>
        <ArrowRight size={16} className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} />
        <div className={cn('flex-1 rounded-xl p-3 text-center border', 'border-success-DEFAULT/40 bg-success-DEFAULT/5')}>
          <p className={cn('text-xs mb-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Required</p>
          <FanLevelStars stars={required.stars} size="sm" className="justify-center" />
        </div>
      </div>

      {/* New unlocks */}
      {unlocks.length > 0 && (
        <div className="mb-4">
          <p className={cn('text-xs font-semibold mb-2', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            After upgrading you unlock:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unlocks.map((b) => (
              <span key={b} className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-DEFAULT/15 text-success-DEFAULT">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div>
        <button
          onClick={() => navigate('/fan/upgrade')}
          className="ds-button ds-button-primary w-full py-2.5 rounded-xl gradient-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
        >
          Upgrade FAN <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
