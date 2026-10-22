// Simple utility for className merging
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(n: number, decimals = 2): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(decimals);
}

export function formatCurrency(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatPercent(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function timeUntil(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  return `${h}h ${m}m`;
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const fanLevelLabel: Record<string, string> = {
  none: 'No FAN',
  fan: 'FAN',
  indie: 'Indie FAN',
  '1star': '1 Star',
  '2star': '2 Stars',
  '3star': '3 Stars',
  '4star': '4 Stars',
  legioner: 'Legioner',
  legend: 'Legend',
  elitelegend: 'Elite Legend',
};

export const shieldTierLabel: Record<string, string> = {
  starter: 'Starter',
  balanced: 'Balanced',
  professional: 'Professional',
};

export const rarityColor: Record<string, string> = {
  common: 'text-primary-500',
  uncommon: 'text-success',
  rare: 'text-accent-DEFAULT',
  epic: 'text-primary-500',
  legendary: 'text-warning',
};
