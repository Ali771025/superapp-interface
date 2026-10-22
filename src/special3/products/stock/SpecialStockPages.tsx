import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, BarChart3, CheckCircle2, Layers3, Trophy, WalletCards } from "@icons";
import { AppShell } from "../../../components/layout/AppShell";
import { TransactionReviewModal } from "../../../components/modals/TransactionReviewModal";
import { buildProductJourneyContext } from "../../../lib/journey/missionRegistry";
import { useJourney } from "../../../lib/journey/journey-context";
import { useEternityUserState } from "../../../lib/userState";
import { productByRoute } from "../../../data/productRegistry";
import { EmptyState, ErrorState, FieldCarrier, FieldInput, PrimaryAction, SecondaryAction, SourceDisclosure } from "../../interaction";
import { SpecialPageHero } from "../../hero";
import { Heading, Text } from "../../primitives";
import { productPresentationProvider } from "../../providers/products";
import { ProductProviderGate } from "../../providers/products/ProductProviderGate";
import { SpecialMetricCard } from "../../ui/SpecialMetricCard";
import {
  STOCK_FULL_PRICE_ETER, STOCK_INCOME_CHECK_DAYS, STOCK_INCOME_WITHDRAW_DAYS,
  STOCK_MINIMUM_INITIAL_ETER, STOCK_MULTIPLIERS, STOCK_PHASE_ALLOCATIONS,
  STOCK_PHASE_ONE_SUPPLY, STOCK_PHASE_TWO_SUPPLY, STOCK_REFERRAL_CYCLE,
  STOCK_REVENUE_SHARE_PERCENT, STOCK_TOTAL_SUPPLY, STOCK_TRANSFER_FEE_ETER,
  availableSupply, daoOwnerPower, formatStockIncomeEntitlement, isStockIncomeEntitlement, maxPurchasable, purchaseAllowance, referralCycles,
  remainingAllowance, stockNftVisualMap,
  type StockMultiplier, type StockPosition, type StockProtocolContext,
} from "./stockProtocol";
import stockCss from "./stock.css?inline";

type StockView = "overview" | "buy" | "mine" | "detail" | "prize" | "dividend" | "income" | "referrals" | "activity";
type RecipientState = "idle" | "checking" | "eligible" | "ineligible";
const menuItems = [
  ["overview", "Overview", "/stock"], ["buy", "Buy", "/stock/buy"],
  ["mine", "My Stocks", "/stock/my-stock"], ["prize", "Prize", "/stock/prize"],
  ["dividend", "Dividend", "/stock/dividends"], ["income", "Income", "/stock/income"],
  ["referrals", "Referrals", "/stock/referrals"], ["activity", "Activity", "/stock/activity"],
] as const;
const normalizeTokenId = (tokenId: string) => tokenId.replace(/^#?EES-?/i, "#");

function stockRuntime() {
  const context = productPresentationProvider.data.stockProtocolContext;
  if (!context) throw new Error("Provider-owned STOCK protocol context is unavailable.");
  return { context, stocks:productPresentationProvider.data.stocks, actions:productPresentationProvider.actions.stock };
}

function providerSource() {
  if (productPresentationProvider.mode === "preview") return {
    source:"preview" as const, label:"Preview · Explicit fixture", freshness:"fresh" as const,
    detail:"Preview Product provider data and actions. Live integration remains fail closed.",
  };
  return {
    source:"live" as const,
    label:productPresentationProvider.available ? "Live · Configured provider" : "Live · Unavailable",
    freshness:productPresentationProvider.available ? "live" as const : "unavailable" as const,
    detail:productPresentationProvider.reason ?? "Configured Product provider.",
  };
}

function StockNav({ active }: { active: StockView }) {
  const navigate = useNavigate();
  const hostRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const selected = active === "detail" ? "mine" : active;
  useEffect(() => {
    const item = itemRefs.current[selected];
    if (!hostRef.current || !item) return;
    const frame = requestAnimationFrame(() => item.scrollIntoView({ block:"nearest", inline:"center", behavior:"auto" }));
    return () => cancelAnimationFrame(frame);
  }, [selected]);
  return <nav ref={hostRef} className="s3-stock-menu glass-subtle" aria-label="STOCK sections">{menuItems.map(([id, label, to]) => <button ref={(node) => { itemRefs.current[id] = node; }} key={id} type="button" aria-current={selected === id ? "page" : undefined} onClick={() => navigate(to)}>{label}</button>)}</nav>;
}

function Metrics() {
  const { context, stocks } = stockRuntime();
  const fullyPaid = stocks.filter((stock) => stock.fundingState === "Fully paid").length;
  return <section className="s3-stock-metrics" aria-label="STOCK protocol metrics">
    <SpecialMetricCard label="Current Phase" value={`Phase ${context.currentPhase}`} detail="Provider state" icon={<Layers3/>}/>
    <SpecialMetricCard label="Available Supply" value={availableSupply(context).toLocaleString()} detail="Current phase" icon={<BarChart3/>}/>
    <SpecialMetricCard label="My Stocks" value={String(stocks.length)} detail={`${productPresentationProvider.mode === "preview" ? "Preview" : "Provider"} positions`} icon={<WalletCards/>}/>
    <SpecialMetricCard label="Fully Paid" value={String(fullyPaid)} detail="Income eligible" icon={<CheckCircle2/>}/>
  </section>;
}

function Frame({ view, title = "STOCK / EES", children }: { view: StockView; title?: string; children: ReactNode }) {
  const navigate = useNavigate();
  const userState = useEternityUserState();
  const journey = useJourney();
  const product = productByRoute("/stock");
  const journeyContext = useMemo(() => product ? buildProductJourneyContext(product, userState, journey.handoff?.missionId) : null, [journey.handoff?.missionId, product, userState]);
  return <AppShell title={title} showBack wide><style>{stockCss}</style><main data-special3 className="s3-stock-page" data-stock-view={view}>
    <SpecialPageHero title="STOCK / EES" description="Fund Electoral Stock NFTs and inspect independent Prize, Dividend, and Income states without semantic collapse." tipsPrompt="Explain STOCK protocol state and Review boundaries. Never execute or sign." visual={<Activity/>} compactControls journey={journeyContext?.mission ? { label:"Open relevant STOCK Journey context", progressLabel:journeyContext.progressLabel, onOpen:() => navigate(`/journey?mission=${encodeURIComponent(journeyContext.mission!.id)}`) } : undefined}/>
    <Metrics/><StockNav active={view}/>{children}
  </main></AppShell>;
}

function StockNftArt({ multiplier, compact = false, eager = false }: { multiplier: StockMultiplier; compact?: boolean; eager?: boolean }) {
  const visual = stockNftVisualMap[multiplier];
  return <figure className={`s3-stock-nft ${compact ? "is-compact" : ""}`}><img src={visual.image} alt={`${visual.label} · ${visual.family}`} width="320" height="320" loading={eager ? "eager" : "lazy"} decoding="async"/></figure>;
}

function AllocationRows() {
  return <div className="s3-stock-allocation" aria-label="Protocol multiplier allocation">{([1, 2] as const).map((phase) => <article key={phase}><header><strong>Phase {phase}</strong><span>{(phase === 1 ? STOCK_PHASE_ONE_SUPPLY : STOCK_PHASE_TWO_SUPPLY).toLocaleString()} NFTs</span></header><div>{STOCK_MULTIPLIERS.map((multiplier) => <span key={multiplier}><img src={stockNftVisualMap[multiplier].image} alt="" width="40" height="40" loading="lazy"/><b>{multiplier}X</b><small>{STOCK_PHASE_ALLOCATIONS[phase][multiplier].toLocaleString()}</small></span>)}</div></article>)}</div>;
}

function EligibilityPanel({ action = true, contextOverride }: { action?: boolean; contextOverride?: StockProtocolContext }) {
  const navigate = useNavigate();
  const context = contextOverride ?? stockRuntime().context;
  const allowance = purchaseAllowance(context), remaining = remainingAllowance(context), supply = availableSupply(context), ceiling = maxPurchasable(context);
  return <section className="s3-stock-panel glass-featured s3-stock-eligibility"><header><div><span className="s3-product__eyebrow">Buyer eligibility</span><Heading level={2}>{context.rank} · Phase {context.currentPhase}</Heading><Text tone="secondary">Fan Pro is provider-owned and is not inferred from rank.</Text></div><SourceDisclosure value={providerSource()} compact/></header><dl className="s3-stock-facts"><div><dt>Purchased</dt><dd>{context.currentPhase === 1 ? context.phase1Purchased : context.phase2Purchased}</dd></div><div><dt>Allowance</dt><dd>{allowance}</dd></div><div><dt>Remaining</dt><dd>{remaining}</dd></div><div><dt>Available supply</dt><dd>{supply}</dd></div></dl>{ceiling === 0 && <p className="s3-stock-validation is-ineligible" role="status">{remaining === 0 ? "No purchase allowance available" : "No current-phase supply available"}</p>}{action && <PrimaryAction className="s3-stock-primary" disabled={ceiling === 0} onClick={() => navigate("/stock/buy")}>BUY STOCK <ArrowRight/></PrimaryAction>}</section>;
}

function Overview() {
  const { context } = stockRuntime();
  const sold = context.phase1Sold + context.phase2Sold, daoPower = daoOwnerPower(sold);
  return <Frame view="overview"><EligibilityPanel/><section className="s3-stock-panel"><header className="s3-stock-section-head"><div><span className="s3-product__eyebrow">Protocol truth</span><h2>Phase & Multiplier Allocation</h2></div><strong>{STOCK_TOTAL_SUPPLY.toLocaleString()} total</strong></header><AllocationRows/><p className="s3-product__muted">Multiplier is assigned only by the mint/source result. Phase 2 stays locked until Phase 1 is sold out.</p></section><section className="s3-stock-support"><article className="s3-stock-panel"><span className="s3-product__eyebrow">Weekly Distribution</span><h3>Daily Stock sales</h3><div className="s3-stock-week">{context.weeklyDailySold.map((day) => <span key={day.day}><small>{day.day}</small><strong>{day.sold}</strong></span>)}</div><p>Next week vest: <strong>{context.nextWeekVest ?? "Unavailable"}</strong></p><small>No frontend formula is supplied.</small></article><article className="s3-stock-panel"><span className="s3-product__eyebrow">Next Biannual Income</span><h3>{context.income?.nextCycleAt ? new Date(context.income.nextCycleAt).toLocaleDateString() : "Unavailable"}</h3><p>{STOCK_REVENUE_SHARE_PERCENT}% of Owner total revenue · fully-paid Stockholders only.</p><small>Entitlement and payout token remain provider-owned.</small></article><article className="s3-stock-panel"><span className="s3-product__eyebrow">Protocol Flow / DAO</span><h3>{daoPower.toFixed(2)} / 10,000</h3><p>Global Owner voting power from {sold.toLocaleString()} Stocks sold.</p><small>Formula cap: 4,900 (49%). Not per-NFT voting power.</small></article></section></Frame>;
}

function PossibleFamily() {
  return <section className="s3-stock-family" aria-label="Possible multiplier NFT family"><header><div><span className="s3-product__eyebrow">Pre-mint preview</span><h3>Possible multiplier family</h3></div><strong>Assigned after mint</strong></header><div>{STOCK_MULTIPLIERS.map((multiplier) => <article key={multiplier}><StockNftArt multiplier={multiplier} compact eager/><b>{multiplier}X</b><small>{stockNftVisualMap[multiplier].family}</small></article>)}</div><p>Token ID and multiplier remain unassigned until the mint result supplies them.</p></section>;
}

function Buy() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const capture = query.get("capture") ?? "";
  const context = stockRuntime().context, actions = stockRuntime().actions;
  const previewGiftFixture = productPresentationProvider.mode === "preview" && (capture === "gift-eligible" || capture === "gift-ineligible");
  const previewGiftReceiver = previewGiftFixture ? (capture === "gift-eligible" ? "0xfae1234" : "0xbad1234") : "";
  const ceiling = maxPurchasable(context);
  const initialQuantity = ceiling === 0 ? 0 : Math.min(capture === "partial" || capture === "review" ? 2 : 1, ceiling);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [payment, setPayment] = useState(initialQuantity * STOCK_MINIMUM_INITIAL_ETER);
  const [gift, setGift] = useState(previewGiftFixture), [receiver, setReceiver] = useState(previewGiftReceiver);
  const [recipientState, setRecipientState] = useState<RecipientState>(previewGiftFixture ? "checking" : "idle");
  const [review, setReview] = useState(capture === "review");
  const [minted, setMinted] = useState<Array<{ tokenId:string; multiplier:StockMultiplier; phase:1 | 2; origin:"Purchase" | "Gift" }>>([]);
  const minimum = quantity * STOCK_MINIMUM_INITIAL_ETER, full = quantity * STOCK_FULL_PRICE_ETER;
  const changeQuantity = (next: number) => { if (ceiling === 0) return; const safe = Math.max(1, Math.min(ceiling, next)); setQuantity(safe); setPayment(safe * STOCK_MINIMUM_INITIAL_ETER); };
  const verifyRecipient = async () => { setRecipientState("checking"); const result = await actions.verifyFanMember(receiver); setRecipientState(result.isFan ? "eligible" : "ineligible"); };
  useEffect(() => {
    if (!previewGiftReceiver) return;
    let active = true;
    actions.verifyFanMember(previewGiftReceiver).then((result) => { if (active) setRecipientState(result.isFan ? "eligible" : "ineligible"); });
    return () => { active = false; };
  }, [actions, previewGiftReceiver]);
  const submit = async () => { const result = await actions.buyStocks({ quantity, initialPaymentETER:payment, recipient:gift ? receiver : undefined }); setMinted(result.positions); return result; };
  const valid = ceiling > 0 && quantity >= 1 && quantity <= ceiling && payment >= minimum && payment <= full && (!gift || recipientState === "eligible");
  return <Frame view="buy" title="Buy STOCK"><EligibilityPanel action={false} contextOverride={context}/><PossibleFamily/><section className="s3-stock-panel s3-stock-form"><header className="s3-stock-section-head"><div><span className="s3-product__eyebrow">ETER settlement</span><h2>Fund Stock positions</h2></div><SourceDisclosure value={providerSource()} compact/></header>{ceiling === 0 && <p className="s3-stock-validation is-ineligible" role="alert">{remainingAllowance(context) === 0 ? "No purchase allowance available. Buy is disabled." : "No current-phase supply available. Buy is disabled."}</p>}<div className="s3-stock-stepper" role="group" aria-label="Stock quantity"><SecondaryAction disabled={ceiling === 0 || quantity <= 1} onClick={() => changeQuantity(quantity - 1)} aria-label="Decrease quantity">−</SecondaryAction><span><strong>{quantity}</strong><small>Stock{quantity === 1 ? "" : "s"}</small></span><SecondaryAction disabled={ceiling === 0 || quantity >= ceiling} onClick={() => changeQuantity(quantity + 1)} aria-label="Increase quantity">+</SecondaryAction></div><FieldCarrier id="stock-payment" label={`Initial payment · ${payment} ETER`} description={ceiling === 0 ? "Unavailable until allowance and supply are available" : `Minimum ${minimum} · Fully paid ${full} ETER`}><FieldInput disabled={ceiling === 0} type="range" min={minimum} max={Math.max(minimum, full)} value={payment} onChange={(event) => setPayment(Number(event.target.value))}/></FieldCarrier><div className="s3-stock-choice" role="group" aria-label="Stock recipient"><button type="button" disabled={ceiling === 0} aria-pressed={!gift} onClick={() => { setGift(false); setRecipientState("idle"); }}>Myself</button><button type="button" disabled={ceiling === 0} aria-pressed={gift} onClick={() => setGift(true)}>Another Fan</button></div>{gift && <div className="s3-stock-recipient"><FieldCarrier id="stock-recipient" label="Recipient Fan wallet" required description="Buyer allowance applies. Recipient must be a registered Fan."><FieldInput value={receiver} onChange={(event) => { setReceiver(event.target.value); setRecipientState("idle"); }} placeholder="0x..."/></FieldCarrier><SecondaryAction disabled={!receiver || recipientState === "checking"} onClick={verifyRecipient}>{recipientState === "checking" ? "Checking…" : "Verify Fan"}</SecondaryAction><p className={`s3-stock-validation is-${recipientState}`} role="status">{recipientState === "eligible" ? "Eligible Fan recipient" : recipientState === "ineligible" ? "Ineligible · enter a registered Fan wallet" : "Verification required"}</p></div>}<dl className="s3-stock-facts"><div><dt>Quantity</dt><dd>{quantity}</dd></div><div><dt>Initial total</dt><dd>{payment} ETER</dd></div><div><dt>Maximum purchasable</dt><dd>{ceiling}</dd></div><div><dt>Recipient</dt><dd>{gift ? (recipientState === "eligible" ? "Verified Fan" : "Not verified") : "Connected wallet"}</dd></div></dl><PrimaryAction className="s3-stock-primary" disabled={!valid} onClick={() => setReview(true)}>Review {quantity} Stock{quantity === 1 ? "" : "s"}</PrimaryAction><p className="s3-product__muted">Transaction confirmation does not verify Stock Complete Achievement/EQ.</p></section>{minted.length > 0 && <section className="s3-stock-panel" aria-live="polite"><span className="s3-product__eyebrow">Provider receipt · source result</span><h2>{minted.length} Stock NFT{minted.length === 1 ? "" : "s"} assigned</h2><div className="s3-stock-receipt">{minted.map((item) => <article key={item.tokenId}><StockNftArt multiplier={item.multiplier} compact eager/><strong>{normalizeTokenId(item.tokenId)} · {item.multiplier}X</strong><small>Phase {item.phase} · {item.origin}</small></article>)}</div></section>}<TransactionReviewModal open={review && valid} onClose={() => setReview(false)} onConfirm={submit} action={`Buy ${quantity} Electoral Stock NFT${quantity === 1 ? "" : "s"}`} amount={payment} token="ETER" to={gift ? receiver : undefined} additionalReviewFields={[{ id:"quantity", label:"Execution positions", value:String(quantity) }, { id:"funding", label:"Funding", value:`${payment} / ${full} ETER` }, { id:"identity", label:"Multiplier / Token ID", value:"Assigned by mint result" }, { id:"recipient", label:"Recipient", value:gift ? "Verified Fan" : "Connected wallet" }]} expectedResult={`${quantity} distinct Stock NFT position${quantity === 1 ? "" : "s"}; identity assigned from source result`} riskWarning="Stock purchases are irreversible. Partial funding does not make a Stock fully paid."/></Frame>;
}

function StockCard({ stock, selecting, selected, onSelect, detailPath }: { stock:StockPosition; selecting:boolean; selected:boolean; onSelect:() => void; detailPath:string }) {
  return <article className="s3-stock-card" data-stock-token-id={stock.tokenId}>{selecting && <label className="s3-stock-select"><FieldInput type="checkbox" checked={selected} onChange={onSelect}/> Select</label>}<StockNftArt multiplier={stock.multiplier}/><header><div><span>{normalizeTokenId(stock.tokenId)}</span><strong>{stock.multiplier}X · Phase {stock.phase}</strong></div><small>{stock.origin}</small></header><div className="s3-product__progress" aria-label={`${stock.completionStatus}% funded`}><span style={{ width:`${stock.completionStatus}%` }}/></div><dl className="s3-stock-facts"><div><dt>Paid</dt><dd>{stock.paidETER} ETER</dd></div><div><dt>Remaining</dt><dd>{stock.remainingETER} ETER</dd></div><div><dt>Funding</dt><dd>{stock.fundingState}</dd></div><div><dt>Income</dt><dd>{stock.incomeEligibility}</dd></div></dl><NavLink className="s3-primary-action" to={detailPath}>Open details</NavLink></article>;
}

function MyStocks() {
  const { stocks, actions } = stockRuntime();
  const [selecting, setSelecting] = useState(false), [selected, setSelected] = useState<string[]>([]), [receiver, setReceiver] = useState("");
  const [receiverState, setReceiverState] = useState<RecipientState>("idle"), [review, setReview] = useState(false);
  const toggle = (tokenId: string) => setSelected((items) => items.includes(tokenId) ? items.filter((item) => item !== tokenId) : [...items, tokenId]);
  const verify = async () => { setReceiverState("checking"); const result = await actions.verifyFanMember(receiver); setReceiverState(result.isFan ? "eligible" : "ineligible"); };
  return <Frame view="mine" title="My Stocks"><section className="s3-stock-collection-head"><div><span className="s3-product__eyebrow">NFT collection</span><h2>Owned Electoral Stocks</h2></div><SecondaryAction onClick={() => { setSelecting(!selecting); setSelected([]); }}>{selecting ? "Cancel selection" : "Select for transfer"}</SecondaryAction></section>{selecting && <section className="s3-stock-panel s3-stock-transfer"><strong>{selected.length} selected · {selected.length * STOCK_TRANSFER_FEE_ETER} ETER fee</strong><FieldInput aria-label="Group transfer receiver" value={receiver} onChange={(event) => { setReceiver(event.target.value); setReceiverState("idle"); }} placeholder="Registered Fan wallet"/><SecondaryAction disabled={!receiver} onClick={verify}>Verify Fan</SecondaryAction><span className={`s3-stock-validation is-${receiverState}`}>{receiverState === "eligible" ? "Eligible Fan receiver" : receiverState === "ineligible" ? "Ineligible Fan receiver" : "Receiver verification required"}</span><PrimaryAction disabled={!selected.length || receiverState !== "eligible"} onClick={() => setReview(true)}>Review group transfer</PrimaryAction></section>}<section className="s3-stock-grid" aria-label="Owned Stock NFTs">{stocks.map((stock) => <StockCard key={stock.tokenId} stock={stock} selecting={selecting} selected={selected.includes(stock.tokenId)} onSelect={() => toggle(stock.tokenId)} detailPath={`/stock/my-stock?tokenId=${encodeURIComponent(stock.tokenId)}`}/>)}</section><TransactionReviewModal open={review} onClose={() => setReview(false)} onConfirm={() => actions.transferStocks({ tokenIds:selected, to:receiver })} action={`Transfer ${selected.length} Stock NFTs`} amount={selected.length * STOCK_TRANSFER_FEE_ETER} token="ETER" to={receiver} expectedResult={`${selected.length} Stock NFTs transferred to a verified Fan`} riskWarning="Transfers are irreversible. Sender pays 19 ETER per Stock."/></Frame>;
}

function StockDetail({ stock }: { stock: StockPosition }) {
  const location = useLocation(), query = useMemo(() => new URLSearchParams(location.search), [location.search]), capture = query.get("capture") ?? "";
  const actions = stockRuntime().actions;
  const [payment, setPayment] = useState(Math.min(STOCK_MINIMUM_INITIAL_ETER, stock.remainingETER));
  const [fundingAction, setFundingAction] = useState<"add" | "complete">(capture === "complete-review" ? "complete" : "add"), [fundingReview, setFundingReview] = useState(capture === "complete-review");
  const [receiver, setReceiver] = useState(capture === "transfer" ? "0xbad1234" : ""), [receiverState, setReceiverState] = useState<RecipientState>(capture === "transfer" ? "ineligible" : "idle"), [transferReview, setTransferReview] = useState(false), [metadata, setMetadata] = useState("Ready");
  const due = fundingAction === "complete" ? stock.remainingETER : payment;
  const verify = async () => { setReceiverState("checking"); const result = await actions.verifyFanMember(receiver); setReceiverState(result.isFan ? "eligible" : "ineligible"); };
  return <Frame view="detail" title={`Stock ${normalizeTokenId(stock.tokenId)}`}><section className="s3-stock-detail glass-featured"><StockNftArt multiplier={stock.multiplier} eager/><div><span className="s3-product__eyebrow">Owned NFT identity</span><h2>{normalizeTokenId(stock.tokenId)} · {stock.multiplier}X</h2><p>Phase {stock.phase} · {stock.origin} · issued {new Date(stock.issuedAt).toLocaleDateString()}</p><dl className="s3-stock-facts"><div><dt>Paid</dt><dd>{stock.paidETER} ETER</dd></div><div><dt>Remaining</dt><dd>{stock.remainingETER} ETER</dd></div><div><dt>Funding</dt><dd>{stock.fundingState}</dd></div><div><dt>Income</dt><dd>{stock.incomeEligibility}</dd></div></dl></div></section><section className="s3-stock-support"><article className="s3-stock-panel s3-stock-form"><span className="s3-product__eyebrow">Funding</span><h3>Add Payment / Complete Stock</h3><div className="s3-stock-choice"><button type="button" aria-pressed={fundingAction === "add"} onClick={() => setFundingAction("add")}>Add Payment</button><button type="button" aria-pressed={fundingAction === "complete"} onClick={() => setFundingAction("complete")}>Complete Stock</button></div>{fundingAction === "add" && <FieldCarrier id="stock-add-payment" label={`Payment · ${payment} ETER`} description={`Remaining position balance: ${stock.remainingETER} ETER`}><FieldInput type="range" min={1} max={Math.max(1, stock.remainingETER)} value={payment} onChange={(event) => setPayment(Number(event.target.value))}/></FieldCarrier>}<strong>{due} ETER</strong><PrimaryAction disabled={stock.remainingETER === 0} onClick={() => setFundingReview(true)}>Review {fundingAction === "complete" ? "completion" : "payment"}</PrimaryAction></article><article className="s3-stock-panel s3-stock-form"><span className="s3-product__eyebrow">Transfer</span><h3>Verified Fan receiver</h3><FieldCarrier id="stock-transfer" label="Receiver wallet" required description={`Sender fee: ${STOCK_TRANSFER_FEE_ETER} ETER`}><FieldInput value={receiver} onChange={(event) => { setReceiver(event.target.value); setReceiverState("idle"); }} placeholder="0x..."/></FieldCarrier><SecondaryAction disabled={!receiver} onClick={verify}>Verify Fan</SecondaryAction><span className={`s3-stock-validation is-${receiverState}`} role="status">{receiverState === "eligible" ? "Eligible Fan receiver" : receiverState === "ineligible" ? "Ineligible · transfer blocked" : "Verification required"}</span><PrimaryAction disabled={receiverState !== "eligible"} onClick={() => setTransferReview(true)}>Review transfer</PrimaryAction></article><article className="s3-stock-panel"><span className="s3-product__eyebrow">Metadata</span><h3>{stockNftVisualMap[stock.multiplier].label}</h3><p>Image and multiplier are source-bound. Token ID is assigned by purchase time.</p><SecondaryAction onClick={() => { setMetadata("Update queued"); window.setTimeout(() => setMetadata("Ready"), 2200); }}>Metadata · {metadata}</SecondaryAction></article></section><TransactionReviewModal open={fundingReview} onClose={() => setFundingReview(false)} onConfirm={() => actions.completeStock({ tokenId:stock.tokenId, amountETER:due })} action={fundingAction === "complete" ? `Complete Stock ${normalizeTokenId(stock.tokenId)}` : `Add Stock payment ${normalizeTokenId(stock.tokenId)}`} amount={due} token="ETER" additionalReviewFields={[{ id:"funding", label:"Current funding", value:`${stock.paidETER} / ${STOCK_FULL_PRICE_ETER} ETER` }, { id:"result", label:"Result", value:fundingAction === "complete" ? "Fully paid after source confirmation" : "Partial funding update" }]} expectedResult={fundingAction === "complete" ? "Stock funding submitted for full completion" : "Stock funding balance updated"} riskWarning="Transaction confirmation is not Stock Complete Achievement verification."/><TransactionReviewModal open={transferReview} onClose={() => setTransferReview(false)} onConfirm={() => actions.transferStocks({ tokenIds:[stock.tokenId], to:receiver })} action={`Transfer Stock ${normalizeTokenId(stock.tokenId)}`} amount={STOCK_TRANSFER_FEE_ETER} token="ETER" to={receiver} expectedResult="One Stock NFT transferred to the verified Fan receiver" riskWarning="Transfer is irreversible. The sender pays 19 ETER."/></Frame>;
}

function StockNotFound({ requestedToken }: { requestedToken?: string | null }) {
  return <Frame view="detail" title="Stock unavailable"><ErrorState title="Stock not found" detail={requestedToken ? `No provider-owned Stock matches ${requestedToken}. Check the Token ID and try again.` : "No provider-owned Stock is available for this route."}/></Frame>;
}

function Prize() {
  return <Frame view="prize" title="STOCK Prize"><section className="s3-stock-panel glass-featured"><span className="s3-product__eyebrow">Independent Product Prize</span><h2>STOCK Prize</h2><p>STOCK Prize is owned by its Product provider. It is not Dividend and it is not Income.</p><div className="s3-stock-support"><article className="s3-stock-panel"><Trophy/><strong>Prize</strong><small>Eligibility, rule identity, amount, token and claim window require provider data.</small></article><article className="s3-stock-panel"><BarChart3/><strong>Dividend</strong><small>Separate Stock distribution mechanism.</small></article><article className="s3-stock-panel"><Activity/><strong>Income</strong><small>Separate biannual CHECK / WITHDRAW mechanism.</small></article></div><EmptyState title="STOCK Prize data unavailable" detail="The current Product provider does not supply a source-backed STOCK Prize rule or entitlement. No financial value is inferred."/><PrimaryAction disabled>Prize action unavailable from provider</PrimaryAction></section></Frame>;
}

function Dividend() {
  return <Frame view="dividend" title="STOCK Dividend"><section className="s3-stock-panel glass-featured"><span className="s3-product__eyebrow">Independent Stock distribution</span><h2>STOCK Dividend</h2><p>Dividend remains separate from Product Prize and from the biannual Income CHECK / WITHDRAW flow.</p><EmptyState title="Dividend data unavailable" detail="The current Product provider supplies no authoritative Dividend rule, entitlement, amount, payout token or claim action."/><PrimaryAction disabled>Dividend action unavailable from provider</PrimaryAction></section></Frame>;
}

function Income() {
  const { context, stocks, actions } = stockRuntime();
  const income = context.income;
  const windowState = income?.window ?? "closed";
  const initialEntitlement = windowState === "withdraw" ? income?.withdrawableEntitlement ?? income?.checkedEntitlement : windowState === "check" ? income?.checkedEntitlement : undefined;
  const [entitlement, setEntitlement] = useState(initialEntitlement), [review, setReview] = useState(false);
  const fullyPaid = stocks.filter((stock) => stock.incomeEligibility === "Eligible");
  const checkIncome = async () => { const result = await actions.checkStockIncome(); setEntitlement(result.entitlement); };
  const entitlementAvailable = isStockIncomeEntitlement(entitlement);
  return <Frame view="income" title="Biannual Income Center"><section className="s3-stock-panel glass-featured"><header className="s3-stock-section-head"><div><span className="s3-product__eyebrow">Provider-owned window</span><h2>{windowState === "check" ? "Check Profit" : windowState === "withdraw" ? "Withdraw" : "Income window closed"}</h2></div><SourceDisclosure value={providerSource()} compact/></header><div className="s3-stock-window"><span className={windowState === "check" ? "is-active" : ""}><strong>{STOCK_INCOME_CHECK_DAYS} days</strong><small>Check Profit</small></span><span className={windowState === "withdraw" ? "is-active" : ""}><strong>{STOCK_INCOME_WITHDRAW_DAYS} days</strong><small>Withdraw</small></span></div><dl className="s3-stock-facts"><div><dt>Eligible Stocks</dt><dd>{fullyPaid.length}</dd></div><div><dt>Checked entitlement</dt><dd>{formatStockIncomeEntitlement(entitlement)}</dd></div><div><dt>Cycle</dt><dd>Biannual</dd></div><div><dt>Fully paid only</dt><dd>Required</dd></div></dl>{windowState === "check" ? <PrimaryAction disabled={!income || fullyPaid.length === 0} onClick={checkIncome}>Check provider entitlement</PrimaryAction> : windowState === "withdraw" ? <PrimaryAction disabled={!entitlementAvailable || fullyPaid.length === 0} onClick={() => setReview(true)}>Review withdrawal</PrimaryAction> : <PrimaryAction disabled>Unavailable outside income window</PrimaryAction>}<p className="s3-product__muted">The authority describes Token-ID/multiplier factors but supplies no exact weighting formula. Amount and payout token both remain provider-owned.</p></section><TransactionReviewModal open={review && entitlementAvailable} onClose={() => setReview(false)} onConfirm={() => actions.withdrawStockIncome(entitlementAvailable ? { expectedAmount:entitlement.amount, expectedToken:entitlement.token } : undefined)} action="Withdraw biannual Stock income" amount={entitlement?.amount} token={entitlement?.token ?? "Unavailable"} expectedResult="Provider-returned Stock income sent to the connected wallet" riskWarning="Only the source-backed checked entitlement and payout token are submitted."/></Frame>;
}

function Referrals() {
  const { context, stocks } = stockRuntime(), awarded = stocks.find((stock) => stock.origin === "Referral Award");
  const directPurchases = context.directReferralStockPurchases;
  const cycles = referralCycles(directPurchases), progress = directPurchases % STOCK_REFERRAL_CYCLE;
  const history = context.referralAwardHistory?.filter((entry) => entry.cycle <= cycles);
  const awardedCount = Math.min(context.referralAwardedStocks, cycles);
  // Phase08.3 rendered history.map((award); Phase08.4 now also exposes completed cycles missing from partial history.
  return <Frame view="referrals" title="STOCK Referrals"><section className="s3-stock-panel glass-featured"><span className="s3-product__eyebrow">Unlimited 19-Stock cycles</span><h2>{directPurchases} direct purchases</h2><dl className="s3-stock-facts"><div><dt>Completed cycles</dt><dd>{cycles}</dd></div><div><dt>Awarded Stocks</dt><dd>{awardedCount}</dd></div><div><dt>Current progress</dt><dd>{progress} / {STOCK_REFERRAL_CYCLE}</dd></div><div><dt>Award funding</dt><dd>Unpaid Stock</dd></div></dl><div className="s3-product__progress"><span style={{ width:`${(progress / STOCK_REFERRAL_CYCLE) * 100}%` }}/></div></section>{awarded && <section className="s3-stock-referral-award"><StockNftArt multiplier={awarded.multiplier} eager/><div><span className="s3-product__eyebrow">Referral Award · real NFT position</span><h2>{normalizeTokenId(awarded.tokenId)} · {awarded.multiplier}X</h2><p>{awarded.fundingState} · Phase {awarded.phase} · {awarded.incomeEligibility}</p><small>Multiplier and artwork come from the provider-owned award identity.</small></div></section>}<section className="s3-stock-panel"><h3>Cycle history</h3>{history === undefined ? <EmptyState title="Referral history unavailable" detail={`${cycles} completed cycle${cycles === 1 ? "" : "s"}; award history is unavailable from the current source.`}/> : cycles === 0 ? <EmptyState title="No referral awards yet" detail="No completed referral cycles are available."/> : <div className="s3-stock-ledger">{Array.from({ length:cycles }, (_, index) => index + 1).map((cycle) => { const award = history.find((entry) => entry.cycle === cycle); return <article key={cycle}><strong>Cycle {cycle} completed</strong><span>{cycle * STOCK_REFERRAL_CYCLE} direct referred purchases</span><small>{award?.tokenId && award.multiplier ? `${normalizeTokenId(award.tokenId)} · ${award.multiplier}X` : "Award identity unavailable"}</small></article>; })}</div>}</section></Frame>;
}

function ActivityView() {
  const providerEvents = stockRuntime().context.stockActivity;
  const events = providerEvents;
  return <Frame view="activity" title="STOCK Activity"><section className="s3-stock-panel"><span className="s3-product__eyebrow">Stock-native events</span><h2>Product activity</h2>{events === undefined ? <EmptyState title="Activity unavailable from current source" detail="The configured Product provider did not supply a Stock activity ledger."/> : events.length === 0 ? <EmptyState title="No Stock activity yet" detail="Provider-owned Stock events will appear here when available."/> : <div className="s3-stock-ledger">{events.map((event) => <article key={event.id}><strong>{event.type}</strong><span>{event.detail}</span><small>{event.status}</small></article>)}</div>}<SourceDisclosure value={providerSource()}/></section></Frame>;
}

function AvailableStockPresentation({ view }: { view:"buy" | "mine" | "status" | "dividends" | "sales" }) {
  const location = useLocation(), query = new URLSearchParams(location.search), requestedToken = query.get("tokenId"), stocks = productPresentationProvider.data.stocks;
  const selected = requestedToken ? stocks.find((stock) => stock.tokenId === requestedToken) : stocks[0];
  let content: ReactNode;
  if (location.pathname === "/stock") content = <Overview/>;
  else if (view === "buy") content = <Buy/>;
  else if (view === "mine") content = requestedToken ? (selected ? <StockDetail stock={selected}/> : <StockNotFound requestedToken={requestedToken}/>) : <MyStocks/>;
  else if (view === "status") content = selected ? <StockDetail stock={selected}/> : <StockNotFound requestedToken={requestedToken}/>;
  else if (location.pathname === "/stock/prize") content = <Prize/>;
  else if (location.pathname === "/stock/dividends") content = <Dividend/>;
  else if (location.pathname === "/stock/income") content = <Income/>;
  else if (location.pathname === "/stock/referrals" || query.get("view") === "referrals") content = <Referrals/>;
  else content = <ActivityView/>;
  return <>{content}</>;
}

export function SpecialStockPresentation({ view }: { view:"buy" | "mine" | "status" | "dividends" | "sales" }) {
  if (!productPresentationProvider.available) return <ProductProviderGate title="STOCK / EES">{null}</ProductProviderGate>;
  if (!productPresentationProvider.data.stockProtocolContext) return <ProductProviderGate title="STOCK / EES"><AppShell title="STOCK / EES" showBack><ErrorState title="STOCK integration unavailable" detail="The configured Product provider did not supply a STOCK protocol context."/></AppShell></ProductProviderGate>;
  return <ProductProviderGate title="STOCK / EES"><AvailableStockPresentation view={view}/></ProductProviderGate>;
}

export function SpecialStockPage() {
  const { pathname } = useLocation();
  const view = pathname === "/stock/buy" || pathname === "/stock" ? "buy"
    : pathname === "/stock/my-stock" ? "mine"
    : pathname === "/stock/status" || pathname === "/stock/transfer" || pathname === "/stock/metadata" ? "status"
    : pathname === "/stock/prize" || pathname === "/stock/dividends" || pathname === "/stock/income" ? "dividends"
    : "sales";
  return <SpecialStockPresentation view={view}/>;
}
