import React, { useMemo, useState } from 'react';
import {
  Activity, ArrowUpRight, Award, BarChart3, Check, ChevronDown, ChevronRight,
  CircleDollarSign, Clock3, Coins, Fingerprint, Gift, Info, Layers3, LockKeyhole,
  Network, RefreshCw, ShieldCheck, Sparkles, Target, Trophy, Users, Vote, Zap,
} from '@icons';
import { AppShell } from '../../components/layout/AppShell';
import { mockUser } from '../../data/mockAssets';
import {
  ACHIEVEMENT_PRODUCTS, EQ_LEDGER, PROTOCOL_LEVELS, REFERRAL_EQ_ROWS,
  getLevelState, getTrackState,
  type AchievementProduct, type AchievementProductId, type AchievementTrack,
} from '../../data/achievementProtocol';
import { cn } from '../../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { isSpecial3ShellEnabled } from '../../special3/shell/featureFlag';

const SpecialAchievementPage = React.lazy(async () => {
  const module = await import('../../special3/system/SpecialAchievementPage');
  return { default:module.SpecialAchievementPage };
});

type AchievementTab = 'overview' | 'protocol' | 'levels' | 'referrals' | 'activity';

const PRODUCT_ICONS: Record<AchievementProductId, React.ReactNode> = {
  generator: <Zap size={18} />,
  fan: <Users size={18} />,
  forecast: <Target size={18} />,
  shield: <ShieldCheck size={18} />,
  stock: <BarChart3 size={18} />,
  era: <Vote size={18} />,
  eid: <Fingerprint size={18} />,
};

const TAB_ITEMS: { id: AchievementTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Sparkles size={16} /> },
  { id: 'protocol', label: 'Achievements', icon: <Trophy size={16} /> },
  { id: 'levels', label: 'Level map', icon: <Layers3 size={16} /> },
  { id: 'referrals', label: 'Referral EQ', icon: <Network size={16} /> },
  { id: 'activity', label: 'EQ activity', icon: <Activity size={16} /> },
];

const formatEQ = (value: number) => `${value.toLocaleString()} EQ`;

function ProductIcon({ product, size = 'normal' }: { product: AchievementProduct; size?: 'small' | 'normal' }) {
  return (
    <span
      className={cn('qap-product-icon', size === 'small' && 'is-small')}
      style={{ '--qap-accent': product.accent } as React.CSSProperties}
      aria-hidden="true"
    >
      {PRODUCT_ICONS[product.id]}
    </span>
  );
}

function StatusPill({ state }: { state: 'earned' | 'active' | 'locked' }) {
  return (
    <span className={cn('qap-status-pill', `is-${state}`)}>
      {state === 'earned' ? <Check size={12} /> : state === 'active' ? <Clock3 size={12} /> : <LockKeyhole size={12} />}
      {state === 'earned' ? 'Earned' : state === 'active' ? 'In progress' : 'Locked'}
    </span>
  );
}

function ProductProgressCard({ product, onOpen }: { product: AchievementProduct; onOpen: () => void }) {
  const tracksWithProgress = product.tracks.filter((track) => track.progress !== undefined);
  const states = tracksWithProgress.map(getTrackState);
  const completed = states.reduce((sum, item) => sum + item.completed, 0);
  const total = tracksWithProgress.reduce((sum, track) => sum + track.milestones.length, 0);
  const percentage = total ? Math.round((completed / total) * 100) : 0;

  return (
    <button
      type="button"
      className="qap-product-card"
      style={{ '--qap-accent': product.accent } as React.CSSProperties}
      onClick={onOpen}
      aria-label={`Open ${product.name} achievements`}
    >
      <div className="qap-product-card-head">
        <ProductIcon product={product} />
        <span className="qap-product-arrow"><ArrowUpRight size={16} /></span>
      </div>
      <div>
        <strong>{product.shortName}</strong>
        <span>{product.tracks.length} reward track{product.tracks.length === 1 ? '' : 's'}</span>
      </div>
      <div className="qap-mini-progress" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${product.name} milestone completion`}>
        <i style={{ width: `${percentage}%` }} />
      </div>
      <footer>
        <span>{completed} indexed</span>
        <b>{percentage}%</b>
      </footer>
    </button>
  );
}

function TrackPanel({ track, accent, open, onToggle }: { track: AchievementTrack; accent: string; open: boolean; onToggle: () => void }) {
  const state = getTrackState(track);
  return (
    <section className={cn('qap-track', open && 'is-open')} style={{ '--qap-accent': accent } as React.CSSProperties}>
      <button type="button" className="qap-track-trigger" onClick={onToggle} aria-expanded={open}>
        <span className="qap-track-glyph"><Target size={16} /></span>
        <span className="qap-track-copy">
          <strong>{track.title}</strong>
          <small>{track.progressLabel ?? track.description}</small>
        </span>
        <span className="qap-track-summary">
          {track.progress !== undefined && <b>{state.completed}/{state.total}</b>}
          <ChevronDown size={17} />
        </span>
      </button>
      {track.progress !== undefined && (
        <div className="qap-track-progress" role="progressbar" aria-valuenow={Math.round(state.progress)} aria-valuemin={0} aria-valuemax={100} aria-label={`${track.title} progress`}>
          <i style={{ width: `${state.progress}%` }} />
        </div>
      )}
      {open && (
        <div className="qap-milestones">
          <p>{track.description}</p>
          <div className="qap-milestone-list">
            {track.milestones.map((milestone, index) => {
              const earned = track.progress !== undefined && track.progress >= milestone.threshold;
              const active = track.progress !== undefined && !earned && state.next?.id === milestone.id;
              const status = earned ? 'earned' : active ? 'active' : 'locked';
              return (
                <article key={milestone.id} className={cn('qap-milestone', `is-${status}`)}>
                  <span className="qap-milestone-index" aria-hidden="true">{earned ? <Check size={14} /> : index + 1}</span>
                  <div>
                    <strong>{milestone.label}</strong>
                    <small>{milestone.qualifier ?? milestone.note ?? 'Protocol milestone'}</small>
                  </div>
                  <b>+{milestone.eq.toLocaleString()} <small>EQ</small></b>
                  <StatusPill state={status} />
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function OverviewPanel({ onSelectProduct, onChangeTab }: { onSelectProduct: (id: AchievementProductId) => void; onChangeTab: (tab: AchievementTab) => void }) {
  const nextActions = [
    { product: ACHIEVEMENT_PRODUCTS[1], title: 'Reach 10 active directs', detail: '4 more directs', eq: 100 },
    { product: ACHIEVEMENT_PRODUCTS[2], title: 'Complete 10 active weeks', detail: '6 more weeks', eq: 200 },
    { product: ACHIEVEMENT_PRODUCTS[0], title: 'Reach $5,000 turnover', detail: '$2,600 remaining', eq: 5_000 },
  ];

  return (
    <div className="qap-overview-layout">
      <section className="qap-section qap-products-section">
        <header className="qap-section-head">
          <div><span>Protocol coverage</span><h2>Your achievement tracks</h2></div>
          <button type="button" onClick={() => onChangeTab('protocol')}>View all <ChevronRight size={15} /></button>
        </header>
        <div className="qap-product-grid">
          {ACHIEVEMENT_PRODUCTS.map((product) => (
            <ProductProgressCard key={product.id} product={product} onOpen={() => onSelectProduct(product.id)} />
          ))}
        </div>
      </section>

      <aside className="qap-overview-side">
        <section className="qap-section qap-next-actions">
          <header className="qap-section-head">
            <div><span>Highest impact</span><h2>Best next actions</h2></div>
            <Target size={18} />
          </header>
          <div>
            {nextActions.map((action, index) => (
              <button key={action.title} type="button" onClick={() => onSelectProduct(action.product.id)}>
                <span className="qap-action-rank">{index + 1}</span>
                <span><strong>{action.title}</strong><small>{action.detail}</small></span>
                <b>+{action.eq.toLocaleString()} EQ</b>
              </button>
            ))}
          </div>
        </section>

        <section className="qap-section qap-principles">
          <header className="qap-section-head">
            <div><span>Protocol logic</span><h2>What EQ rewards</h2></div>
            <Info size={18} />
          </header>
          <ul>
            <li><CircleDollarSign size={16} /><span><strong>Direct value</strong><small>Economic activity that strengthens protocol utility.</small></span></li>
            <li><Network size={16} /><span><strong>Network growth</strong><small>Directs, leadership and sustainable community expansion.</small></span></li>
            <li><Award size={16} /><span><strong>Commitment & skill</strong><small>Consistent participation and qualified outcomes.</small></span></li>
          </ul>
        </section>
      </aside>
    </div>
  );
}

function ProtocolPanel({ selectedId, onSelect }: { selectedId: AchievementProductId; onSelect: (id: AchievementProductId) => void }) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const selected = ACHIEVEMENT_PRODUCTS.find((product) => product.id === selectedId) ?? ACHIEVEMENT_PRODUCTS[0];

  return (
    <div className="qap-protocol-layout">
      <nav className="qap-product-nav" aria-label="Achievement features">
        {ACHIEVEMENT_PRODUCTS.map((product) => (
          <button
            type="button"
            key={product.id}
            className={cn(selected.id === product.id && 'is-active')}
            style={{ '--qap-accent': product.accent } as React.CSSProperties}
            onClick={() => { onSelect(product.id); setExpandedTrack(null); }}
          >
            <ProductIcon product={product} size="small" />
            <span><strong>{product.shortName}</strong><small>{product.tracks.length} tracks</small></span>
            <ChevronRight size={15} />
          </button>
        ))}
      </nav>

      <section className="qap-protocol-detail" style={{ '--qap-accent': selected.accent } as React.CSSProperties}>
        <header>
          <ProductIcon product={selected} />
          <div><span>{selected.name}</span><h2>{selected.philosophy}</h2><p>{selected.policy}</p></div>
        </header>
        <div className="qap-track-stack">
          {selected.tracks.map((track, index) => (
            <TrackPanel
              key={track.id}
              track={track}
              accent={selected.accent}
              open={expandedTrack === track.id || (expandedTrack === null && index === 0)}
              onToggle={() => setExpandedTrack((current) => current === track.id ? '' : track.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function LevelsPanel({ totalEQ }: { totalEQ: number }) {
  const levelState = getLevelState(totalEQ);
  return (
    <div className="qap-levels-layout">
      <section className="qap-section qap-level-explainer">
        <div>
          <span className="qap-eyebrow">19-level progression</span>
          <h2>Every EQ point advances one shared ecosystem level.</h2>
          <p>Levels represent cumulative participation across all ETERNITY features. Q rewards are resolved by the reward contract at eligible progression events.</p>
        </div>
        <div className="qap-level-summary">
          <span>Current level</span><strong>L{levelState.current.level}</strong>
          <small>{formatEQ(totalEQ)} total</small>
        </div>
      </section>

      <section className="qap-level-ladder" aria-label="QORA level thresholds">
        {PROTOCOL_LEVELS.map((item) => {
          const state = totalEQ >= item.minEQ ? 'complete' : levelState.next?.level === item.level ? 'current' : 'locked';
          return (
            <article key={item.level} className={`is-${state}`}>
              <span className="qap-level-node">{state === 'complete' ? <Check size={16} /> : item.level}</span>
              <div><small>Level</small><strong>L{item.level}</strong><span>{item.minEQ.toLocaleString()} EQ</span></div>
              <StatusPill state={state === 'complete' ? 'earned' : state === 'current' ? 'active' : 'locked'} />
            </article>
          );
        })}
      </section>
    </div>
  );
}

function ReferralPanel() {
  const earnedBonus = REFERRAL_EQ_ROWS.reduce((sum, row) => sum + row.bonusEQ, 0);
  return (
    <div className="qap-referral-layout">
      <section className="qap-referral-rule">
        <div className="qap-referral-orbit" aria-hidden="true"><Network size={28} /><i /><i /></div>
        <div>
          <span className="qap-eyebrow">First-line reward</span>
          <h2>Earn 10% of eligible direct-line EQ.</h2>
          <p>A direct referral must be at your level or below. Only their personal base EQ is used; referral EQ never generates another referral reward.</p>
        </div>
        <div className="qap-referral-equation" aria-label="Referral bonus formula">
          <span>Eligible base EQ</span><b>× 10%</b><strong>Referral EQ</strong>
        </div>
      </section>

      <section className="qap-section qap-referral-table-wrap">
        <header className="qap-section-head">
          <div><span>Eligibility preview</span><h2>Direct-line EQ</h2></div>
          <div className="qap-referral-total"><small>Indexed bonus</small><strong>+{earnedBonus} EQ</strong></div>
        </header>
        <div className="qap-referral-table" role="table" aria-label="Referral EQ eligibility">
          <div role="row" className="is-head"><span>Member</span><span>Level test</span><span>Base EQ</span><span>10% bonus</span></div>
          {REFERRAL_EQ_ROWS.map((row) => (
            <div role="row" key={row.id}>
              <span><i>{row.eid.slice(0, 1)}</i><b>{row.eid}</b></span>
              <span><small>L{row.level} direct</small><em className={row.eligible ? 'is-eligible' : 'is-ineligible'}>{row.eligible ? `≤ your L${row.userLevel}` : `> your L${row.userLevel}`}</em></span>
              <span>{row.baseEQ.toLocaleString()} EQ</span>
              <span className={row.eligible ? 'is-positive' : ''}>{row.eligible ? `+${row.bonusEQ}` : 'Not eligible'}</span>
            </div>
          ))}
        </div>
        <footer><Info size={14} /> Referral bonuses are shown separately and are excluded from recursive 10% calculations.</footer>
      </section>
    </div>
  );
}

function ActivityPanel() {
  const [filter, setFilter] = useState<AchievementProductId | 'all'>('all');
  const visible = filter === 'all' ? EQ_LEDGER : EQ_LEDGER.filter((row) => row.product === filter);
  return (
    <section className="qap-section qap-ledger">
      <header className="qap-section-head">
        <div><span>On-chain index</span><h2>EQ activity ledger</h2></div>
        <button type="button"><RefreshCw size={14} /> Sync</button>
      </header>
      <div className="qap-ledger-filters" aria-label="Filter EQ activity">
        <button type="button" className={cn(filter === 'all' && 'is-active')} onClick={() => setFilter('all')}>All</button>
        {ACHIEVEMENT_PRODUCTS.map((product) => (
          <button type="button" key={product.id} className={cn(filter === product.id && 'is-active')} onClick={() => setFilter(product.id)}>{product.shortName}</button>
        ))}
      </div>
      <div className="qap-ledger-list">
        {visible.map((row) => {
          const product = ACHIEVEMENT_PRODUCTS.find((item) => item.id === row.product)!;
          return (
            <article key={row.id}>
              <ProductIcon product={product} size="small" />
              <div><strong>{row.label}</strong><small>{product.shortName} · {row.source}</small></div>
              <time>{row.date}</time>
              <b>+{row.amount.toLocaleString()} EQ</b>
              <span><Check size={12} /> Confirmed</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LegacyAchievementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const totalEQ = mockUser.eqPoints;
  const levelState = getLevelState(totalEQ);
  const requestedView = searchParams.get('view');
  const initialTab: AchievementTab = requestedView === 'badges' ? 'protocol' : (TAB_ITEMS.some((item) => item.id === requestedView) ? requestedView as AchievementTab : 'overview');
  const [tab, setTabState] = useState<AchievementTab>(initialTab);
  const [selectedProduct, setSelectedProduct] = useState<AchievementProductId>('generator');
  const [rewardNotice, setRewardNotice] = useState(false);

  React.useEffect(() => {
    const nextTab: AchievementTab = requestedView === 'badges' ? 'protocol' : (TAB_ITEMS.some((item) => item.id === requestedView) ? requestedView as AchievementTab : 'overview');
    setTabState(nextTab);
  }, [requestedView]);

  const remaining = levelState.next ? levelState.next.minEQ - totalEQ : 0;
  const contributionData = useMemo(() => ACHIEVEMENT_PRODUCTS.map((product) => ({
    ...product,
    value: EQ_LEDGER.filter((row) => row.product === product.id).reduce((sum, row) => sum + row.amount, 0),
  })).filter((item) => item.value > 0), []);

  const openProduct = (id: AchievementProductId) => {
    setSelectedProduct(id);
    setTab('protocol');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const setTab = (nextTab: AchievementTab) => {
    setTabState(nextTab);
    const next = new URLSearchParams(searchParams);
    if (nextTab === 'overview') next.delete('view'); else next.set('view', nextTab);
    setSearchParams(next, { replace: true });
  };

  return (
    <AppShell title="QORA Achievement Protocol" showBack>
      <main className="qap-page">
        <section className="qap-hero">
          <div className="qap-hero-main">
            <div className="qap-level-ring" style={{ '--qap-progress': `${levelState.progress * 3.6}deg` } as React.CSSProperties}>
              <div><span>Level</span><strong>{levelState.current.level}</strong></div>
            </div>
            <div className="qap-hero-copy">
              <span className="qap-eyebrow"><Sparkles size={13} /> QORA reward protocol</span>
              <h1>Your contribution becomes visible progress.</h1>
              <p>Earn EQ across the ecosystem, advance through 19 levels and unlock contract-calculated Q rewards.</p>
              <div className="qap-hero-progress">
                <div><strong>{totalEQ.toLocaleString()} EQ</strong><span>{levelState.next ? `${remaining.toLocaleString()} EQ to Level ${levelState.next.level}` : 'Highest level reached'}</span></div>
                <div role="progressbar" aria-valuenow={Math.round(levelState.progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next QORA level"><i style={{ width: `${levelState.progress}%` }} /></div>
              </div>
            </div>
          </div>
          <aside className="qap-reward-vault">
            <span><Gift size={15} /> Q reward vault</span>
            <div><strong>Contract-calculated</strong><small>Q is settled at eligible progression events.</small></div>
            <button type="button" onClick={() => setRewardNotice(true)}><Coins size={15} /> Check reward status</button>
            {rewardNotice && <p role="status"><Check size={13} /> Wallet is indexed. No claimable settlement yet.</p>}
          </aside>
        </section>

        <section className="qap-stat-strip" aria-label="Achievement summary">
          <div><span><Trophy size={15} /> Current level</span><strong>L{levelState.current.level}</strong></div>
          <div><span><Target size={15} /> Next threshold</span><strong>{levelState.next ? levelState.next.minEQ.toLocaleString() : 'Complete'}</strong><small>{levelState.next ? 'EQ' : ''}</small></div>
          <div><span><Activity size={15} /> Indexed records</span><strong>{EQ_LEDGER.length}</strong></div>
          <div><span><Network size={15} /> Referral rate</span><strong>10%</strong><small>eligible base EQ</small></div>
          <div className="qap-contribution-mini">
            <span>EQ mix</span>
            <div>{contributionData.map((item) => <i key={item.id} style={{ width: `${(item.value / totalEQ) * 100}%`, background: item.accent }} title={`${item.shortName}: ${item.value} EQ`} />)}</div>
          </div>
        </section>

        <nav className="qap-tabs" aria-label="Achievement sections">
          {TAB_ITEMS.map((item) => (
            <button type="button" key={item.id} className={cn(tab === item.id && 'is-active')} onClick={() => setTab(item.id)}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="qap-content">
          {tab === 'overview' && <OverviewPanel onSelectProduct={openProduct} onChangeTab={setTab} />}
          {tab === 'protocol' && <ProtocolPanel selectedId={selectedProduct} onSelect={setSelectedProduct} />}
          {tab === 'levels' && <LevelsPanel totalEQ={totalEQ} />}
          {tab === 'referrals' && <ReferralPanel />}
          {tab === 'activity' && <ActivityPanel />}
        </div>

        <footer className="qap-protocol-note">
          <Info size={15} />
          <p><strong>Protocol accounting:</strong> EQ is indexed from eligible on-chain activity. Feature activation policies apply, and referral EQ is never used as the base for another referral reward.</p>
        </footer>
      </main>
    </AppShell>
  );
}

export function AchievementsPage() {
  if (!isSpecial3ShellEnabled()) return <LegacyAchievementsPage/>;
  return <React.Suspense fallback={<AppShell title="Achievements & EQ"><div data-special3 role="status">Loading Achievement registry…</div></AppShell>}><SpecialAchievementPage/></React.Suspense>;
}
