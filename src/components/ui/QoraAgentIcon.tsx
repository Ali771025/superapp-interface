import { QoraOrb, type QoraOrbState } from '../qora/QoraOrb';

export function QoraAgentIcon({ size = 28, state = 'idle', className, decorative = true }: { size?: number; state?: QoraOrbState | 'error'; className?: string; decorative?: boolean }) {
  const semanticState: QoraOrbState = state === 'error' ? 'warning' : state;
  return <QoraOrb size={size <= 30 ? 'micro' : 'compact'} pixelSize={size} state={semanticState} className={className} decorative={decorative}/>;
}
