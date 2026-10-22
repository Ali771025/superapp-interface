import { Award, BarChart3, Minus, TrendingDown, TrendingUp } from '@icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { IdentityAvatar } from '../components/ui/IdentityAvatar';
import { EmptyState, LocalNav, MetricCard, PrimaryAction, SecondaryAction, SourceDisclosure } from '../special3/interaction/SharedComponents';
import { Badge, Heading, Inline, Stack, Surface, Text } from '../special3/primitives';
import { publicSurfaceProviders, type LeaderboardEntry, type LeaderboardTimeFilter } from '../special3/providers/publicSurfaces';
import { ProductHeroActions } from '../special3/products/ProductHeroActions';
import './leaderboard-phase16.css';

const periods = [{id:'Daily',label:'Daily'},{id:'Weekly',label:'Weekly'},{id:'Monthly',label:'Monthly'},{id:'All-time',label:'All-time'}] as const;

function periodFrom(value: string | null): LeaderboardTimeFilter {
  return periods.some((period) => period.id === value) ? value as LeaderboardTimeFilter : 'All-time';
}

function Movement({ movement }: { movement?: LeaderboardEntry['movement'] }) {
  if (!movement) return null;
  const Icon = movement === 'up' ? TrendingUp : movement === 'down' ? TrendingDown : Minus;
  return <Badge tone={movement === 'up' ? 'success' : movement === 'down' ? 'warning' : 'neutral'}><Icon aria-hidden="true"/>{movement}</Badge>;
}

function RankingCard({ entry, priority = false }: { entry: LeaderboardEntry; priority?: boolean }) {
  return <Surface as="article" className={`s3-leaderboard__entry${priority ? ' is-priority' : ''}${entry.isCurrentUser ? ' is-current-user' : ''}`} data-leaderboard-rank={entry.rank} data-current-user={entry.isCurrentUser || undefined}>
    <span className="s3-leaderboard__rank" aria-label={`Rank ${entry.rank}`}>{String(entry.rank).padStart(2,'0')}</span>
    <IdentityAvatar className="s3-leaderboard__avatar" identity={entry.eid} level={entry.level ?? 1} size={priority ? 46 : 38} showLevelBadge={false}/>
    <div className="s3-leaderboard__identity"><Inline gap={2}><Heading level={3}>{entry.eid}</Heading>{entry.isCurrentUser && <Badge tone="primary">You</Badge>}</Inline><Text variant="caption" tone="muted">{entry.username}{entry.level ? ` · Level ${entry.level} context` : ''}</Text></div>
    <div className="s3-leaderboard__value"><Text variant="numeric">{entry.rankValue.toLocaleString()}</Text><Text variant="caption" tone="muted">{entry.rankUnit}</Text></div>
    <Movement movement={entry.movement}/>
  </Surface>;
}

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [params,setParams] = useSearchParams();
  const period = periodFrom(params.get('period'));
  const mode = params.get('leaderboardData') === 'live' ? 'live' : 'preview';
  const result = publicSurfaceProviders[mode].leaderboard(period);
  const data = result.data;
  const entries = data?.entries ?? [];
  const currentPosition = data?.currentUserPosition;
  const showMethodology = params.get('section') === 'methodology';
  const changePeriod = (next: string) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'All-time') nextParams.delete('period'); else nextParams.set('period',next);
    setParams(nextParams,{replace:true});
  };

  return <AppShell title="Leaderboard" wide showJourneyPresence={false}><section data-special3 className="s3-product s3-product--leaderboard s3-leaderboard" data-leaderboard-mode={mode} data-leaderboard-period={period}>
    <header className="s3-product__hero s3-leaderboard__hero"><div className="s3-product__hero-row"><div><p className="s3-product__eyebrow">ETERNITY · PARTICIPATION</p><h1>Leaderboard</h1><p>Compare provider-supplied ecosystem participation positions without mixing Product-specific ranks.</p></div><ProductHeroActions product="Leaderboard"/></div></header>

    <section className="s3-product__metrics s3-leaderboard__metrics" aria-label="Leaderboard summary">
      <MetricCard label="Mode" value={mode === 'preview' ? 'Source Preview' : 'Live'} detail={mode === 'preview' ? 'QA fixture, not production' : 'Authoritative provider only'}/>
      <MetricCard label="Period" value={period} detail="Provider-owned selection"/>
      <MetricCard label="Entries" value={data ? String(entries.length) : '—'} detail={data ? 'Provider rows' : 'Unavailable'}/>
      <MetricCard label="Your position" value={currentPosition ? `#${currentPosition.rank}` : '—'} detail={currentPosition ? currentPosition.label : 'Provider did not supply one'}/>
    </section>

    <LocalNav label="Leaderboard period" items={periods} activeId={period} onChange={changePeriod}/>

    <main className="s3-leaderboard__workspace">
      {result.state === 'unavailable' || !data ? <EmptyState title="Live leaderboard unavailable" detail={`${result.detail} No Preview fallback is used in Live mode.`}/> : <section className="s3-leaderboard__ranking" aria-labelledby="leaderboard-ranking-title">
        <header className="s3-leaderboard__section-heading"><div><Text variant="caption" tone="muted">PROVIDER RANKING · {period.toUpperCase()}</Text><Heading id="leaderboard-ranking-title" level={2}>Participation positions</Heading></div><SourceDisclosure value={data.source} compact/></header>
        <div className="s3-leaderboard__top-three">{entries.slice(0,3).map((entry) => <RankingCard key={entry.eid} entry={entry} priority/>)}</div>
        {currentPosition && <Surface className="s3-leaderboard__position" data-preview-position={mode === 'preview' || undefined}><span><Text variant="caption" tone="muted">{currentPosition.label.toUpperCase()}</Text><Heading level={3}>{currentPosition.eid}</Heading></span><strong>#{currentPosition.rank}</strong><Text variant="caption" tone="muted">Supplied explicitly by the {mode} provider</Text></Surface>}
        <Stack gap={2} as="section" aria-label="Remaining leaderboard positions">{entries.slice(3).map((entry) => <RankingCard key={entry.eid} entry={entry}/>)}</Stack>
      </section>}
    </main>

    <details className="s3-leaderboard__methodology" open={showMethodology || undefined} data-methodology>
      <summary><span><BarChart3 aria-hidden="true"/><strong>Source &amp; methodology</strong></span><small>{data?.rankingBasis.label ?? 'Provider metadata unavailable'}</small></summary>
      <div className="s3-leaderboard__methodology-body">
        {data ? <SourceDisclosure value={data.source}/> : <Text tone="secondary">Live provider metadata is unavailable.</Text>}
        <dl><div><dt>Period</dt><dd>{period}</dd></div><div><dt>Ranking basis</dt><dd>{data?.rankingBasis.label ?? 'Unavailable'}</dd></div><div><dt>Unit</dt><dd>{data?.rankingBasis.unit ?? '—'}</dd></div><div><dt>Formula</dt><dd>{data?.rankingBasis.formulaStatus === 'available' ? 'Available from provider' : 'Production ranking formula unavailable from provider.'}</dd></div></dl>
        <Text tone="secondary">{data?.rankingBasis.detail ?? 'No authoritative ranking provider is configured.'}</Text>
        <Text tone="secondary">Global Leaderboard position is separate from ETERNITY Level, Personal EQ, FAN Rank, EDGE Learning Rank, and Profile or Community Rank.</Text>
        <Text variant="caption" tone="muted">QORA may explain the visible source and rank distinctions or navigate to Journey and Achievement. It cannot predict a position, fabricate a formula, promise rank gain, or execute an action.</Text>
      </div>
    </details>

    <section className="s3-leaderboard__next-step" aria-label="Verified participation next steps"><Award aria-hidden="true"/><div><Heading level={3}>Continue with verified participation</Heading><Text tone="secondary">Achievements and Journey remain distinct from the provider-owned ranking calculation.</Text></div><Inline gap={2}><PrimaryAction onClick={() => navigate('/achievements')}>Explore verified achievements</PrimaryAction><SecondaryAction onClick={() => navigate('/journey')}>Open Journey</SecondaryAction></Inline></section>
  </section></AppShell>;
}
