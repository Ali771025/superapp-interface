import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, BarChart2, CircleDollarSign, Coins, Fingerprint,
  Flame, Heart, Layers3, LayoutDashboard, MoreHorizontal, Repeat2, ShieldCheck, ShoppingCart, Sparkles, Target, TrendingDown, TrendingUp,
} from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { useTheme } from '../lib/theme-context';
import { cn, formatCurrency, formatNumber } from '../lib/utils';
import { mockEESStocks, mockPortfolioValue, mockShields, mockTokenAssets, mockUser } from '../data/mockAssets';
import { TokenMark } from '../components/ui/TokenMark';
import type { PaymentToken } from '../lib/types';
import { SectionTabs } from '../components/ui/SectionTabs';
import type { LucideIcon } from '@icons';
import { AssetTrendChart } from '../components/charts/AssetTrendChart';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { isSpecialProductPresentationEnabled } from '../special3/products/presentationRegistry';
import { GeneratorAssetsIntegration } from '../special3/products/generator/GeneratorIntegrationSurfaces';
import { SpecialAssetsPage } from '../special3/system/SpecialSystemPages';
import { shieldVisualFor } from '../special3/products/shield/shieldVisuals';

type AssetView = 'overview' | 'tokens' | 'collectibles';

const views: { key: AssetView; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'tokens', label: 'Tokens', icon: Coins },
  { key: 'collectibles', label: 'Ownership', icon: Layers3 },
];

const tokenActions: Record<string, Array<[string, string, LucideIcon]>> = {
  ETER: [['Transfer', '/generator/transfer', ArrowUpRight], ['Donate', '/generator/donate', Heart], ['Burn', '/generator/burn', Flame], ['Swap', '/swap', Repeat2]],
  ET: [['Transfer', '/generator/transfer?token=ET', ArrowUpRight], ['Sell', '/generator/sell?token=ET', CircleDollarSign], ['Swap', '/swap?from=ET', Repeat2]],
  Q: [['Transfer', '/generator/transfer?token=Q', ArrowUpRight], ['Buy', '/swap?to=Q', ShoppingCart], ['Sell', '/swap?from=Q', CircleDollarSign], ['Swap', '/swap?from=Q', Repeat2]],
  USDT: [['Transfer', '/generator/transfer?token=USDT', ArrowUpRight], ['Buy', '/swap?to=USDT', ShoppingCart], ['Sell', '/swap?from=USDT', CircleDollarSign], ['Swap', '/swap?from=USDT', Repeat2]],
};

export function AssetsPage() {
  if (isSpecial3ShellEnabled()) return <SpecialAssetsPage/>;
  return <LegacyAssetsPage/>;
}

function LegacyAssetsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const embeddedInJourney = searchParams.get('view') === 'assets';
  const requestedView = searchParams.get(embeddedInJourney ? 'assetView' : 'view') as AssetView | null;
  const activeView = views.some((view) => view.key === requestedView) ? requestedView! : 'overview';
  const hideDuplicateSummary = searchParams.get('from') === 'economy';
  const ownershipValue = useMemo(() => mockShields.reduce((sum, item) => sum + item.paidAmount, 0) + mockEESStocks.reduce((sum, item) => sum + item.paidAmount, 0), []);
  const [openActions, setOpenActions] = useState<string | null>(null);
  const [openChart, setOpenChart] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const specialGenerator = isSpecialProductPresentationEnabled('Generator');

  const setView = (view: AssetView) => {
    const next = new URLSearchParams(searchParams);
    if (embeddedInJourney) {
      next.set('view', 'assets');
      if (view === 'overview') next.delete('assetView');
      else next.set('assetView', view);
    } else if (view === 'overview') next.delete('view');
    else next.set('view', view);
    setSearchParams(next, { replace: true });
  };

  return (
    <AppShell title="Assets" wide>
      <div className="space-y-6">
        <SectionTabs label="Asset views" items={views} active={activeView} onChange={setView} />

        {specialGenerator && (activeView === 'overview' || activeView === 'tokens') && <GeneratorAssetsIntegration/>}

        {!hideDuplicateSummary && <section className="surface overflow-hidden vf-summary-card vf-assets-summary">
          <div className={cn('grid', summaryExpanded && 'lg:grid-cols-[1.2fr_1fr]')}>
            <div className="p-5 sm:p-6">
              <p className={cn('text-sm font-semibold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Total estimated value</p>
              <div className="flex flex-wrap items-end gap-3 mt-2">
                <p className={cn('font-display text-2xl sm:text-3xl font-bold tabular-nums', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{formatCurrency(mockPortfolioValue.total)}</p>
                <button type="button" onClick={() => setSummaryExpanded((value) => !value)} aria-expanded={summaryExpanded} className="vf-summary-expand">{summaryExpanded ? 'Collapse' : 'Expand'} <ArrowRight size={14}/></button>
              </div>
              {summaryExpanded && <p className={cn('text-xs mt-2', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}><span className="inline-flex items-center gap-1 font-bold text-success-DEFAULT"><TrendingUp size={14}/> {mockPortfolioValue.change24h}%</span> · Prices are indicative until confirmed on-chain.</p>}
            </div>
            {summaryExpanded && <div className={cn('grid grid-cols-2 border-t lg:border-t-0 lg:border-l', isDark ? 'border-dark-border' : 'border-light-border')}>
              <Metric label="Tokens" value={formatCurrency(mockTokenAssets.reduce((sum, token) => sum + token.usdValue, 0))} isDark={isDark} />
              <Metric label="Ownership paid" value={formatCurrency(ownershipValue)} isDark={isDark} borderLeft />
              <Metric label="SHIELD assets" value={String(mockShields.length)} isDark={isDark} borderTop />
              <Metric label="EID names" value={String(mockUser.ownedEids.length)} isDark={isDark} borderTop borderLeft />
            </div>}
          </div>
        </section>}

        {activeView === 'overview' && <section className="asset-current-mission">
          <span><Target size={22}/></span>
          <div><small>Current mission</small><h2>Complete wallet safety</h2><p>Two verified tasks remain in your QORA-guided path.</p></div>
          <div><strong><Sparkles size={14}/>{isSpecial3ShellEnabled() ? 'EQ after verified Achievement' : '+20 EQ'}</strong><button type="button" onClick={() => navigate('/home')}>Continue<ArrowRight size={16}/></button></div>
        </section>}

        {(activeView === 'overview' || activeView === 'tokens') && (
          <section aria-labelledby="token-balances">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="eyebrow">Liquid assets</p>
                <h2 id="token-balances" className="section-title mt-1">Token balances</h2>
              </div>
              {activeView === 'overview' && <button type="button" onClick={() => setView('tokens')} className="text-sm font-bold text-primary-500 focus-ring rounded-lg">See details</button>}
            </div>
            <div className="surface relative z-10 overflow-visible">
              <div className={cn('asset-token-header hidden md:grid gap-4 px-5 py-3 border-b text-xs font-bold uppercase tracking-wider', isDark ? 'border-dark-border text-dark-textSecondary' : 'border-light-border text-light-textSecondary')}>
                <span>Asset</span><span>Balance</span><span>Value</span><span>24h</span><span className="sr-only">Chart</span><span className="sr-only">Actions</span>
              </div>
              <div className={cn('divide-y', isDark ? 'divide-dark-border' : 'divide-light-border')}>
                {mockTokenAssets.map((token) => (
                  <div key={token.symbol} className={cn('asset-token-row relative grid items-center gap-4 p-4 md:px-5', openActions === token.symbol && 'z-[80]', openChart === token.symbol && 'has-open-chart')}>
                    <div className="asset-token-identity flex items-center gap-3 min-w-0">
                      <TokenMark token={token.symbol as PaymentToken} size={40} />
                      <div className="min-w-0">
                        <p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{token.symbol}</p>
                        <p className={cn('text-xs truncate mt-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{token.name}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setOpenChart((current) => current === token.symbol ? null : token.symbol)} aria-label={`Toggle ${token.symbol} chart`} aria-expanded={openChart === token.symbol} className="asset-token-chart-button"><BarChart2 size={18}/></button>
                    <button type="button" onClick={() => setOpenActions((current) => current === token.symbol ? null : token.symbol)} aria-label={`Open ${token.symbol} operations`} aria-expanded={openActions === token.symbol} className="asset-token-more-button"><MoreHorizontal size={18} /></button>
                    <div className="asset-token-balance hidden md:block"><p className={cn('text-sm font-bold tabular-nums', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{formatNumber(token.balance)}</p><p className={cn('text-xs mt-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{token.symbol}</p></div>
                    <div className="asset-token-value"><p className={cn('text-sm font-bold tabular-nums', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{formatCurrency(token.usdValue)}</p><p className={cn('text-xs mt-0.5 md:hidden', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{formatNumber(token.balance)} {token.symbol}</p></div>
                    <div className={cn('asset-token-change hidden md:flex items-center gap-1 text-sm font-bold', token.change24h >= 0 ? 'text-success-DEFAULT' : 'text-danger-DEFAULT')}>
                      {token.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{Math.abs(token.change24h)}%
                    </div>
                    {openActions === token.symbol && <div className="absolute right-4 top-14 z-[100] min-w-48 surface-elevated p-2" role="menu" aria-label={`${token.symbol} operations`}>{token.symbol === 'ET' && <p className="data-label px-2 py-1">ETERNAL</p>}{tokenActions[token.symbol]?.map(([label, route, Icon]) => <button key={label} role="menuitem" onClick={() => { setOpenActions(null); navigate(route); }} className="flex w-full min-h-11 items-center gap-3 px-3 text-left text-sm font-bold hover:bg-primary-500/10 focus-ring"><Icon size={16} className="text-primary-500" />{label}</button>)}</div>}
                    {openChart === token.symbol && <div className="asset-token-chart"><AssetTrendChart symbol={token.symbol} onClose={() => setOpenChart(null)}/></div>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {(activeView === 'overview' || activeView === 'collectibles') && (
          <section aria-labelledby="ownership-assets">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="eyebrow">On-chain ownership</p>
                <h2 id="ownership-assets" className="section-title mt-1">Features and identity</h2>
              </div>
              {activeView === 'overview' && <button type="button" onClick={() => setView('collectibles')} className="text-sm font-bold text-primary-500 focus-ring rounded-lg">View all</button>}
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {mockShields.map((shield) => (
                <OwnershipCard key={shield.tokenId} icon={ShieldCheck} image={shieldVisualFor(shield).image} imageAlt={`${shieldVisualFor(shield).label} NFT ${shield.tokenId}`} eyebrow={`SHIELD · ${shield.batchCode}`} title={`SHIELD ${shield.tokenId}`} meta={`${shield.paidAmount}/${shield.totalAmount} ${shield.paymentToken} paid`} progress={(shield.paidAmount / shield.totalAmount) * 100} color="text-accent-DEFAULT" onClick={() => navigate(`/shield/${shield.tokenId.replace('#', '')}`)} isDark={isDark} />
              ))}
              {mockEESStocks.map((stock) => (
                <OwnershipCard key={stock.tokenId} icon={BarChart2} image="/assets/ui/ees-product.png" eyebrow="STOCK" title={stock.name} meta={`${stock.votingPower} voting power`} progress={stock.completionStatus} color="text-success-DEFAULT" onClick={() => navigate('/stock/my-stock')} isDark={isDark} />
              ))}
              {mockUser.ownedEids.map((eid) => (
                <OwnershipCard key={eid.id} icon={Fingerprint} eyebrow={eid.isPrimary ? 'Primary EID' : 'EID'} title={eid.name} meta={eid.tokenId} color="text-primary-500" onClick={() => navigate('/eid/my-names')} isDark={isDark} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Metric({ label, value, isDark, borderLeft, borderTop }: { label: string; value: string; isDark: boolean; borderLeft?: boolean; borderTop?: boolean }) {
  return <div className={cn('p-4 sm:p-5', borderLeft && 'border-l', borderTop && 'border-t', isDark ? 'border-dark-border' : 'border-light-border')}><p className={cn('text-xs font-semibold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{label}</p><p className={cn('text-lg font-bold mt-1 tabular-nums', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{value}</p></div>;
}

function OwnershipCard({ icon: Icon, image, imageAlt="", eyebrow, title, meta, progress, color, onClick, isDark }: { icon: typeof ShieldCheck; image?: string; imageAlt?: string; eyebrow: string; title: string; meta: string; progress?: number; color: string; onClick: () => void; isDark: boolean }) {
  return (
    <button type="button" onClick={onClick} className="data-surface min-h-40 p-4 text-left focus-ring transition-colors hover:border-primary-500/50">
      <div className="float-right ml-4 flex h-24 w-24 items-center justify-center">{image ? <img src={image} alt={imageAlt} width="96" height="96" loading="lazy" decoding="async" className="h-full w-full object-contain" /> : <Icon size={32} className={color} />}</div>
      <div className="flex items-start gap-3"><div className={cn('w-10 h-10 flex items-center justify-center', color)}><Icon size={18} /></div><ArrowRight size={16} className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} /></div>
      <p className={cn('text-xs font-bold uppercase tracking-wider mt-4', color)}>{eyebrow}</p>
      <p className={cn('text-sm font-bold mt-1', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{title}</p>
      <p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{meta}</p>
      {progress !== undefined && <div className={cn('h-1.5 rounded-full overflow-hidden mt-4', isDark ? 'bg-dark-border' : 'bg-light-border')}><div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(progress, 100)}%` }} /></div>}
    </button>
  );
}
