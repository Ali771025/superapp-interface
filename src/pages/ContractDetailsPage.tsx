import { useMemo, useState } from 'react';
import { Copy, Database, ExternalLink } from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { BrowseTemplate } from '../special3/interaction/PageTemplates';
import { EmptyState, FieldCarrier, FieldSelect, FreshnessIndicator, MetricCard, MetricGrid, SecondaryAction, SourceDisclosure } from '../special3/interaction/SharedComponents';
import { Heading, Inline, Stack, Surface, Text } from '../special3/primitives';
import { publicSurfaceProvider } from '../special3/providers/publicSurfaces';

export function ContractDetailsPage() {
  const result = publicSurfaceProvider.contractCatalog();
  const [selectedId, setSelectedId] = useState('ETER');
  const [copied, setCopied] = useState(false);
  const selected = useMemo(() => result.data?.entries.find((entry) => entry.id === selectedId) ?? result.data?.entries[0], [result.data,selectedId]);
  const copy = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return <AppShell title="Contract details" showBack wide><BrowseTemplate eyebrow="System utility" title="Contract details" titleOwner="shell" intro="Inspect source-explicit contract catalog entries without inferred indexer, holder, activity, or freshness claims." status={result.data ? <SourceDisclosure value={result.data.source} compact/> : undefined}>
    {result.state === 'unavailable' || !result.data || !selected ? <EmptyState title="Verified contract data unavailable" detail={result.detail}/> : <Stack gap={5}>
      <FieldCarrier id="contract-catalog-entry" label="Contract catalog entry" description="Select a controlled Preview catalog record. This is not a Live indexer response.">
        <FieldSelect value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>{result.data.entries.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</FieldSelect>
      </FieldCarrier>
      <Surface><Stack gap={4}>
        <Inline gap={3}><Database aria-hidden="true"/><Stack gap={1}><Text variant="caption" tone="muted">{selected.network}</Text><Heading level={2}>{selected.label}</Heading></Stack><FreshnessIndicator value={result.data.source}/></Inline>
        <MetricGrid><MetricCard label="Network" value={selected.network}/><MetricCard label="Contract standard" value={selected.standard}/><MetricCard label="Provider state" value="Preview catalog" detail="Not indexed or Live"/></MetricGrid>
      </Stack></Surface>
      <Surface><Stack gap={3}><Text variant="label" tone="secondary">Full canonical address</Text><Text as="code" variant="mono" className="break-all">{selected.address}</Text><Inline gap={3}><SecondaryAction onClick={() => void copy()} aria-live="polite"><Copy aria-hidden="true"/>{copied ? 'Copied full address' : 'Copy full address'}</SecondaryAction><a className="s3-secondary-action" href={`https://polygonscan.com/address/${selected.address}`} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true"/>Open in PolygonScan</a></Inline></Stack></Surface>
    </Stack>}
  </BrowseTemplate></AppShell>;
}
