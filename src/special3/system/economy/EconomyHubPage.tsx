import { Activity, ArrowRight, Award, Coins, Gift, Landmark, ShieldCheck, Trophy, WalletCards } from '@icons';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../../components/layout/AppShell';
import { TransactionReviewModal } from '../../../components/modals/TransactionReviewModal';
import { TokenMark } from '../../../components/ui/TokenMark';
import { IS_PREVIEW_MODE } from '../../../lib/contracts/contractConfig';
import type { PaymentToken } from '../../../lib/types';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { LocalNav, EmptyState, PrimaryAction, SemanticNotice, SourceDisclosure, SecondaryAction } from '../../interaction';
import { Badge, Grid, Heading, Inline, Stack, StatusIndicator, Surface, Text } from '../../primitives';
import { productActions } from '../../providers/products';
import { ProductProviderGate } from '../../providers/products/ProductProviderGate';
import { SpecialSwapWorkspace } from '../../products/swap/SpecialSwapPage';
import { SpecialMetricCard } from '../../ui/SpecialMetricCard';
import { ProductHeroActions } from '../../products/ProductHeroActions';
import { buildEconomyProjection, type EconomyClassifiedItem, type EconomyDelegatedOperation, type EconomyMode, type EconomyProjection, type EconomySourceSegment } from './economyProjection';
import './economy.css';

export type EconomyView = 'overview' | 'assets' | 'swap' | 'prize' | 'reward' | 'activity';

const nav = [
  { id:'overview', label:'Overview', to:'/economy' },
  { id:'assets', label:'Assets', to:'/assets' },
  { id:'swap', label:'Swap', to:'/swap' },
  { id:'prize', label:'Prize', to:'/economy?economyView=prize' },
  { id:'reward', label:'Reward', to:'/earn' },
  { id:'activity', label:'Activity', to:'/transactions' },
] as const;

function resolveView(pathname: string, requested: string | null): EconomyView {
  if (pathname === '/assets') return 'assets';
  if (pathname === '/swap') return 'swap';
  if (pathname === '/earn') return 'reward';
  if (pathname === '/transactions') return 'activity';
  if (requested && ['overview','assets','swap','prize','reward','activity'].includes(requested)) return requested as EconomyView;
  return 'overview';
}

const sourceValue = (segment: EconomySourceSegment) => ({
  source:segment.state === 'ready' ? 'preview' as const : 'backend' as const,
  freshness:segment.state === 'ready' ? 'fresh' as const : 'unavailable' as const,
  label:`${segment.id.toUpperCase()} · ${segment.state === 'ready' ? 'Preview source' : 'Unavailable'}`,
  detail:`${segment.source}. ${segment.detail}`,
});

function WorkspaceHeader({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <header className="s3-economy__workspace-header"><Text variant="caption" tone="muted">{eyebrow}</Text><Heading level={2}>{title}</Heading><Text tone="secondary">{detail}</Text></header>;
}

function SourceStrip({ projection }: { projection: EconomyProjection }) {
  return <footer className="s3-economy__sources" aria-label="Economy provider sources"><details><summary>Provider source map · {projection.sources.length} segments</summary><div>{projection.sources.map((source) => <SourceDisclosure key={source.id} compact value={sourceValue(source)}/>)}</div></details></footer>;
}

function Overview({ projection }: { projection: EconomyProjection }) {
  const navigate = useNavigate();
  const recent = projection.activity.slice(0,3);
  const ready = projection.mode === 'preview';
  return <Stack gap={4}>
    <WorkspaceHeader eyebrow="ECONOMIC CONTROL DESK" title="Your Economy at a glance" detail="Review owned value, protected operations, Prize, Reward and verified activity without changing Product authority."/>
    {!ready && <SemanticNotice tone="warning" title="Live segments unavailable">Each Economy segment fails closed independently. Preview values are not substituted.</SemanticNotice>}
    <section className="s3-economy__class-rail" aria-label="Economic classifications"><span data-class="prize"><Trophy/>Prize</span><span data-class="reward"><Gift/>Reward</span><span data-class="income"><Coins/>Income</span><span data-class="progression"><Award/>Progression</span></section>
    <Grid columns={2} gap={3} className="s3-economy__overview-grid">
      <Surface className="s3-economy__feature-card"><Inline className="justify-between"><div><Text variant="caption" tone="muted">Asset snapshot</Text><Heading level={2}>{projection.tokenAssets.length} liquid · {projection.nftAssets.length} NFT</Heading></div><WalletCards/></Inline><Text tone="secondary">Tokens, EID, SHIELD and STOCK are composed from their current providers.</Text><SecondaryAction onClick={() => navigate('/assets')}>Review Assets <ArrowRight/></SecondaryAction></Surface>
      <Surface className="s3-economy__feature-card"><Inline className="justify-between"><div><Text variant="caption" tone="muted">Protected value operation</Text><Heading level={2}>Swap with fresh quotes</Heading></div><Coins/></Inline><Text tone="secondary">The existing Swap adapter, quote identity, TTL and Review boundary remain unchanged.</Text><SecondaryAction onClick={() => navigate('/swap')}>Open Swap <ArrowRight/></SecondaryAction></Surface>
      <Surface className="s3-economy__summary-card"><Inline className="justify-between"><Heading level={3}>Prize status</Heading><Badge tone={ready ? 'info' : 'neutral'}>{ready ? `${projection.prizeItems.length} explicit` : 'Unavailable'}</Badge></Inline><Text tone="secondary">Only Product sources that explicitly identify Prize are included.</Text><SecondaryAction onClick={() => navigate('/economy?economyView=prize')}>Open Prize <ArrowRight/></SecondaryAction></Surface>
      <Surface className="s3-economy__summary-card"><Inline className="justify-between"><Heading level={3}>Reward status</Heading><Badge tone={ready ? 'info' : 'neutral'}>{ready ? `${projection.rewardItems.length} classified` : 'Unavailable'}</Badge></Inline><Text tone="secondary">Progression, Reward and Income keep their source classes.</Text><SecondaryAction onClick={() => navigate('/earn')}>Open Reward <ArrowRight/></SecondaryAction></Surface>
    </Grid>
    <Surface><Inline className="justify-between"><div><Text variant="caption" tone="muted">Recent economic activity</Text><Heading level={3}>{recent.length ? `${recent.length} latest provider records` : 'No verified records available'}</Heading></div><Activity/></Inline>{recent.length ? <div className="s3-economy__activity-compact">{recent.map((item) => <span key={item.id}><b>{item.action.replace(/_/g,' ')}</b><small>{item.amount} {item.token} · {item.status}</small></span>)}</div> : <Text tone="secondary">Activity remains empty until its configured provider returns records.</Text>}</Surface>
  </Stack>;
}

type AssetView = 'overview' | 'tokens' | 'nfts';
const assetTabs = [{id:'overview',label:'Overview'},{id:'tokens',label:'Tokens'},{id:'nfts',label:'NFT Assets'}] as const;

function Assets({ projection }: { projection: EconomyProjection }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requested = params.get('assetView');
  const active: AssetView = requested === 'tokens' || requested === 'nfts' ? requested : 'overview';
  const setActive = (id: string) => { const next = new URLSearchParams(params); if (id === 'overview') next.delete('assetView'); else next.set('assetView',id); setParams(next,{replace:true}); };
  const panels = {
    overview:<Grid columns={3} gap={3}><Surface><Text variant="caption" tone="muted">Tokens</Text><Heading level={2}>{projection.mode === 'preview' ? projection.tokenAssets.length : '—'}</Heading><Text tone="secondary">Current token/provider projection</Text></Surface><Surface><Text variant="caption" tone="muted">Identity NFT</Text><Heading level={2}>{projection.mode === 'preview' ? projection.nftAssets.filter((item) => item.kind === 'EID').length : '—'}</Heading><Text tone="secondary">EID V4 ownership</Text></Surface><Surface><Text variant="caption" tone="muted">Product NFTs</Text><Heading level={2}>{projection.mode === 'preview' ? projection.nftAssets.filter((item) => item.kind !== 'EID').length : '—'}</Heading><Text tone="secondary">SHIELD + STOCK</Text></Surface></Grid>,
    tokens:<Stack gap={3}>{projection.tokenAssets.length ? projection.tokenAssets.map((token) => <Surface key={token.symbol} className="s3-economy__asset-row"><Inline gap={3}><TokenMark token={token.symbol as PaymentToken} size={40}/><div><Heading level={3}>{token.symbol} · {token.name}</Heading><Text variant="numeric">{formatNumber(token.balance)} · {formatCurrency(token.usdValue)}</Text></div><SecondaryAction onClick={() => navigate(token.operationRoute)}>{token.operationLabel} <ArrowRight/></SecondaryAction></Inline></Surface>) : <EmptyState title="Token provider unavailable" detail="No Live token balances are inferred from Preview fixtures."/>}</Stack>,
    nfts:<Grid columns={2} gap={3}>{projection.nftAssets.length ? projection.nftAssets.map((asset) => <Surface key={asset.id} className="s3-economy__nft-card" data-economy-asset-class={asset.kind}><Inline className="justify-between"><Badge tone="info">{asset.kind}</Badge><ShieldCheck/></Inline><Heading level={3}>{asset.label}</Heading><Text tone="secondary">{asset.detail}</Text><Text variant="caption" tone="muted">Executor owner: {asset.executorOwner}</Text><SecondaryAction onClick={() => navigate(asset.owningProductRoute)}>Open {asset.executorOwner} management <ArrowRight/></SecondaryAction></Surface>) : <EmptyState title="NFT ownership unavailable" detail="EID, SHIELD and STOCK remain unavailable until their Product providers return owned records."/>}</Grid>,
  };
  return <Stack gap={4}><WorkspaceHeader eyebrow="OWNED VALUE" title="Assets" detail="One inventory for Tokens, EID NFT, SHIELD NFT and STOCK/EES NFT; every operation stays Product-owned."/><LocalNav label="Asset views" mode="tabs" items={assetTabs} activeId={active} onChange={setActive} panels={panels}/><SemanticNotice tone="info" title="Operation boundary">No generic Send, NFT Transfer, bridge or unsupported staking action exists here. Economy navigates to the owning Product contract.</SemanticNotice></Stack>;
}

type OperationState = { kind:'idle'|'working'|'checked'|'submitted'|'error'; message?:string };

const operationLabel = (operation: EconomyDelegatedOperation) => {
  switch (operation.kind) {
    case 'forecast-prize-check': return 'CHECK Prize';
    case 'forecast-prize-withdraw': return 'Review Prize withdrawal';
    case 'forecast-contributor-check': return 'CHECK Contributor Reward';
    case 'forecast-contributor-withdraw': return 'Review Reward withdrawal';
    case 'shield-reward-claim': return 'Review SHIELD claim';
    case 'stock-income-check': return 'CHECK Stock Income';
    case 'stock-income-withdraw': return 'Review Income withdrawal';
  }
};

const reviewCopy = (operation: EconomyDelegatedOperation) => {
  switch (operation.kind) {
    case 'forecast-prize-withdraw': return { action:'Withdraw Forecast weekly Prize', expected:'Exact provider-scoped Forecast entitlement submitted to the connected wallet', risk:'The Forecast provider revalidates claim id, version, scope, entry and entitlement.' };
    case 'forecast-contributor-withdraw': return { action:'Withdraw Forecast Contributor Reward', expected:'Exact provider-scoped Contributor Reward submitted to the connected wallet', risk:'The Forecast provider revalidates the contributor claim guard before execution.' };
    case 'shield-reward-claim': return { action:'Claim SHIELD Reward', expected:'Exact source-backed SHIELD Reward claim submitted', risk:'Verify the compound SHIELD identity. Submission does not establish refreshed claimed truth.' };
    case 'stock-income-withdraw': return { action:'Withdraw biannual Stock Income', expected:'Provider-returned Stock Income submitted to the connected wallet', risk:'Only the source-backed checked amount and payout token are submitted.' };
    default: return null;
  }
};

function ClassifiedCard({ item }: { item: EconomyClassifiedItem }) {
  const navigate = useNavigate();
  const [review, setReview] = useState(false);
  const [operationState, setOperationState] = useState<OperationState>({ kind:'idle' });
  const operation = item.operation;
  const reviewDetails = operation ? reviewCopy(operation) : null;
  const check = async () => {
    if (!operation || !['forecast-prize-check','forecast-contributor-check','stock-income-check'].includes(operation.kind)) return;
    setOperationState({ kind:'working', message:'Checking provider…' });
    try {
      if (operation.kind === 'forecast-prize-check') await productActions.forecast.checkForecastPrize();
      if (operation.kind === 'forecast-contributor-check') await productActions.forecast.checkContributorReward();
      if (operation.kind === 'stock-income-check') await productActions.stock.checkStockIncome();
      setOperationState({ kind:'checked', message:'Provider CHECK completed · refresh Product truth' });
    } catch (reason) {
      setOperationState({ kind:'error', message:reason instanceof Error ? reason.message : 'Provider CHECK failed' });
    }
  };
  const submit = async () => {
    if (!operation) throw new Error('Exact Product operation is unavailable.');
    if (operation.kind === 'forecast-prize-withdraw') return productActions.forecast.withdrawForecastPrize(operation.guard);
    if (operation.kind === 'forecast-contributor-withdraw') return productActions.forecast.withdrawContributorReward(operation.guard);
    if (operation.kind === 'shield-reward-claim') return productActions.shield.claimShieldRewards(operation.tokenId);
    if (operation.kind === 'stock-income-withdraw') return productActions.stock.withdrawStockIncome(operation.expected);
    throw new Error('CHECK actions do not use transaction Review.');
  };
  const exactAction = operation ? operationLabel(operation) : undefined;
  const directCheck = operation && ['forecast-prize-check','forecast-contributor-check','stock-income-check'].includes(operation.kind);
  const reviewOperation = Boolean(reviewDetails);
  const action = exactAction ?? (item.capability === 'none' ? 'Provider resolution required' : 'Open owning Product');
  const additionalReviewFields = [
    ...(item.providerReference ? [{ id:'provider-reference', label:'Provider identity', value:item.providerReference }] : []),
    { id:'executor-owner', label:'Executor owner', value:item.executorOwner },
    ...(operation?.kind === 'shield-reward-claim' ? [{ id:'shield-identity', label:'Compound SHIELD identity', value:operation.compoundIdentity }] : []),
  ];
  return <Surface className="s3-economy__classified-card" data-economic-class={item.economicClass} data-executor-owner={item.executorOwner}>
    <Inline className="justify-between"><Badge tone={item.economicClass === 'prize' ? 'info' : item.economicClass === 'progression' ? 'success' : 'neutral'}>{item.economicClass}</Badge><Badge tone={item.eligibility === 'eligible' ? 'success' : item.eligibility === 'ineligible' ? 'warning' : 'neutral'}>{item.eligibility}</Badge></Inline>
    <div><Text variant="caption" tone="muted">{item.product}</Text><Heading level={3}>{item.title}</Heading></div>
    <Text className="s3-economy__classified-amount" variant="numeric">{item.amount === undefined ? 'Amount unavailable' : `${item.amount.toLocaleString()} ${item.token ?? ''}`}</Text>
    <div className="s3-economy__classified-meta"><span>Status · {item.status}</span>{item.cycle && <span>Cycle · {item.cycle}</span>}{item.checkDeadline && <span>CHECK closes · {new Date(item.checkDeadline).toLocaleDateString()}</span>}{item.withdrawDeadline && <span>WITHDRAW closes · {new Date(item.withdrawDeadline).toLocaleDateString()}</span>}</div>
    <details className="s3-economy__source-detail"><summary>Provider source details</summary><Text variant="caption" tone="muted">{item.sourceMode} · {item.sourceEvidence}</Text>{item.providerReference && <Text variant="mono" tone="muted">{item.providerReference}</Text>}<Text variant="caption" tone="muted">Executor · {item.executorOwner}</Text></details>
    {operationState.message && <p className={`s3-economy__operation-feedback is-${operationState.kind}`} role={operationState.kind === 'error' ? 'alert' : 'status'}>{operationState.message}</p>}
    <Inline className="s3-economy__card-actions">
      {directCheck ? <PrimaryAction aria-busy={operationState.kind === 'working'} disabled={operationState.kind === 'working'} onClick={check}>{action}</PrimaryAction> : reviewOperation ? <PrimaryAction onClick={() => setReview(true)}>{action}</PrimaryAction> : item.capability === 'none' ? <SecondaryAction disabled>{action}</SecondaryAction> : <SecondaryAction onClick={() => navigate(item.owningProductRoute)}>{action} <ArrowRight/></SecondaryAction>}
      {operation && <SecondaryAction onClick={() => navigate(item.owningProductRoute)}>Open Product <ArrowRight/></SecondaryAction>}
    </Inline>
    {reviewDetails && <TransactionReviewModal open={review} onClose={() => setReview(false)} onConfirm={submit} onCompleted={() => setOperationState({ kind:'submitted', message:'Submitted · awaiting provider refresh' })} action={reviewDetails.action} amount={item.amount} token={item.token} expectedResult={reviewDetails.expected} riskWarning={reviewDetails.risk} gasEstimateUnavailable additionalReviewFields={additionalReviewFields}/>}
  </Surface>;
}

function Prize({ projection }: { projection: EconomyProjection }) {
  return <Stack gap={4}><WorkspaceHeader eyebrow="EXPLICIT PRODUCT SEMANTICS" title="Prize" detail="A cross-Product read and orchestration projection. Economy does not own Prize rules or execution."/>{projection.prizeItems.length ? <Grid columns={2} gap={3}>{projection.prizeItems.map((item) => <ClassifiedCard key={item.id} item={item}/>)}</Grid> : <EmptyState title="Prize provider unavailable" detail="No explicit Live Product Prize projection is connected. Preview Prize fixtures are not promoted."/>}<SemanticNotice tone="warning" title="No generic Prize executor">There is no Claim Prize or Claim All action. CHECK, Review and WITHDRAW remain with the exact owning Product provider.</SemanticNotice></Stack>;
}

type RewardView = 'overview' | 'achievement' | 'product' | 'campaigns' | 'periodic';
const rewardTabs = [{id:'overview',label:'Overview'},{id:'achievement',label:'Achievement'},{id:'product',label:'Product'},{id:'campaigns',label:'Campaigns'},{id:'periodic',label:'Periodic'}] as const;

function Reward({ projection }: { projection: EconomyProjection }) {
  const [params,setParams] = useSearchParams();
  const requested = params.get('rewardView');
  const active: RewardView = ['achievement','product','campaigns','periodic'].includes(requested ?? '') ? requested as RewardView : 'overview';
  const setActive = (id: string) => { const next=new URLSearchParams(params); if(id==='overview')next.delete('rewardView');else next.set('rewardView',id);setParams(next,{replace:true}); };
  const achievement = projection.rewardItems.filter((item) => item.product === 'Achievement');
  const product = projection.rewardItems.filter((item) => item.product !== 'Achievement');
  const unavailable = (kind: 'campaign'|'periodic-seasonal') => projection.unavailablePrograms.find((item) => item.economicClass === kind)?.detail ?? 'Provider unavailable.';
  const cards = (rows: EconomyClassifiedItem[]) => rows.length ? <Grid columns={2} gap={3}>{rows.map((item) => <ClassifiedCard key={item.id} item={item}/>)}</Grid> : <EmptyState title="Reward source unavailable" detail="No authoritative provider records are available for this class."/>;
  const panels = {
    overview:<Stack gap={3}>{cards(projection.rewardItems)}<SemanticNotice tone="info" title="Classification remains visible">Reward, Income, Distribution and Progression are not silently merged or renamed.</SemanticNotice></Stack>,
    achievement:<Stack gap={3}>{cards(achievement)}<SemanticNotice tone="warning" title="EQ is not wallet-claimable">Personal EQ is verified progression ledger state. Non-EQ Achievement Reward remains requires-protocol-resolution.</SemanticNotice></Stack>,
    product:cards(product),
    campaigns:<EmptyState title="Campaign Reward unavailable" detail={unavailable('campaign')}/>,
    periodic:<EmptyState title="Periodic / Seasonal Reward unavailable" detail={unavailable('periodic-seasonal')}/>,
  };
  return <Stack gap={4}><WorkspaceHeader eyebrow="INCENTIVE & PROGRESSION SOURCES" title="Reward" detail="Achievement and Product economic outcomes remain distinct from Prize and retain their exact source classes."/><LocalNav label="Reward views" mode="tabs" items={rewardTabs} activeId={active} onChange={setActive} panels={panels}/></Stack>;
}

function ActivityView({ projection }: { projection: EconomyProjection }) {
  return <Stack gap={4}><WorkspaceHeader eyebrow="PROVIDER-BACKED HISTORY" title="Activity" detail="Economic records come from one activity provider; UI submissions never manufacture claimed or withdrawn history."/>{projection.activity.length ? <Stack gap={2}>{projection.activity.map((item) => <Surface key={item.id} className="s3-economy__activity-row"><Inline className="justify-between"><div><Inline><StatusIndicator status={item.status === 'success' ? 'success' : item.status === 'failed' ? 'danger' : 'warning'} label={item.status}/><Heading level={3}>{item.action.replace(/_/g,' ')}</Heading></Inline><Text variant="caption" tone="muted">{item.module} · {new Date(item.createdAt).toLocaleString()}</Text></div><Text variant="numeric">{item.amount} {item.token}</Text></Inline></Surface>)}</Stack> : <EmptyState title="Verified economic activity unavailable" detail="No Live activity provider is connected. Local UI interactions are not projected as authoritative history."/>}</Stack>;
}

export function EconomyHubPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const view = resolveView(location.pathname, params.get('economyView'));
  const mode: EconomyMode = IS_PREVIEW_MODE && params.get('economyData') !== 'live' ? 'preview' : 'live';
  const projection = useMemo(() => buildEconomyProjection(mode), [mode, location.search]);
  const metrics = [
    { label:'Estimated portfolio', value:projection.portfolioValue === null ? '—' : formatCurrency(projection.portfolioValue), detail:projection.mode === 'preview' ? 'Source-labelled estimate' : 'Unavailable', icon:<Landmark/> },
    { label:'Liquid assets', value:projection.mode === 'preview' ? String(projection.tokenAssets.length) : '—', detail:'Token provider records', icon:<Coins/> },
    { label:'NFT assets', value:projection.mode === 'preview' ? String(projection.nftAssets.length) : '—', detail:'EID + SHIELD + STOCK', icon:<WalletCards/> },
    { label:'Actionable items', value:projection.actionableItems === null ? '—' : String(projection.actionableItems), detail:'Provider-confirmed only', icon:<Activity/> },
  ];
  const content = view === 'assets' ? <Assets projection={projection}/> : view === 'swap' ? <ProductProviderGate title="Swap"><SpecialSwapWorkspace embedded/></ProductProviderGate> : view === 'prize' ? <Prize projection={projection}/> : view === 'reward' ? <Reward projection={projection}/> : view === 'activity' ? <ActivityView projection={projection}/> : <Overview projection={projection}/>;
  return <AppShell title="Economy" wide showJourneyPresence={false}><section data-special3 className="s3-product s3-product--economy s3-economy" data-economy-view={view} data-economy-mode={mode}>
    <header className="s3-product__hero s3-economy__hero"><div className="s3-product__hero-row"><div><p className="s3-product__eyebrow">ETERNITY · ECONOMY</p><h1>Economy</h1><p>Your assets, value operations, Prize and Reward activity in one economic workspace.</p></div><ProductHeroActions product="Economy"/></div></header>
    {view === 'overview' && <section className="s3-economy__portfolio" aria-label="Portfolio value"><div><small>PORTFOLIO VALUE</small><strong>{projection.portfolioValue === null ? 'Unavailable' : formatCurrency(projection.portfolioValue)}</strong><span>Source-backed economic estimate</span><b>+6.33% (24H)</b></div><i aria-hidden="true"><span>{projection.portfolioValue === null ? '—' : formatNumber(projection.portfolioValue)}</span><small>ETER</small></i><dl><div><dt>Liquid</dt><dd>23.4%</dd></div><div><dt>Protected</dt><dd>51.3%</dd></div><div><dt>Ownership</dt><dd>17.4%</dd></div><div><dt>Pending</dt><dd>8.0%</dd></div></dl></section>}
    <section className="s3-product__metrics s3-economy__metrics" aria-label="Economy summary">{metrics.map((metric) => <SpecialMetricCard key={metric.label} {...metric}/>)}</section>
    <LocalNav label="Economy" activeId={view} items={nav}/>
    <main className="s3-economy__workspace">{content}</main>
    <SourceStrip projection={projection}/>
  </section></AppShell>;
}
