import { lazy, Suspense, useRef, useState } from 'react';
import { Activity, Check, Clock, FileClock, Gift, Plus, Sparkles, Target, Trash2, UserRoundCheck } from '@icons';
import { AppShell } from '../../components/layout/AppShell';
import { PaymentTokenSelector } from '../../components/forms/PaymentTokenSelector';
import { useTheme } from '../../lib/theme-context';
import { cn, formatNumber, timeUntil } from '../../lib/utils';
import { mockCurrentForecast, mockForecastEntries, mockTokenRates, mockUser } from '../../data/mockAssets';
import type { PaymentToken } from '../../lib/types';
import { SectionTabs } from '../../components/ui/SectionTabs';
import { useLocation } from 'react-router-dom';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';

const SpecialForecastPresentation=lazy(async()=>{const module=await import('../../special3/products/forecast/SpecialForecastPages');return {default:module.SpecialForecastPresentation}});

type Mode = 'standard' | 'special' | 'free' | 'gift';
type Prediction = [string, string, string, string, string];
const emptyPrediction = (): Prediction => ['', '', '', '', ''];
const sample: Prediction = ['07', '14', '22', '05', '03'];

function CircleSet({ values, mode = 'standard', editable = false, onChange, label, matchMask }: { values: Prediction; mode?: Mode; editable?: boolean; onChange?: (next: Prediction) => void; label?: string; matchMask?: boolean[] }) {
  const fields = useRef<Array<HTMLInputElement | null>>([]);
  const isLocked = (index: number) => mode === 'special' && (index === 0 || index === 4);
  const focusSibling = (index: number, direction: 1 | -1) => {
    let next = index + direction;
    while (next >= 0 && next < values.length && isLocked(next)) next += direction;
    fields.current[next]?.focus();
  };
  const update = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 2);
    const next = [...values] as Prediction;
    next[index] = clean && Number(clean) > 99 ? '99' : clean;
    onChange?.(next);
    if (clean.length === 2) requestAnimationFrame(() => focusSibling(index, 1));
  };
  return <fieldset className="w-full"><legend className="sr-only">{label ?? 'Forecast prediction'}</legend><div className="forecast-signal-row flex w-full items-center justify-center gap-1.5 sm:gap-3">{values.map((value,index) => {
    const checked = isLocked(index);
    const color = index < 3 ? 'is-white' : index === 3 ? 'is-yellow' : 'is-blue';
    const state = matchMask ? (matchMask[index] ? 'correct' : 'incorrect') : undefined;
    return <div key={index} data-state={state} className={cn('forecast-signal-circle aspect-square min-w-0 flex-1 max-w-16 rounded-full border-2 grid place-items-center shadow-sm transition-transform duration-200 focus-within:scale-105', color, state === 'correct' && 'is-correct', state === 'incorrect' && 'is-dimmed')}>{checked ? <Check size={21} strokeWidth={3} /> : editable ? <input ref={(node) => { fields.current[index] = node; }} aria-label={`Forecast field ${index + 1}`} inputMode="numeric" value={value} onChange={(event) => update(index,event.target.value)} onKeyDown={(event) => { if (event.key === 'Backspace' && !value) focusSibling(index, -1); }} onBlur={(event) => update(index, event.target.value ? String(Math.max(0, Number(event.target.value))).padStart(2,'0') : '')} placeholder="00" className="w-full h-full rounded-full bg-transparent text-center text-base font-black outline-none placeholder:text-current/40" /> : <span className="text-sm font-black tabular-nums">{value || '--'}</span>}</div>;
  })}</div></fieldset>;
}

function PreviousForecastHistory() {
  const rows = [
    { white: 3, gold: true, blue: true, amount: '1599.091842' }, { white: 2, gold: true, blue: false, amount: '0.028738' },
    { white: 1, gold: true, blue: false, amount: '0.024633' }, { white: 3, gold: false, blue: true, amount: '0.020527' },
    { white: 2, gold: true, blue: false, amount: '0.016422' }, { white: 1, gold: true, blue: false, amount: '0.014369', or: true },
    { white: 2, gold: false, blue: true, amount: '0.010263' },
  ];
  return <section className="surface overflow-hidden" aria-label="Previous Forecast Treasury"><header className="bg-[var(--panel-elevated)] p-5"><h3 className="font-display text-xl font-bold">Previous Forecast Treasury</h3></header><div className="grid grid-cols-[1fr_auto] bg-[var(--panel-elevated)] px-4 py-3 text-xs font-bold sm:text-sm"><span className="text-center">Treasury</span><span>Amount (ETER)</span></div><div>{rows.map((row, index) => <article key={row.amount} className={cn('grid min-h-16 grid-cols-[1fr_auto] items-center gap-3 px-4 py-3', index % 2 === 0 ? 'bg-[var(--panel-secondary)]' : 'bg-[var(--surface-recessed)]')}><div className="flex min-w-0 items-center justify-center gap-1.5">{Array.from({ length: row.white }).map((_, dot) => <span key={dot} className="h-5 w-5 rounded-full border border-light-border bg-white shadow-sm sm:h-7 sm:w-7" />)}{row.gold && <><span className="text-xs font-bold">{row.or ? 'OR' : '+'}</span><span className="forecast-treasury-dot is-yellow h-5 w-5 rounded-full shadow-sm sm:h-7 sm:w-7" /></>}{row.blue && <><span className="text-xs font-bold">+</span><span className="forecast-treasury-dot is-blue h-5 w-5 rounded-full shadow-sm sm:h-7 sm:w-7" /></>}</div><strong className="font-mono text-xs tabular-nums sm:text-base">{row.amount}</strong></article>)}</div><div className="grid grid-cols-[1fr_auto] items-center bg-[var(--panel-secondary)] px-4 py-3"><span className="text-sm">Non-winners</span><strong className="font-mono tabular-nums">0.016422</strong></div><footer className="grid grid-cols-[1fr_auto] items-center bg-[var(--panel-elevated)] px-4 py-4"><strong className="text-center">Total</strong><strong className="font-mono text-sm tabular-nums sm:text-lg">1599.223215</strong></footer></section>;
}

function CountdownWindow() {
  return <div className="safety-surface p-4"><div className="flex items-center gap-2 text-warning-DEFAULT"><Clock size={16} /><p className="text-sm font-bold">Weekly reward window</p></div><div className="grid grid-cols-2 gap-2 mt-3"><div className="data-surface p-3"><p className="text-xs text-[var(--muted)]">CHECK · first 3 days</p><p className="font-bold tabular-nums mt-1">02d 08h 14m</p></div><div className="data-surface p-3"><p className="text-xs text-[var(--muted)]">WITHDRAW · final 4 days</p><p className="font-bold tabular-nums mt-1">04d 00h 00m</p></div></div></div>;
}

function LegacyForecastPage() {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const f = mockCurrentForecast;
  const initialView = pathname.endsWith('/claim') || pathname.endsWith('/savior') ? 'contributor' : pathname.endsWith('/tickets') || pathname.endsWith('/results') ? 'status' : 'prediction';
  const initialStatus = pathname.endsWith('/results') ? 'history' : 'current';
  const [view, setView] = useState<'prediction' | 'status' | 'contributor'>(initialView);
  const [statusTopic, setStatusTopic] = useState<'current' | 'history' | 'treasury'>(initialStatus);
  const [mode, setMode] = useState<Mode>('standard');
  const [predictions, setPredictions] = useState<Prediction[]>([emptyPrediction()]);
  const [paymentToken, setPaymentToken] = useState<PaymentToken>('ETER');
  const complete = (row: Prediction) => mode === 'special' ? [1,2,3].every((index) => row[index]) : row.every(Boolean);
  const ready = predictions.filter(complete).length;
  const entryUSD = mode === 'free' || mode === 'gift' ? 0 : mode === 'special' ? 7 : f.entryFee * (mockTokenRates.ETER || 1.35);
  const totalUSD = ready * entryUSD;
  const update = (index: number, next: Prediction) => setPredictions((rows) => rows.map((row,i) => i === index ? next : row));
  const [balanceWhole, balanceDecimal] = mockUser.eterBalance.toFixed(2).split('.');

  return <AppShell title="Forecast" showBack><div className="product-workspace-vnext forecast-workspace-vnext space-y-4 pb-6">
    <SectionTabs label="Forecast views" items={[{ key: 'prediction', label: 'Prediction', icon: Target }, { key: 'status', label: 'Status', icon: Activity }, { key: 'contributor', label: 'Contributor', icon: UserRoundCheck }]} active={view} onChange={setView} />
    <section className="brand-surface overflow-hidden"><div className="h-1.5 bg-gradient-to-r from-warning-DEFAULT via-primary-500 to-warning-DEFAULT" /><div className="p-5"><div className="flex items-start justify-between"><div><p className="data-label">ETERNITY Forecast</p><h1 className="text-xl font-bold mt-1">Week #{f.weekNumber}</h1></div><span className="status-pill text-warning-DEFAULT"><Clock size={13} /> {timeUntil(f.closesAt)}</span></div><div className="grid grid-cols-2 gap-3 mt-5"><div className="data-surface p-3"><p className="text-xs text-[var(--muted)]">ETER price</p><p className={cn('text-xl font-black tabular-nums mt-1', isDark ? 'text-white' : 'text-light-textSecondary')}>$1<span className="forecast-decimal text-2xl">.350000</span></p></div><div className="data-surface p-3"><p className="text-xs text-[var(--muted)]">ETER balance</p><p className="text-xl font-black tabular-nums mt-1">{balanceWhole}<span className="forecast-decimal vf-forecast-balance-decimal">.{balanceDecimal}</span> <span className="text-xs">ETER</span></p></div></div><div className="grid grid-cols-3 gap-2 mt-3">{[['Treasury',`${formatNumber(f.poolSize)} ETER`],['Predictions',f.totalTickets.toLocaleString()],['Saviors',String(f.saviorCount)]].map(([label,value]) => <div key={label} className="data-surface p-2.5 text-center"><p className="font-bold text-sm">{value}</p><p className="text-xs text-[var(--muted)]">{label}</p></div>)}</div></div></section>

    {view === 'prediction' && <>
    <section className="surface p-4"><p className="data-label mb-3 text-center">Previous combo · Week #{f.weekNumber - 1}</p><div className="mx-auto max-w-md"><CircleSet values={sample} /></div></section>

    <section className="surface p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Create predictions</p><h2 className="section-title mt-1">Your five-circle forecast</h2></div><button type="button" onClick={() => setPredictions((rows) => [...rows, emptyPrediction()])} className="w-12 h-12 rounded-full bg-primary-500 text-white grid place-items-center focus-ring" aria-label="Add another prediction"><Plus size={20} /></button></div><p className="text-xs text-[var(--muted)] mt-2">Enter values from 01 to 99. Add multiple predictions before reviewing one combined payment.</p>
      <div className="space-y-4 mt-5">{predictions.map((row,index) => <div key={index} className="data-surface p-4 animate-fade-in"><div className="flex justify-between mb-3"><span className="text-xs font-bold">Prediction {index + 1}</span>{predictions.length > 1 && <button onClick={() => setPredictions((rows) => rows.filter((_,i) => i !== index))} aria-label={`Remove prediction ${index + 1}`} className="text-danger-DEFAULT"><Trash2 size={16} /></button>}</div><CircleSet values={row} mode={mode} editable onChange={(next) => update(index,next)} /></div>)}</div>
      <div className="grid grid-cols-2 gap-2 mt-5">{(['standard','special','free','gift'] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={cn('cut-button px-3 capitalize', mode === item && 'cut-button--primary')}>{item}<small className="block ml-1 opacity-70">{item === 'special' ? '$7 fixed' : item === 'standard' ? `${f.entryFee} ETER` : item === 'gift' ? 'Gift entry' : 'No entry fee'}</small></button>)}</div>
      <div className="mt-4 data-surface p-4"><div className="flex justify-between"><span className="text-sm text-[var(--muted)]">{ready} ready prediction{ready === 1 ? '' : 's'}</span><strong className="text-warning-DEFAULT">${totalUSD.toFixed(2)}</strong></div>{ready > 0 && <div className="mt-4"><PaymentTokenSelector selected={paymentToken} onChange={setPaymentToken} usdAmount={totalUSD} balances={{USDT:mockUser.usdtBalance,ETER:mockUser.eterBalance,ET:mockUser.etBalance,Q:mockUser.qBalance}} label="Pay with" /></div>}<button disabled className="cut-button cut-button--primary w-full px-4 mt-4 disabled:opacity-40">Open provider-owned Forecast flow to submit</button><p role="status" className="mt-2 text-xs text-[var(--muted)]">Legacy Forecast is read-only. Obsolete financial execution is blocked.</p></div>
    </section>
    </>}

    {view === 'status' && <section className="space-y-4 animate-fade-in"><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{[['Total earning','125.40 ETER'],['Referral earning','18.25 ETER'],['Contributor','TRUE'],['Total predictions','38']].map(([label,value]) => <div key={label} className="data-surface p-3"><p className="text-xs text-[var(--muted)]">{label}</p><p className="font-bold mt-1">{value}</p></div>)}</div><SectionTabs label="Forecast status details" items={[{ key: 'current', label: 'Current prediction', icon: Sparkles }, { key: 'history', label: 'History', icon: FileClock }, { key: 'treasury', label: 'Previous forecast treasury', icon: Gift }]} active={statusTopic} onChange={setStatusTopic} />{statusTopic === 'current' && <div className="surface p-4"><p className="text-sm font-bold mb-3">Week #{f.weekNumber} · active</p><CircleSet values={['09','23','44','12','06']} /></div>}{statusTopic === 'history' && <div className="space-y-2">{mockForecastEntries.map((entry,index) => { const matches = entry.status === 'won' ? [true, false, true, true, false] : [false, index % 2 === 0, false, false, false]; return <div key={entry.id} className="surface p-4"><div className="flex justify-between mb-3"><p className="font-bold">Week #{entry.weekNumber}</p><strong className={entry.status === 'won' ? 'text-success-DEFAULT' : 'text-[var(--muted)]'}>{entry.status === 'won' ? `+${entry.prizeAmount} ETER` : 'No earning'}</strong></div><CircleSet values={index % 2 ? ['03','18','31','09','02'] : sample} matchMask={matches} label={`Prediction result for week ${entry.weekNumber}`} /></div>; })}</div>}{statusTopic === 'treasury' && <PreviousForecastHistory />}</section>}
    {view === 'contributor' && <section className="space-y-4 animate-fade-in"><div className="brand-surface p-5"><p className="data-label">Forecast contributor</p><p className="text-2xl font-bold text-success-DEFAULT mt-2">Eligible</p><p className="text-xs text-[var(--muted)] mt-2">Eligibility follows FAN access and qualified network participation. Distribution is weekly through CHECK and WITHDRAW.</p></div><div className="grid grid-cols-2 gap-2">{[['Qualified levels','8'],['Contributor points','145'],['Estimated share','32.8 ETER'],['Distribution','Weekly']].map(([label,value]) => <div key={label} className="data-surface p-3"><p className="text-xs text-[var(--muted)]">{label}</p><p className="font-bold mt-1">{value}</p></div>)}</div><CountdownWindow /></section>}

  </div></AppShell>;
}

export function ForecastPage() { return isSpecialProductPresentationEnabled('Forecast')?<Suspense fallback={<AppShell title="Forecast"><div data-special3 role="status">Loading Forecast presentation…</div></AppShell>}><SpecialForecastPresentation/></Suspense>:<LegacyForecastPage/>; }
export function EnterForecastPage() { return <ForecastPage />; }
