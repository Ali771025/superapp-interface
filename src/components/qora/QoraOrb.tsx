import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

export type QoraOrbState = 'idle' | 'listening' | 'thinking' | 'action-ready' | 'success' | 'warning';
export type QoraOrbSize = 'hero' | 'standard' | 'compact' | 'micro';

const stateLabel: Record<QoraOrbState, string> = {
  idle: 'QORA is ready', listening: 'QORA is listening', thinking: 'QORA is thinking',
  'action-ready': 'QORA prepared an action for your review', success: 'QORA completed the preparation',
  warning: 'QORA needs your attention',
};

export function QoraOrb({ state = 'idle', size = 'standard', pixelSize, audioLevel = 0, interactive = false, onClick, className, decorative = false, living = false }: {
  state?: QoraOrbState; size?: QoraOrbSize; pixelSize?: number; audioLevel?: number; interactive?: boolean; onClick?: () => void; className?: string; decorative?: boolean; living?: boolean;
}) {
  const { theme } = useTheme();
  void living;
  const id = useId().replace(/:/g, '');
  const [reduced, setReduced] = useState(false);
  const level = Math.max(0, Math.min(1, Number.isFinite(audioLevel) ? audioLevel : 0));

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync(); query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const style = useMemo(() => ({
    '--orb-audio': level,
    '--orb-react': 1 + level * .1,
    ...(pixelSize ? { '--orb-size': `${pixelSize}px` } : {}),
  } as CSSProperties), [level, pixelSize]);
  const orb = <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-core`} cx="34%" cy="28%" r="74%"><stop offset="0" stopColor="var(--orb-highlight)"/><stop offset=".34" stopColor="var(--orb-core)"/><stop offset="1" stopColor="var(--orb-aura)" stopOpacity=".28"/></radialGradient>
      <linearGradient id={`${id}-flow`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--orb-highlight)" stopOpacity=".14"/><stop offset=".5" stopColor="var(--orb-aura)" stopOpacity=".88"/><stop offset="1" stopColor="var(--orb-core)" stopOpacity=".16"/></linearGradient>
      <clipPath id={`${id}-clip`}><circle cx="100" cy="100" r="72"/></clipPath>
      <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <circle className="et-orb-shell" cx="100" cy="100" r="74"/>
    <g clipPath={`url(#${id}-clip)`}>
      <circle className="et-orb-depth" cx="100" cy="100" r="72" fill={`url(#${id}-core)`}/>
      <ellipse className="et-orb-flow is-a" cx="94" cy="91" rx="67" ry="27" fill="none" stroke={`url(#${id}-flow)`} strokeWidth="15"/>
      <ellipse className="et-orb-flow is-b" cx="108" cy="113" rx="57" ry="22" fill="none" stroke={`url(#${id}-flow)`} strokeWidth="9"/>
      <path className="et-orb-ribbon" d="M33 110C58 65 87 74 102 91s35 35 65-9" fill="none" stroke={`url(#${id}-flow)`} strokeWidth="9" strokeLinecap="round"/>
      <circle className="et-orb-core" cx="100" cy="100" r="25" fill={`url(#${id}-core)`} filter={`url(#${id}-soft)`}/>
      <ellipse className="et-orb-highlight" cx="75" cy="63" rx="29" ry="12" transform="rotate(-24 75 63)"/>
    </g>
    {state === 'success' && <path className="et-orb-mark" d="m84 101 11 11 23-26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/>}
    {state === 'action-ready' && <path className="et-orb-mark" d="m84 101 11 11 23-26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/>}
    {state === 'warning' && <path className="et-orb-mark" d="M100 80v25m0 12v1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5"/>}
  </svg>;
  const classes = cn('et-qora-orb', `is-${state}`, `size-${size}`, `theme-${theme}`, reduced && 'is-reduced', className);
  if (interactive) return <button type="button" className={classes} style={style} onClick={onClick} aria-label={stateLabel[state]}>{orb}</button>;
  return <span className={classes} style={style} role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : stateLabel[state]}>{orb}</span>;
}
