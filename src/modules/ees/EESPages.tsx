import { lazy, Suspense, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, Check, Layers3, Minus, Plus, RefreshCw, Send, ShoppingCart } from '@icons';
import { AppShell } from '../../components/layout/AppShell';
import { PaymentTokenSelector } from '../../components/forms/PaymentTokenSelector';
import { TransactionReviewModal } from '../../components/modals/TransactionReviewModal';
import { CenteredModal } from '../../components/modals/CenteredModal';
import { RiskWarningCard } from '../../components/cards/RiskWarningCard';
import { cn } from '../../lib/utils';
import { mockEESStocks, mockTokenRates, mockUser } from '../../data/mockAssets';
import { eesAdapter } from '../../adapters/mock/eesAdapter';
import type { PaymentToken } from '../../lib/types';
import { SectionTabs } from '../../components/ui/SectionTabs';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';

const SpecialStockPresentation = lazy(async()=>{const module=await import('../../special3/products/stock/SpecialStockPages');return {default:module.SpecialStockPresentation}});
type StockPresentationView='buy'|'mine'|'status'|'dividends'|'sales';
function StockPresentationBoundary({view,legacy}:{view:StockPresentationView;legacy:React.ReactNode}){return isSpecialProductPresentationEnabled('STOCK/EES')?<Suspense fallback={<AppShell title="STOCK"><div data-special3 role="status">Loading STOCK presentation…</div></AppShell>}><SpecialStockPresentation view={view}/></Suspense>:legacy}

const multipliers = [
  { value: '1x', color: '#fd9d3f', minted: 1210 },
  { value: '2x', color: '#e8e7e7', minted: 840 },
  { value: '3x', color: '#ffc23f', minted: 530 },
  { value: '5x', color: '#bad1ff', minted: 216 },
  { value: '10x', color: '#f5b7ff', minted: 71 },
];

type StockView = 'buy' | 'mine' | 'status' | 'sales';

function StockNavigation({ active }: { active: StockView }) {
  const navigate = useNavigate();
  const items: Array<[StockView, string, string]> = [
    ['buy', 'Mint Stock', '/stock/buy'],
    ['mine', 'My stock', '/stock/my-stock'],
    ['status', 'Status', '/stock/status'],
  ];
  const icons = { buy: ShoppingCart, mine: Layers3, status: Activity, sales: Activity };
  return <SectionTabs items={items.map(([key, label]) => ({ key, label, icon: icons[key] }))} active={active} onChange={(key) => navigate(items.find(([item]) => item === key)?.[2] ?? '/stock/buy')} label="STOCK sections" className="w-full" />;
}

function SupplyOverview({ active }: { active: StockView }) {
  return (
    <div className="space-y-3">
      <StockNavigation active={active} />
      {active === 'buy' && <section className="surface p-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[['Phase-one supply', '4,000'], ['Remaining', '1,133'], ['Available this week', '120'], ['Sold this week', '78']].map(([label, value]) => (
            <div key={label} className="data-surface px-2.5 py-1.5 min-h-12 flex items-center justify-between gap-2 sm:block">
              <p className="text-xs text-[var(--muted)] leading-tight">{label}</p>
              <strong className="text-sm tabular-nums sm:block sm:mt-0.5">{value}</strong>
            </div>
          ))}
        </div>
      </section>}
      {active === 'buy' && <section className="surface p-3">
        <p className="data-label mb-2">Multiplier distribution</p>
        <div className="grid grid-cols-5 gap-1.5">
          {multipliers.map((item) => (
            <div key={item.value} style={{ backgroundColor: item.color }} className="ees-multiplier-card min-h-16 p-1.5 text-dark-bg flex flex-col justify-between text-center">
              <strong>{item.value}</strong>
              <div className="border-t border-dark-bg/20 pt-1"><span className="text-xs font-bold">{item.minted}</span><p className="text-xs">minted</p></div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)] mt-3">Multipliers determine periodic income distribution weight; voting rights remain one per stock.</p>
      </section>}
    </div>
  );
}

function StockCard({ stock }: { stock: (typeof mockEESStocks)[number] }) {
  return (
    <article className="surface p-4">
      <div className="grid sm:grid-cols-[88px_1fr] gap-4">
        <img src="/assets/ui/ees-product.png" alt="" className="w-20 h-20 object-contain" />
        <div>
          <div className="flex justify-between gap-3"><div><p className="font-bold">{stock.name}</p><p className="text-xs text-[var(--muted)]">Unique token {stock.tokenId}</p></div><strong className="text-warning-DEFAULT">{stock.multiplier}x</strong></div>
          <div className="grid grid-cols-3 gap-2 mt-3">{[['Completion', `${stock.completionStatus}%`], ['Voting', `${stock.votingPower} right`], ['Dividend', `${stock.dividends} USDT`]].map(([label, value]) => <div key={label} className="data-surface p-2"><p className="text-xs text-[var(--muted)]">{label}</p><p className="text-xs font-bold mt-1">{value}</p></div>)}</div>
        </div>
      </div>
    </article>
  );
}

function LegacyEESPage() {
  return (
    <AppShell title="My STOCK" showBack wide>
      <div className="space-y-4"><SupplyOverview active="mine" /><section className="space-y-3" aria-label="My stocks">{mockEESStocks.map((stock) => <StockCard key={stock.tokenId} stock={stock} />)}</section></div>
    </AppShell>
  );
}

function LegacyEESStatusPage() {
  const { pathname } = useLocation();
  const [transferOpen, setTransferOpen] = useState(pathname.endsWith('/transfer'));
  const [transferReviewOpen, setTransferReviewOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [receiver, setReceiver] = useState('');
  const [metadataState, setMetadataState] = useState<'idle' | 'queued'>('idle');
  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  return (
    <AppShell title="STOCK Status" showBack wide>
      <div className="space-y-4">
        <SupplyOverview active="status" />
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-2">{[['Stocks', mockEESStocks.length], ['C-stocks', 1], ['Weight', '8x'], ['Multiplier', 'Max 5x'], ['Max mintable', 4]].map(([label, value]) => <div key={label} className="data-surface p-3"><p className="text-xs text-[var(--muted)]">{label}</p><strong className="block mt-1">{value}</strong></div>)}</section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onClick={() => setTransferOpen(true)} className="cut-button px-3 flex items-center justify-center gap-2"><Send size={15} /> Group actions</button>
          <button onClick={() => { setMetadataState('queued'); window.setTimeout(() => setMetadataState('idle'), 2200); }} className="cut-button px-3 flex items-center justify-center gap-2"><RefreshCw size={15} className={metadataState === 'queued' ? 'animate-spin' : ''} /> {metadataState === 'queued' ? 'Update queued' : 'Metadata'}</button>
        </div>
        <p className="safety-surface p-3 text-xs text-[var(--muted)]" role="status">{metadataState === 'queued' ? 'NFT metadata refresh has been queued for the connected wallet.' : 'Metadata requests the smart contract refresh flow for owned stock NFTs.'}</p>
      </div>
      <CenteredModal open={transferOpen && !transferReviewOpen} onClose={() => setTransferOpen(false)} title="Group transfer" maxWidth="max-w-lg">
        <div className="p-4 sm:p-5 space-y-4"><p className="text-xs text-[var(--muted)]">Select multiple stocks. Transfer costs 19 ETER per stock.</p>{mockEESStocks.map((stock) => <button key={stock.tokenId} onClick={() => toggle(stock.tokenId)} className={cn('w-full data-surface p-3 flex items-center gap-3 text-left', selected.includes(stock.tokenId) && 'border-primary-500')}><span className="w-6 h-6 border grid place-items-center">{selected.includes(stock.tokenId) && <Check size={14} />}</span><span className="flex-1"><strong>{stock.name}</strong><small className="block text-[var(--muted)]">{stock.multiplier}x multiplier</small></span></button>)}<label className="block text-sm font-bold">Receiver<input value={receiver} onChange={(event) => setReceiver(event.target.value)} placeholder="0x..." className="field-control px-3 mt-2 font-mono" /></label><div className="data-surface p-3 flex justify-between"><span>Transfer fee</span><strong className="text-warning-DEFAULT">{selected.length * 19} ETER</strong></div><button disabled={!selected.length || !receiver} onClick={() => setTransferReviewOpen(true)} className="cut-button cut-button--primary w-full px-4 disabled:opacity-40">Review transfer</button></div>
      </CenteredModal>
      <TransactionReviewModal open={transferReviewOpen} onClose={() => setTransferReviewOpen(false)} onConfirm={() => eesAdapter.transferStocks(selected, receiver)} action={`Transfer ${selected.length} STOCK NFT${selected.length === 1 ? '' : 's'}`} amount={selected.length * 19} token="ETER" to={receiver} expectedResult={`${selected.length} STOCK NFT${selected.length === 1 ? '' : 's'} transferred to the reviewed receiver`} riskWarning="NFT transfers are irreversible. Verify the receiver address and selected STOCK count before signing." />
    </AppShell>
  );
}

function LegacyBuyEESPage() {
  const [quantity, setQuantity] = useState(1); const [down, setDown] = useState(19); const [token, setToken] = useState<PaymentToken>('ETER'); const [review, setReview] = useState(false);
  const full = quantity * 100; const minimum = quantity * 19; const usd = down * (mockTokenRates.ETER || 1.35); const pay = usd / (mockTokenRates[token] || 1);
  const changeQty = (delta: number) => { const next = Math.max(1, Math.min(8, quantity + delta)); setQuantity(next); setDown(next * 19); };
  return <AppShell title="Mint Stock" showBack wide><div className="product-workspace-vnext ees-workspace-vnext space-y-4"><SupplyOverview active="buy" /><RiskWarningCard level="info" message="Each stock costs 100 ETER with a minimum 19 ETER initial payment. Complete ownership unlocks full distribution rights." /><section className="action-surface p-4"><div className="flex items-center justify-between"><button onClick={() => changeQty(-1)} className="w-11 h-11 grid place-items-center"><Minus size={16} /></button><div className="text-center"><strong className="text-3xl">{quantity}</strong><p className="text-xs text-[var(--muted)]">stock{quantity > 1 ? 's' : ''}</p></div><button onClick={() => changeQty(1)} className="w-11 h-11 grid place-items-center"><Plus size={16} /></button></div><div className="data-surface p-4 mt-4"><div className="flex justify-between"><span>Pay now</span><strong>{down} ETER</strong></div><input type="range" min={minimum} max={full} value={down} onChange={(event) => setDown(Number(event.target.value))} className="w-full accent-primary-500 mt-3" /><div className="flex justify-between text-xs text-[var(--muted)]"><span>Min {minimum}</span><span>Full {full} ETER</span></div></div><div className="mt-4"><PaymentTokenSelector selected={token} onChange={setToken} usdAmount={usd} balances={{ USDT: mockUser.usdtBalance, ETER: mockUser.eterBalance, ET: mockUser.etBalance, Q: mockUser.qBalance }} /></div><button onClick={() => setReview(true)} className="cut-button cut-button--primary w-full px-4 mt-4">Confirm {pay.toFixed(4)} {token}</button></section><TransactionReviewModal open={review} onClose={() => setReview(false)} onConfirm={() => eesAdapter.buyStock({ amount: down })} action={`Mint ${quantity} Stock`} amount={Number(pay.toFixed(4))} token={token} expectedResult={`${quantity} Electoral Stock NFT${quantity > 1 ? 's' : ''} with ownership rights`} /></div></AppShell>;
}

function LegacyEESSalesReportPage() {
  const rows = [{ name: 'SARAH.ETER', stocks: 8, multiplier: '3x' }, { name: 'JAMES.ETER', stocks: 6, multiplier: '2x' }, { name: 'ANA.ETER', stocks: 5, multiplier: '5x' }];
  return <AppShell title="Electoral Stock Sales" showBack wide><div className="space-y-4"><SupplyOverview active="sales" /><div className="grid grid-cols-2 gap-2"><div className="data-surface p-4"><p className="text-xs text-[var(--muted)]">Total sales</p><strong className="text-2xl block mt-1">19</strong></div><div className="data-surface p-4"><p className="text-xs text-[var(--muted)]">Stocks awarded</p><strong className="text-2xl block mt-1">1</strong></div></div><div className="surface divide-y divide-current/10">{rows.map((row) => <div key={row.name} className="grid grid-cols-[1fr_auto_auto] gap-4 p-4"><div><p className="font-bold">{row.name}</p><p className="text-xs text-[var(--muted)]">Direct referral</p></div><strong>{row.stocks} stocks</strong><span className="text-warning-DEFAULT">{row.multiplier}</span></div>)}</div></div></AppShell>;
}

function LegacyEESDividendsPage() {
  const [review, setReview] = useState(false); const total = mockEESStocks.reduce((sum, stock) => sum + stock.dividends, 0);
  return <AppShell title="Electoral Stock Income" showBack><div className="brand-surface p-5"><p className="data-label">Periodic income</p><strong className="text-3xl text-success-DEFAULT block mt-2">{total} USDT</strong><button onClick={() => setReview(true)} className="cut-button cut-button--primary px-4 mt-4">Confirm withdrawal</button><TransactionReviewModal open={review} onClose={() => setReview(false)} onConfirm={() => eesAdapter.claimDividends(mockEESStocks[0].tokenId)} action="Withdraw Electoral Stock income" amount={total} token="USDT" expectedResult={`${total} USDT sent to the connected wallet`} /></div></AppShell>;
}

export function EESPage(){return <StockPresentationBoundary view="mine" legacy={<LegacyEESPage/>}/>}
export function EESStatusPage(){return <StockPresentationBoundary view="status" legacy={<LegacyEESStatusPage/>}/>}
export function BuyEESPage(){return <StockPresentationBoundary view="buy" legacy={<LegacyBuyEESPage/>}/>}
export function EESSalesReportPage(){return <StockPresentationBoundary view="sales" legacy={<LegacyEESSalesReportPage/>}/>}
export function EESHistoryPage(){return <StockPresentationBoundary view="sales" legacy={<LegacyEESSalesReportPage/>}/>}
export function EESDividendsPage(){return <StockPresentationBoundary view="dividends" legacy={<LegacyEESDividendsPage/>}/>}
