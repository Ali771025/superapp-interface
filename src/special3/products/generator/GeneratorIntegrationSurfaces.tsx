import { ArrowRight, Flame, Heart, Repeat2, Send, Sparkles } from '@icons';
import { useNavigate } from 'react-router-dom';
import { TokenMark } from '../../../components/ui/TokenMark';
import { IS_PREVIEW_MODE } from '../../../lib/contracts/contractConfig';
import { formatCurrency, formatNumber } from '../../../lib/utils';
import { productData } from '../../providers/products';
const { ecosystemStats } = productData;
import { DataCard, FreshnessIndicator, PrimaryAction, SecondaryAction, SourceDisclosure, type SourceFreshness } from '../../interaction';
import { Badge, Grid, Heading, Inline, Surface, Text } from '../../primitives';
import { generatorEterAsset } from '../../../modules/generator/generatorProduct';
import './generator.css';

const source: SourceFreshness = IS_PREVIEW_MODE
  ? { source:'mock', label:'Preview · Mock', freshness:'unavailable', detail:'Generator and ETER fixture data; freshness is unavailable.' }
  : { source:'direct-chain', freshness:'live', detail:'Configured Generator and wallet sources.' };

export function GeneratorEconomyIntegration() {
  const navigate = useNavigate();
  return <section data-special3 data-s3-generator-integration="economy" className="s3-generator-integration" aria-labelledby="s3-economy-eter-title">
    <DataCard title="ETER operations" disclosure={<SourceDisclosure value={source} compact/>}>
      <div className="s3-generator-integration__summary"><TokenMark token="ETER" size={46}/><div><Heading level={3} id="s3-economy-eter-title">{formatNumber(generatorEterAsset.balance)} ETER</Heading><Text variant="caption" tone="muted">{formatCurrency(generatorEterAsset.usdValue)} · ${ecosystemStats.eterPrice} per ETER</Text></div><FreshnessIndicator value={source}/></div>
      <Inline><PrimaryAction className="s3-generator-primary" onClick={() => navigate('/generator/generate')}><Sparkles aria-hidden="true"/>Generate ETER</PrimaryAction><SecondaryAction onClick={() => navigate('/generator/sell')}>Sell</SecondaryAction><SecondaryAction onClick={() => navigate('/generator/transfer')}>Transfer</SecondaryAction><SecondaryAction onClick={() => navigate('/transactions?product=generator')}>History</SecondaryAction></Inline>
    </DataCard>
  </section>;
}

export function GeneratorAssetsIntegration() {
  const navigate = useNavigate();
  const actions = [
    { label:'Transfer ETER', route:'/generator/transfer', icon:Send },
    { label:'Donate ETER', route:'/generator/donate', icon:Heart },
    { label:'Burn ETER', route:'/generator/burn', icon:Flame },
    { label:'Swap', route:'/swap?from=ETER', icon:Repeat2 },
  ];
  return <section data-special3 data-s3-generator-integration="assets" className="s3-generator-integration" aria-labelledby="s3-assets-eter-title">
    <DataCard title="ETER Product operations" disclosure={<SourceDisclosure value={source} compact/>}>
      <div className="s3-generator-integration__summary"><TokenMark token="ETER" size={46}/><div><Heading level={3} id="s3-assets-eter-title">ETER is owned by Generator</Heading><Text variant="caption" tone="muted">Generic Send is not introduced; Product routes retain transfer, donate and burn semantics.</Text></div><Badge tone="info">Product-owned</Badge></div>
      <Grid columns={4} gap={2}>{actions.map(({ label, route, icon:Icon }) => <Surface key={label} as="button" variant="interactive" className="s3-generator-integration__action" onClick={() => navigate(route)}><Icon aria-hidden="true"/><Text as="span" variant="label">{label}</Text><ArrowRight aria-hidden="true"/></Surface>)}</Grid>
    </DataCard>
  </section>;
}
