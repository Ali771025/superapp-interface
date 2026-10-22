import { Compass } from '@icons';
import { GlowingShadow } from '../ui/GlowingShadow';

type CurrentMissionCardProps = {
  title: string;
  expectedEQ: number;
  showEq?: boolean;
  onContinue: () => void;
};

export function CurrentMissionCard({ title, expectedEQ, showEq = true, onContinue }: CurrentMissionCardProps) {
  return (
    <GlowingShadow className="journey-mission-card journey-home-tile" role="link" tabIndex={0} onClick={onContinue} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onContinue(); } }} aria-label={`Continue mission: ${title}`}>
      <header className="journey-tile-heading"><Compass size={24}/><div><span>MISSION</span><h2>{title}</h2><p>{showEq ? `Continue this step · +${expectedEQ} EQ` : 'Continue this step · EQ resolved after verified Achievement'}</p></div></header>
    </GlowingShadow>
  );
}
