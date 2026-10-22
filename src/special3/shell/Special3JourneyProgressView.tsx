import { CheckCircle2, CircleDot, ListChecks, Target } from '@icons';
import type { MissionDefinition } from '../../lib/journey/types';
import type { MissionProgressionPresentation } from '../progression/missionAchievementMappings';

interface Special3JourneyProgressViewProps {
  missions: readonly MissionDefinition[];
  activeMission?: MissionDefinition;
  progression: MissionProgressionPresentation;
}

export function Special3JourneyProgressView({ missions, activeMission, progression }: Special3JourneyProgressViewProps) {
  const completedMissions = missions.filter((mission) => mission.progress >= 100).length;
  const completedTasks = missions.reduce((total, mission) => total + mission.completedTasks, 0);
  const totalTasks = missions.reduce((total, mission) => total + mission.totalTasks, 0);
  return <section aria-labelledby="journey-progress-title" style={{display:'grid',gap:'var(--s3-space-3)'}}>
    <header><small style={{color:'var(--s3-text-muted)'}}>TRUTHFUL JOURNEY SUMMARY</small><h2 id="journey-progress-title" style={{marginTop:4}}>Progress</h2></header>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',gap:'var(--s3-space-3)'}}>
      {[{icon:<Target/>,label:'Active mission',value:activeMission?.title ?? 'Unavailable'},{icon:<ListChecks/>,label:'Registry tasks',value:`${completedTasks} of ${totalTasks}`},{icon:<CheckCircle2/>,label:'Completed missions',value:String(completedMissions)}].map((item) => <article key={item.label} className="glass-subtle" style={{minHeight:96,display:'grid',gridTemplateColumns:'38px minmax(0,1fr)',alignItems:'center',gap:'var(--s3-space-3)',padding:'var(--s3-space-4)',borderRadius:'var(--s3-radius-card)'}}><span aria-hidden="true" style={{color:'var(--s3-primary)'}}>{item.icon}</span><span><small style={{color:'var(--s3-text-muted)'}}>{item.label}</small><strong style={{display:'block',marginTop:4,fontSize:'var(--s3-type-title)'}}>{item.value}</strong></span></article>)}
    </div>
    <article className="glass-subtle" style={{display:'grid',gap:'var(--s3-space-3)',padding:'var(--s3-space-4)',borderRadius:'var(--s3-radius-card)'}}>
      <header style={{display:'flex',alignItems:'center',gap:8}}><CircleDot aria-hidden="true" style={{color:'var(--s3-primary)'}}/><strong>Achievement and EQ boundary</strong></header>
      <p style={{color:'var(--s3-text-secondary)',fontSize:'var(--s3-type-label)',lineHeight:1.55}}>{progression.detail}</p>
      <dl style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'var(--s3-space-2)'}}><div style={{padding:'var(--s3-space-3)',borderRadius:'var(--s3-radius-control)',background:'var(--s3-surface-raised)'}}><dt style={{color:'var(--s3-text-muted)',fontSize:11}}>Achievement</dt><dd style={{marginTop:4,fontWeight:700}}>{progression.achievementLabel}</dd></div><div style={{padding:'var(--s3-space-3)',borderRadius:'var(--s3-radius-control)',background:'var(--s3-surface-raised)'}}><dt style={{color:'var(--s3-text-muted)',fontSize:11}}>Potential EQ</dt><dd style={{marginTop:4,fontWeight:700}}>{progression.potentialEqLabel || 'Unavailable'}</dd></div></dl>
    </article>
  </section>;
}
