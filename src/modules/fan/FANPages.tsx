import { Fragment, lazy, Suspense, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, Check, ArrowRight, TrendingUp, Copy, HandCoins, LayoutDashboard, Route, Users,
} from '@icons';
import { AppShell } from '../../components/layout/AppShell';
import { TransactionReviewModal } from '../../components/modals/TransactionReviewModal';
import { PaymentTokenSelector } from '../../components/forms/PaymentTokenSelector';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { mockFanProfile, mockUser, mockTokenRates } from '../../data/mockAssets';
import { fanAdapter } from '../../adapters/mock/fanAdapter';
import {
  ACCESS_LEVELS, ACCESS_FEATURES, CATEGORY_LABELS,
  fanLevelToAccessKey, getNewlyUnlockedFeatures, isFeatureUnlocked,
} from '../../data/accessMatrix';
import type { PaymentToken } from '../../lib/types';
import { FanLevelStars } from '../../components/ui/FanLevelStars';
import { CommunityOrbit } from '../../components/fan/CommunityOrbit';
import { SectionTabs } from '../../components/ui/SectionTabs';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';

const SpecialFanPresentation = lazy(async()=>{const module=await import('../../special3/products/fan/SpecialFanPages');return {default:module.SpecialFanPresentation}});
type SpecialFanView='overview'|'join'|'upgrade'|'renewal'|'network'|'status'|'income'|'rewards'|'prize-pools'|'growth'|'referrals'|'indie';
function FanPresentationBoundary({view,legacy}:{view:SpecialFanView;legacy:React.ReactNode}){return isSpecialProductPresentationEnabled('FanCommunity')?<Suspense fallback={<AppShell title="FAN Community"><div data-special3 role="status">Loading FanCommunity presentation…</div></AppShell>}><SpecialFanPresentation view={view}/></Suspense>:legacy}

const FAN_UPGRADE_PRICES: Record<string, number> = {
  fan: 0,
  '1star': 10,
  '2star': 40,
  '3star': 160,
  '4star': 700,
};

// Determine user's FAN status
const userFanLevel = mockUser.fanLevel;

function GrowthMark({ id, stars }: { id: string; stars: number }) {
  const badges: Record<string, string> = {
    legioner: '/assets/ui/fan-legioner-clean.png',
    legend: '/assets/ui/fan-legend-clean.png',
    'legend-one': '/assets/ui/fan-legend-clean.png',
  };
  return badges[id]
    ? <span className={`fan-growth-mark${id === 'legend-one' ? ' is-legend-one' : ''}`}>
        {id === 'legend-one' && <FanLevelStars stars={1} size="xs"/>}
        <img src={badges[id]} alt="" />
      </span>
    : <FanLevelStars stars={stars} size="sm" />;
}

function LegacyFANPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fp = mockFanProfile;
  const [copied, setCopied] = useState(false);
  const initialSection = pathname.endsWith('/status') ? 'status' : pathname.endsWith('/network') || pathname.endsWith('/referrals') ? 'community' : pathname.endsWith('/legion') || pathname.endsWith('/indie') ? 'growth' : 'overview';
  const [section, setSection] = useState<'overview' | 'status' | 'community' | 'growth'>(initialSection);
  const inviteLink = `https://example.invalid/invite/${mockUser.primaryEid}`;
  const isFirstExperience = userFanLevel === 'none';
  const growth = [
    { id: 'fan', stars: 0, label: 'FAN access', detail: 'Free community membership' },
    { id: 'one', stars: 1, label: 'FAN access', detail: 'Complete subscription slot 1' },
    { id: 'two', stars: 2, label: 'FAN access', detail: 'Complete subscription slot 2' },
    { id: 'three', stars: 3, label: 'FAN access', detail: 'Complete subscription slot 3' },
    { id: 'four', stars: 4, label: 'FAN access', detail: 'Complete all four subscription slots' },
    { id: 'legioner', stars: 4, label: 'LEGIONER', detail: 'Build and maintain a qualified community' },
    { id: 'legend', stars: 4, label: 'LEGEND', detail: 'Reach the Legend community milestone' },
    { id: 'legend-one', stars: 1, label: 'LEGEND', detail: 'Legend progression · first star' },
  ];
  if (isFirstExperience) {
    return <AppShell title="FAN Community" showBack wide><div className="mx-auto max-w-3xl py-6"><section className="brand-surface p-6 sm:p-8 text-center"><p className="data-label">FAN COMMUNITY</p><h1 className="display-title mt-3">JOIN TO COMMUNITY</h1><p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">Choose free access or subscribe directly to an eligible FAN level. Your community dashboard becomes available after joining.</p><button onClick={() => navigate('/fan/join')} className="vf-fan-join mt-6 inline-flex min-h-12 items-center justify-center gap-2 px-6 font-bold">JOIN <ArrowRight size={16} /></button></section></div></AppShell>;
  }
  return <AppShell title="FAN Community" showBack wide><div className="space-y-4">
    <SectionTabs label="FAN community views" items={[{ key: 'overview', label: 'Overview', icon: LayoutDashboard }, { key: 'status', label: 'Status', icon: Activity }, { key: 'community', label: 'Your Community', icon: Users }, { key: 'growth', label: 'Growth Path', icon: Route }]} active={section} onChange={(key) => { const next = key as typeof section; setSection(next); navigate(next === 'overview' ? '/fan' : next === 'community' ? '/fan/network' : next === 'growth' ? '/fan/legion' : '/fan/status', { replace: true }); }} />
    {section === 'overview' && <>
    <section className="brand-surface fan-profile-card p-5"><div><p className="data-label">Your FAN level</p><FanLevelStars stars={fp.starLevel} size="lg" animated className="mt-2" /><p className="fan-generation">GEN: <strong>GENESIS</strong></p></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">{[['Direct referrals', fp.directReferrals], ['Community fans', fp.activeDownline], ['Community income', `${fp.claimableIncome} ETER`], ['Renewal', fp.nextRenewal]].map(([label, value]) => <div key={label} className="data-surface p-2.5"><p className="text-xs text-[var(--muted)]">{label}</p><p className="font-bold mt-1">{value}</p></div>)}</div><div className="grid grid-cols-2 gap-2 mt-4"><button onClick={() => navigate('/fan/join')} className="vf-fan-join px-3 font-bold">JOIN</button><button onClick={() => navigate('/fan/upgrade')} className="cut-button cut-button--primary px-3">Upgrade</button></div><div className="data-surface flex items-center gap-2 p-3 mt-3"><span className="flex-1 min-w-0 truncate font-mono text-xs">{inviteLink}</span><button onClick={() => { navigator.clipboard.writeText(inviteLink); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} className="invite-link-cta cut-button px-3"><Copy size={14} /> {copied ? 'Copied' : 'Invite link'}</button></div></section>
    <section className="surface p-4 flex items-center justify-between"><div><p className="data-label">Referral Score</p><p className="text-xs text-[var(--muted)] mt-1">Quality of active, retained and verified referrals.</p></div><strong className="text-xl text-success-DEFAULT">{fp.referralQualityScore}/100</strong></section>
    </>}
    {section === 'status' && <section className="surface p-4 animate-fade-in"><div className="flex items-center justify-between"><div><p className="data-label">Community status</p><h2 className="section-title mt-1">Active and growing</h2></div><span className="text-success-DEFAULT font-bold">{fp.activeDownline} active</span></div><div className="h-2 bg-primary-500/10 mt-3"><div className="h-full bg-success-DEFAULT" style={{ width: `${fp.referralQualityScore}%` }} /></div><button onClick={() => navigate('/fan/income')} className="cut-button w-full px-3 mt-4 flex items-center justify-center gap-2"><HandCoins size={14} /> View 15-level Community Income</button></section>}
    {section === 'community' && <CommunityOrbit />}
    {section === 'growth' && <section className="fan-growth-path animate-fade-in">{growth.map((level, index) => {
      const currentId = ['fan', 'one', 'two', 'three', 'four'][fp.starLevel];
      const currentIndex = growth.findIndex((item) => item.id === currentId);
      const locked = index > currentIndex;
      return <article key={level.id} aria-disabled={locked} className={cn('surface fan-growth-level', level.id === currentId && 'is-current', locked && 'is-locked')}>
        <GrowthMark id={level.id} stars={level.stars} />
        <div className="flex-1"><p className="text-sm font-bold">{level.label}</p><p className="text-xs text-[var(--muted)]">{level.detail}</p></div>
        {level.id === currentId && <span className="fan-growth-state">Current</span>}
        {locked && <span className="fan-growth-state">Locked</span>}
      </article>;
    })}</section>}
    {section === 'overview' && <><button onClick={() => navigate('/fan/access')} className="cut-button w-full px-4">Access &amp; Benefits</button><p className="safety-surface p-3 text-xs text-warning-DEFAULT">Grow responsibly. Never promise guaranteed returns.</p></>}
  </div></AppShell>;
}

function LegacyJoinFANPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [paymentToken, setPaymentToken] = useState<PaymentToken>('ETER');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [referrer, setReferrer] = useState('');
  const arrivedByReferral = Boolean(searchParams.get('ref') || searchParams.get('invite'));
  const canJoinIndie = userFanLevel === 'none' && !arrivedByReferral;

  const joinPrices: Record<string, number> = { fan0: 0, star1: 10, star2: 50, star3: 210, indie: 910 };
  const price = selectedLevel ? joinPrices[selectedLevel] ?? 0 : 0;
  const estToken = price > 0 ? parseFloat((price / (mockTokenRates[paymentToken] || 1)).toFixed(4)) : 0;

  const selectedLevelObj = ACCESS_LEVELS.find((l) => l.key === selectedLevel);
  const unlocksForSelected = selectedLevel
    ? ACCESS_FEATURES.filter((f) => isFeatureUnlocked(f, selectedLevel as never))
    : [];

  return (
    <AppShell title="Join FAN Community" showBack>
      <div className="space-y-4 pb-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {([1, 2, 3] as const).map((s) => (
            <Fragment key={s}>
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                step === s ? 'bg-primary-500 text-white' : step > s ? 'bg-success-DEFAULT/20 text-success-DEFAULT' : isDark ? 'bg-dark-border text-dark-textSecondary' : 'bg-light-border text-light-textSecondary'
              )}>
                {step > s ? <Check size={12} /> : <span className={cn('w-2 h-2 rounded-full', step === s ? 'bg-white' : 'bg-current opacity-40')} />}
              </div>
              {s < 3 && <div className={cn('flex-1 h-px', step > s ? 'bg-success-DEFAULT/40' : isDark ? 'bg-dark-border' : 'bg-light-border')} />}
            </Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs">
          <span className={cn(step >= 1 ? 'text-primary-500 font-semibold' : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Choose Level</span>
          <span className={cn(step >= 2 ? 'text-primary-500 font-semibold' : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Preview Benefits</span>
          <span className={cn(step >= 3 ? 'text-primary-500 font-semibold' : isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Payment</span>
        </div>

        {/* Step 1: Choose level */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>Choose your starting level</p>
            <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>You can always upgrade later. Your level determines your benefits and earning potential.</p>

            {[
              {
                key: 'fan0',
                stars: 0,
                price: 'Free',
                desc: 'Join the community, receive QDrop airdrops, access social features',
                features: ['FAN Community access', 'QDrop airdrops', 'Social ecosystem features'],
                color: 'text-primary-500',
                bg: 'bg-primary-500/10',
              },
              {
                key: 'star1', stars: 1, price: '$10/year', desc: 'Unlock referral income and one-star access.',
                features: ['Referral income', 'EIP participation', 'FAN income stream', 'Level-based prize draws'], color: 'text-primary-500', bg: 'bg-primary-500/10',
              },
              { key: 'star2', stars: 2, price: '$50 total', desc: 'Start directly with broader access and two-star income eligibility.', features: ['All lower access', 'Expanded network income', 'Forecast contributor eligibility'], color: 'text-success-DEFAULT', bg: 'bg-success-DEFAULT/10' },
              { key: 'star3', stars: 3, price: '$210 total', desc: 'Direct three-star registration with the first three access levels combined.', features: ['All lower access', 'Expanded feature access', 'Starred Savior eligibility'], color: 'text-warning-DEFAULT', bg: 'bg-warning-DEFAULT/10' },
              { key: 'indie', stars: 4, price: '$910 once', desc: 'Independent FAN path: one-time payment, no annual renewal and no referrer required.', features: ['Independent registration', 'No annual renewal', 'No referrer required'], color: 'text-primary-500', bg: 'bg-primary-500/10' },
            ].filter((level) => level.key !== 'indie' || canJoinIndie).map((level) => (
              <button
                key={level.key}
                onClick={() => setSelectedLevel(level.key)}
                className={cn(
                  'w-full text-left rounded-2xl p-4 border-2 transition-all disabled:opacity-45',
                  selectedLevel === level.key
                    ? 'border-primary-500 bg-primary-500/5'
                    : isDark ? 'border-dark-border bg-dark-card' : 'border-light-border bg-light-card shadow-sm'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2"><FanLevelStars stars={level.stars} size="sm" animated={selectedLevel === level.key} />{level.key === 'indie' && <strong className="text-xs text-primary-500">INDIE</strong>}</span>
                  </div>
                  <span className={cn('text-sm font-bold', level.key === 'fan0' ? 'text-success-DEFAULT' : 'text-primary-500')}>{level.price}</span>
                </div>
                <p className={cn('text-xs mb-2', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{level.desc}</p>
                <div className="space-y-1">
                  {level.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5">
                      <Check size={10} className="text-success-DEFAULT flex-shrink-0" />
                      <span className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{f}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}

            <button
              disabled={!selectedLevel}
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl gradient-primary text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Benefits preview */}
        {step === 2 && selectedLevelObj && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div><p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>Benefits at selected access</p><span className="inline-flex items-center gap-2 mt-2"><FanLevelStars stars={selectedLevelObj.stars} size="sm" />{selectedLevel === 'indie' && <strong className="text-xs text-primary-500">INDIE</strong>}</span></div>
              <span className={cn('text-xs font-bold px-2 py-1 rounded-full', selectedLevelObj.bgColor, selectedLevelObj.color)}>
                {unlocksForSelected.length} features
              </span>
            </div>

            {Object.keys(CATEGORY_LABELS).map((cat) => {
              const features = unlocksForSelected.filter((f) => f.category === cat);
              if (features.length === 0) return null;
              return (
                <div key={cat} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
                  <p className={cn('text-xs font-bold uppercase tracking-wider mb-2', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{CATEGORY_LABELS[cat]}</p>
                  <div className="space-y-2">
                    {features.map((f) => (
                      <div key={f.id} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-success-DEFAULT/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={9} className="text-success-DEFAULT" />
                        </div>
                        <div>
                          <p className={cn('text-xs font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{f.label}</p>
                          <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{f.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep(1)} className={cn('py-3 rounded-2xl text-sm font-semibold', isDark ? 'bg-dark-card border border-dark-border text-dark-textSecondary' : 'bg-light-card border border-light-border text-light-textSecondary shadow-sm')}>
                Back
              </button>
              <button onClick={() => setStep(3)} className="py-3 rounded-2xl gradient-primary text-white font-bold text-sm flex items-center justify-center gap-2">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && selectedLevelObj && (
          <div className="space-y-3 animate-fade-in">
            <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
              <div className="flex items-center justify-between mb-2">
                <p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>Joining as</p>
                <span className="inline-flex items-center gap-2"><FanLevelStars stars={selectedLevelObj.stars} size="sm" />{selectedLevel === 'indie' && <strong className="text-xs text-primary-500">INDIE</strong>}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Annual subscription</p>
                <p className={cn('text-base font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
                  {price === 0 ? 'Free' : selectedLevel === 'indie' ? `$${price} one-time` : `$${price}`}
                </p>
              </div>
            </div>

            {price > 0 && (
              <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
                <PaymentTokenSelector
                  selected={paymentToken}
                  onChange={setPaymentToken}
                  usdAmount={price}
                  balances={{ USDT: mockUser.usdtBalance, ETER: mockUser.eterBalance, ET: mockUser.etBalance, Q: mockUser.qBalance }}
                  label="Pay with"
                />
              </div>
            )}

            {selectedLevel !== 'indie' && <label className={cn('block rounded-2xl p-4 text-sm font-bold', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border')}>
              Referrer wallet or EID <span className="font-normal text-[var(--muted)]">(optional when opened from an invite link)</span>
              <input value={referrer} onChange={(event) => setReferrer(event.target.value)} placeholder="0x... or NAME.ETER" className="field-control px-3 mt-2 font-mono" />
            </label>}

            {selectedLevel === 'indie' && <p className="data-surface p-3 text-xs text-[var(--muted)]">Indie FAN does not require a referrer and has no annual renewal.</p>}

            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <p className="text-xs text-primary-500">Your referral link will be generated based on your EID: <strong>{mockUser.primaryEid}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep(2)} className={cn('py-3 rounded-2xl text-sm font-semibold', isDark ? 'bg-dark-card border border-dark-border text-dark-textSecondary' : 'bg-light-card border border-light-border text-light-textSecondary shadow-sm')}>
                Back
              </button>
              <button
                onClick={() => price === 0 ? navigate('/fan') : setReviewOpen(true)}
                className="py-3 rounded-2xl gradient-primary text-white font-bold text-sm"
              >
                {price === 0 ? 'Join Free' : `Join — ${estToken} ${paymentToken}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {price > 0 && (
        <TransactionReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          onConfirm={() => fanAdapter.upgradeFan(mockUser.walletAddress, selectedLevel as never)}
          action="Join FAN Community"
          amount={estToken}
          token={paymentToken}
          network="Polygon"
        />
      )}
    </AppShell>
  );
}

function LegacyFANUpgradePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [paymentToken, setPaymentToken] = useState<PaymentToken>('ETER');
  const [reviewOpen, setReviewOpen] = useState(false);
  const fp = mockFanProfile;

  const levelKeys = Object.keys(FAN_UPGRADE_PRICES);
  const currentIdx = levelKeys.indexOf(fp.level);
  const nextLevel = levelKeys[currentIdx + 1];
  const upgradePrice = nextLevel ? FAN_UPGRADE_PRICES[nextLevel] : 0;
  const estToken = upgradePrice > 0 ? parseFloat((upgradePrice / (mockTokenRates[paymentToken] || 1)).toFixed(4)) : 0;

  const currentAccessKey = fanLevelToAccessKey(fp.level);
  const nextAccessKey = nextLevel ? fanLevelToAccessKey(nextLevel as never) : null;
  const newlyUnlocked = nextAccessKey ? getNewlyUnlockedFeatures(currentAccessKey, nextAccessKey) : [];
  const currentLevel = ACCESS_LEVELS.find((l) => l.key === currentAccessKey);
  const nextAccessLevel = nextAccessKey ? ACCESS_LEVELS.find((l) => l.key === nextAccessKey) : null;
  const categories = Array.from(new Set(newlyUnlocked.map((f) => f.category)));

  return (
    <AppShell title="Upgrade FAN Level" showBack>
      <div className="space-y-4 pb-4">
        {/* Level comparison */}
        <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <div className="flex items-center gap-3 mb-3">
            <div className={cn('flex-1 rounded-xl p-3 text-center', isDark ? 'bg-dark-surface' : 'bg-light-bg')}>
              <p className={cn('text-xs mb-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Current</p>
              <FanLevelStars stars={currentLevel?.stars ?? fp.starLevel} size="sm" />
            </div>
            <ArrowRight size={16} className="text-primary-500 flex-shrink-0" />
            {nextLevel ? (
              <div className="flex-1 rounded-xl p-3 text-center border-2 border-primary-500/40 bg-primary-500/5">
                <p className={cn('text-xs mb-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Upgrade to</p>
                <FanLevelStars stars={nextAccessLevel?.stars ?? fp.starLevel + 1} size="sm" animated />
              </div>
            ) : (
              <div className={cn('flex-1 rounded-xl p-3 text-center', isDark ? 'bg-dark-surface' : 'bg-light-bg')}>
                <p className="text-xs text-success-DEFAULT font-semibold">Max Level</p>
              </div>
            )}
          </div>
          {nextLevel && (
            <p className={cn('text-xs text-center', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
              Annual subscription: <span className="font-bold text-warning-DEFAULT">${upgradePrice}/year</span>
            </p>
          )}
          {!nextLevel && <p className="text-xs mt-2 text-success-DEFAULT font-semibold text-center">You are at the highest FAN level!</p>}
        </div>

        {/* New features */}
        {nextLevel && newlyUnlocked.length > 0 && (
          <div className={cn('rounded-2xl p-4 border border-success-DEFAULT/30 bg-success-DEFAULT/5', isDark ? '' : 'shadow-sm')}>
            <p className={cn('text-xs font-bold mb-3', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
              {newlyUnlocked.length} new features after upgrade:
            </p>
            {categories.map((cat) => (
              <div key={cat} className="mb-3 last:mb-0">
                <p className={cn('text-xs font-bold uppercase tracking-wide mb-2', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{CATEGORY_LABELS[cat]}</p>
                <div className="space-y-1.5">
                  {newlyUnlocked.filter((f) => f.category === cat).map((f) => (
                    <div key={f.id} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-success-DEFAULT/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={9} className="text-success-DEFAULT" />
                      </div>
                      <div>
                        <p className={cn('text-xs font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{f.label}</p>
                        <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {nextLevel && (
          <>
            <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
              <PaymentTokenSelector
                selected={paymentToken}
                onChange={setPaymentToken}
                usdAmount={upgradePrice}
                balances={{ USDT: mockUser.usdtBalance, ETER: mockUser.eterBalance, ET: mockUser.etBalance, Q: mockUser.qBalance }}
                label="Pay upgrade with"
              />
            </div>
            <button
              onClick={() => setReviewOpen(true)}
              className="w-full py-3.5 rounded-2xl gradient-primary text-white font-bold text-sm"
            >
              Upgrade FAN access — {estToken} {paymentToken}
            </button>
          </>
        )}
      </div>

      {nextLevel && (
        <TransactionReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          onConfirm={() => fanAdapter.upgradeFan(mockUser.walletAddress, nextLevel as never)}
          action="Upgrade FAN access"
          amount={estToken}
          token={paymentToken}
          network="Polygon"
        />
      )}
    </AppShell>
  );
}

function LegacyFANRewardsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AppShell title="FAN Rewards" showBack>
      <div className="space-y-3">
        <div className={cn('rounded-2xl p-4 space-y-2', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <Row label="Periodic reward allocation" value="84.20 ETER" isDark={isDark} accent />
          <Row label="CHECK window" value="First 3 days" isDark={isDark} />
          <Row label="WITHDRAW window" value="Final 4 days" isDark={isDark} />
          <hr className={isDark ? 'border-dark-border' : 'border-light-border'} />
          <Row label="Current action" value="CHECK available" isDark={isDark} accent />
        </div>
        <button
          onClick={() => navigate('/earn')}
          className="w-full py-3.5 rounded-2xl gradient-primary text-white font-semibold flex items-center justify-center gap-2"
        >
          <TrendingUp size={16} />
          Open periodic rewards in Earn
        </button>
        <p className={cn('text-xs text-center', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
          Network income is sent directly to the wallet and never appears in this reward claim flow.
        </p>
      </div>
    </AppShell>
  );
}

function LegacyFANIncomePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const levels = Array.from({ length: 15 }, (_, index) => ({ level: index + 1, fans: Math.max(2, 18 - index), income: Number((42.5 / (index + 1)).toFixed(2)), stars: (index % 4) + 1 }));
  const total = levels.reduce((sum, row) => sum + row.income, 0);
  return <AppShell title="Community Income" showBack>
    <div className="fan-income-page space-y-4">
      <div className="brand-surface fan-income-summary p-5">
        <span><HandCoins size={24}/></span>
        <div><p className="data-label">15-level community income</p><p className="font-display text-3xl font-bold text-success-DEFAULT mt-2">{total.toFixed(2)} ETER</p><p className="text-xs text-[var(--muted)] mt-2">All genealogy levels are visible in one continuous report.</p></div>
      </div>
      <div className={cn('surface fan-income-levels', isDark ? 'divide-dark-border' : 'divide-light-border')}>
        {levels.map((row) => <div key={row.level}>
          <span className="fan-income-level-index">{String(row.level).padStart(2, '0')}</span>
          <FanLevelStars stars={row.stars} size="xs" />
          <div><p className="text-sm font-bold">Community level {row.level}</p><p className="text-xs text-[var(--muted)]">{row.fans} community fans</p></div>
          <strong className="text-success-DEFAULT tabular-nums">{row.income} ETER</strong>
        </div>)}
      </div>
    </div>
  </AppShell>;
}

function Row({ label, value, isDark, accent }: { label: string; value: string; isDark: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>{label}</span>
      <span className={cn('font-semibold', accent ? 'text-success-DEFAULT' : (isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'))}>{value}</span>
    </div>
  );
}

export function FANPage(){const {pathname}=useLocation();const view:SpecialFanView=pathname.endsWith('/referrals')?'referrals':pathname.endsWith('/network')?'network':pathname.endsWith('/status')?'status':pathname.endsWith('/legion')?'growth':pathname.endsWith('/indie')?'indie':'overview';return <FanPresentationBoundary view={view} legacy={<LegacyFANPage/>}/>} 
export const JoinFANPage=()=> <FanPresentationBoundary view="join" legacy={<LegacyJoinFANPage/>}/>;
export const FANUpgradePage=()=> <FanPresentationBoundary view="upgrade" legacy={<LegacyFANUpgradePage/>}/>;
export const FANRenewalPage=()=> <FanPresentationBoundary view="renewal" legacy={<LegacyFANUpgradePage/>}/>;
export const FANRewardsPage=()=> <FanPresentationBoundary view="rewards" legacy={<LegacyFANRewardsPage/>}/>;
export const FANPrizePoolsPage=()=> <FanPresentationBoundary view="prize-pools" legacy={<LegacyFANRewardsPage/>}/>;
export const FANIncomePage=()=> <FanPresentationBoundary view="income" legacy={<LegacyFANIncomePage/>}/>;
