import { useState } from 'react';
import { ArrowRight, BarChart2, Fingerprint, Gift, Landmark, Repeat2, ShieldCheck, Sparkles, WalletCards } from '@icons';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { TokenMark } from '../components/ui/TokenMark';
import { mockPortfolioValue, mockTokenAssets } from '../data/mockAssets';
import { IS_PREVIEW_MODE } from '../lib/contracts/contractConfig';
import { formatCurrency, formatNumber } from '../lib/utils';
import { useEternityUserState } from '../lib/userState';
import { useWallet } from '../lib/wallet-context';
import { AssetTrendChart } from '../components/charts/AssetTrendChart';
import { PortfolioSummaryCard } from '../components/ui/PortfolioSummaryCard';
import { isSpecialProductPresentationEnabled } from '../special3/products/presentationRegistry';
import { GeneratorEconomyIntegration } from '../special3/products/generator/GeneratorIntegrationSurfaces';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { SpecialEconomyPage } from '../special3/system/SpecialSystemPages';

export function EconomyPage() {
  if (isSpecial3ShellEnabled()) return <SpecialEconomyPage/>;
  return <LegacyEconomyPage/>;
}

function LegacyEconomyPage() {
  const navigate = useNavigate();
  const user = useEternityUserState();
  const wallet = useWallet();
  const primaryAssets = mockTokenAssets.slice(0, 3);
  const [openAssetChart, setOpenAssetChart] = useState<string | null>(null);
  const specialGenerator = isSpecialProductPresentationEnabled('Generator');
  return <AppShell title="Economy" wide>
    <div className="economy-workspace economy-vnext">
      <PortfolioSummaryCard
        title="Estimated portfolio"
        balance={user.isDemo ? formatCurrency(mockPortfolioValue.total) : '—'}
        delta={user.isDemo ? mockPortfolioValue.change24h : undefined}
        helper={user.isGuest ? 'Connect a wallet to load verified balances.' : user.isDemo ? 'Demo data — not read from the blockchain.' : 'Waiting for verified indexer data.'}
        allocations={[
          { code:'ETER', percent:57, tone:'primary' },
          { code:'ET', percent:21, tone:'violet' },
          { code:'Q', percent:16, tone:'cyan' },
          { code:'USDT', percent:6, tone:'neutral' },
        ]}
        actionLabel={user.isGuest ? (wallet.isConnecting ? 'Connecting…' : 'Connect wallet') : 'Asset details'}
        actionDisabled={wallet.isConnecting}
        onAction={user.isGuest ? wallet.connect : () => navigate('/journey?view=assets&assetView=tokens&from=economy')}
      />

      {specialGenerator && <GeneratorEconomyIntegration/>}

      {wallet.error && <p className="economy-wallet-error" role="alert">{wallet.error}</p>}
      <section className="economy-assets" aria-label="Primary assets">
        {primaryAssets.map((asset) => <article key={asset.symbol} className={openAssetChart === asset.symbol ? 'has-open-chart' : ''}>
          <div className="economy-asset-summary">
            <button type="button" className="economy-asset-link" onClick={() => navigate('/journey?view=assets&assetView=tokens&from=economy')}>
              <TokenMark token={asset.symbol as 'ETER'|'ET'|'Q'} size={42}/>
              <span><strong><bdi>{asset.symbol}</bdi></strong><small><bdi>{user.isDemo && IS_PREVIEW_MODE ? `${formatNumber(asset.balance)} · ${formatCurrency(asset.usdValue)}` : 'Balance unavailable'}</bdi></small></span>
            </button>
            <button
              type="button"
              className="economy-chart-toggle"
              aria-expanded={openAssetChart === asset.symbol}
              onClick={() => setOpenAssetChart((current) => current === asset.symbol ? null : asset.symbol)}
            >
              <BarChart2 size={16}/>Chart
            </button>
          </div>
          {openAssetChart === asset.symbol && <AssetTrendChart symbol={asset.symbol} onClose={() => setOpenAssetChart(null)}/>}
        </article>)}
      </section>

      <div className="economy-layout">
        <section className="economy-actions">
          <header><span className="workspace-eyebrow">Actions</span><h2>Move value through ETERNITY</h2></header>
          <div className="economy-action-grid">
            {!specialGenerator && <button className="economy-action-square" onClick={() => navigate('/generator')}><span><Sparkles size={21}/></span><strong>Generate</strong><small>ETER</small></button>}
            <button className="economy-action-square" onClick={() => navigate('/swap')}><span><Repeat2 size={21}/></span><strong>Swap</strong><small>Tokens</small></button>
            <button className="economy-action-reward" onClick={() => navigate('/earn')}><span><Gift size={21}/></span><span><strong>Rewards</strong><small>Pending and claimable rewards</small></span><ArrowRight size={17}/></button>
          </div>
        </section>

        <aside className="economy-ownership">
          <header><WalletCards size={22}/><span><strong>Ownership</strong><small>Assets that create on-chain rights</small></span></header>
          <button onClick={() => navigate('/eid/my-names')}><Fingerprint size={19}/><span><strong>EID</strong><small>Identity ownership</small></span><ArrowRight size={16}/></button>
          <button onClick={() => navigate('/shield')}><ShieldCheck size={19}/><span><strong>SHIELD</strong><small>Protected ownership</small></span><ArrowRight size={16}/></button>
          <button onClick={() => navigate('/stock/buy')}><Landmark size={19}/><span><strong>STOCK</strong><small>Ownership and voting rights</small></span><ArrowRight size={16}/></button>
        </aside>
      </div>
    </div>
  </AppShell>;
}
