import React, { lazy, Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, ChevronDown, ChevronUp, ArrowRight, LayoutGrid, Rows3 } from '@icons';
import { AppShell } from '../../components/layout/AppShell';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { mockUser } from '../../data/mockAssets';
import {
  ACCESS_LEVELS, ACCESS_FEATURES, CATEGORY_LABELS,
  fanLevelToAccessKey, isFeatureUnlocked, getNewlyUnlockedFeatures,
  getLevelIndex, type AccessLevelKey,
} from '../../data/accessMatrix';
import { FanLevelStars } from '../../components/ui/FanLevelStars';
import { SectionTabs } from '../../components/ui/SectionTabs';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';

const SpecialFanAccess=lazy(async()=>{const module=await import('../../special3/products/fan/SpecialFanPages');return {default:()=> <module.SpecialFanPresentation view="access"/>}});

function nonStarLevelLabel(label: string) {
  return /star/i.test(label) ? null : label;
}

const DISPLAY_ACCESS_LEVELS = ACCESS_LEVELS.filter((level) => level.key !== 'indie');

function FeatureRow({ feature, userLevelKey, highlightLevel }: {
  feature: typeof ACCESS_FEATURES[number];
  userLevelKey: AccessLevelKey;
  highlightLevel?: AccessLevelKey;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expanded, setExpanded] = useState(false);
  const userUnlocked = isFeatureUnlocked(feature, userLevelKey);
  const isNewlyUnlocked = highlightLevel ? (!isFeatureUnlocked(feature, userLevelKey) && isFeatureUnlocked(feature, highlightLevel)) : false;

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all',
        isNewlyUnlocked ? 'border-primary-500/50 shadow-[0_0_12px_rgba(81,112,255,0.12)]' : isDark ? 'border-dark-border' : 'border-light-border',
        isDark ? 'bg-dark-card' : 'bg-light-card shadow-sm'
      )}
    >
      <button
        className="w-full flex items-center gap-3 p-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Status icon */}
        <div className={cn(
          'w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all',
          userUnlocked
            ? 'text-success-DEFAULT'
            : isNewlyUnlocked
            ? 'text-success-DEFAULT'
            : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'
        )}>
          {userUnlocked ? (
            <Check size={14} className="text-success-DEFAULT" />
          ) : (
            <Lock size={12} className={cn(isNewlyUnlocked ? 'text-success-DEFAULT' : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn(
              'text-sm font-semibold',
              userUnlocked ? (isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary') : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'
            )}>
              {feature.label}
            </p>
            {isNewlyUnlocked && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-success-DEFAULT/20 text-success-DEFAULT">NEW UNLOCK</span>
            )}
            {!userUnlocked && !isNewlyUnlocked && (
              <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full', isDark ? 'bg-dark-border text-dark-textSecondary' : 'bg-light-border text-light-textSecondary')}>
                {ACCESS_LEVELS.find((l) => l.key === feature.minLevel)?.label}
              </span>
            )}
          </div>
        </div>

        {expanded ? (
          <ChevronUp size={14} className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} />
        ) : (
          <ChevronDown size={14} className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} />
        )}
      </button>

      {expanded && (
        <div className={cn('px-4 pb-4 pt-0 border-t', isDark ? 'border-dark-border' : 'border-light-border')}>
          <p className={cn('text-xs mt-3 leading-relaxed', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            {feature.description}
          </p>
          {!userUnlocked && (
            <div className={cn('mt-2 p-2.5 rounded-xl text-xs', isDark ? 'bg-dark-surface' : 'bg-light-bg')}>
              <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Required: </span>
              {(() => { const required = ACCESS_LEVELS.find((level) => level.key === feature.minLevel); return required ? <span className="inline-flex items-center gap-2"><FanLevelStars stars={required.stars} size="xs" />{nonStarLevelLabel(required.label) && <span className={cn('font-semibold', required.color)}>{required.label}</span>}</span> : null; })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LevelCard({ level, isCurrentLevel, isNextLevel, onClick }: {
  level: typeof ACCESS_LEVELS[number];
  isCurrentLevel: boolean;
  isNextLevel: boolean;
  onClick: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const featureCount = ACCESS_FEATURES.filter((f) => f.minLevel === level.key).length;
  const activeBenefitCount = ACCESS_FEATURES.filter((feature) => isFeatureUnlocked(feature, level.key)).length;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isCurrentLevel ? 'step' : undefined}
      className={cn(
        'fan-access-level-card group relative overflow-visible border-2 text-left transition-all duration-200',
        isCurrentLevel
          ? 'border-primary-500 shadow-[0_0_16px_rgba(81,112,255,0.2)]'
          : isNextLevel
          ? 'border-primary-500/60 shadow-[0_0_10px_rgba(81,112,255,0.12)]'
          : isDark ? 'border-dark-border' : 'border-light-border',
        isDark ? 'bg-dark-card' : 'bg-light-card shadow-sm',
        'hover:-translate-y-1 hover:border-primary-500/70 focus-ring'
      )}
    >
      {isCurrentLevel && (
        <span className="absolute top-1 left-3 z-10 text-xs font-bold px-2 py-0.5 bg-primary-500 text-white">YOU</span>
      )}
      {isNextLevel && (
        <span className="absolute -top-2 left-3 text-xs font-bold px-2 py-0.5 rounded-full bg-success-DEFAULT text-white">NEXT</span>
      )}

      <div className="fan-access-level-head">
        <span className="fan-access-level-mark">
          {level.key === 'none' ? <span className="text-xs font-bold">NON FAN</span> : <FanLevelStars stars={level.stars} size="sm" animated={isCurrentLevel || isNextLevel} />}
        </span>
        <span className={cn('fan-access-level-title', isCurrentLevel ? 'text-primary-500' : isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
          {nonStarLevelLabel(level.label) ?? `${level.stars} Star access`}
        </span>
      </div>

      <dl className="fan-access-level-data">
        <div><dt>Active benefits</dt><dd>{activeBenefitCount}</dd></div>
        <div><dt>New at level</dt><dd>{featureCount || 'Base'}</dd></div>
        <div><dt>Annual access</dt><dd className={level.subscriptionFeeUSD > 0 ? 'text-warning-DEFAULT' : 'text-success-DEFAULT'}>{level.subscriptionFeeUSD > 0 ? `$${level.subscriptionFeeUSD}` : 'Free'}</dd></div>
      </dl>
    </button>
  );
}

function DesktopMatrix({ userLevelKey }: { userLevelKey: AccessLevelKey }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const categories = Array.from(new Set(ACCESS_FEATURES.map((f) => f.category)));

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[640px] text-xs border-collapse">
        <thead>
          <tr>
            <th className={cn('text-left p-3 font-semibold w-48', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Feature</th>
            {DISPLAY_ACCESS_LEVELS.map((level) => {
              const isCurrent = level.key === userLevelKey;
              return (
                <th
                  key={level.key}
                  className={cn(
                    'p-3 text-center font-bold rounded-t-xl',
                    isCurrent ? 'bg-primary-500/15 text-primary-500' : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn('font-bold', level.color)}>
                      {level.key === 'none' ? <span className="text-[11px] font-bold">NON FAN</span> : <FanLevelStars stars={level.stars} size="xs" />}
                    </span>
                    {nonStarLevelLabel(level.label) && <span>{level.label}</span>}
                    {isCurrent && <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-primary-500 text-white">YOU</span>}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <React.Fragment key={cat}>
              <tr>
                <td colSpan={DISPLAY_ACCESS_LEVELS.length + 1} className={cn('px-3 py-2 text-xs font-bold uppercase tracking-wider', isDark ? 'text-dark-textSecondary bg-dark-surface' : 'text-light-textSecondary bg-light-bg')}>
                  {CATEGORY_LABELS[cat]}
                </td>
              </tr>
              {ACCESS_FEATURES.filter((f) => f.category === cat).map((feature) => (
                <tr key={feature.id} className={cn('border-t', isDark ? 'border-dark-border' : 'border-light-border')}>
                  <td className={cn('p-3', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')} title={feature.description}>
                    {feature.label}
                  </td>
                  {DISPLAY_ACCESS_LEVELS.map((level) => {
                    const unlocked = isFeatureUnlocked(feature, level.key);
                    const isCurrent = level.key === userLevelKey;
                    return (
                      <td
                        key={level.key}
                        className={cn('p-3 text-center', isCurrent ? 'bg-primary-500/5' : '')}
                      >
                        {unlocked ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-success-DEFAULT/15 flex items-center justify-center">
                              <Check size={10} className="text-success-DEFAULT" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Lock size={10} className={isDark ? 'text-dark-border' : 'text-light-border'} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className={cn('border-t', isDark ? 'border-dark-border' : 'border-light-border')}>
            <td className={cn('p-3 font-semibold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Annual Fee</td>
            {DISPLAY_ACCESS_LEVELS.map((level) => (
              <td key={level.key} className={cn('p-3 text-center font-bold', level.subscriptionFeeUSD > 0 ? 'text-warning-DEFAULT' : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                {level.subscriptionFeeUSD > 0 ? `$${level.subscriptionFeeUSD}` : 'Free'}
              </td>
            ))}
          </tr>
          <tr>
            <td />
            {DISPLAY_ACCESS_LEVELS.map((level) => {
              const isCurrent = level.key === userLevelKey;
              const isHigher = getLevelIndex(level.key) > getLevelIndex(userLevelKey);
              return (
                <td key={level.key} className="p-2 text-center">
                  {isHigher && (
                    <button
                      onClick={() => navigate('/fan/upgrade')}
                      className="w-full py-1.5 rounded-lg bg-primary-500/20 text-primary-500 text-xs font-bold hover:bg-primary-500/30 transition-colors"
                    >
                      Upgrade
                    </button>
                  )}
                  {isCurrent && (
                    <span className="text-xs font-bold text-primary-500">Current</span>
                  )}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function LegacyAccessMatrixPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'matrix'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const userFanLevel = mockUser.fanLevel;
  const userLevelKey = userFanLevel === 'indie' ? 'star4' : fanLevelToAccessKey(userFanLevel);
  const currentLevel = ACCESS_LEVELS.find((l) => l.key === userLevelKey)!;
  const nextLevelIdx = getLevelIndex(userLevelKey) + 1;
  const nextLevel = nextLevelIdx < DISPLAY_ACCESS_LEVELS.length ? DISPLAY_ACCESS_LEVELS[nextLevelIdx] : null;
  const newlyUnlocked = nextLevel ? getNewlyUnlockedFeatures(userLevelKey, nextLevel.key) : [];

  const unlockedCount = ACCESS_FEATURES.filter((f) => isFeatureUnlocked(f, userLevelKey)).length;
  const lockedCount = ACCESS_FEATURES.length - unlockedCount;

  const categories = ['all', ...Array.from(new Set(ACCESS_FEATURES.map((f) => f.category)))];
  const filteredFeatures = filterCategory === 'all' ? ACCESS_FEATURES : ACCESS_FEATURES.filter((f) => f.category === filterCategory);

  const tabs = [
    { key: 'overview', label: 'My Access', icon: LayoutGrid },
    { key: 'matrix', label: 'Full Matrix', icon: Rows3 },
  ] as const;

  return (
    <AppShell title="Access & Benefits" showBack>
      <div className="space-y-4 pb-4">

        {/* Hero Card */}
        <div className="brand-surface overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="relative mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">My access</p>
              <h1 className={cn('mt-2 text-2xl font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>Your FAN benefits</h1>
              <p className={cn('mt-2 max-w-sm text-sm leading-relaxed', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>See what is active now and what your next community level will unlock.</p>
            </div>
            <div className="fan-current-level grid min-h-20 min-w-24 place-items-center border border-primary-500/30 bg-primary-500/10 p-3">
              {currentLevel.key === 'none' ? <span className="text-sm font-bold">NON FAN</span> : <FanLevelStars stars={currentLevel.stars} size="md" animated />}
              {nonStarLevelLabel(currentLevel.label) && <span className={cn('mt-1 text-xs font-bold', currentLevel.color)}>{currentLevel.label}</span>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="data-surface p-3 text-center">
              <p className="text-lg font-bold text-success-DEFAULT">{unlockedCount}</p>
              <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Unlocked</p>
            </div>
            <div className="data-surface p-3 text-center">
              <p className={cn('text-lg font-bold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{lockedCount}</p>
              <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Locked</p>
            </div>
            <div className="data-surface p-3 text-center">
              <p className="text-lg font-bold text-warning-DEFAULT">
                {currentLevel.subscriptionFeeUSD > 0 ? `$${currentLevel.subscriptionFeeUSD}` : 'Free'}
              </p>
              <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Annual</p>
            </div>
          </div>

          {nextLevel && (
            <div className="action-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <p className={cn('text-xs font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
                  <span className="inline-flex items-center gap-2"><span>Next access</span><FanLevelStars stars={nextLevel.stars} size="xs" /></span>
                </p>
                <span className="text-xs font-bold text-success-DEFAULT">+{newlyUnlocked.length} unlocks</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {newlyUnlocked.slice(0, 3).map((f) => (
                  <span key={f.id} className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-DEFAULT/15 text-success-DEFAULT">
                    {f.label}
                  </span>
                ))}
                {newlyUnlocked.length > 3 && (
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', isDark ? 'bg-dark-border text-dark-textSecondary' : 'bg-light-border text-light-textSecondary')}>
                    +{newlyUnlocked.length - 3} more
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate('/fan/upgrade')}
                className="w-full py-2.5 rounded-xl gradient-primary text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                Upgrade access <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <SectionTabs items={[...tabs]} active={activeTab} onChange={setActiveTab} label="Access sections"/>

        {activeTab === 'overview' && (
          <>
            {/* Level cards row */}
            <div className="fan-access-level-grid">
              {DISPLAY_ACCESS_LEVELS.map((level) => (
                <LevelCard
                  key={level.key}
                  level={level}
                  isCurrentLevel={level.key === userLevelKey}
                  isNextLevel={nextLevel?.key === level.key}
                  onClick={() => level.key !== userLevelKey && navigate('/fan/upgrade')}
                />
              ))}
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                    filterCategory === cat
                      ? 'bg-primary-500 text-white'
                      : isDark ? 'bg-dark-card border border-dark-border text-dark-textSecondary' : 'bg-light-card border border-light-border text-light-textSecondary shadow-sm'
                  )}
                >
                  {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Feature list */}
            <div className="space-y-2">
              {filteredFeatures.map((feature) => (
                <FeatureRow
                  key={feature.id}
                  feature={feature}
                  userLevelKey={userLevelKey}
                  highlightLevel={nextLevel?.key}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'matrix' && (
          <div className={cn('rounded-2xl overflow-hidden', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <DesktopMatrix userLevelKey={userLevelKey} />
          </div>
        )}

        {/* CTA row */}
        <div>
          <button
            onClick={() => navigate('/fan/upgrade')}
            className="py-3 rounded-2xl gradient-primary text-white text-sm font-semibold"
          >
            Upgrade Level
          </button>
        </div>

      </div>
    </AppShell>
  );
}

export function AccessMatrixPage(){return isSpecialProductPresentationEnabled('FanCommunity')?<Suspense fallback={<AppShell title="FAN Access"><div data-special3 role="status">Loading FAN access…</div></AppShell>}><SpecialFanAccess/></Suspense>:<LegacyAccessMatrixPage/>}
