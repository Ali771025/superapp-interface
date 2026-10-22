import { Activity, Focus, Moon, Sun } from '@icons';
import type { ReactNode } from 'react';
import { special3Levels } from '../tokens/generated';
import { Badge, Chip, Container, Divider, Grid, Heading, Icon, Inline, ScrollRegion, Skeleton, Stack, StatusIndicator, Surface, Text } from '../primitives';
import { AchievementBadge, AchievementProgress, EQDelta, LevelBadge, LevelProgress, ProgressIndicator, RewardChip } from '../progression-ui';
import { Phase04Gallery } from './Phase04Gallery';
import './gallery.css';

const semanticSwatches = ['canvas','surface','surface-raised','surface-interactive','border','border-strong','text-primary','text-secondary','text-muted','primary','success','warning','danger','info','focus','disabled'] as const;
const spaces = [0,1,2,3,4,5,6,8,10,12,16] as const;

export function Special3Gallery() {
  if (new URLSearchParams(window.location.search).has('phase04')) return <Phase04Gallery/>;
  return <section data-special3 className="s3-gallery">
    <Container size="max"><Stack gap={8}>
      <header className="s3-gallery__hero"><Stack gap={3}>
        <Inline gap={2}><Badge tone="primary">SPECIAL 3.0</Badge><Badge>Development only</Badge></Inline>
        <Heading level={1} display>Calm Intelligence + Financial Precision</Heading>
        <Text tone="secondary">Foundation and primitive gallery. No product workflow, route behavior, transaction logic or progression evaluation is executed here.</Text>
      </Stack></header>

      <GallerySection title="Theme infrastructure" description="The same semantic contract renders independently in Light and Dark themes.">
        <Grid columns={2} gap={4}>
          <ThemePreview theme="light" icon={<Sun/>} />
          <ThemePreview theme="dark" icon={<Moon/>} />
        </Grid>
      </GallerySection>

      <GallerySection title="Typography" description="A bounded responsive scale with tabular financial numerals.">
        <Surface><Stack gap={4}>
          <Heading level={1} display>Display — Identity moment</Heading><Heading level={1}>Page title</Heading><Heading level={2}>Section title</Heading><Heading level={3}>Card title</Heading>
          <Text>Body text remains readable at 14px minimum across supported viewports.</Text><Text variant="label">Label — VERIFIED EVENT</Text><Text variant="caption" tone="muted">Caption — Updated 2 minutes ago</Text>
          <Text variant="numeric-xl">1,900,000.00 EQ</Text><Text variant="mono">0x71C…A942</Text>
        </Stack></Surface>
      </GallerySection>

      <GallerySection title="Semantic colors and surfaces" description="Product accents never replace semantic status meaning.">
        <Grid columns={4} gap={3}>{semanticSwatches.map(token => <div key={token} className={`s3-gallery-swatch s3-gallery-swatch--${token}`}><span/><Text variant="caption">{token}</Text></div>)}</Grid>
        <Grid columns={4} gap={3}><Surface>Surface</Surface><Surface variant="raised" elevation={1}>Raised · E1</Surface><Surface variant="interactive" elevation={2}>Interactive · E2</Surface><Surface variant="subtle" elevation={3}>Panel · E3</Surface></Grid>
      </GallerySection>

      <GallerySection title="Spacing, radius and borders" description="All examples use the official 4px spacing scale.">
        <ScrollRegion label="SPECIAL 3.0 spacing scale"><Inline gap={4} wrap={false} className="s3-gallery-spacing">{spaces.map(space => <Stack gap={1} align="center" key={space}><span className={`s3-gallery-space s3-gallery-space-${space}`}/><Text variant="caption">{space}</Text></Stack>)}</Inline></ScrollRegion>
        <Inline gap={3}>{['xs','sm','control','nested','card','panel','pill'].map(radius => <span key={radius} className={`s3-gallery-radius s3-gallery-radius--${radius}`}>{radius}</span>)}</Inline>
      </GallerySection>

      <GallerySection title="Status, focus and loading" description="Status always combines icon, label and semantic color.">
        <Inline gap={4}><StatusIndicator status="success" label="Verified"/><StatusIndicator status="warning" label="Pending review"/><StatusIndicator status="danger" label="Failed"/><StatusIndicator status="info" label="Testnet"/><StatusIndicator status="neutral" label="Preview"/></Inline>
        <Inline gap={3}><Chip onClick={() => undefined} selected><Focus aria-hidden="true"/>Keyboard focus target</Chip><Badge tone="success">Live</Badge><Badge tone="warning">Mock</Badge><Badge tone="info">Testnet</Badge><Badge>Preview</Badge></Inline>
        <Surface variant="raised"><Stack gap={3}><Skeleton width="half"/><Skeleton width="full"/><Skeleton width="three-quarter"/></Stack></Surface>
      </GallerySection>

      <GallerySection title="All 19 Levels" description="Level identity uses number, name, state and accent; color is never the only signal.">
        <Grid columns={4} gap={3}>{special3Levels.map(({level,name}) => <LevelBadge key={level} level={level} name={name} state={level < 8 ? 'unlocked' : level === 8 ? 'current' : 'locked'} />)}</Grid>
        <LevelProgress level={8} levelName="Aether" value={64} currentLabel="7,500 EQ" nextLabel="15,000 EQ" />
      </GallerySection>

      <GallerySection title="Achievement, EQ and Reward presentation" description="These components display supplied state only; they do not evaluate events or mutate ledgers.">
        <Grid columns={3} gap={3}>
          <AchievementBadge achievementId="generator-turnover-50" label="$50 turnover" product="Generator" state="earned" />
          <AchievementBadge achievementId="forecast-week-10" label="10 active weeks" product="Forecast" state="in-progress" />
          <AchievementBadge achievementId="shield-sequential-a" label="Sequential A" product="SHIELD" state="locked" />
        </Grid>
        <AchievementProgress achievementId="fan-direct-30" label="30 active directs" value={18} max={30} unit="verified directs" />
        <Inline gap={3}><EQDelta value={2000} sourceLabel="Verified Achievement"/><EQDelta value={0}/><RewardChip status="unresolved">Non-EQ reward</RewardChip></Inline>
        <ProgressIndicator label="Verified progression handoff" currentStep={2} steps={['Product Action','Verified Event','Achievement','EQ / Reward','Journey handoff']} />
      </GallerySection>

      <GallerySection title="Motion and reduced motion" description="Motion explains state change; reduced-motion removes nonessential animation.">
        <Surface variant="interactive"><Inline gap={3}><Icon label="Active transition"><Activity/></Icon><Stack gap={1}><Text variant="label">Component transition · 200ms</Text><Text variant="caption" tone="muted">Reduced-motion fallback: immediate state update without ambient movement.</Text></Stack></Inline></Surface>
      </GallerySection>

      <Divider/>
      <Phase04Gallery/>

      <Divider/><Text variant="caption" tone="muted">SPECIAL 3.0 Phase 01 gallery · presentation only · 79-rule Achievement/EQ lock preserved</Text>
    </Stack></Container>
  </section>;
}

function GallerySection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="s3-gallery__section"><Stack gap={4}><Stack gap={1}><Heading level={2}>{title}</Heading><Text tone="secondary">{description}</Text></Stack>{children}</Stack></section>;
}

function ThemePreview({ theme, icon }: { theme: 'light' | 'dark'; icon: ReactNode }) {
  return <div data-s3-theme={theme} className="s3-theme-preview"><Stack gap={4}>
    <Inline gap={2}><Icon label={`${theme} theme`}>{icon}</Icon><Heading level={3}>{theme === 'light' ? 'Light' : 'Dark'} theme</Heading></Inline>
    <Surface elevation={1}><Stack gap={3}><Text variant="label">SEMANTIC SURFACE</Text><Text variant="numeric">125,400.00 ETER</Text><Inline gap={2}><StatusIndicator status="success" label="Verified"/><Chip selected>Current</Chip></Inline></Stack></Surface>
  </Stack></div>;
}
