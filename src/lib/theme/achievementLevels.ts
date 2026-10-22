export interface LevelColors {
  main: string;
  glow: string;
  gradient: string;
  gradientFrom: string;
  gradientTo: string;
  border: string;
  text: string;
  bg: string;
  ring: string;
}

// Level colors are identity accents only. They never replace semantic status colors.
const LEVEL_PALETTE = [
  ['#2DD4BF', '#0891B2'], ['#38BDF8', '#2563EB'], ['#4ADE80', '#16A34A'],
  ['#FACC15', '#CA8A04'], ['#FB923C', '#EA580C'], ['#F87171', '#DC2626'],
  ['#F472B6', '#DB2777'], ['#C084FC', '#9333EA'], ['#8B7CFF', '#5170FF'],
  ['#22D3EE', '#0E7490'], ['#67E8F9', '#0891B2'], ['#818CF8', '#4F46E5'],
  ['#FCD34D', '#D97706'], ['#FBBF24', '#B45309'], ['#FB7185', '#BE123C'],
  ['#A3E635', '#4D7C0F'], ['#34D399', '#047857'], ['#E879F9', '#6366F1'],
  ['#F2F2EE', '#5170FF'],
] as const;

const LEVEL_COLORS: LevelColors[] = LEVEL_PALETTE.map(([from, to]) => {
  return {
    main: from,
    glow: `${from}59`,
    gradient: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    gradientFrom: from,
    gradientTo: to,
    border: `${from}99`,
    text: 'text-primary-500',
    bg: 'bg-primary-500/10',
    ring: 'ring-primary-500/40',
  };
});

export function getAchievementLevelColor(level: number): LevelColors {
  const idx = Math.max(0, Math.min(level - 1, LEVEL_COLORS.length - 1));
  return LEVEL_COLORS[idx];
}

export interface PassportTier {
  tierName: string;
  tierDescription: string;
  visualIntensity: 'low' | 'medium' | 'medium-high' | 'high' | 'premium' | 'mythic';
}

export function getPassportTier(level: number): PassportTier {
  if (level <= 4) return { tierName: 'Genesis', tierDescription: 'Your first steps in Eternity.', visualIntensity: 'low' };
  if (level <= 8) return { tierName: 'Explorer', tierDescription: 'Growing across the ecosystem.', visualIntensity: 'medium' };
  if (level <= 12) return { tierName: 'Ascendant', tierDescription: 'Recognized progress and deeper activity.', visualIntensity: 'medium-high' };
  if (level <= 15) return { tierName: 'Prime', tierDescription: 'High-value ecosystem participant.', visualIntensity: 'high' };
  if (level <= 17) return { tierName: 'Legend', tierDescription: 'Advanced and trusted ecosystem member.', visualIntensity: 'high' };
  if (level === 18) return { tierName: 'Elite', tierDescription: 'Elite ecosystem status.', visualIntensity: 'premium' };
  return { tierName: 'Mythic', tierDescription: 'The highest Eternity passport tier.', visualIntensity: 'mythic' };
}

export function getLevelGradientStyle(level: number): React.CSSProperties {
  const c = getAchievementLevelColor(level);
  return { background: c.gradient };
}

export function getLevelGlowStyle(level: number, opacity = 0.3): React.CSSProperties {
  const c = getAchievementLevelColor(level);
  return { boxShadow: `0 0 24px 4px ${c.main}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` };
}

export function getLevelBorderStyle(level: number): React.CSSProperties {
  const c = getAchievementLevelColor(level);
  return { borderColor: c.border };
}
