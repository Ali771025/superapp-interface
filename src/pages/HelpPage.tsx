import { useId, useState } from 'react';
import { ChevronDown, ExternalLink, LifeBuoy } from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { BrowseTemplate } from '../special3/interaction/PageTemplates';
import { SourceDisclosure } from '../special3/interaction/SharedComponents';
import { Heading, Stack, Surface, Text } from '../special3/primitives';

const faqs = [
  { q:'What is ETER?', a:'ETER is the main token that powers the ETERNITY ecosystem. It is used across features, rewards, and governance.' },
  { q:'What is SHIELD?', a:'SHIELD is a long-term decentralized asset NFT. It grows over time and supports inheritance. It is not a savings account — understand the terms before purchasing.' },
  { q:'What is Forecast?', a:'Forecast is a weekly prediction game, not an investment. You predict ecosystem outcomes and win prizes from the pool if correct.' },
  { q:'What is EES?', a:'Electoral Stocks (EES) give you ownership rights, voting power in ERA, and dividend income when completed.' },
  { q:'Is my investment guaranteed?', a:'No. Nothing in ETERNITY guarantees investment returns. All financial features carry risk. Understand before participating.' },
  { q:'How do I protect my wallet?', a:'Never share your seed phrase. Use hardware wallets if possible. Complete the Web3 Safety course in EDGE.' },
  { q:'How do I contact support?', a:'Open QORA Agent first — it can resolve most questions. For advanced issues, use the community help channels.' },
];

export function HelpPage() {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(null);
  const source = { source:'off-chain' as const, label:'Static help content', freshness:'unknown' as const, detail:'Repository-owned FAQ copy; not Live account or Product state.' };
  return <AppShell title="Help Center" showBack><BrowseTemplate eyebrow="System support" title="Help Center" titleOwner="shell" intro="Plain-language answers, wallet safety reminders, and the official community destination." status={<SourceDisclosure value={source} compact/>}>
    <Stack gap={4}>
      <Heading level={2}>Frequently asked questions</Heading>
      {faqs.map((faq,index) => {
        const expanded = open === index;
        const buttonId = `${baseId}-faq-${index}`;
        const panelId = `${baseId}-answer-${index}`;
        return <Surface key={faq.q} variant={expanded ? 'raised' : 'default'}><button id={buttonId} type="button" className="s3-secondary-action w-full justify-between text-left" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? null : index)}><span>{faq.q}</span><ChevronDown aria-hidden="true" className={expanded ? 'rotate-180' : ''}/></button>{expanded && <Text id={panelId} role="region" aria-labelledby={buttonId} tone="secondary" className="mt-3">{faq.a}</Text>}</Surface>;
      })}
      <Surface><Stack gap={3} align="center"><LifeBuoy aria-hidden="true"/><Heading level={2}>Community support</Heading><Text tone="secondary">Join the official ETERNITY community for peer support and announcements.</Text><a href="https://github.com/Ali771025" target="_blank" rel="noopener noreferrer" className="s3-secondary-action"><ExternalLink aria-hidden="true"/>Open official community</a></Stack></Surface>
    </Stack>
  </BrowseTemplate></AppShell>;
}
