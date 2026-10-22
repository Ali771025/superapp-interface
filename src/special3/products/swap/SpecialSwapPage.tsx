import { ArrowRight, ArrowUpDown, CheckCircle2, Clock3, RefreshCw, ShieldCheck } from '@icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppShell } from '../../../components/layout/AppShell';
import { TransactionReviewModal } from '../../../components/modals/TransactionReviewModal';
import { TokenMark } from '../../../components/ui/TokenMark';
import { productActions, productData } from '../../providers/products';
import { ProductProviderGate } from '../../providers/products/ProductProviderGate';
const { tokenRates, user } = productData;
const swapAdapter = productActions.swap;
import type { PaymentToken } from '../../../lib/types';
import { readEcosystemPaymentRegistry } from '../../../modules/payments/ecosystemPaymentRegistry';
import { Badge, Heading, Inline, Stack, Surface, Text } from '../../primitives';
import { ActionFormTemplate, Field, FieldDescription, FieldError, FieldHint, FieldInput, FieldLabel, FieldSelect, PrimaryAction, QoraTransactionDisclosure, SecondaryAction, SourceDisclosure } from '../../interaction';

const TOKENS = [...readEcosystemPaymentRegistry().enabledPaymentAssets];
const QUOTE_TTL_MS = 30_000;
type Quote = Omit<Awaited<ReturnType<typeof swapAdapter.getQuote>>, 'fee'> & { fee: number; requestId: number; quotedAt: number; expiresAt: number };
type Receipt = { txHash: string; toAmount: number };

const decimal = (value: string) => value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
const amountNumber = (value: string) => Number(value || 0);
const format = (value: number) => value.toFixed(6).replace(/\.?0+$/, '');

export function SpecialSwapPage() {
  return <ProductProviderGate title="Swap"><SpecialSwapWorkspace/></ProductProviderGate>;
}

export function SpecialSwapWorkspace({ embedded = false }: { embedded?: boolean } = {}) {
  const balances: Record<PaymentToken, number> = { USDT:user.usdtBalance, ETER:user.eterBalance, ET:user.etBalance, Q:user.qBalance };
  const navigate = useNavigate();
  const [fromToken, setFromToken] = useState<PaymentToken>('USDT');
  const [toToken, setToToken] = useState<PaymentToken>('ETER');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteState, setQuoteState] = useState<'idle'|'loading'|'fresh'|'stale'|'error'>('idle');
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [review, setReview] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [now, setNow] = useState(Date.now());
  const version = useRef(0);
  const parsed = amountNumber(amount);
  const balance = balances[fromToken];
  const insufficient = parsed > balance;
  const sameToken = fromToken === toToken;
  const stale = Boolean(quote && now >= quote.expiresAt);
  const ready = parsed > 0 && !insufficient && !sameToken && quoteState === 'fresh' && Boolean(quote) && !stale;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const requestId = ++version.current;
    setQuote(null);
    setQuoteError(null);
    if (!Number.isFinite(parsed) || parsed <= 0 || sameToken) { setQuoteState('idle'); return; }
    setQuoteState('loading');
    swapAdapter.getQuote(fromToken, toToken, parsed).then((result) => {
      if (requestId !== version.current) return;
      const quotedAt = Date.now();
      setNow(quotedAt);
      setQuote({ ...result, fee:result.fee ?? 0, requestId, quotedAt, expiresAt:quotedAt + QUOTE_TTL_MS });
      setQuoteState('fresh');
    }).catch((reason) => {
      if (requestId !== version.current) return;
      setQuoteState('error');
      setQuoteError(reason instanceof Error ? reason.message : 'Quote unavailable');
    });
  }, [fromToken, parsed, sameToken, toToken]);

  useEffect(() => { if (stale && quoteState === 'fresh') setQuoteState('stale'); }, [quoteState, stale]);

  const feeUsd = useMemo(() => quote ? quote.fee * (tokenRates[fromToken] || 1) : 0, [fromToken, quote]);
  const flip = () => { const output = quote ? format(quote.toAmount) : ''; setFromToken(toToken); setToToken(fromToken); setAmount(output); setReceipt(null); };
  const refresh = () => { const current = amount; setAmount(''); window.setTimeout(() => setAmount(current), 0); };
  const execute = async () => {
    if (!ready || !quote) throw new Error('A fresh quote is required.');
    const result = await swapAdapter.swap(fromToken, toToken, parsed);
    setReceipt(result);
    return result;
  };

  if (receipt) {
    const result = <section data-special3 className="s3-product s3-product--swap mx-auto w-full max-w-3xl"><Surface className="p-6"><Stack gap={4} align="center"><CheckCircle2 className="text-success-DEFAULT" size={36}/><Text variant="caption" tone="muted">Preview · Mock Product result</Text><Heading level={1}>Swap adapter completed</Heading><Text variant="numeric-xl">{format(receipt.toAmount)} {toToken}</Text><Text variant="mono" tone="muted">{receipt.txHash}</Text><Surface className="w-full p-4"><Inline><Clock3/><div><Heading level={3}>Progression remains pending</Heading><Text tone="secondary">Swap has no locked Achievement/EQ rule. Transaction confirmation never grants generic EQ or completes Journey.</Text></div></Inline></Surface><Inline><SecondaryAction onClick={() => setReceipt(null)}>Start another</SecondaryAction><PrimaryAction onClick={() => navigate('/transactions')}>View history <ArrowRight/></PrimaryAction></Inline></Stack></Surface></section>;
    return embedded ? result : <AppShell title="Swap result" showBack>{result}</AppShell>;
  }

  const form = <ActionFormTemplate
    className="s3-swap"
    eyebrow="Swap · Protected wallet action"
    title="Swap"
    titleOwner="shell"
    intro="Convert enabled ecosystem assets using one versioned, time-bounded quote."
    status={<SourceDisclosure compact value={{ source:'mock', freshness:quoteState === 'fresh' && !stale ? 'fresh' : quoteState === 'stale' ? 'stale' : 'unavailable', label:'Preview · Mock quote', detail:'Shared ecosystem token registry and existing Swap adapter.' }}/>} 
    qoraMode={embedded ? undefined : "compact"}
    qora={embedded ? undefined : <QoraTransactionDisclosure mode="form"/>}
    actions={<PrimaryAction disabled={!ready} onClick={() => setReview(true)}>{quoteState === 'loading' ? 'Resolving quote…' : stale ? 'Refresh expired quote' : insufficient ? `Insufficient ${fromToken}` : 'Review Swap'}</PrimaryAction>}
  >
    <Stack gap={4}>
      <Surface className="p-4"><Field id="s3-swap-from" state={insufficient || sameToken || Boolean(quoteError) ? 'invalid' : 'default'}>
        <Inline className="justify-between"><FieldLabel htmlFor="s3-swap-from" required>From amount</FieldLabel><Text variant="caption" tone="muted">Balance {balance} {fromToken}</Text></Inline>
        <FieldDescription id="s3-swap-from-description">Select the payment asset and enter the existing Product amount.</FieldDescription>
        <Inline className="items-stretch"><FieldSelect aria-label="From token" className="field-control min-h-12 w-36 px-3" value={fromToken} onChange={(event) => { setFromToken(event.target.value as PaymentToken); setReceipt(null); }}>{TOKENS.map((token) => <option key={token}>{token}</option>)}</FieldSelect><FieldInput id="s3-swap-from" inputMode="decimal" className="field-control min-h-12 flex-1 px-3 text-xl font-bold" value={amount} onChange={(event) => { setAmount(decimal(event.target.value)); setReceipt(null); }} aria-invalid={insufficient || sameToken} aria-describedby="s3-swap-validation" placeholder="0.00"/><button type="button" className="min-h-11 px-3 font-semibold text-primary-500" onClick={() => setAmount(String(balance))}>MAX</button></Inline>
        {insufficient || sameToken || quoteError ? <FieldError id="s3-swap-validation">{sameToken ? 'From and To assets must be different.' : insufficient ? 'Amount exceeds the available balance.' : quoteError}</FieldError> : <FieldHint id="s3-swap-validation">No gas reserve is subtracted unless the Product source explicitly supplies one.</FieldHint>}
      </Field></Surface>

      <button type="button" onClick={flip} className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[var(--s3-border)]" aria-label="Flip From and To tokens"><ArrowUpDown/></button>

      <Surface className="p-4"><Field id="s3-swap-to"><Inline className="justify-between"><FieldLabel htmlFor="s3-swap-to">To asset</FieldLabel><Text variant="caption" tone="muted">Balance {balances[toToken]} {toToken}</Text></Inline><FieldDescription id="s3-swap-to-description">Destination asset for the current quote.</FieldDescription><Inline className="items-center"><FieldSelect id="s3-swap-to" aria-describedby="s3-swap-to-description" className="field-control min-h-12 w-36 px-3" value={toToken} onChange={(event) => { setToToken(event.target.value as PaymentToken); setReceipt(null); }}>{TOKENS.map((token) => <option key={token}>{token}</option>)}</FieldSelect><div className="flex-1 text-right"><Inline className="justify-end"><TokenMark token={toToken} size={24}/><Text variant="numeric-xl">{quote ? format(quote.toAmount) : '—'}</Text></Inline></div></Inline></Field></Surface>

      <Surface className="p-4" data-quote-request-id={quote?.requestId ?? 'none'} data-quote-state={stale ? 'stale' : quoteState}><Stack gap={2}><Inline className="justify-between"><Heading level={3}>Quote details</Heading><Badge tone={quoteState === 'fresh' && !stale ? 'success' : quoteState === 'loading' ? 'info' : 'warning'}>{stale ? 'Expired' : quoteState}</Badge></Inline>{quote ? <dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-[var(--s3-text-muted)]">Rate</dt><dd>1 {fromToken} = {quote.rate.toFixed(6)} {toToken}</dd></div><div><dt className="text-[var(--s3-text-muted)]">Protocol fee</dt><dd>{format(quote.fee)} {fromToken} · ${feeUsd.toFixed(2)}</dd></div><div><dt className="text-[var(--s3-text-muted)]">Price impact</dt><dd>{quote.priceImpact}%</dd></div><div><dt className="text-[var(--s3-text-muted)]">Freshness</dt><dd>{stale ? 'Expired — refresh required' : `${Math.max(0, Math.ceil((quote.expiresAt - now) / 1_000))}s remaining`}</dd></div></dl> : <Text tone="secondary">{quoteState === 'loading' ? 'Resolving the latest request…' : 'Enter an amount to request a quote.'}</Text>}{stale && <button type="button" className="min-h-11 self-start px-3 text-primary-500" onClick={refresh}><RefreshCw/> Refresh quote</button>}</Stack></Surface>
      <Surface className="p-4"><Inline><ShieldCheck/><Text tone="secondary">Older asynchronous quote results cannot overwrite the current request. Stale or expired quotes cannot open Review.</Text></Inline></Surface>
    </Stack>

    <TransactionReviewModal
      open={review}
      onClose={() => setReview(false)}
      onConfirm={execute}
      action={`Swap ${fromToken} to ${toToken}`}
      amount={parsed}
      token={fromToken}
      estimatedReceive={quote ? `${format(quote.toAmount)} ${toToken}` : undefined}
      expectedResult={quote ? `${format(quote.toAmount)} ${toToken} from quote #${quote.requestId}` : 'Fresh quote required'}
      approvalRequired={fromToken === 'USDT' || fromToken === 'Q'}
      gasEstimateUnavailable
      additionalReviewFields={quote ? [
        { id:'quote-id', label:'Quote identity', value:`#${quote.requestId}` },
        { id:'quote-rate', label:'Quote rate', value:`1 ${fromToken} = ${quote.rate.toFixed(6)} ${toToken}` },
        { id:'protocol-fee', label:'Protocol fee', value:`${format(quote.fee)} ${fromToken}` },
        { id:'price-impact', label:'Price impact', value:`${quote.priceImpact}%` },
        { id:'quote-freshness', label:'Quote freshness', value:stale ? 'Expired' : 'Fresh' },
      ] : []}
    />
  </ActionFormTemplate>;
  return embedded ? form : <AppShell title="Swap" showBack>{form}</AppShell>;
}
