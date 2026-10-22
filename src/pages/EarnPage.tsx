import { lazy, Suspense, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, BarChart2, CheckCircle2, Clock3, Gift, History,
  LayoutDashboard, ShieldCheck, Target, TrendingUp, Trophy, Users,
} from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { TransactionReviewModal } from '../components/modals/TransactionReviewModal';
import { useTheme } from '../lib/theme-context';
import { cn } from '../lib/utils';
import { mockRewards } from '../data/mockAssets';
import type { Reward } from '../lib/types';
import { FanLevelStars } from '../components/ui/FanLevelStars';
import { QoraAgentIcon } from '../components/ui/QoraAgentIcon';
import { SectionTabs } from '../components/ui/SectionTabs';
import { CurrentMissionCard } from '../components/journey/CurrentMissionCard';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { useEternityUserState } from '../lib/userState';
import { useJourney } from '../lib/journey/journey-context';
import { buildMissionRegistry, defaultMission } from '../lib/journey/missionRegistry';

type EarnView = 'overview' | 'opportunities' | 'pools' | 'history';

const views: { key: EarnView; label: string; icon: typeof Gift }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'opportunities', label: 'Opportunities', icon: TrendingUp },
  { key: 'pools', label: 'Prize pools', icon: Trophy },
  { key: 'history', label: 'History', icon: History },
];

const opportunityCards = [
  { title: 'FAN Community', description: 'Earn through responsible and active community growth.', value: 'Access active', stars: 2, route: '/fan', icon: Users, color: 'text-success-DEFAULT', bg: 'bg-success-DEFAULT/10' },
  { title: 'Forecast', description: 'A weekly prediction game with transparent pools.', value: 'Week 28 open', route: '/forecast', icon: Target, color: 'text-warning-DEFAULT', bg: 'bg-warning-DEFAULT/10' },
  { title: 'STOCK dividends', description: 'Track ownership completion and dividend eligibility.', value: '28.5 USDT', route: '/stock/dividends', icon: BarChart2, color: 'text-success-DEFAULT', bg: 'bg-success-DEFAULT/10' },
  { title: 'SHIELD milestones', description: 'Long-term growth becomes available at milestones.', value: '2 active', route: '/shield', icon: ShieldCheck, color: 'text-accent-DEFAULT', bg: 'bg-accent-DEFAULT/10' },
  { title: 'QORA missions', description: 'Complete verified ecosystem missions with QORA guidance.', value: 'Guided path', route: '/qora/missions', icon: Target, color: 'text-primary-500', bg: 'bg-primary-500/10' },
];

const historyItems = [
  { title: 'Forecast Week 27 prize', date: '2 days ago', amount: '+45.0 ETER', status: 'Confirmed' },
  { title: 'FAN direct bonus', date: '4 days ago', amount: '+12.0 ETER', status: 'Confirmed' },
  { title: 'STOCK dividend', date: '1 week ago', amount: '+28.5 USDT', status: 'Confirmed' },
];

const prizePools = [
  { product: 'FAN Community', title: 'Community momentum', cycle: 'Weekly distribution', value: '42,800 ETER' },
  { product: 'FAN Community', title: 'Legend pool', cycle: 'Monthly distribution', value: '18,600 ETER' },
  { product: 'SHIELD', title: '$100 Shareholders', cycle: 'Quarterly', value: '28,400 ETER' },
  { product: 'SHIELD', title: '$1,000 Shareholders', cycle: 'Quarterly', value: '64,200 ETER' },
  { product: 'SHIELD', title: '$10,000 Shareholders', cycle: 'Quarterly', value: '110,800 ETER' },
  { product: 'SHIELD', title: '$100 Olympic', cycle: 'Quarterly', value: '17,900 ETER' },
  { product: 'SHIELD', title: '$1,000 Olympic', cycle: 'Quarterly', value: '43,600 ETER' },
  { product: 'SHIELD', title: '$10,000 Olympic', cycle: 'Quarterly', value: '91,300 ETER' },
  { product: 'SHIELD', title: 'Eternal Prize', cycle: 'Quarterly', value: '156,000 ETER' },
  { product: 'SHIELD', title: 'EITS top sellers', cycle: 'Instant shared claim', value: '34,250 ET' },
  { product: 'Stock', title: 'Electoral dividends', cycle: 'Quarterly distribution', value: '84,300 USDT' },
  { product: 'Stock', title: 'Voting participation', cycle: 'Governance cycle', value: '16,400 ETER' },
  { product: 'Forecast', title: 'Savior', cycle: 'Instant shared claim', value: '18,420 ETER' },
  { product: 'Forecast', title: 'Starred Savior', cycle: 'Instant shared claim', value: '9,840 ETER' },
  { product: 'Forecast', title: 'Contributor', cycle: 'Weekly CHECK / WITHDRAW', value: '12,100 ETER' },
  { product: 'Elite', title: 'Elite performance', cycle: 'Monthly distribution', value: '96,500 ETER' },
  { product: 'Elite', title: 'Elite legacy', cycle: 'Quarterly distribution', value: '212,000 ETER' },
];
const prizeCategories = ['FAN Community', 'Forecast', 'SHIELD', 'Stock', 'Elite'] as const;

function LegacyEarnPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const user = useEternityUserState();
  const journey = useJourney();
  const missions = useMemo(() => buildMissionRegistry(user), [user]);
  const activeMission = missions.find((mission) => mission.id === journey.plan?.activeMissionId) ?? defaultMission(user);
  const expectedEQ = Number(activeMission?.legacyExpectedImpact.find((item) => item.kind === 'eq')?.value?.replace(/[^\d]/g, '') ?? 0);
  const requestedView = searchParams.get('view') as EarnView | null;
  const activeView = views.some((view) => view.key === requestedView) ? requestedView! : 'overview';
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [poolCategory, setPoolCategory] = useState<(typeof prizeCategories)[number]>('FAN Community');
  const claimable = useMemo(() => mockRewards.filter((reward) => reward.status === 'claimable' && !claimed.has(reward.id)), [claimed]);
  const pending = mockRewards.filter((reward) => reward.status === 'pending');
  const tokenTotals = useMemo(() => claimable.reduce<Record<string, number>>((totals, reward) => ({ ...totals, [reward.token]: (totals[reward.token] || 0) + reward.amount }), {}), [claimable]);

  const setView = (view: EarnView) => setSearchParams(view === 'overview' ? {} : { view }, { replace: true });

  return (
    <AppShell title="Earn" wide>
      <div className="space-y-6">
        <SectionTabs label="Earn views" items={views} active={activeView} onChange={setView} />

        <CurrentMissionCard
          title={activeMission?.title ?? 'Choose a meaningful first mission'}
          expectedEQ={expectedEQ}
          showEq={!isSpecial3ShellEnabled()}
          onContinue={() => navigate(activeMission?.route ?? '/home')}
        />

        {activeView === 'overview' && (
          <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6 items-start">
            <div className="space-y-6">
              <section aria-labelledby="claimable-title">
                <div className="flex items-end justify-between mb-3">
                  <div><p className="eyebrow">Available now</p><h2 id="claimable-title" className="section-title mt-1">Claimable rewards</h2></div>
                  <span className="text-sm font-bold text-warning-DEFAULT">{claimable.length} signatures</span>
                </div>
                <div className="vf-claim-grid">
                  {claimable.length > 0 ? (
                    <div className="contents">
                      {claimable.map((reward) => (
                        <article key={reward.id} className="vf-claim-card">
                          <div className="vf-claim-icon"><Gift size={18} /></div>
                          <div className="min-w-0">
                            <p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{reward.source}</p>
                            <p className={cn('text-xs mt-1 capitalize', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{reward.type} reward · One wallet signature</p>
                          </div>
                          <div className="vf-claim-action">
                            <p className="text-sm font-bold text-success-DEFAULT tabular-nums">{reward.amount} {reward.token}</p>
                            <button type="button" onClick={() => setSelectedReward(reward)} className="cut-button px-4 text-primary-500 focus-ring">Confirm</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="vf-claim-empty"><CheckCircle2 size={28}/><strong>Everything is claimed</strong><small>New verified rewards will appear here.</small></div>
                  )}
                </div>
                {claimable.length > 1 && <p className={cn('text-xs mt-3 leading-relaxed', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Rewards are intentionally reviewed separately. “Claim all” is only enabled when a verified batch contract can complete them with one transparent transaction.</p>}
              </section>

              <section aria-labelledby="pending-title">
                <div className="mb-3"><p className="eyebrow">Not yet available</p><h2 id="pending-title" className="section-title mt-1">Pending rewards</h2></div>
                <div className="surface">
                  {pending.map((reward) => (
                    <div key={reward.id} className="flex items-center gap-4 p-4 sm:p-5">
                      <div className="w-10 h-10 text-accent-DEFAULT flex items-center justify-center"><Clock3 size={18} /></div>
                      <div className="flex-1"><p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{reward.source}</p><p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Available after {reward.claimableAt}</p></div>
                      <p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{reward.amount} {reward.token}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-20">
              <section className="surface p-5" aria-labelledby="reward-summary">
                <p className="eyebrow">Summary</p>
                <h2 id="reward-summary" className="section-title mt-1">Ready by token</h2>
                <div className="space-y-3 mt-5">
                  {Object.entries(tokenTotals).map(([token, amount]) => (
                    <div key={token} className={cn('flex items-center justify-between p-3 rounded-xl', isDark ? 'bg-dark-surface' : 'bg-light-bg')}><span className={cn('text-sm font-semibold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{token}</span><span className={cn('text-lg font-bold tabular-nums', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{amount.toFixed(1)}</span></div>
                  ))}
                </div>
              </section>
              <button type="button" onClick={() => setView('opportunities')} className="action-surface w-full p-5 text-left focus-ring hover:border-primary-500/50">
                <TrendingUp size={20} className="text-primary-500" /><p className={cn('text-sm font-bold mt-4', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>Explore earning opportunities</p><p className={cn('text-xs mt-1 leading-relaxed', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Compare purpose, conditions and risks before participating.</p><span className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-primary-500">Explore <ArrowRight size={15} /></span>
              </button>
            </aside>
          </div>
        )}

        {activeView === 'opportunities' && (
          <section aria-labelledby="opportunities-title">
            <div className="mb-4"><p className="eyebrow">Choose by goal</p><h2 id="opportunities-title" className="section-title mt-1">Earning opportunities</h2><p className={cn('text-sm mt-2', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Estimated returns are informational, never guaranteed.</p></div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {opportunityCards.map((card) => (
                <button key={card.title} type="button" onClick={() => navigate(card.route)} className="action-surface min-h-52 p-5 text-left focus-ring transition-colors hover:border-primary-500/50">
                  <div className="flex items-start justify-between"><div className={card.color}>{card.route.startsWith('/qora') ? <QoraAgentIcon size={28} state="thinking" /> : <card.icon size={22} />}</div><ArrowRight size={16} className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} /></div>
                  <p className={cn('text-base font-bold mt-5', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{card.title}</p>
                  <p className={cn('text-sm mt-2 leading-relaxed', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{card.description}</p>
                  {'stars' in card && typeof card.stars === 'number' && <FanLevelStars stars={card.stars} size="sm" animated className="mt-4" />}
                  <p className={cn('text-sm font-bold mt-2', card.color)}>{card.value}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeView === 'pools' && (
          <section className="space-y-5" aria-labelledby="prize-pools-title">
            <div><p className="eyebrow">Feature reward treasury</p><h2 id="prize-pools-title" className="section-title mt-1">Prize pools</h2><p className="text-sm text-[var(--muted)] mt-2">Network income is paid directly and is not shown here. These cards represent periodic or shared-claim reward contracts.</p></div>
            <label className="earn-prize-filter">
              <span>Prize category</span>
              <select value={poolCategory} onChange={(event) => setPoolCategory(event.target.value as typeof poolCategory)}>
                {prizeCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <div className="safety-surface p-4"><div className="flex items-center gap-2 text-warning-DEFAULT"><Clock3 size={17} /><strong>Weekly reward window</strong></div><div className="grid grid-cols-2 gap-2 mt-3"><div className="data-surface p-3"><p className="text-xs text-[var(--muted)]">CHECK · first 3 days</p><p className="font-bold tabular-nums mt-1">02d 08h 14m</p></div><div className="data-surface p-3"><p className="text-xs text-[var(--muted)]">WITHDRAW · final 4 days</p><p className="font-bold tabular-nums mt-1">04d 00h 00m</p></div></div></div>
            <div className="vf-prize-groups"><section><header><strong>{poolCategory}</strong><span>{prizePools.filter((pool) => pool.product === poolCategory).length} pools</span></header><div>{prizePools.filter((pool) => pool.product === poolCategory).map((pool) => <article key={`${pool.product}-${pool.title}`}><span>{pool.cycle}</span><h3>{pool.title}</h3><strong>{pool.value}</strong><button type="button" onClick={() => navigate(`/qora?prompt=${encodeURIComponent(`Check my eligibility for the ${pool.title} reward pool and explain the requirements.`)}`)}>Eligibility <ArrowRight size={14}/></button></article>)}</div></section></div>
          </section>
        )}

        {activeView === 'history' && (
          <section aria-labelledby="history-title">
            <div className="mb-4"><p className="eyebrow">Verified record</p><h2 id="history-title" className="section-title mt-1">Reward history</h2></div>
            <div className="surface overflow-hidden">
              <div className={cn('divide-y', isDark ? 'divide-dark-border' : 'divide-light-border')}>
                {historyItems.map((item) => (
                  <div key={item.title} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_0.7fr_0.7fr] gap-4 items-center p-4 sm:p-5">
                    <div><p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{item.title}</p><p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{item.date}</p></div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-success-DEFAULT"><CheckCircle2 size={14} /> {item.status}</span>
                    <p className="text-sm font-bold text-success-DEFAULT text-right tabular-nums">{item.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <TransactionReviewModal
        open={Boolean(selectedReward)}
        onClose={() => setSelectedReward(null)}
        onConfirm={async () => {
          if (!selectedReward) return;
          await Promise.resolve();
          setClaimed((current) => new Set([...current, selectedReward.id]));
        }}
        action={`Claim ${selectedReward?.source || 'reward'}`}
        amount={selectedReward?.amount}
        token={selectedReward?.token}
        network="Polygon PoS"
        approvalRequired={false}
      />
    </AppShell>
  );
}

const SpecialRewardsPage = lazy(async () => {
  const module = await import('../special3/system/SpecialRewardsPage');
  return { default:module.SpecialRewardsPage };
});

export function EarnPage() {
  if (!isSpecial3ShellEnabled()) return <LegacyEarnPage/>;
  return <Suspense fallback={<AppShell title="Rewards"><div data-special3 role="status">Loading reward aggregation…</div></AppShell>}><SpecialRewardsPage/></Suspense>;
}
