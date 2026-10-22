import { Award, CheckCircle2, CircleGauge, ExternalLink, Gift, Info, Network, ShieldCheck, Trophy } from '@icons';
import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { useEternityUserState } from '../../lib/userState';
import { Badge, Heading, Text } from '../primitives';
import { SpecialPageHero } from '../hero';
import { getRuntimeAchievementRegistry } from '../progression/runtime';
import { resolveLevel } from '../progression/levelResolver';
import type { AchievementProduct, LockedAchievementRule } from '../progression/types';
import { SpecialMetricCard } from '../ui/SpecialMetricCard';
import achievementPageCss from './achievement-page.css?inline';

const PRODUCT_ORDER: AchievementProduct[] = ['Generator', 'FanCommunity', 'Forecast', 'SHIELD', 'STOCK/EES', 'ERA', 'EID'];
const PRODUCT_ROUTES: Record<AchievementProduct, string> = { Generator:'/generator', FanCommunity:'/fan', Forecast:'/forecast', SHIELD:'/shield', 'STOCK/EES':'/stock', ERA:'/era', EID:'/eid' };
const PRODUCT_LABELS: Record<AchievementProduct, string> = { Generator:'Generator', FanCommunity:'FAN Community', Forecast:'Forecast', SHIELD:'SHIELD', 'STOCK/EES':'STOCK / EES', ERA:'ERA', EID:'EID' };
type View = 'overview' | 'rules' | 'levels' | 'referral' | 'ledger';

const VIEWS: ReadonlyArray<{ value: View; label: string }> = [
  { value:'overview', label:'Overview' },
  { value:'rules', label:'Achievements' },
  { value:'levels', label:'Levels' },
  { value:'referral', label:'Referral EQ' },
  { value:'ledger', label:'Activity' },
];
const registry = getRuntimeAchievementRegistry();

function rulesFor(product: AchievementProduct) {
  return registry.all().filter((rule) => rule.product === product);
}

function productFromValue(value?: string | null) {
  const normalized = value?.toLowerCase().replace(/[^a-z]/g, '');
  return PRODUCT_ORDER.find((product) => product.toLowerCase().replace(/[^a-z]/g, '') === normalized);
}

function capLabel(cap: LockedAchievementRule['cap']) {
  return typeof cap === 'object' ? `${cap.count} events · ${cap.totalEq.toLocaleString()} EQ` : String(cap);
}

function RuleCard({ rule, highlighted }: { rule: LockedAchievementRule; highlighted?: boolean }) {
  return <article className={`s3-achievement-rule glass-subtle ${highlighted ? 'is-highlighted' : ''}`} data-achievement-id={rule.achievementId}>
    <header>
      <span className="s3-achievement-rule__glyph" aria-hidden="true"><Award/></span>
      <span><small>PROTOCOL RULE</small><strong>{rule.milestone.label}</strong></span>
      <Badge tone="primary">Conditional +{rule.eqDelta.toLocaleString()} EQ</Badge>
    </header>
    <p>{rule.qualificationRule}</p>
    <dl>
      <div><dt>Verified event</dt><dd>{rule.eventType}</dd></div>
      <div><dt>Repeatability / cap</dt><dd>{rule.repeatability} · {capLabel(rule.cap)}</dd></div>
      <div><dt>Journey impact</dt><dd>{rule.journeyImpactCategory}</dd></div>
      <div><dt>Referral eligibility</dt><dd>{rule.referralEligibility}</dd></div>
    </dl>
    <footer><ShieldCheck aria-hidden="true"/><span>{rule.forwardOnly ? 'Forward-only' : 'Current-state semantics'} · awarded only after verified, committed evidence.</span></footer>
  </article>;
}

export function SpecialAchievementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const user = useEternityUserState();
  const requested = params.get('view');
  const view: View = location.pathname === '/progress' ? 'levels' : ['rules', 'levels', 'referral', 'ledger'].includes(requested ?? '') ? requested as View : 'overview';
  const matchingRule = id ? registry.byId(id) : undefined;
  const product = matchingRule?.product ?? productFromValue(id) ?? productFromValue(params.get('product')) ?? 'Generator';
  const level = resolveLevel(user.eq, registry.levels);
  const integrity = registry.source.integrityContract;
  const selectedRules = useMemo(() => rulesFor(product), [product]);
  const nextLevelLabel = level.nextThreshold === undefined ? 'Complete' : `${level.nextThreshold.toLocaleString()} EQ`;
  const nextLevelNumber = level.nextThreshold === undefined ? level.level : level.level + 1;
  const progress = Math.round(level.progressPercent);
  const navRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({});
  const filterRef = useRef<HTMLDivElement | null>(null);
  const productRefs = useRef<Partial<Record<AchievementProduct, HTMLButtonElement | null>>>({});

  useEffect(() => {
    const selected = tabRefs.current[view];
    const scrollHost = navRef.current;
    if (!selected || !scrollHost) return;
    const frame = requestAnimationFrame(() => {
      const itemRect = selected.getBoundingClientRect();
      const hostRect = scrollHost.getBoundingClientRect();
      if (itemRect.left < hostRect.left || itemRect.right > hostRect.right) selected.scrollIntoView({ block:'nearest', inline:'center', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);

  useEffect(() => {
    if (view !== 'rules') return;
    const selected = productRefs.current[product];
    const scrollHost = filterRef.current;
    if (!selected || !scrollHost) return;
    const frame = requestAnimationFrame(() => {
      const itemRect = selected.getBoundingClientRect();
      const hostRect = scrollHost.getBoundingClientRect();
      if (itemRect.left < hostRect.left || itemRect.right > hostRect.right) selected.scrollIntoView({ block:'nearest', inline:'center', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [product, view]);

  const setView = (next: View) => {
    if (next === 'overview') setParams({}, { replace:true });
    else if (next === 'rules') setParams({ view:'rules', product }, { replace:true });
    else setParams({ view:next }, { replace:true });
  };
  const selectProduct = (next: AchievementProduct) => setParams({ view:'rules', product:next }, { replace:true });

  return <AppShell title="Achievement" showBack wide showJourneyPresence={false}>
    <style>{achievementPageCss}</style>
    <main className="s3-achievement-page" data-achievement-view={view}>
      <SpecialPageHero
        title="Achievement"
        description={level.nextThreshold === undefined ? 'Every level threshold has been reached.' : `One mission moves you closer to Level ${nextLevelNumber}.`}
        tipsPrompt="Explain my current Achievement level, the next locked threshold, and the verified actions that can advance Personal EQ. Do not execute actions or imply uncommitted rewards."
        visual={<span className="s3-achievement-hero-ring" style={{background:`conic-gradient(var(--s3-primary) ${progress}%, color-mix(in srgb,var(--s3-primary) 12%,transparent) 0)`}}><b>L{level.level}</b></span>}
        identity={<span className="s3-achievement-hero-path" aria-label={`Level ${level.level}, ${progress}% toward Level ${nextLevelNumber} at ${nextLevelLabel}`}>
          <b>L{level.level}</b><span><i style={{width:`${progress}%`}}/></span><small>{progress}%</small><b>L{nextLevelNumber}</b><em>{nextLevelLabel}</em>
        </span>}
      />

      <section className="s3-achievement-identity" aria-label="Identity and path summary">
        <div className="s3-achievement-avatar"><span><Award/></span><b>{level.level}</b></div>
        <div><h2>ALEX</h2><p><ShieldCheck/> EID Active</p><strong>Level {level.level} <i>•</i> Nova</strong></div>
        <dl><div><dt>Influence</dt><dd>INVEST · DEVELOP · LEARN</dd></div><div><dt>Next unlock</dt><dd>Level {nextLevelNumber}</dd><small>EDGE Access</small></div></dl>
      </section>

      <section className="s3-achievement-metrics" aria-label="Achievement progression metrics">
        <SpecialMetricCard label="EQ" value={user.eq.toLocaleString()} detail="Personal progression" icon={<CircleGauge/>}/>
        <SpecialMetricCard label="Level" value={String(level.level)} detail={`${progress}% complete`} icon={<Trophy/>}/>
        <SpecialMetricCard label="Rules" value={String(registry.ruleCount)} detail="Conditional registry" icon={<Award/>}/>
        <SpecialMetricCard label="Levels" value="19" detail="Canonical progression" icon={<ShieldCheck/>}/>
      </section>

      <nav ref={navRef} className="s3-achievement-nav glass-subtle" aria-label="Achievement sections" role="tablist">
        {VIEWS.map((item) => <button ref={(node) => { tabRefs.current[item.value] = node; }} key={item.value} type="button" role="tab" aria-selected={view === item.value} onClick={() => setView(item.value)}>{item.label}</button>)}
      </nav>

      {view === 'overview' && <div className="s3-achievement-overview">
        <section className="s3-achievement-journey glass-featured" aria-labelledby="achievement-journey-map"><header><div><Heading level={2} id="achievement-journey-map">Journey Map</Heading><p>Your path of growth and unlocks</p></div><span>● Complete　◉ Current　○ Locked</span></header><ol>{[['Mission','EID Activated','done'],['Milestone','Level 6','done'],['Mission','Secure Wallet','current'],['Unlock','EDGE Access','next'],['Achievement','EQ Vanguard','locked']].map(([kind,label,state])=><li key={label} className={`is-${state}`}><i>{state==='done'?<CheckCircle2/>:<Award/>}</i><small>{kind}</small><strong>{label}</strong><em>{state==='done'?'✓':state==='current'?'Current':'🔒'}</em></li>)}</ol><footer><Gift/><span><small>Level Prize</small><strong>Resolved at verified award</strong><p>Next: Level {nextLevelNumber}</p></span><button type="button" onClick={()=>setView('levels')}>Review Levels</button></footer></section>

        <section className="s3-achievement-mission glass-featured" aria-labelledby="achievement-next-level"><span className="s3-achievement-next__ring" style={{background:`conic-gradient(var(--s3-primary) ${progress}%, color-mix(in srgb,var(--s3-primary) 10%,transparent) 0)`}}><span><ShieldCheck/><small>{progress}%</small></span></span><div><small>NEXT MISSION</small><Heading level={2} id="achievement-next-level">Secure Your Wallet</Heading><p>Protect access. Secure your future.</p><ul><li>✓ Connect Wallet</li><li>✓ Enable 2FA</li><li>○ Backup Recovery Phrase</li></ul><progress value={2} max={3}/></div><aside><small>Reward</small><strong>+750 EQ</strong><button type="button" onClick={()=>navigate('/settings/security')}>Continue Mission</button></aside></section>

        <section className="s3-achievement-tracks" aria-labelledby="achievement-product-tracks">
          <header><div><small>LOCKED REGISTRY</small><Heading level={2} id="achievement-product-tracks">Product Achievement Tracks</Heading></div><Award aria-hidden="true"/></header>
          <div>{PRODUCT_ORDER.map((item) => <button type="button" className={`s3-achievement-track is-${item.toLowerCase().replace(/[^a-z]/g, '-')}`} key={item} onClick={() => selectProduct(item)}><span aria-hidden="true"><Award/></span><strong>{PRODUCT_LABELS[item]}</strong><small>{rulesFor(item).length} rules</small></button>)}</div>
        </section>

        <section className="s3-achievement-principles glass-subtle" aria-labelledby="achievement-principles">
          <header><ShieldCheck aria-hidden="true"/><Heading level={3} id="achievement-principles">Progression principles</Heading></header>
          <ul><li>Personal EQ advances Levels.</li><li>Referral EQ stays separate.</li><li>Only verified, committed events count.</li><li>Q rewards remain contract-resolved.</li></ul>
        </section>
      </div>}

      {view === 'rules' && <section className="s3-achievement-rules" aria-labelledby="achievement-rule-list">
        <header><div><small>ACHIEVEMENTS · CONDITIONAL</small><Heading level={2} id="achievement-rule-list">{PRODUCT_LABELS[product]} protocol</Heading></div><button type="button" onClick={() => navigate(PRODUCT_ROUTES[product])}>Open Product <ExternalLink aria-hidden="true"/></button></header>
        <div ref={filterRef} className="s3-achievement-product-filter" role="group" aria-label="Filter achievement rules by Product">{PRODUCT_ORDER.map((item) => <button ref={(node) => { productRefs.current[item] = node; }} type="button" key={item} aria-pressed={product === item} onClick={() => selectProduct(item)}>{PRODUCT_LABELS[item]}</button>)}</div>
        <div className="s3-achievement-rule-grid">{selectedRules.map((rule) => <RuleCard key={rule.achievementId} rule={rule} highlighted={rule.achievementId === id}/>)}</div>
      </section>}

      {view === 'levels' && <section className="s3-achievement-levels" aria-labelledby="level-map">
        <header><div><small>PERSONAL EQ ONLY</small><Heading level={2} id="level-map">19-Level progression</Heading></div><span>Current · Level {level.level}</span></header>
        <ol>{registry.levels.map((threshold, index) => {
          const number = index + 1;
          const state = number === level.level ? 'current' : user.eq >= threshold ? 'reached' : 'locked';
          return <li key={threshold} data-level={number} className={`is-${state}`} aria-current={state === 'current' ? 'step' : undefined}><span>{state === 'reached' ? <CheckCircle2 aria-label="Reached"/> : <b>{number}</b>}</span><div><small>{state.toUpperCase()}</small><strong>Level {number}</strong></div><em>{threshold.toLocaleString()} EQ</em></li>;
        })}</ol><aside><Info aria-hidden="true"/><span><strong>Canonical level rules</strong><small>Daily EQ burn threshold = current level threshold × 1%. Influence is tracked on INVEST, DEVELOP, and LEARN axes. Any award multiplier is captured when the verified award is issued.</small></span></aside>
      </section>}

      {view === 'referral' && <section className="s3-achievement-referral glass-featured" aria-labelledby="referral-rule">
        <header><Network aria-hidden="true"/><div><small>SEPARATE ACCOUNTING</small><Heading level={2} id="referral-rule">Referral EQ rule</Heading></div></header>
        <div className="s3-achievement-referral__flow"><span><small>Eligible input</small><strong>Personal base EQ</strong></span><b aria-hidden="true">×</b><span><small>First-line rate</small><strong>{(integrity.referral.rate * 100).toFixed(0)}%</strong></span><b aria-hidden="true">→</b><span><small>Separate output</small><strong>Referral EQ</strong></span></div>
        <ul><li>Direct must be at the same or lower Level.</li><li>Referral EQ never recursively compounds.</li><li>Referral EQ never affects Personal Level EQ.</li></ul>
        <aside><Info aria-hidden="true"/><span><strong>Account projection unavailable in Preview</strong><small>No balance is generated without a committed Referral EQ ledger projection.</small></span></aside>
      </section>}

      {view === 'ledger' && <section className="s3-achievement-ledger glass-featured" aria-labelledby="ledger-empty">
        <span aria-hidden="true"><Info/></span><small>VERIFIED EVENT HISTORY</small><Heading level={2} id="ledger-empty">No committed EQ ledger entries available</Heading><Text tone="secondary">The current Preview exposes a Personal EQ snapshot, but not a committed per-event ledger projection. Mock rows are never presented as protocol truth.</Text><div><ShieldCheck aria-hidden="true"/> Observed → indexed → verified → committed</div>
      </section>}
    </main>
  </AppShell>;
}
