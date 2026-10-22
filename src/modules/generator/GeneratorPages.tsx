import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowUpRight, Flame, Heart, Send, Gift } from '@icons';
import { AppShell } from '../../components/layout/AppShell';
import { TokenMark } from '../../components/ui/TokenMark';
import { TransactionReviewModal } from '../../components/modals/TransactionReviewModal';
import { RiskWarningCard } from '../../components/cards/RiskWarningCard';
import { useTheme } from '../../lib/theme-context';
import { cn, formatCurrency, formatNumber } from '../../lib/utils';
import { mockEcosystemStats, mockUser } from '../../data/mockAssets';
import { PaymentTokenSelector } from '../../components/forms/PaymentTokenSelector';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';
import { GENERATOR_PAYMENT_TOKENS, generatorEterAsset, type GeneratorAction, useGeneratorProductController } from './generatorProduct';

const SpecialGeneratorPresentation = lazy(async () => {
  const module = await import('../../special3/products/generator/SpecialGeneratorPages');
  return { default:module.SpecialGeneratorPresentation };
});

function GeneratorPresentationBoundary({ action }: { action?: GeneratorAction }) {
  if (isSpecialProductPresentationEnabled('Generator')) return <Suspense fallback={<AppShell title="Generator"><div data-special3 role="status" className="s3-generator-loading">Loading Generator presentation…</div></AppShell>}><SpecialGeneratorPresentation action={action}/></Suspense>;
  return action ? <LegacyGeneratorActionPage action={action}/> : <LegacyGeneratorPage/>;
}

function LegacyGeneratorActionPage({ action }: { action: GeneratorAction }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const controller = useGeneratorProductController(action);

  return (
    <AppShell title={controller.copy.title} showBack>
      <div className="vf-generator-page space-y-4 animate-fade-in">
        <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <p className={cn('text-sm mb-3', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{controller.copy.description}</p>
          <div className="space-y-3">
            <div>
              <label className={cn('text-xs font-semibold mb-1 block', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                Amount {action === 'buy' ? `(${controller.paymentToken})` : '(ETER)'}
              </label>
              <input type="number" value={controller.amount} onChange={(event) => controller.setAmount(event.target.value)} placeholder="0.00" className={cn('w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none border', isDark ? 'bg-dark-border border-dark-border text-dark-textPrimary placeholder-dark-textSecondary' : 'bg-light-bg border-light-border text-light-textPrimary placeholder-light-textSecondary')}/>
              <p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Available: {controller.availableBalance} {action === 'buy' ? controller.paymentToken : 'ETER'}</p>
            </div>
            {action === 'buy' && <PaymentTokenSelector selected={controller.paymentToken} onChange={controller.setPaymentToken} usdAmount={controller.paymentUSD} tokens={[...GENERATOR_PAYMENT_TOKENS]} balances={{ USDT:mockUser.usdtBalance, ETER:mockUser.eterBalance, Q:mockUser.qBalance }} label="Generate with"/>}
            {action === 'transfer' && <div>
              <label className={cn('text-xs font-semibold mb-1 block', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Recipient Address</label>
              <input value={controller.recipient} onChange={(event) => controller.setRecipient(event.target.value)} placeholder="0x..." aria-invalid={!controller.recipientValidation.valid} aria-describedby="legacy-generator-recipient-error" className={cn('w-full rounded-xl px-4 py-3 text-sm font-mono outline-none border', isDark ? 'bg-dark-border border-dark-border text-dark-textPrimary placeholder-dark-textSecondary' : 'bg-light-bg border-light-border text-light-textPrimary placeholder-light-textSecondary')}/>
              {!controller.recipientValidation.valid && <p id="legacy-generator-recipient-error" role="alert" className="mt-1 text-xs text-danger-DEFAULT">{controller.recipientValidation.error}</p>}
            </div>}
          </div>
        </div>
        <div className={cn('rounded-2xl p-4 space-y-2', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <div className="flex justify-between text-xs"><span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>ETER Price</span><span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>${mockEcosystemStats.eterPrice}</span></div>
          <div className="flex justify-between text-xs"><span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Estimated Received</span><span className="text-success-DEFAULT font-semibold">{controller.estimatedReceived}</span></div>
          <div className="flex justify-between text-xs"><span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Network Fee</span><span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>~0.002 ETH</span></div>
          <div className="flex justify-between text-xs"><span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Protocol Fee</span><span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>3%</span></div>
        </div>
        {action === 'burn' && <RiskWarningCard message="Burning ETER is irreversible. The tokens will be permanently removed from your wallet and the circulating supply. Understand before you burn." level="danger"/>}
        {action === 'donate' && <RiskWarningCard message="Donations go directly to the ecosystem pool and cannot be reversed. Understand before you donate." level="warning"/>}
        <button disabled={!controller.ready} onClick={() => controller.setReviewOpen(true)} className="cut-button cut-button--primary w-full px-4 disabled:opacity-50">Confirm {controller.copy.title}</button>
      </div>
      <TransactionReviewModal open={controller.reviewOpen} onClose={() => controller.setReviewOpen(false)} onConfirm={controller.confirm} action={controller.copy.title} amount={controller.amountNumber} token={action === 'buy' ? controller.paymentToken : 'ETER'} to={action === 'transfer' ? controller.recipient : undefined} riskWarning={action === 'burn' ? 'This action is irreversible.' : undefined} expectedResult={controller.estimatedReceived}/>
    </AppShell>
  );
}

function LegacyGeneratorPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const secondaryActions = [
    { label:'Sell', icon:ArrowUpRight, path:'/generator/sell', color:'text-warning-DEFAULT' },
    { label:'Burn', icon:Flame, path:'/generator/burn', color:'text-danger-DEFAULT' },
    { label:'Donate', icon:Heart, path:'/generator/donate', color:'text-success-DEFAULT' },
    { label:'Transfer', icon:Send, path:'/generator/transfer', color:'text-accent-DEFAULT' },
    { label:'Gift', icon:Gift, path:'/generator/transfer', color:'text-warning-DEFAULT' },
  ];
  return <AppShell title="Generator" showBack><div className="vf-generator-page space-y-4">
    <div className="space-y-4"><div className="flex justify-center"><TokenMark token="ETER" size={56}/></div><div className="grid grid-cols-3 gap-2">
      <div className={cn('rounded-xl p-2.5 text-center', isDark ? 'bg-dark-surface' : 'bg-light-bg')}><p className={cn('text-xs mb-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>ETER Price</p><p className="font-bold text-sm text-primary-500">${mockEcosystemStats.eterPrice}</p></div>
      <div className={cn('rounded-xl p-2.5 text-center', isDark ? 'bg-dark-surface' : 'bg-light-bg')}><p className={cn('text-xs mb-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Your ETER</p><p className={cn('font-bold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{formatNumber(generatorEterAsset.balance)}</p></div>
      <div className={cn('rounded-xl p-2.5 text-center', isDark ? 'bg-dark-surface' : 'bg-light-bg')}><p className={cn('text-xs mb-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Value</p><p className="font-bold text-sm text-success-DEFAULT">{formatCurrency(generatorEterAsset.usdValue)}</p></div>
    </div><button onClick={() => navigate('/generator/buy')} className="generator-cta vf-generate-eter min-h-14 w-full px-5 text-base font-bold text-white flex items-center justify-center gap-2 focus-ring active:scale-[0.99]"><Zap size={20}/>Generate ETER</button></div>
    <div className="vf-generator-actions mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3">{secondaryActions.map(({ label, icon:Icon, path, color }) => <button key={label} onClick={() => navigate(path)} className="flex min-h-16 min-w-20 flex-col items-center justify-center gap-1.5 px-3 text-xs font-semibold transition-all hover:text-primary-500 active:scale-95 focus-ring"><Icon size={16} className={color}/><span>{label}</span></button>)}</div>
  </div></AppShell>;
}

export const BuyETERPage = () => <GeneratorPresentationBoundary action="buy"/>;
export const SellETERPage = () => <GeneratorPresentationBoundary action="sell"/>;
export const BurnETERPage = () => <GeneratorPresentationBoundary action="burn"/>;
export const DonateETERPage = () => <GeneratorPresentationBoundary action="donate"/>;
export const TransferETERPage = () => <GeneratorPresentationBoundary action="transfer"/>;
export function GeneratorPage() { return <GeneratorPresentationBoundary/>; }
