import { CheckCircle2, ChevronDown, Clock3, ExternalLink, XCircle } from '@icons';
import { useMemo, useState } from 'react';
import { IS_PREVIEW_MODE } from '../../../lib/contracts/contractConfig';
import { special3SystemProvider } from '../../providers';
import { AddressValue, DataCard, EmptyState, SourceDisclosure, type SourceFreshness } from '../../interaction';
import { Badge, Heading, Stack, Text } from '../../primitives';
import { GeneratorProductFrame } from './SpecialGeneratorPages';
import './generator.css';

type Filter = 'all' | 'success' | 'pending' | 'failed';
const FILTERS: ReadonlyArray<{ value:Filter; label:string }> = [
  { value:'all', label:'All' }, { value:'success', label:'Success' }, { value:'pending', label:'Pending' }, { value:'failed', label:'Failed' },
];
const source: SourceFreshness = IS_PREVIEW_MODE
  ? { source:'mock', label:'Preview · Mock history', freshness:'unavailable', detail:'Current project transaction fixtures; freshness is unavailable and this is not live wallet history.' }
  : { source:'indexed', freshness:'syncing', detail:'Configured transaction history source.' };

export function SpecialGeneratorHistory() {
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const provider = special3SystemProvider.transactions();
  const records = useMemo(() => provider.data?.filter((entry) => entry.module === 'Generator' && (filter === 'all' || entry.status === filter)) ?? [], [filter, provider.data]);
  return <GeneratorProductFrame active="history" view="history">
    <section className="s3-generator-history glass-featured" aria-labelledby="generator-history-title">
      <header><span><small>PRODUCT-OWNED RECORDS</small><Heading level={2} id="generator-history-title">Generator History</Heading><Text tone="secondary">Configured records only; Preview fixtures are never presented as verified wallet history.</Text></span><SourceDisclosure value={source} compact/></header>
      <div className="s3-generator-history-filters" role="group" aria-label="Filter Generator history">{FILTERS.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
      <Stack gap={2} aria-live="polite">{records.map((record) => {
        const open = expanded === record.id;
        const StatusIcon = record.status === 'success' ? CheckCircle2 : record.status === 'failed' ? XCircle : Clock3;
        return <article key={record.id} className={`s3-generator-history-row is-${record.status}`}>
          <button type="button" className="s3-generator-history-row__main" aria-expanded={open} onClick={() => setExpanded(open ? null : record.id)}><StatusIcon aria-hidden="true"/><span><Text as="span" variant="caption" tone="muted">{new Date(record.createdAt).toLocaleString()}</Text><Heading level={3}>{record.action === 'BUY_ETER' ? 'ETER generated' : record.action.replace(/_/g, ' ')}</Heading></span><span><Text as="strong" variant="numeric">{record.amount} {record.token}</Text><Badge tone={record.status === 'success' ? 'success' : record.status === 'failed' ? 'danger' : 'warning'}>{record.status}</Badge></span><ChevronDown aria-hidden="true"/></button>
          {open && <div className="s3-generator-history-row__detail"><DataCard title="Wallet and transaction evidence"><dl><div><dt>Wallet</dt><dd><AddressValue value={record.walletAddress} label="wallet address"/></dd></div>{record.txHash && <div><dt>Transaction</dt><dd><AddressValue value={record.txHash} label="transaction hash"/></dd></div>}<div><dt>Network</dt><dd>{record.network}</dd></div><div><dt>Recorded Preview fee estimate</dt><dd>{record.gasEstimate ?? 'Unavailable'} {record.gasToken}</dd></div></dl>{record.explorerUrl && <a href={record.explorerUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true"/> Open configured explorer</a>}<Text variant="caption" tone="muted">This configured record does not replace current Product or Review estimates.</Text></DataCard></div>}
        </article>;
      })}{records.length === 0 && <EmptyState title="No matching Generator activity" detail="No configured record matches this status filter."/>}</Stack>
    </section>
  </GeneratorProductFrame>;
}
