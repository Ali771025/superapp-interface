import source from './source.json';

export const special3TokenSource = source;

export const special3Breakpoints = {
  xs: 360,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;

export const special3Containers = {
  reading: 820,
  standard: 1040,
  wide: 1240,
  max: 1360,
} as const;

export const special3VisualFoundations = {
  gradients: {
    intelligence: [source.color.qora.blue.$value, source.color.qora.violet.$value, source.color.qora.magenta.$value],
    network: [source.color.network.blue.$value, source.color.network.cyan.$value, source.color.network.teal.$value],
  },
  canvas: source.color.canvas,
  glass: source.glass,
  ambient: source.motion.ambient,
} as const;

export const special3Levels = [
  { level: 1, name: 'Origin', accent: '#6B7280' },
  { level: 2, name: 'Signal', accent: '#64748B' },
  { level: 3, name: 'Horizon', accent: '#4F8CFF' },
  { level: 4, name: 'Vector', accent: '#5170FF' },
  { level: 5, name: 'Pulse', accent: '#5D5FEF' },
  { level: 6, name: 'Nexus', accent: '#6F5CFF' },
  { level: 7, name: 'Orbit', accent: '#7B61FF' },
  { level: 8, name: 'Aether', accent: '#875CFF' },
  { level: 9, name: 'Prism', accent: '#9B5DE5' },
  { level: 10, name: 'Nova', accent: '#B35CFF' },
  { level: 11, name: 'Radiant', accent: '#C95CFF' },
  { level: 12, name: 'Aurora', accent: '#E05E9C' },
  { level: 13, name: 'Ember', accent: '#E66A7A' },
  { level: 14, name: 'Forge', accent: '#E9784A' },
  { level: 15, name: 'Ascendant', accent: '#E89C2F' },
  { level: 16, name: 'Sovereign', accent: '#F4C300' },
  { level: 17, name: 'Eternal', accent: '#22A06B' },
  { level: 18, name: 'Celestial', accent: '#0085C7' },
  { level: 19, name: 'Infinity', accent: 'linear-gradient(110deg,#5170FF 0%,#875CFF 52%,#F4C300 100%)' },
] as const;

export type Special3Level = (typeof special3Levels)[number]['level'];
export type Special3Theme = 'light' | 'dark' | 'system';

export const special3ProgressionContract = {
  levelCount: 19,
  achievementRuleCount: 79,
  presentationOnly: true,
} as const;
