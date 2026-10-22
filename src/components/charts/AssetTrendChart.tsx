import { useId } from 'react';
import { X } from '@icons';

type AssetTrendChartProps = {
  symbol: string;
  onClose: () => void;
};

const trends: Record<string, string> = {
  ETER: 'M4 104 C34 99 47 75 72 82 S112 112 145 70 S194 45 219 57 S267 33 316 20',
  ET: 'M4 92 C42 72 62 90 91 67 S143 37 174 58 S222 92 252 55 S290 37 316 31',
  Q: 'M4 108 C33 85 52 94 81 73 S129 68 158 42 S203 34 228 54 S280 45 316 18',
  USDT: 'M4 66 C48 65 83 69 118 65 S181 67 220 64 S278 67 316 63',
};

export function AssetTrendChart({ symbol, onClose }: AssetTrendChartProps) {
  const rawId = useId().replace(/:/g, '');
  const path = trends[symbol] ?? trends.ETER;
  return (
    <section className="asset-trend-chart" aria-label={`${symbol} price chart`}>
      <header>
        <span><strong>{symbol}</strong><small>7-period trend</small></span>
        <button type="button" onClick={onClose} aria-label={`Close ${symbol} chart`}><X size={16}/>Close</button>
      </header>
      <svg viewBox="0 0 320 122" role="img" aria-labelledby={`${rawId}-title`}>
        <title id={`${rawId}-title`}>{symbol} trend over seven periods</title>
        <defs>
          <linearGradient id={`${rawId}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--brand)"/>
            <stop offset=".55" stopColor="#8f76ff"/>
            <stop offset="1" stopColor="#22c8ff"/>
          </linearGradient>
          <linearGradient id={`${rawId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--brand)" stopOpacity=".26"/>
            <stop offset="1" stopColor="var(--brand)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path className="asset-trend-fill" d={`${path} L316 120 L4 120 Z`} fill={`url(#${rawId}-fill)`}/>
        <path className="asset-trend-line" d={path} stroke={`url(#${rawId}-stroke)`}/>
      </svg>
    </section>
  );
}
