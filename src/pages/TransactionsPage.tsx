import { useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { mockTransactionLogs } from '../data/mockLogs';
import { CheckCircle2, XCircle, Clock3, ExternalLink, ChevronDown, Sparkles, Activity, CircleDollarSign } from '@icons';
import { useSearchParams } from 'react-router-dom';
import { isSpecialProductPresentationEnabled } from '../special3/products/presentationRegistry';
import { SpecialGeneratorHistory } from '../special3/products/generator/SpecialGeneratorHistory';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { SpecialTransactionsPage } from '../special3/system/SpecialSystemPages';

const copy = {
  BUY_ETER: { title: 'ETER generated', outcome: 'ETER was added to the connected wallet.', reason: 'Generator request completed.' },
  ENTER_FORECAST: { title: 'Forecast entered', outcome: 'Your prediction is now recorded for this round.', reason: 'Prediction entry completed.' },
  SHIELD_PAYMENT: { title: 'SHIELD payment', outcome: 'The payment was not completed and no ownership changed.', reason: 'The wallet did not have enough USDT.' },
} as const;

type Filter = 'all' | 'success' | 'pending' | 'failed';

export function TransactionsPage() {
  const [searchParams] = useSearchParams();
  if (searchParams.get('product') === 'generator' && isSpecialProductPresentationEnabled('Generator')) return <SpecialGeneratorHistory/>;
  if (isSpecial3ShellEnabled()) return <SpecialTransactionsPage/>;
  return <LegacyTransactionsPage/>;
}

function LegacyTransactionsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const transactions = useMemo(() => mockTransactionLogs.filter((item) => filter === 'all' || item.status === filter), [filter]);
  const completed = mockTransactionLogs.filter((item) => item.status === 'success').length;

  return (
    <AppShell title="Activity" showBack>
      <div className="qf-report-page">
        <section className="qf-report-summary" aria-label="Activity summary">
          <div><Activity size={18}/><span><small>Recent activity</small><strong>{mockTransactionLogs.length} operations</strong></span></div>
          <div><CheckCircle2 size={18}/><span><small>Completed</small><strong>{completed}</strong></span></div>
          <div><CircleDollarSign size={18}/><span><small>Network fees</small><strong>0.0091 ETH</strong></span></div>
          <button onClick={() => window.location.assign('/qora?prompt=Explain my recent transactions')}><Sparkles size={15}/> Explain with QORA</button>
        </section>

        <nav className="qf-report-filter" aria-label="Filter activity">
          {(['all', 'success', 'pending', 'failed'] as Filter[]).map((item) => (
            <button key={item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item === 'all' ? 'All activity' : item}</button>
          ))}
        </nav>

        <section className="qf-report-list" aria-live="polite">
          {transactions.map((tx) => {
            const detail = copy[tx.action as keyof typeof copy] ?? {
              title: tx.action.replace(/_/g, ' ').toLowerCase(),
              outcome: 'The operation has been recorded.',
              reason: `${tx.module} operation`,
            };
            const isOpen = expanded === tx.id;
            return (
              <article key={tx.id} className={`qf-report-row is-${tx.status} ${isOpen ? 'is-open' : ''}`}>
                <button className="qf-report-row-main" onClick={() => setExpanded(isOpen ? null : tx.id)} aria-expanded={isOpen}>
                  <span className="qf-report-status" aria-label={tx.status}>
                    {tx.status === 'success' ? <CheckCircle2 size={18}/> : tx.status === 'failed' ? <XCircle size={18}/> : <Clock3 size={18}/>}
                  </span>
                  <span className="qf-report-copy"><small>{tx.module} · {new Date(tx.createdAt).toLocaleDateString()}</small><strong>{detail.title}</strong><p>{detail.outcome}</p></span>
                  <span className="qf-report-amount"><strong>{tx.amount} {tx.token}</strong><small>{tx.status}</small></span>
                  <ChevronDown size={16}/>
                </button>
                {isOpen && (
                  <div className="qf-report-detail">
                    <div><small>What happened</small><p>{detail.reason}</p></div>
                    <div><small>Wallet decision</small><p>{tx.status === 'failed' ? 'Nothing was submitted successfully.' : 'Confirmed by the connected wallet.'}</p></div>
                    <details>
                      <summary>Technical details</summary>
                      <dl>
                        <div><dt>Network fee estimate</dt><dd>{tx.gasEstimate} ETH</dd></div>
                        <div><dt>Wallet</dt><dd>{tx.walletAddress.slice(0, 8)}…{tx.walletAddress.slice(-5)}</dd></div>
                        {tx.txHash && <div><dt>Transaction</dt><dd>{tx.txHash.slice(0, 12)}…{tx.txHash.slice(-8)}</dd></div>}
                      </dl>
                      {tx.txHash && <a href={`https://polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noreferrer">Open in explorer <ExternalLink size={13}/></a>}
                    </details>
                  </div>
                )}
              </article>
            );
          })}
          {transactions.length === 0 && <div className="qf-report-empty"><Clock3 size={24}/><strong>No matching activity</strong><p>Try another status filter.</p></div>}
        </section>
      </div>
    </AppShell>
  );
}
