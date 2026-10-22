export function formatFinancialText(value: string, options: { group?: boolean } = {}): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^(-?)(\d*)(?:\.(\d*))?$/);
  if (!match) return value;
  const [, sign, integer = '', fraction] = match;
  const normalizedInteger = integer || '0';
  const grouped = options.group === false ? normalizedInteger : normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${grouped}${fraction === undefined ? '' : `.${fraction}`}`;
}

export function shortenIdentifier(value: string, head = 8, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function formatFreshness(updatedAt?: string, now = Date.now()): string {
  if (!updatedAt) return 'Freshness unavailable';
  const elapsed = Math.max(0, now - Date.parse(updatedAt));
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 10) return 'Live';
  if (seconds < 60) return `Updated ${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return `Updated ${Math.floor(minutes / 60)} hour${minutes < 120 ? '' : 's'} ago`;
}
