import { Activity, ArrowRight, BarChart3, CircleDollarSign, History, WalletCards, Zap } from '@icons';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '../../../components/layout/AppShell';
import { TransactionReviewModal } from '../../../components/modals/TransactionReviewModal';
import { PaymentTokenSelector } from '../../../components/forms/PaymentTokenSelector';
import { TokenMark } from '../../../components/ui/TokenMark';
import { IS_PREVIEW_MODE } from '../../../lib/contracts/contractConfig';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { useEternityUserState } from '../../../lib/userState';
import { useJourney } from '../../../lib/journey/journey-context';
import { buildProductJourneyContext } from '../../../lib/journey/missionRegistry';
import { productByRoute } from '../../../data/productRegistry';
import { productData } from '../../providers/products';
import { ProductProviderGate } from '../../providers/products/ProductProviderGate';
import {
  ActionReceipt, DataCard, EligibilityNotice, FinancialInput, PrimaryAction, QoraTransactionDisclosure,
  RiskNotice, SecondaryAction, SourceDisclosure, WalletAddressInput, resolveActionContext,
  type ReceiptStage, type SourceFreshness,
} from '../../interaction';
import { Badge, Heading, Inline, Stack, Text } from '../../primitives';
import { getConfiguredProgressionReadiness } from '../../progression';
import { SpecialPageHero } from '../../hero';
import { SpecialMetricCard } from '../../ui/SpecialMetricCard';
import {
  GENERATOR_PAYMENT_TOKENS, generatorEterAsset, type GeneratorAction,
  useGeneratorProductController,
} from '../../../modules/generator/generatorProduct';
import { GENERATOR_FINANCIAL_CONTEXT } from './financialContext';
import './generator.css';

const { ecosystemStats, transactionLogs } = productData;

export const generatorSource: SourceFreshness = IS_PREVIEW_MODE
  ? { source:'mock', label:'Preview · Mock', freshness:'unavailable', detail:'Fixture balances and mock Generator adapter; freshness is unavailable and no real transaction occurs.' }
  : { source:'direct-chain', label:'Direct Chain', freshness:'live', detail:'Configured Generator adapter and wallet authorization.' };

export type GeneratorMenuKey = 'generate' | 'sell' | 'transfer' | 'burn' | 'donate' | 'history';
const GENERATOR_MENU: ReadonlyArray<{ key:GeneratorMenuKey; label:string; route:string }> = [
  { key:'generate', label:'Generate', route:'/generator/generate' },
  { key:'sell', label:'Sell', route:'/generator/sell' },
  { key:'transfer', label:'Transfer', route:'/generator/transfer' },
  { key:'burn', label:'Burn', route:'/generator/burn' },
  { key:'donate', label:'Donate', route:'/generator/donate' },
  { key:'history', label:'History', route:'/generator/history' },
];

const menuKeyForAction = (action: GeneratorAction): GeneratorMenuKey => action === 'buy' ? 'generate' : action;

function GeneratorMenu({ active }: { active:GeneratorMenuKey }) {
  const navigate = useNavigate();
  const hostRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Partial<Record<GeneratorMenuKey, HTMLButtonElement | null>>>({});

  useEffect(() => {
    const host = hostRef.current;
    const selected = itemRefs.current[active];
    if (!host || !selected) return;
    const frame = requestAnimationFrame(() => {
      const hostRect = host.getBoundingClientRect();
      const itemRect = selected.getBoundingClientRect();
      if (itemRect.left < hostRect.left || itemRect.right > hostRect.right) selected.scrollIntoView({ block:'nearest', inline:'center', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return <nav ref={hostRef} className="s3-generator-menu glass-subtle" aria-label="Generator actions">
    {GENERATOR_MENU.map((item) => <button
      ref={(node) => { itemRefs.current[item.key] = node; }}
      key={item.key}
      type="button"
      aria-current={active === item.key ? 'page' : undefined}
      onClick={() => navigate(item.route)}
    >{item.label}</button>)}
  </nav>;
}

function GeneratorMetrics() {
  return <section className="s3-generator-metrics" aria-label="Generator metrics">
    <SpecialMetricCard label="ETER Price" value={formatCurrency(ecosystemStats.eterPrice)} detail="Current Generator source" icon={<CircleDollarSign/>}/>
    <SpecialMetricCard label="Your ETER" value={`${formatNumber(generatorEterAsset.balance)} ETER`} detail="Generator-owned balance" icon={<WalletCards/>}/>
    <SpecialMetricCard label="ETER Value" value={formatCurrency(generatorEterAsset.usdValue)} detail="Indicative USD value" icon={<BarChart3/>}/>
    <SpecialMetricCard label="24h Volume" value={formatCurrency(ecosystemStats.generatorVolume24h)} detail="Generator 24h source" icon={<Activity/>}/>
  </section>;
}

export function GeneratorProductFrame({ active, view, children }: { active:GeneratorMenuKey; view:string; children:ReactNode }) {
  const navigate = useNavigate();
  const user = useEternityUserState();
  const journey = useJourney();
  const product = productByRoute('/generator');
  const journeyContext = useMemo(() => product ? buildProductJourneyContext(product, user, journey.handoff?.missionId) : null, [journey.handoff?.missionId, product, user]);
  const relevantJourney = journeyContext?.mission;
  return <AppShell title="Generator" showBack wide showJourneyPresence={false}>
    <main className="s3-generator-page" data-generator-view={view}>
      <SpecialPageHero
        title="Generator"
        description="Generate, move and manage ETER through Product-owned wallet flows."
        tipsPrompt="Explain the current Generator action, its payment or ETER requirements, risks and review boundary. Do not execute, confirm or sign anything."
        visual={<TokenMark token="ETER" size={40}/>}
        compactControls
        journey={relevantJourney ? { label:'Open relevant Generator Journey context', progressLabel:journeyContext?.progressLabel, onOpen:() => navigate(`/journey?mission=${encodeURIComponent(relevantJourney.id)}`) } : undefined}
      />
      <GeneratorMetrics/>
      <GeneratorMenu active={active}/>
      {children}
    </main>
  </AppShell>;
}

export function SpecialGeneratorPresentation({ action }: { action?: GeneratorAction }) {
  return <ProductProviderGate title="Generator">{action ? <SpecialGeneratorAction action={action}/> : <SpecialGeneratorOverview/>}</ProductProviderGate>;
}

export function SpecialGeneratorPage() {
  const { pathname } = useLocation();
  const action: GeneratorAction | undefined = pathname === '/generator/generate' || pathname === '/generator/buy' ? 'buy'
    : pathname === '/generator/sell' ? 'sell'
    : pathname === '/generator/burn' ? 'burn'
    : pathname === '/generator/donate' ? 'donate'
    : pathname === '/generator/transfer' ? 'transfer'
    : undefined;
  return <SpecialGeneratorPresentation action={action}/>;
}

function SpecialGeneratorOverview() {
  const navigate = useNavigate();
  const recent = transactionLogs.find((entry) => entry.module === 'Generator');
  return <GeneratorProductFrame active="generate" view="overview">
    <section className="s3-generator-primary-workspace glass-featured" aria-labelledby="generator-primary-title">
      <div className="s3-generator-primary-workspace__token"><TokenMark token="ETER" size={52}/><span><small>PRIMARY PRODUCT ACTION</small><Heading level={2} id="generator-primary-title">Generate ETER</Heading><Text tone="secondary">{formatNumber(generatorEterAsset.balance)} ETER · {formatCurrency(generatorEterAsset.usdValue)} indicative value</Text></span></div>
      <div className="s3-generator-primary-workspace__readiness"><SourceDisclosure value={generatorSource} compact/><Badge tone={IS_PREVIEW_MODE ? 'neutral' : 'warning'}>{IS_PREVIEW_MODE ? 'Preview flow' : 'Wallet required'}</Badge></div>
      <PrimaryAction className="s3-generator-primary" onClick={() => navigate('/generator/generate')}><Zap aria-hidden="true"/>Generate ETER<ArrowRight aria-hidden="true"/></PrimaryAction>
    </section>

    <section className="s3-generator-support" aria-label="Generator support">
      <DataCard title="Product truth"><Stack gap={1}><Text variant="label">Product-owned execution</Text><Text variant="caption" tone="muted">Amount, quote, Review and wallet authorization remain inside Generator. QORA can only explain or prepare.</Text></Stack></DataCard>
      <DataCard title="Recent activity" disclosure={<SecondaryAction onClick={() => navigate('/generator/history')}><History aria-hidden="true"/>History</SecondaryAction>}>
        {recent ? <Stack gap={1}><Text variant="label">{recent.action === 'BUY_ETER' ? 'ETER generated' : recent.action.replace(/_/g, ' ')}</Text><Text tone="secondary">{recent.amount} {recent.token} · {recent.status}</Text><Text variant="caption" tone="muted">Configured {IS_PREVIEW_MODE ? 'Preview' : 'Product'} record · {new Date(recent.createdAt).toLocaleDateString()}</Text></Stack> : <Text tone="muted">No configured Generator history is available.</Text>}
      </DataCard>
      <DataCard title="Authorization readiness"><Stack gap={1}><Text variant="label">{IS_PREVIEW_MODE ? 'No real signature in Preview' : 'Connected wallet required'}</Text><Text variant="caption" tone="muted">Review remains a separate boundary before Product confirmation, indexing and progression evaluation.</Text></Stack></DataCard>
    </section>
  </GeneratorProductFrame>;
}

function SpecialGeneratorAction({ action }: { action: GeneratorAction }) {
  const navigate = useNavigate();
  const location = useLocation();
  const controller = useGeneratorProductController(action);
  const actionContext = resolveActionContext({ pathname:location.pathname, search:location.search, product:'Generator', action:controller.copy.title, formState:controller.formState, source:IS_PREVIEW_MODE ? 'preview' : 'live', mode:getConfiguredProgressionReadiness().effectiveMode });
  const queryToken = new URLSearchParams(location.search).get('token');
  const active = menuKeyForAction(action);

  if (controller.completion) {
    const stages: ReceiptStage[] = [
      { id:'wallet', label:IS_PREVIEW_MODE ? 'Preview authorization' : 'Wallet authorization', state:'success', detail:IS_PREVIEW_MODE ? 'Controlled mock execution completed.' : 'Authorized by the connected wallet.' },
      { id:'confirmation', label:'Product confirmation', state:'success', detail:'Generator adapter returned a transaction result.' },
      { id:'indexing', label:'Indexed Generator evidence', state:'pending', detail:controller.completion.indexerDelayed ? 'Indexer delay remains visible.' : 'Awaiting authoritative indexed turnover evidence.' },
      { id:'progression', label:'Achievement evaluation', state:'pending', detail:'Transaction confirmation alone does not award EQ or complete Journey.' },
    ];
    return <GeneratorProductFrame active={active} view="receipt">
      <section className="s3-generator-receipt glass-featured" aria-label="Generator receipt">
        <ActionReceipt
          title={controller.copy.title}
          productResult={<Stack gap={2}><Text variant="label">{controller.estimatedReceived}</Text><Text tone="secondary">The Generator adapter completed the requested Product operation.</Text></Stack>}
          evidence={[
            { id:'action', label:'Action', value:controller.copy.title },
            { id:'amount', label:'Amount', value:`${controller.amountNumber} ${action === 'buy' ? controller.paymentToken : 'ETER'}` },
            ...(action === 'transfer' ? [{ id:'recipient', label:'Recipient', value:controller.recipient, fullValue:controller.recipient, copyable:true, mono:true }] : []),
            ...(controller.completion.transactionHash ? [{ id:'transaction', label:IS_PREVIEW_MODE ? 'Mock transaction' : 'Transaction', value:controller.completion.transactionHash, fullValue:controller.completion.transactionHash, copyable:true, mono:true }] : []),
          ]}
          stages={stages}
          source={generatorSource}
          syncState={controller.completion.indexerDelayed ? 'delayed' : 'unavailable'}
          progression={{ state:'pending', label:'Pending verified Achievement evaluation', journeyImpact:'Journey cannot complete directly from transaction confirmation', evidence:'generator.turnover.indexed required' }}
          nextAction={<Inline><SecondaryAction onClick={() => controller.setCompletion(null)}>Start another</SecondaryAction><PrimaryAction onClick={() => navigate('/generator/history')}>View history</PrimaryAction></Inline>}
        />
      </section>
    </GeneratorProductFrame>;
  }

  const risk = action === 'burn' ? 'Burn permanently removes ETER and cannot be reversed.' : action === 'donate' ? 'Donation transfers ETER to the ecosystem pool and cannot be reversed.' : action === 'transfer' ? 'A transfer sends ETER to the reviewed full wallet address.' : undefined;
  return <GeneratorProductFrame active={active} view={`action-${active}`}>
    <section className="s3-generator-action-layout" aria-label={`${controller.copy.title} workspace`}>
      <div className="s3-generator-form glass-featured" data-s3-action-context={actionContext.contextKey} data-s3-generator-action={action}>
        <header><span><small>PROTECTED GENERATOR ACTION</small><Heading level={2}>{controller.copy.title}</Heading><Text tone="secondary">{controller.copy.description}</Text></span><SourceDisclosure value={generatorSource} compact/></header>
        <Stack gap={3}>
          <FinancialInput id="generator-amount" label="Amount" value={controller.amount} onChange={controller.setAmount} unit={action === 'buy' || action === 'donate' ? controller.paymentToken : 'ETER'} balance={String(controller.availableBalance)} state={controller.amountValid ? 'valid' : 'default'} error={controller.amountError} precision={18} feeContext="Network estimate available at Review" conversionContext={controller.estimatedReceived === '—' ? undefined : `Estimated result ${controller.estimatedReceived}`}/>
          {(action === 'buy' || action === 'donate') && <PaymentTokenSelector label={action === 'buy' ? 'Generate with' : 'Donate with'} selected={controller.paymentToken} onChange={controller.setPaymentToken} usdAmount={controller.paymentUSD} tokens={[...GENERATOR_PAYMENT_TOKENS]} balances={{USDT:productData.user.usdtBalance,ETER:productData.user.eterBalance,ET:productData.user.etBalance,Q:productData.user.qBalance}}/>}
          {action === 'transfer' && <WalletAddressInput id="generator-recipient" label="Recipient address" value={controller.recipient} onChange={controller.setRecipient} state={controller.recipientValidation.valid ? 'valid' : 'invalid'} error={controller.recipientValidation.error} hint="Product-owned Polygon/EVM validation controls Review readiness."/>}
          <EligibilityNotice eligible={controller.ready}>{controller.ready ? 'Generator validation reports this form as Review-ready.' : 'Review remains blocked until all Product-owned requirements are valid.'}</EligibilityNotice>
          {queryToken && queryToken !== 'ETER' && <RiskNotice>Route query token={queryToken} is preserved in Action Context. Generator semantics remain ETER.</RiskNotice>}
          {risk && <RiskNotice level={action === 'burn' ? 'danger' : 'warning'}>{risk}</RiskNotice>}
          <PrimaryAction className="s3-generator-primary s3-generator-review" disabled={!controller.ready} onClick={() => controller.setReviewOpen(true)}>Review {controller.copy.title}</PrimaryAction>
        </Stack>
      </div>

      <aside className="s3-generator-action-support">
        <DataCard title="Financial context"><dl className="s3-generator-financial-context"><div><dt>ETER price</dt><dd><span>{formatCurrency(ecosystemStats.eterPrice)}</span><small>Current Product fixture</small></dd></div><div><dt>Estimated result</dt><dd><span>{controller.estimatedReceived}</span><small>Product calculation</small></dd></div>{GENERATOR_FINANCIAL_CONTEXT.map((field) => <div key={field.id} data-s3-financial-field={field.id} data-source={field.source} data-availability={field.availability}><dt>{field.label}</dt><dd><span>{field.value}</span><small>{field.source.replace(/-/g, ' ')}</small></dd></div>)}</dl><Text variant="caption" tone="muted">No pre-Review network estimate is fabricated.</Text></DataCard>
        <DataCard title="QORA boundary"><QoraTransactionDisclosure mode="form"/></DataCard>
      </aside>
    </section>
    <TransactionReviewModal
      open={controller.reviewOpen}
      onClose={() => controller.setReviewOpen(false)}
      onConfirm={controller.confirm}
      onCompleted={controller.setCompletion}
      actionContextFormState={controller.formState}
      action={controller.copy.title}
      amount={controller.amountNumber}
      token={action === 'buy' || action === 'donate' ? controller.paymentToken : 'ETER'}
      to={action === 'transfer' ? controller.recipient : undefined}
      riskWarning={risk}
      expectedResult={controller.estimatedReceived}
    />
  </GeneratorProductFrame>;
}
