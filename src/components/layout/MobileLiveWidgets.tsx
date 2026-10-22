import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings2 } from '@icons';
import { CenteredModal } from '../modals/CenteredModal';
import { SHELL_PRODUCTS } from './shellProducts';
import {
  mockCurrentForecast,
  mockEcosystemStats,
  mockFanProfile,
  mockPortfolioValue,
  mockShields,
} from '../../data/mockAssets';
import type { ProductDefinition } from '../../data/productRegistry';

const STORAGE_KEY = 'eternity:workspace-shortcuts:v2';
const DEFAULT_ITEMS: WorkspaceItem[] = [
  { id: 'assets', mode: 'button' },
  { id: 'generator', mode: 'button' },
  { id: 'shield', mode: 'button' },
  { id: 'forecast', mode: 'button' },
];

type WidgetMode = 'button' | 'live';
type WorkspaceItem = { id: string; mode: WidgetMode };
type Metric = readonly [string, string];
type WidgetDefinition = ProductDefinition & { metrics: readonly Metric[] };

const LIVE_METRICS: Record<string, readonly Metric[]> = {
  assets: [
    ['Value', `$${mockPortfolioValue.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
    ['24h', `+${mockPortfolioValue.change24h}%`],
    ['Assets', '4'],
  ],
  generator: [
    ['ETER', `$${mockEcosystemStats.eterPrice}`],
    ['24h', `+${mockEcosystemStats.eterChange24h}%`],
    ['Volume', `$${Math.round(mockEcosystemStats.generatorVolume24h / 1000)}K`],
  ],
  shield: [
    ['Owned', `${mockShields.length}`],
    ['Supply', mockEcosystemStats.shieldSupply.toLocaleString()],
    ['Paid', `${mockShields.filter((item) => item.remainingAmount === 0).length}`],
  ],
  forecast: [
    ['Week', `${mockCurrentForecast.weekNumber}`],
    ['Pool', `${Math.round(mockCurrentForecast.poolSize / 1000)}K`],
    ['Tickets', mockCurrentForecast.totalTickets.toLocaleString()],
  ],
  fan: [
    ['Directs', `${mockFanProfile.directReferrals}`],
    ['Network', `${mockFanProfile.totalDownline}`],
    ['Claimable', `${mockFanProfile.claimableIncome} E`],
  ],
  era: [
    ['Active', `${mockEcosystemStats.activeProposals}`],
    ['Status', 'Eligible'],
    ['Power', '1 vote'],
  ],
  ees: [
    ['Holders', mockEcosystemStats.eesHolders.toLocaleString()],
    ['Dividend', '28.5'],
    ['Status', 'Active'],
  ],
};

function loadSelection(): WorkspaceItem[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as unknown;
    if (!Array.isArray(saved)) return DEFAULT_ITEMS;
    const validIds = new Set(SHELL_PRODUCTS.map((product) => product.id));
    const next = saved.filter((item): item is WorkspaceItem => Boolean(
      item && typeof item === 'object'
      && 'id' in item && typeof item.id === 'string' && validIds.has(item.id)
      && 'mode' in item && (item.mode === 'button' || item.mode === 'live'),
    )).slice(0, 4);
    return next.length ? next : DEFAULT_ITEMS;
  } catch {
    return DEFAULT_ITEMS;
  }
}

function saveSelection(items: WorkspaceItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function MobileLiveWidgets() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<WorkspaceItem[]>(loadSelection);
  const [customizing, setCustomizing] = useState(false);
  const [query, setQuery] = useState('');
  const definitions = useMemo<WidgetDefinition[]>(() => SHELL_PRODUCTS.map((product) => ({
    ...product,
    metrics: LIVE_METRICS[product.id] ?? [
      ['Status', product.status === 'coming-soon' ? 'Soon' : product.status === 'preview' ? 'Preview' : 'Active'],
      ['Space', product.area],
      ['Access', product.requiresWallet ? 'Wallet' : 'Open'],
    ],
  })), []);
  const visible = selected.map((selection) => {
    const definition = definitions.find((widget) => widget.id === selection.id);
    return definition ? { ...definition, mode: selection.mode } : null;
  }).filter((widget): widget is WidgetDefinition & { mode: WidgetMode } => Boolean(widget));
  const filteredDefinitions = definitions.filter((definition) => {
    const value = query.trim().toLowerCase();
    return !value || `${definition.label} ${definition.shortDescription} ${definition.area}`.toLowerCase().includes(value);
  });

  const update = (recipe: (current: WorkspaceItem[]) => WorkspaceItem[]) => {
    setSelected((current) => {
      const next = recipe(current);
      saveSelection(next);
      return next;
    });
  };
  const toggle = (id: string) => update((current) => current.some((item) => item.id === id)
    ? current.filter((item) => item.id !== id)
    : current.length < 4 ? [...current, { id, mode: 'button' }] : current);
  const setMode = (id: string, mode: WidgetMode) => update((current) => current.map((item) => item.id === id ? { ...item, mode } : item));
  const liveCount = visible.filter((item) => item.mode === 'live').length;

  return <section className="mobile-live-widgets" aria-label="Workspace shortcuts">
    <header>
      <span><small>Workspace shortcuts</small><strong>{visible.length}/4 · {liveCount} live</strong></span>
      <button type="button" onClick={() => setCustomizing(true)}><Settings2 size={16}/>Customize</button>
    </header>
    <div className="mobile-live-widget-grid">
      {visible.map(({ id, label, icon: Icon, metrics, route, mode }) => <button
        type="button"
        key={id}
        className={mode === 'live' ? 'is-live' : 'is-button'}
        onClick={() => navigate(route)}
        aria-label={`Open ${label} in Workspace${mode === 'live' ? ' live widget' : ''}`}
      >
        <header><Icon size={26}/><strong>{label}</strong>{mode === 'live' && <i>Live</i>}</header>
        {mode === 'live' && <dl>{metrics.map(([name, value], index) => <div key={name}><dt>{name}</dt><dd className={index === 0 ? 'is-primary' : ''}>{value}</dd></div>)}</dl>}
      </button>)}
    </div>

    <CenteredModal open={customizing} onClose={() => setCustomizing(false)} title="Customize workspace" maxWidth="max-w-2xl">
      <div className="mobile-widget-customizer">
        <p>Choose up to four modules. Keep each one as a simple button or turn on its live snapshot.</p>
        <label className="mobile-widget-search"><Search size={17}/><span className="sr-only">Search modules</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all modules"/></label>
        <div>{filteredDefinitions.map(({ id, label, icon: Icon, shortDescription }) => {
          const item = selected.find((selection) => selection.id === id);
          const active = Boolean(item);
          const disabled = !active && selected.length >= 4;
          return <article key={id} className={active ? 'is-selected' : ''}>
            <button className="mobile-widget-select" type="button" onClick={() => toggle(id)} disabled={disabled} aria-pressed={active}>
              <Icon size={24}/><span><strong>{label}</strong><small>{shortDescription}</small></span><i aria-hidden="true">{active ? 'Added' : 'Add'}</i>
            </button>
            {active && <div className="mobile-widget-mode" role="group" aria-label={`${label} display mode`}>
              <button type="button" onClick={() => setMode(id, 'button')} aria-pressed={item?.mode === 'button'}>Button</button>
              <button type="button" onClick={() => setMode(id, 'live')} aria-pressed={item?.mode === 'live'}>Live widget</button>
            </div>}
          </article>;
        })}</div>
        {!filteredDefinitions.length && <div className="mobile-widget-no-results"><Search size={22}/><strong>No matching module</strong><span>Try a product name such as Generator, SHIELD or EDGE.</span></div>}
        <footer><span>{selected.length} of 4 selected · {liveCount} live</span><button type="button" onClick={() => setCustomizing(false)}>Done</button></footer>
      </div>
    </CenteredModal>
  </section>;
}
