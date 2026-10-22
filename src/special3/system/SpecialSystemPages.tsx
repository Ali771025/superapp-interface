import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { IdentityAvatar } from '../../components/ui/IdentityAvatar';
import { TokenMark } from '../../components/ui/TokenMark';
import { useTheme } from '../../lib/theme-context';
import type { PaymentToken } from '../../lib/types';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { useWallet } from '../../lib/wallet-context';
import { committedEqHistory } from '../progression/eqPresentation';
import { BrowserProgressionPersistence } from '../progression/persistence';
import type { EqLedgerEntry } from '../progression/types';
import { Grid, Heading, Inline, Stack, StatusIndicator, Surface, Text } from '../primitives';
import { BrowseTemplate, OverviewTemplate } from '../interaction/PageTemplates';
import { EmptyState, LocalNav, MetricCard, MetricGrid, PrimaryAction, SecondaryAction, SemanticNotice, SourceDisclosure } from '../interaction/SharedComponents';
import { special3SystemProvider, type SpecialTransaction } from '../providers';
import { shieldAssetKeyFor, shieldVisualFor } from '../products/shield/shieldVisuals';

function providerSource(result: { mode:'preview'|'live'; detail:string }) {
  return { source:result.mode, freshness:result.mode === 'preview' ? 'unknown' as const : 'unavailable' as const, label:result.mode === 'preview' ? 'Preview data' : 'Live provider', detail:result.detail };
}

function ProviderUnavailable({ detail }: { detail: string }) {
  return <EmptyState title="Verified data unavailable" detail={detail}/>;
}

export function SpecialEconomyPage() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const result = special3SystemProvider.economy();
  return <AppShell title="Economy" wide><OverviewTemplate eyebrow="System" title="Economy" titleOwner="shell" intro="A source-explicit view of liquid value, ownership, and verified actions." status={<SourceDisclosure value={providerSource(result)} compact/>}>
    {result.state === 'unavailable' || !result.data ? <ProviderUnavailable detail={result.detail}/> : <Stack gap={6}>
      <SemanticNotice tone="warning" title="Preview boundary">{result.detail}</SemanticNotice>
      <MetricGrid><MetricCard label="Estimated portfolio" value={formatCurrency(result.data.portfolio.total)} detail="Illustrative total"/><MetricCard label="24-hour change" value={`${result.data.portfolio.change24h}%`} detail="Preview movement"/><MetricCard label="Liquid assets" value={result.data.tokens.length} detail="Tokens represented"/></MetricGrid>
      <Grid columns={3}>{result.data.tokens.slice(0,3).map((token) => <Surface key={token.symbol}><Stack gap={2}><Inline><TokenMark token={token.symbol as PaymentToken} size={40}/><Heading level={3}>{token.symbol}</Heading></Inline><Text variant="numeric">{formatNumber(token.balance)}</Text><Text tone="secondary">{formatCurrency(token.usdValue)}</Text></Stack></Surface>)}</Grid>
      <Inline gap={3}><PrimaryAction onClick={() => navigate('/swap')}>Open Swap</PrimaryAction><SecondaryAction onClick={() => navigate('/journey?view=assets&from=economy')}>Review assets</SecondaryAction>{!wallet.address && <SecondaryAction onClick={wallet.connect}>Connect wallet</SecondaryAction>}</Inline>
    </Stack>}
  </OverviewTemplate></AppShell>;
}

type AssetView = 'overview'|'tokens'|'ownership';
const assetTabs = [{id:'overview',label:'Overview'},{id:'tokens',label:'Tokens'},{id:'ownership',label:'Ownership'}] as const;
const assetActions:Record<string,ReadonlyArray<{label:string;to:string}>>={
  ETER:[{label:'Transfer',to:'/generator/transfer'},{label:'Donate',to:'/generator/donate'},{label:'Burn',to:'/generator/burn'},{label:'Swap',to:'/swap?from=ETER'}],
  ET:[{label:'Transfer',to:'/generator/transfer?token=ET'},{label:'Sell',to:'/generator/sell?token=ET'},{label:'Swap',to:'/swap?from=ET'}],
  Q:[{label:'Transfer',to:'/generator/transfer?token=Q'},{label:'Buy',to:'/swap?to=Q'},{label:'Sell',to:'/swap?from=Q'},{label:'Swap',to:'/swap?from=Q'}],
  USDT:[{label:'Transfer',to:'/generator/transfer?token=USDT'},{label:'Buy',to:'/swap?to=USDT'},{label:'Sell',to:'/swap?from=USDT'},{label:'Swap',to:'/swap?from=USDT'}],
};

export function SpecialAssetsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('assetView') ?? searchParams.get('view');
  const active: AssetView = requested === 'tokens' || requested === 'ownership' ? requested : 'overview';
  const result = special3SystemProvider.assets();
  const setActive = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(searchParams.get('view') === 'assets' ? 'assetView' : 'view', id);
    setSearchParams(next, { replace:true });
  };
  const panels = result.data ? {
    overview:<Stack gap={5}><MetricGrid><MetricCard label="Estimated value" value={formatCurrency(result.data.portfolio.total)}/><MetricCard label="Tokens" value={result.data.tokens.length}/><MetricCard label="SHIELD" value={result.data.shields.length}/><MetricCard label="STOCK" value={result.data.stocks.length}/></MetricGrid><SemanticNotice tone="warning" title="Preview boundary">{result.detail}</SemanticNotice><PrimaryAction onClick={()=>navigate('/assets#detail')}>Inspect ETER detail</PrimaryAction></Stack>,
    tokens:<Stack gap={3}>{result.data.tokens.map((token) => <Surface key={token.symbol} as="article"><Stack gap={3}><Inline gap={3}><TokenMark token={token.symbol as PaymentToken} size={40}/><Stack gap={1}><Heading level={3}>{token.symbol} · {token.name}</Heading><Text variant="numeric">{formatNumber(token.balance)} · {formatCurrency(token.usdValue)}</Text></Stack></Inline><Inline gap={2}>{(assetActions[token.symbol]??[{label:'Swap',to:`/swap?from=${token.symbol}`}]).map(action=><SecondaryAction key={action.label} onClick={()=>navigate(action.to)}>{action.label}</SecondaryAction>)}</Inline></Stack></Surface>)}</Stack>,
    ownership:<Grid columns={2}>{result.data.shields.map((item) => { const visual=shieldVisualFor(item); return <Surface key={shieldAssetKeyFor(item)}><Stack gap={2}><img src={visual.image} alt={`${visual.label} NFT ${item.tokenId}`} width="240" height="240" loading="lazy" decoding="async" className="mx-auto h-32 w-full object-contain"/><Text variant="label">{visual.label} · {item.batchCode}</Text><Heading level={3}>SHIELD {item.tokenId} · ${item.priceGroup.toLocaleString()}</Heading><Text tone="secondary">{item.durationYears} year · {item.lifecycleState}</Text><Text tone="secondary">{item.paidAmount}/{item.totalAmount} {item.paymentToken} paid</Text><Inline gap={2}><SecondaryAction onClick={()=>navigate(`/shield/${item.priceGroup}/${item.tokenId.replace('#','')}`)}>Manage</SecondaryAction><SecondaryAction onClick={()=>navigate(`/swap?context=shield&tokenId=${encodeURIComponent(item.tokenId)}`)}>Contextual Swap</SecondaryAction></Inline></Stack></Surface>; })}{result.data.stocks.map((item) => <Surface key={item.tokenId}><Stack gap={2}><Text variant="label">STOCK</Text><Heading level={3}>STOCK {item.tokenId}</Heading><Text tone="secondary">{item.votingPower} voting power</Text><Inline gap={2}><SecondaryAction onClick={()=>navigate(`/stock/my-stock?tokenId=${encodeURIComponent(item.tokenId)}`)}>Manage</SecondaryAction><SecondaryAction onClick={()=>navigate(`/swap?context=stock&tokenId=${encodeURIComponent(item.tokenId)}`)}>Contextual Swap</SecondaryAction></Inline></Stack></Surface>)}</Grid>,
  } : undefined;
  const detail = result.data && location.hash === '#detail' ? <Stack gap={4}><Surface as="article"><Stack gap={2}><Text variant="caption">ASSET DETAIL</Text><Heading level={2}>ETER</Heading><Text variant="numeric">{formatNumber(result.data.tokens.find((token)=>token.symbol==='ETER')?.balance ?? 0)} ETER</Text><Text tone="secondary">Provider balance · liquid Product asset</Text></Stack></Surface><Surface><Stack gap={3}><Heading level={2}>Asset history</Heading><Text tone="secondary">Activity and capability actions remain owned by their Product routes.</Text><Inline gap={2}><PrimaryAction onClick={()=>navigate('/transactions')}>View activity</PrimaryAction><SecondaryAction onClick={()=>navigate('/generator/transfer')}>Transfer ETER</SecondaryAction><SecondaryAction onClick={()=>navigate('/swap?from=ETER')}>Swap ETER</SecondaryAction></Inline></Stack></Surface></Stack> : null;
  return <AppShell title="Assets" wide><BrowseTemplate eyebrow="System" title="Assets" intro="Balances and ownership remain clearly separated from source verification." status={<SourceDisclosure value={providerSource(result)} compact/>}>
    {result.state === 'unavailable' || !result.data ? <ProviderUnavailable detail={result.detail}/> : detail ?? <LocalNav label="Asset views" mode="tabs" items={assetTabs} activeId={active} onChange={setActive} panels={panels}/>} 
  </BrowseTemplate></AppShell>;
}

type TransactionFilter = 'all'|'success'|'pending'|'failed';
const transactionTabs = [{id:'all',label:'All activity'},{id:'success',label:'Success'},{id:'pending',label:'Pending'},{id:'failed',label:'Failed'}] as const;

function TransactionRows({ rows }: { rows: SpecialTransaction[] }) {
  const [expanded, setExpanded] = useState<string|null>(null);
  if (!rows.length) return <EmptyState title="No matching activity" detail="Choose another status filter."/>;
  return <Stack gap={3}>{rows.map((tx) => <Surface key={tx.id} as="article" variant="interactive"><Stack gap={3}>
    <SecondaryAction aria-expanded={expanded === tx.id} onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}><Inline gap={3}><StatusIndicator status={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'danger' : 'warning'} label={tx.status}/><Text variant="label">{tx.action.replace(/_/g,' ')}</Text><Text variant="numeric">{tx.amount} {tx.token}</Text></Inline></SecondaryAction>
    {expanded === tx.id && <Stack gap={2}><Text tone="secondary">{tx.module} · {new Date(tx.createdAt).toLocaleString()}</Text><Text variant="caption">Network: {tx.network} · Fee estimate: {tx.gasEstimate} {tx.gasToken}</Text><Text variant="mono">Wallet: {tx.walletAddress}</Text>{tx.txHash && <Text variant="mono">Transaction: {tx.txHash}</Text>}{tx.explorerUrl && <a className="s3-secondary-action" href={tx.explorerUrl} target="_blank" rel="noreferrer">Open verified explorer</a>}</Stack>}
  </Stack></Surface>)}</Stack>;
}

export function SpecialTransactionsPage() {
  const [filter,setFilter] = useState<TransactionFilter>('all');
  const result = special3SystemProvider.transactions();
  const rows = useMemo(() => result.data?.filter((tx) => filter === 'all' || tx.status === filter) ?? [], [filter,result.data]);
  const panels = Object.fromEntries(transactionTabs.map((tab) => [tab.id,<TransactionRows key={tab.id} rows={rows}/>]));
  return <AppShell title="Activity" showBack wide><BrowseTemplate eyebrow="System" title="Activity" intro="Network, fee token, status, and explorer destination come from the active provider contract." status={<SourceDisclosure value={providerSource(result)} compact/>}>
    {result.state === 'unavailable' ? <ProviderUnavailable detail={result.detail}/> : <Stack gap={4}><SemanticNotice tone="info" title="Provider contract">{result.detail}</SemanticNotice><LocalNav label="Filter activity" mode="tabs" items={transactionTabs} activeId={filter} onChange={(id) => setFilter(id as TransactionFilter)} panels={panels}/></Stack>}
  </BrowseTemplate></AppShell>;
}

export function SpecialNotificationsPage() {
  const result = special3SystemProvider.notifications();
  return <AppShell title="Notifications" showBack><BrowseTemplate eyebrow="System" title="Notifications" intro="A readable event feed with explicit preview provenance." status={<SourceDisclosure value={providerSource(result)} compact/>}>
    {result.state === 'unavailable' || !result.data ? <ProviderUnavailable detail={result.detail}/> : <Stack gap={3}>{result.data.map((notice) => <Surface key={notice.id} as="article" variant={notice.read ? 'default' : 'interactive'}><Stack gap={2}><Inline><StatusIndicator status={notice.read ? 'neutral' : 'info'} label={notice.read ? 'Read' : 'New'}/><Text variant="caption" tone="muted">{notice.time}</Text></Inline><Heading level={3}>{notice.title}</Heading><Text tone="secondary">{notice.body}</Text></Stack></Surface>)}</Stack>}
  </BrowseTemplate></AppShell>;
}

export function SpecialSettingsPage() {
  const navigate = useNavigate();
  const { theme,toggleTheme } = useTheme();
  const wallet = useWallet();
  const result = special3SystemProvider.user();
  return <AppShell title="Settings" showBack><BrowseTemplate eyebrow="System" title="Settings" intro="Only settings connected to a real local or wallet action are interactive." status={<SourceDisclosure value={providerSource(result)} compact/>}>
    <Stack gap={4}>
      {result.data && <Surface><Inline gap={3}><IdentityAvatar identity={result.data.walletAddress} level={result.data.achievementProgress?.level ?? 0} size={56}/><Stack gap={1}><Heading level={3}>{result.data.username}</Heading><Text tone="secondary">{result.data.primaryEid}</Text></Stack><SecondaryAction onClick={() => navigate('/profile')}>Open Profile</SecondaryAction></Inline></Surface>}
      <Surface><Stack gap={3}><Heading level={3}>Appearance</Heading><SecondaryAction role="switch" aria-checked={theme === 'dark'}  onClick={toggleTheme}>Dark theme: {theme === 'dark' ? 'On' : 'Off'}</SecondaryAction></Stack></Surface>
      <Surface><Stack gap={3}><Heading level={3}>Notifications and biometric lock</Heading><SemanticNotice tone="neutral" title="Unavailable">These settings require an integrated device preference provider.</SemanticNotice><SecondaryAction disabled>Manage device settings</SecondaryAction></Stack></Surface>
      <Surface><Stack gap={3}><Heading level={3}>Wallet</Heading><Inline><SecondaryAction onClick={() => navigate('/contract-details')}>Contract details</SecondaryAction><SecondaryAction onClick={wallet.disconnect} disabled={!wallet.address}>Disconnect wallet</SecondaryAction></Inline><Text variant="caption" tone="muted">Never share your seed phrase.</Text></Stack></Surface>
    </Stack>
  </BrowseTemplate></AppShell>;
}

export function SpecialProgressPage() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const result = special3SystemProvider.user();
  const [entries,setEntries] = useState<EqLedgerEntry[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    if (!wallet.address) { setEntries([]); setLoading(false); return; }
    setLoading(true);
    new BrowserProgressionPersistence(window.localStorage).load(wallet.address).then((state) => { if (active) setEntries(committedEqHistory(state)); }).catch(() => { if (active) setEntries([]); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  },[wallet.address]);
  const progress = result.data?.achievementProgress;
  return <AppShell title="Progress" wide><OverviewTemplate eyebrow="System" title="Progress" intro="Presentation distinguishes illustrative profile progress from committed EQ ledger entries." status={<SourceDisclosure value={providerSource(result)} compact/>}>
    <Stack gap={5}>
      {progress ? <MetricGrid><MetricCard label="Illustrative level" value={progress.level}/><MetricCard label="Illustrative EQ" value={progress.eqPoints.toLocaleString()}/><MetricCard label="Level progress" value={`${progress.progressPercent}%`}/></MetricGrid> : <ProviderUnavailable detail={result.detail}/>} 
      <Surface><Stack gap={3}><Heading level={2}>Verified EQ ledger</Heading>{loading ? <Text>Loading verified EQ ledger…</Text> : entries.length ? entries.slice(0,5).map((entry) => <Inline key={entry.ledgerEntryId}><Text>{entry.product} · {entry.achievementId}</Text><Text variant="numeric">+{entry.eqDelta} EQ</Text></Inline>) : <SemanticNotice tone="neutral" title="No verified history">No committed EQ entries are available for this wallet in the current environment.</SemanticNotice>}</Stack></Surface>
      <PrimaryAction onClick={() => navigate('/qora?prompt=Continue my current mission')}>Continue with QORA</PrimaryAction>
    </Stack>
  </OverviewTemplate></AppShell>;
}
