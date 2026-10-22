import { lazy, Suspense, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { ShieldCard } from '../../components/cards/ShieldCard';
import { PaymentTokenSelector } from '../../components/forms/PaymentTokenSelector';
import { TransactionReviewModal } from '../../components/modals/TransactionReviewModal';
import { CenteredModal } from '../../components/modals/CenteredModal';
import { RiskWarningCard } from '../../components/cards/RiskWarningCard';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { mockShields, mockTokenRates, mockUser } from '../../data/mockAssets';
import { insuranceAdapter } from '../../adapters/mock/insuranceAdapter';
import type { PaymentToken, ShieldPurchaseConfig } from '../../lib/types';
import { SectionTabs } from '../../components/ui/SectionTabs';
import { ArrowUpRight, CalendarClock, CheckCircle2, Gift, Layers3, RefreshCw, ShoppingCart, WalletCards } from '@icons';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';
import { shieldVisualFor } from '../../special3/products/shield/shieldVisuals';

const SpecialShieldPresentation = lazy(async () => {
  const module = await import('../../special3/products/shield/SpecialShieldPages');
  return { default:module.SpecialShieldPresentation };
});
type ShieldPresentationView = 'overview'|'mint'|'mine'|'detail'|'distribution'|'rewards'|'inheritance'|'activity'|'sales';
function ShieldPresentationBoundary({ view, legacy }:{view:ShieldPresentationView;legacy:React.ReactNode}) {
  return isSpecialProductPresentationEnabled('SHIELD')
    ? <Suspense fallback={<AppShell title="SHIELD"><div data-special3 role="status">Loading SHIELD presentation…</div></AppShell>}><SpecialShieldPresentation view={view}/></Suspense>
    : legacy;
}

const tiers: { id: ShieldPurchaseConfig['tier']; amount: number; label: string }[] = [
  { id: 'starter', amount: 100, label: 'Starter' }, { id: 'balanced', amount: 1000, label: 'Growth' }, { id: 'professional', amount: 10000, label: 'Professional' },
];
const olympicColors = [
  { label: 'Yellow', cls: 'is-shield-yellow', minted: [10748, 3650, 821], remaining: [27325, 9100, 2275] },
  { label: 'Black', cls: 'is-shield-black', minted: [1977, 681, 144], remaining: [8156, 2740, 684] },
  { label: 'Red', cls: 'is-shield-red', minted: [1409, 472, 103], remaining: [6036, 2012, 503] },
  { label: 'Green', cls: 'is-shield-green', minted: [1345, 449, 98], remaining: [4331, 1444, 361] },
  { label: 'Blue', cls: 'is-shield-blue', minted: [79, 27, 6], remaining: [232, 78, 20] },
];

type ShieldView = 'buy' | 'mine' | 'sales';

function ShieldNavigation({ active }: { active: ShieldView }) {
  const navigate = useNavigate();
  const routes: Record<ShieldView, string> = { buy: '/shield/mint', mine: '/shield/my-shields', sales: '/shield' };
  return <SectionTabs items={[{ key: 'buy', label: 'Mint SHIELD', icon: ShoppingCart }, { key: 'mine', label: 'My SHIELD', icon: Layers3 }]} active={active} onChange={(key) => navigate(routes[key])} label="SHIELD sections" className="w-full" />;
}

function ShieldMarketSnapshot() {
  const [selectedTier, setSelectedTier] = useState(0);
  const selected = tiers[selectedTier];
  return <section className="vf-shield-overview"><div className="vf-shield-overview-head"><div><p className="data-label">SHIELD overview</p><h2>${selected.amount.toLocaleString()}</h2></div></div><div className="vf-shield-tiers">{tiers.map((tier, index) => <button key={tier.id} onClick={() => setSelectedTier(index)} className={selectedTier === index ? 'is-active' : ''} aria-pressed={selectedTier === index}><strong>${tier.amount.toLocaleString()}</strong></button>)}</div><div className="vf-shield-colors" aria-live="polite">{olympicColors.map((item) => { const minted = item.minted[selectedTier]; const remaining = item.remaining[selectedTier]; return <div key={item.label} aria-label={`${item.label}: ${minted} minted, ${remaining} remaining`} className={item.cls}><strong>{minted}</strong><strong>{remaining}</strong></div>; })}</div></section>;
}

function ShieldBuyForm() {
  const { theme } = useTheme(); const isDark = theme === 'dark';
  const [tier,setTier] = useState<ShieldPurchaseConfig['tier']>('starter');
  const [years,setYears] = useState(1); const [pct,setPct] = useState(25);
  const [token,setToken] = useState<PaymentToken>('USDT'); const [review,setReview] = useState(false);
  const selected = tiers.find((item) => item.id === tier)!; const usd = selected.amount * pct / 100;
  const tokenAmount = usd / (mockTokenRates[token] || 1);
  return <section className="vf-shield-form action-surface p-4 sm:p-5"><div><p className="eyebrow">Mint SHIELD</p><h2 className="section-title mt-1">Build your policy</h2><p className="text-xs text-[var(--muted)] mt-2">Choose value, period and reserve.</p></div>
    <div className="mt-5"><p className="text-sm font-bold mb-2">Amount</p><div className="grid grid-cols-3 gap-2">{tiers.map((item) => <button key={item.id} onClick={() => setTier(item.id)} className={cn('cut-button px-2',tier === item.id && 'cut-button--primary')}>${item.amount.toLocaleString()}</button>)}</div></div>
    <div className="mt-5"><p className="text-sm font-bold mb-2">Period</p><div className="grid grid-cols-5 gap-1.5">{[1,2,3,4,5].map((year) => <button key={year} onClick={() => setYears(year)} className={cn('min-h-11 border rounded-xl text-sm font-bold',years === year ? 'border-primary-500 bg-primary-500/10 text-primary-500' : isDark ? 'border-dark-border' : 'border-light-border')}>{year}y</button>)}</div></div>
    <div className="mt-5 data-surface p-4"><div className="flex justify-between"><p className="text-sm font-bold">Reserve percentage</p><strong className="text-primary-500">{pct}%</strong></div><input type="range" min="2" max="100" value={pct} onChange={(event) => setPct(Number(event.target.value))} className="w-full accent-primary-500 mt-3" /><div className="flex justify-between text-xs text-[var(--muted)]"><span>2% minimum</span><span>100% complete</span></div><div className="grid grid-cols-2 gap-2 mt-3"><div><p className="text-xs text-[var(--muted)]">Pay now</p><strong>${usd.toFixed(2)}</strong></div><div><p className="text-xs text-[var(--muted)]">Remaining reserve</p><strong>${(selected.amount-usd).toFixed(2)}</strong></div></div></div>
    <div className="mt-5"><p className="text-sm font-bold mb-2">Payment</p><PaymentTokenSelector selected={token} onChange={setToken} usdAmount={usd} balances={{USDT:mockUser.usdtBalance,ETER:mockUser.eterBalance,ET:mockUser.etBalance,Q:mockUser.qBalance}} /></div>
    <button onClick={() => setReview(true)} className="cut-button cut-button--primary w-full px-4 mt-5">Confirm {tokenAmount.toFixed(4)} {token}</button>
    <TransactionReviewModal open={review} onClose={() => setReview(false)} onConfirm={() => insuranceAdapter.buyShield({tier,amount:usd,paymentToken:token})} action={`Mint $${selected.amount.toLocaleString()} SHIELD · ${years} years`} amount={Number(tokenAmount.toFixed(4))} token={token} expectedResult={`1 SHIELD NFT with a ${years}-year period`} riskWarning="SHIELD is a long-term NFT feature. Review the reserve amount, period and receiver before signing." />
  </section>;
}

function LegacyInsurancePage() {
  return <AppShell title="SHIELD" showBack wide><div className="product-workspace-vnext shield-workspace-vnext space-y-4"><ShieldNavigation active="buy" /><ShieldMarketSnapshot /><ShieldBuyForm /></div></AppShell>;
}

function LegacyBuyShieldPage() { return <AppShell title="Mint SHIELD" showBack wide><div className="product-workspace-vnext shield-workspace-vnext space-y-4"><ShieldNavigation active="buy" /><ShieldMarketSnapshot /><ShieldBuyForm /></div></AppShell>; }

function LegacyMyShieldsPage() {
  const navigate = useNavigate();
  const [groupAction, setGroupAction] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [groupReviewOpen, setGroupReviewOpen] = useState(false);
  const total = mockShields.reduce((sum,item) => sum + item.totalAmount,0);
  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const allSelected = selected.length === mockShields.length;
  return <AppShell title="My SHIELDs" showBack wide><div className="space-y-4"><ShieldNavigation active="mine" /><div className="surface p-3"><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{[['Total allocated E',`${total.toLocaleString()} E`],['SHIELDs',mockShields.length],['Fully paid',mockShields.filter((item) => item.remainingAmount === 0).length],['Paid with ET',1]].map(([label,value]) => <div key={label} className="data-surface p-3"><p className="text-xs text-[var(--muted)]">{label}</p><strong className="block mt-1">{value}</strong></div>)}</div></div><section><p className="data-label mb-2">Group actions</p><div className="grid grid-cols-3 gap-2">{['Group transfer','Group buy back','Metadata'].map((label) => <button key={label} onClick={() => { setGroupAction(label); setSelected([]); }} className={cn('cut-button px-2 text-xs', groupAction === label && 'cut-button--primary')}>{label}</button>)}</div></section>{groupAction && <section className="brand-surface p-3 flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{groupAction}</p><p className="text-xs text-[var(--muted)]">Choose the SHIELDs to include.</p></div><button onClick={() => setSelected(allSelected ? [] : mockShields.map((item) => item.tokenId))} className="cut-button px-3">{allSelected ? 'Deselect all' : 'Select all'}</button></section>}{mockShields.map((shield) => <div key={shield.tokenId} className={cn('flex items-stretch gap-2', selected.includes(shield.tokenId) && 'outline outline-2 outline-primary-500 outline-offset-2')}>{groupAction && <button type="button" onClick={() => toggle(shield.tokenId)} aria-label={`${selected.includes(shield.tokenId) ? 'Deselect' : 'Select'} ${shield.tokenId}`} className="w-11 shrink-0 grid place-items-center"><span className="w-6 h-6 border-2 grid place-items-center">{selected.includes(shield.tokenId) && <span className="w-3 h-3 bg-primary-500" />}</span></button>}<div className="min-w-0 flex-1"><ShieldCard shield={shield} onClick={() => groupAction ? toggle(shield.tokenId) : navigate(`/shield/${shield.tokenId.replace('#','')}`)} /></div></div>)}{groupAction && <div className="sticky bottom-24 lg:bottom-4 surface-elevated p-3 flex items-center justify-between gap-3"><span className="text-sm"><strong>{selected.length}</strong> selected</span><button disabled={!selected.length} onClick={() => setGroupReviewOpen(true)} className="cut-button cut-button--primary px-4 disabled:opacity-40">Review {groupAction}</button></div>}</div><TransactionReviewModal open={groupReviewOpen} onClose={() => setGroupReviewOpen(false)} onConfirm={() => insuranceAdapter.runGroupAction({ tokenIds:selected, action:groupAction ?? 'Group action' })} action={`${groupAction ?? 'Group action'} · ${selected.length} SHIELDs`} expectedResult={`${selected.length} selected SHIELDs updated after confirmation`} riskWarning="Group actions affect every selected NFT. Verify the count and wallet request before signing." /></AppShell>;
}

type ShieldAction = 'reserve' | 'complete' | 'period' | 'buyback' | 'transfer' | 'gift';
const shieldActionIcons = { reserve: WalletCards, complete: CheckCircle2, period: CalendarClock, buyback: RefreshCw, transfer: ArrowUpRight, gift: Gift };
function LegacyShieldDetailPage() {
  const { id } = useParams();
  const shield = mockShields.find((item) => item.tokenId.replace('#','') === id) ?? mockShields[0];
  const [action,setAction] = useState<ShieldAction | null>(null); const [reviewOpen,setReviewOpen] = useState(false); const [receiver,setReceiver] = useState(mockUser.walletAddress); const [token,setToken] = useState<PaymentToken>('USDT'); const [pct,setPct] = useState(10); const [receiveET,setReceiveET] = useState(true); const [date,setDate] = useState('2027-06-01');
  const giftAvailable = shield.tokenId === mockShields[0]?.tokenId;
  if (!shield) return <AppShell title="SHIELD not found" showBack><p>SHIELD not found.</p></AppShell>;
  const needsReceiver = action && ['complete','buyback','transfer','gift'].includes(action);
  return <AppShell title={`SHIELD ${shield.tokenId}`} showBack><div className="space-y-4"><ShieldCard shield={shield} /><div className="surface p-4"><p className="data-label">NFT image · {shield.batchCode}</p><img src={shieldVisualFor(shield).image} alt={`${shieldVisualFor(shield).label} NFT ${shield.tokenId}`} width="320" height="320" decoding="async" className="w-full max-h-64 object-contain mt-3" /></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{([['reserve','Add to reserve'],['complete','Complete reserve'],['period','Reduce period'],['buyback','Buyback'],['transfer','Transfer'],['gift','Gift']] as [ShieldAction,string][]).map(([key,label]) => { const Icon = shieldActionIcons[key]; return <button key={key} disabled={key === 'gift' && !giftAvailable} onClick={() => setAction(key)} className="cut-button px-3 disabled:opacity-35"><Icon size={15}/>{label}</button>; })}</div>{!giftAvailable && <p className="text-xs text-[var(--muted)]">Gift is available without levy only during the first two hours after purchase.</p>}</div>
    <CenteredModal open={Boolean(action) && !reviewOpen} onClose={() => setAction(null)} title={action ? action.replace(/\b\w/g,(letter) => letter.toUpperCase()) : 'SHIELD action'} maxWidth="max-w-lg"><div className="p-4 sm:p-5 space-y-4">{action === 'reserve' && <><label className="block text-sm font-bold">Reserve payment · {pct}% of USDT meter</label><input type="range" min="2" max="100" value={pct} onChange={(event) => setPct(Number(event.target.value))} className="w-full accent-primary-500" /><PaymentTokenSelector selected={token} onChange={setToken} usdAmount={shield.totalAmount*pct/100} /></>}{action === 'period' && <><PaymentTokenSelector selected={token} onChange={setToken} usdAmount={25} label="Payment option" /><label className="block text-sm font-bold">New unlock date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field-control px-3 mt-2" /></label></>}{needsReceiver && <><label className="block text-sm font-bold">Receiver<input value={receiver} onChange={(event) => setReceiver(event.target.value)} placeholder="Leave empty for configured heirs" className="field-control px-3 mt-2 font-mono" /></label><p className="safety-surface p-3 text-xs text-[var(--muted)]">If receiver is empty, payment or ownership goes to previously configured heir(s).</p></>}{action === 'buyback' && <label className="flex items-center justify-between data-surface p-3"><span className="text-sm font-bold">Receive allocated ET</span><input type="checkbox" checked={receiveET} onChange={(event) => setReceiveET(event.target.checked)} className="w-5 h-5 accent-primary-500" /></label>}{action === 'buyback' && !receiveET && <p className="text-xs text-[var(--muted)]">Allocated ET will be converted and received as ETER.</p>}{action === 'transfer' && <RiskWarningCard level="warning" message="Transfer levy is 3% of allocated ET. Transfer to a configured heir has a reduced 1.5% levy." />}{action === 'gift' && <RiskWarningCard level="info" message="Gift is levy-free only within two hours of purchase." />}<button onClick={() => setReviewOpen(true)} className="cut-button cut-button--primary w-full px-4">Review action</button></div></CenteredModal>
    <TransactionReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} onConfirm={() => insuranceAdapter.runShieldAction({ tokenId:shield.tokenId, action:action ?? 'update', receiver:needsReceiver ? receiver : undefined, amount:action === 'reserve' ? shield.totalAmount*pct/100 : undefined })} action={`${action ? action.replace(/\b\w/g,(letter) => letter.toUpperCase()) : 'Update'} ${shield.tokenId}`} amount={action === 'reserve' ? Number((shield.totalAmount*pct/100).toFixed(2)) : undefined} token={action === 'reserve' || action === 'period' ? token : undefined} to={needsReceiver ? receiver : undefined} expectedResult={`${shield.tokenId} updated after on-chain confirmation`} riskWarning="SHIELD actions are irreversible after wallet confirmation. Review the NFT, receiver and expected result carefully." />
  </AppShell>;
}

function LegacyShieldSalesReportPage() {
  const direct = [{name:'SARAH.ETER',shields:3,type:'$1,000'},{name:'JAMES.ETER',shields:2,type:'$100'},{name:'ANA.ETER',shields:1,type:'$10,000'}];
  return <AppShell title="SHIELD Sales Report" showBack wide><div className="space-y-4"><ShieldNavigation active="sales" /><div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{[['Total income','2,840 ET'],['Referrer income','420 ET'],['Is EITS','TRUE'],['EITS income','190 ET'],['SHIELDs sold','6']].map(([label,value]) => <div key={label} className="data-surface p-3"><p className="text-xs text-[var(--muted)]">{label}</p><strong className="block mt-1">{value}</strong></div>)}</div><div className="surface divide-y divide-current/10">{direct.map((item) => <div key={item.name} className="grid grid-cols-[1fr_auto_auto] gap-4 p-4"><div><p className="font-bold">{item.name}</p><p className="text-xs text-[var(--muted)]">Direct referral</p></div><strong>{item.shields} SHIELDs</strong><span className="text-primary-500">{item.type}</span></div>)}</div></div></AppShell>;
}

function LegacyInheritancePage() {
  const [beneficiary,setBeneficiary] = useState(''); const [review,setReview] = useState(false);
  return <AppShell title="SHIELD Inheritance" showBack><div className="space-y-4"><RiskWarningCard level="info" message="Configured heirs receive eligible SHIELD value when a receiver is intentionally left empty in supported actions." /><label className="block text-sm font-bold">Beneficiary address<input value={beneficiary} onChange={(event) => setBeneficiary(event.target.value)} placeholder="0x..." className="field-control px-3 mt-2 font-mono" /></label><button disabled={!beneficiary} onClick={() => setReview(true)} className="cut-button cut-button--primary w-full px-4 disabled:opacity-40">Confirm beneficiary</button><TransactionReviewModal open={review} onClose={() => setReview(false)} onConfirm={() => insuranceAdapter.setInheritance({tokenId:mockShields[0].tokenId,beneficiary})} action="Set SHIELD beneficiary" to={beneficiary} expectedResult="Recovery beneficiary updated for the selected SHIELD" /></div></AppShell>;
}

export function InsurancePage(){return <ShieldPresentationBoundary view="overview" legacy={<LegacyInsurancePage/>}/>;}
export function BuyShieldPage(){return <ShieldPresentationBoundary view="mint" legacy={<LegacyBuyShieldPage/>}/>;}
export function MyShieldsPage(){return <ShieldPresentationBoundary view="mine" legacy={<LegacyMyShieldsPage/>}/>;}
export function ShieldDetailPage(){return <ShieldPresentationBoundary view="detail" legacy={<LegacyShieldDetailPage/>}/>;}
export function ShieldSalesReportPage(){return <ShieldPresentationBoundary view="sales" legacy={<LegacyShieldSalesReportPage/>}/>;}
export function InheritancePage(){return <ShieldPresentationBoundary view="inheritance" legacy={<LegacyInheritancePage/>}/>;}
export function ShieldActivityPage(){return <ShieldPresentationBoundary view="activity" legacy={<LegacyInsurancePage/>}/>;}
export function ShieldDistributionPage(){return <ShieldPresentationBoundary view="distribution" legacy={<LegacyInsurancePage/>}/>;}
export function ShieldRewardsPage(){return <ShieldPresentationBoundary view="rewards" legacy={<LegacyInsurancePage/>}/>;}
