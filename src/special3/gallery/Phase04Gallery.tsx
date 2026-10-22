import { useState, type ReactNode } from 'react';
import { Badge, Grid, Heading, Inline, Stack, StatusIndicator, Surface, Text } from '../primitives';
import {
  ActionFormTemplate,
  ActionReceipt,
  BrowseTemplate,
  DataCard,
  DetailTemplate,
  EligibilityNotice,
  EmptyState,
  ErrorState,
  FinancialInput,
  LoadingState,
  MetricCard,
  MetricGrid,
  OverviewTemplate,
  PrimaryAction,
  QoraTransactionDisclosure,
  QuoteStateView,
  RecoveryState,
  ResultTemplate,
  ReviewTemplate,
  RiskNotice,
  SecondaryAction,
  SourceDisclosure,
  Special3TransactionReview,
  WalletAddressInput,
  type ProgressionPresentation,
  type QoraSurfaceMode,
  type ReceiptStage,
  type ReviewField,
  type SourceFreshness,
} from '../interaction';

const previewSource: SourceFreshness = { source:'preview', label:'Development sample', freshness:'fresh', updatedAt:'2026-08-08T15:00:00Z', detail:'Gallery fixture. No transaction.' };
const fieldSource: SourceFreshness = { ...previewSource, label:'Preview field', detail:'Development-only field source.' };
const chainSource: SourceFreshness = { source:'direct-chain', freshness:'fresh', updatedAt:'2026-08-08T15:00:00Z', detail:'Controlled development evidence.' };
const fullAddress = '0x71C0A9AEE4B0987B1C15D0629F56A1A94255A942';
const reviewFields: ReviewField[] = [
  { id:'action', label:'Action', value:'Transfer ETER' }, { id:'product', label:'Product', value:'Generator' },
  { id:'amount', label:'Amount', value:'125.00 ETER' }, { id:'recipient', label:'Recipient', value:fullAddress, fullValue:fullAddress, copyable:true, mono:true },
  { id:'network', label:'Network', value:'Polygon' }, { id:'gas', label:'Estimated fee', value:'0.012 POL' },
  { id:'approval', label:'Approval required', value:'No' }, { id:'result', label:'Expected Product result', value:'Transfer submitted after wallet authorization' },
];
const pendingProgression: ProgressionPresentation = { state:'pending', label:'Pending verified Achievement evaluation', journeyImpact:'Not updated from transaction confirmation' };
const unavailableProgression: ProgressionPresentation = { state:'unavailable', label:'Progression verification unavailable', journeyImpact:'Journey remains unchanged' };
const pendingStages: ReceiptStage[] = [
  { id:'product', label:'Product transaction', state:'success', detail:'Confirmed on Polygon' },
  { id:'index', label:'ETERNITY data', state:'pending', detail:'Indexing confirmed evidence' },
  { id:'progression', label:'Progression', state:'pending', detail:'No Achievement or EQ yet' },
  { id:'journey', label:'Journey', state:'unavailable', detail:'Awaiting verified progression handoff' },
];

export function Phase04Gallery() {
  const params = new URLSearchParams(window.location.search);
  const focused = params.get('phase04');
  const theme = params.get('theme') === 'light' ? 'light' : 'dark';
  if (focused) return <div data-special3 data-s3-theme={theme} className="s3-p4-fixture"><FocusedFixture state={focused}/></div>;
  return <section className="s3-p4-gallery" aria-label="SPECIAL 3.0 Phase 04 development gallery"><Stack gap={6}>
    <header><Inline gap={2}><Badge tone="primary">PHASE 04.1</Badge><Badge tone="warning">Development sample data</Badge></Inline><Heading level={2}>Shared Interaction + Transaction Architecture</Heading><Text tone="secondary">Reusable presentation only. Product values, rules, validation, eligibility and execution remain Product-owned.</Text></header>
    <TemplateGallery/>
    <InteractionGallery/>
  </Stack></section>;
}

function TemplateGallery() {
  return <section><Stack gap={4}><Heading level={3}>Six Page Templates</Heading><div className="s3-p4-template-grid">
    <MiniFrame label="A · Overview"><OverviewTemplate title="Generator" intro="Operational state and one Primary Action." actions={<PrimaryAction>Generate ETER</PrimaryAction>}><MetricGrid><MetricCard label="Balance" value="125.00 ETER"/><MetricCard label="Source" value="Preview"/></MetricGrid></OverviewTemplate></MiniFrame>
    <MiniFrame label="B · Browse"><BrowseTemplate title="Positions" intro="Discover and inspect current Product records."><DataCard title="Position #104"><Text>Status, amount, date and available action.</Text></DataCard></BrowseTemplate></MiniFrame>
    <MiniFrame label="C · Detail"><DetailTemplate title="Position #104" status={<StatusIndicator status="success" label="Active"/>}><MetricGrid><MetricCard label="Value" value="1,000 ETER"/></MetricGrid><SecondaryAction>Open metadata</SecondaryAction></DetailTemplate></MiniFrame>
    <MiniFrame label="D · Action Form"><ActionFixture/></MiniFrame>
    <MiniFrame label="E · Review / Verify"><ReviewFixture/></MiniFrame>
    <MiniFrame label="F · Result / Receipt"><ReceiptFixture progression="pending"/></MiniFrame>
  </div></Stack></section>;
}

function InteractionGallery() {
  const [amount, setAmount] = useState('125.00');
  const [address, setAddress] = useState(fullAddress);
  return <section><Stack gap={4}><Heading level={3}>Fields, states and recovery</Heading><Grid columns={2} gap={4}>
    <Surface><Stack gap={4}><FinancialInput label="Amount" value={amount} onChange={setAmount} unit="ETER" balance="240.50" min="1" precision={18} onMax={() => setAmount('240.50')} source={fieldSource}/><WalletAddressInput label="Recipient" value={address} onChange={setAddress} state="valid" identityHint="NOVA"/></Stack></Surface>
    <Surface><Stack gap={3}><EligibilityNotice eligible="unknown">Product-owned eligibility is still being evaluated.</EligibilityNotice><RiskNotice>Review the recipient and irreversible transfer effect.</RiskNotice><QuoteStateView quote={{ state:'stale', source:previewSource, quoteId:'DEV-104', message:'Refresh before Review.' }}/></Stack></Surface>
    <LoadingState/><EmptyState title="No verified records" detail="Complete a Product action and wait for indexed evidence." action={<SecondaryAction>Review requirements</SecondaryAction>}/>
    <ErrorState title="Network unavailable" detail="No transaction was submitted. Check Polygon connectivity." action={<SecondaryAction>Retry safely</SecondaryAction>}/><RecoveryState title="Indexer delay" detail="The transaction is confirmed; Product data and progression remain pending." action={<SecondaryAction>Refresh status</SecondaryAction>}/>
  </Grid></Stack></section>;
}

function FocusedFixture({ state }: { state: string }) {
  const content = state === 'action' ? <ActionFixture/> : state === 'action-shell' ? <ActionFixture qoraMode="shell"/> : state === 'action-invalid' ? <InvalidActionFixture/> : state === 'review' ? <ReviewFixture/> : state === 'pending' ? <PendingFixture/> : state === 'receipt-unavailable' ? <ReceiptFixture progression="unavailable"/> : state === 'receipt-rejected' ? <RejectedFixture/> : state === 'gallery' ? <InteractionGallery/> : <ReceiptFixture progression="pending"/>;
  const showFixtureSource = ['action', 'action-shell', 'action-invalid', 'gallery'].includes(state);
  return <div className="s3-p4-fixture__frame">{showFixtureSource && <div className="s3-p4-fixture__label"><SourceDisclosure value={previewSource}/></div>}{content}</div>;
}

function ActionFixture({ qoraMode = 'compact' }: { qoraMode?: QoraSurfaceMode } = {}) {
  const [amount, setAmount] = useState('125.00');
  const [address, setAddress] = useState(fullAddress);
  return <ActionFormTemplate eyebrow="Generator · Transfer" title="Transfer ETER" intro="Product validation remains authoritative. Review opens only after Product logic reports Ready." actions={<PrimaryAction data-s3-primary-review>Review transfer</PrimaryAction>} qoraMode={qoraMode} qora={<QoraTransactionDisclosure mode="form"/>}>
    <Surface><Stack gap={5}><FinancialInput label="Amount" value={amount} onChange={setAmount} unit="ETER" balance="240.50" min="1" precision={18} feeContext="Network fee shown in Review" onMax={() => setAmount('240.50')} source={fieldSource}/><WalletAddressInput label="Recipient" value={address} onChange={setAddress} state="valid" identityHint="NOVA"/><EligibilityNotice eligible>Existing Generator validation reports this development fixture as Review-ready.</EligibilityNotice></Stack></Surface>
  </ActionFormTemplate>;
}

function InvalidActionFixture() {
  const [amount, setAmount] = useState('125.00');
  const [address, setAddress] = useState('not-a-product-approved-recipient');
  return <ActionFormTemplate eyebrow="Generator · Transfer" title="Transfer ETER" intro="The shared layer renders Product validation; it does not replace or broaden it." actions={<PrimaryAction data-s3-primary-review disabled aria-disabled="true">Review transfer</PrimaryAction>} qoraMode="compact" qora={<QoraTransactionDisclosure mode="form"/>}>
    <Surface><Stack gap={5}><FinancialInput label="Amount" value={amount} onChange={setAmount} unit="ETER" balance="240.50" precision={18} source={fieldSource}/><WalletAddressInput label="Recipient" value={address} onChange={setAddress} state="invalid" error="Product validation has not approved this recipient for Review."/><EligibilityNotice eligible={false}>Review remains blocked until the Product-owned validation state becomes valid.</EligibilityNotice></Stack></Surface>
  </ActionFormTemplate>;
}

function ReviewFixture() {
  return <ReviewTemplate eyebrow="Verify" title="Review transfer" intro="Check the full recipient, amount, network, evidence and grounded progression state." qoraMode="compact" qora={<QoraTransactionDisclosure mode="review"/>}>
    <Special3TransactionReview fields={reviewFields} source={previewSource} progression={pendingProgression} risk="Transfer cannot be reversed after wallet authorization." preview onCancel={() => undefined} onConfirm={() => undefined} confirmLabel="Run Preview"/>
  </ReviewTemplate>;
}

function PendingFixture() {
  return <ResultTemplate eyebrow="Transaction status" title="Confirmation is not progression" status={<StatusIndicator status="info" label="Indexing"/>} qoraMode="compact" qora={<QoraTransactionDisclosure mode="result"/>}>
    <ActionReceipt title="Transfer submitted" productResult={<Text>Transaction confirmed on Polygon. ETERNITY is indexing the Product result.</Text>} evidence={[{ id:'hash', label:'Transaction hash', value:fullAddress, fullValue:fullAddress, copyable:true, mono:true },{ id:'network', label:'Network', value:'Polygon' }]} progression={pendingProgression} stages={pendingStages} source={chainSource} syncState="syncing"/>
  </ResultTemplate>;
}

function ReceiptFixture({ progression }: { progression: 'pending'|'unavailable' }) {
  const value = progression === 'pending' ? pendingProgression : unavailableProgression;
  const stages = pendingStages.map((stage) => stage.id === 'index' ? { ...stage, state:'success' as const, detail:'Indexed Product result' } : stage.id === 'progression' && progression === 'unavailable' ? { ...stage, state:'unavailable' as const, detail:'Verifier unavailable; zero progression' } : stage);
  return <ResultTemplate eyebrow="Receipt" title="Product result" status={<StatusIndicator status="success" label="Product success"/>} qoraMode="compact" qora={<QoraTransactionDisclosure mode="result"/>}>
    <ActionReceipt title="Transfer completed" productResult={<Text>125.00 ETER transferred to the reviewed recipient.</Text>} evidence={[{ id:'hash', label:'Transaction hash', value:fullAddress, fullValue:fullAddress, copyable:true, mono:true },{ id:'network', label:'Network', value:'Polygon' }]} progression={value} stages={stages} source={chainSource} syncState="indexed" nextAction={<PrimaryAction>Return to Generator</PrimaryAction>}/>
  </ResultTemplate>;
}

function RejectedFixture() {
  const rejectedStages: ReceiptStage[] = [
    { id:'wallet', label:'Wallet authorization', state:'failed', detail:'Cancelled by user' },
    { id:'transaction', label:'Transaction submission', state:'unavailable', detail:'No transaction submitted' },
    { id:'progression', label:'Progression', state:'unavailable', detail:'Zero Achievement, EQ and Journey progress' },
  ];
  return <ResultTemplate eyebrow="Recovery" title="Wallet request cancelled" status={<StatusIndicator status="warning" label="No transaction"/>} qoraMode="compact" qora={<QoraTransactionDisclosure mode="result"/>}>
    <ActionReceipt title="Nothing was submitted" productResult={<Text>Your wallet rejected or cancelled the request. No Product mutation is assumed.</Text>} progression={unavailableProgression} stages={rejectedStages} source={previewSource} nextAction={<SecondaryAction>Back to Review</SecondaryAction>}/>
  </ResultTemplate>;
}

function MiniFrame({ label, children }: { label: string; children: ReactNode }) {
  return <div className="s3-p4-mini"><Badge>{label}</Badge><div className="s3-p4-mini__viewport">{children}</div></div>;
}
