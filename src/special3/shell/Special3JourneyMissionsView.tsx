import { ArrowRight, CheckCircle2, ListChecks, Target } from '@icons';
import type { MissionDefinition } from '../../lib/journey/types';

interface Special3JourneyMissionsViewProps {
  missions: readonly MissionDefinition[];
  activeMissionId?: string;
  onOpenMission: (mission: MissionDefinition) => void;
}

export function Special3JourneyMissionsView({ missions, activeMissionId, onOpenMission }: Special3JourneyMissionsViewProps) {
  return <section aria-labelledby="journey-missions-title" style={{display:'grid',gap:'var(--s3-space-3)'}}>
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'var(--s3-space-3)'}}>
      <span><small style={{color:'var(--s3-text-muted)'}}>REAL JOURNEY REGISTRY</small><h2 id="journey-missions-title" style={{marginTop:4}}>Available missions</h2></span>
      <span style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--s3-primary)',fontSize:'var(--s3-type-label)',fontWeight:700}}><ListChecks aria-hidden="true"/>{missions.length}</span>
    </header>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:'var(--s3-space-3)'}}>
      {missions.map((mission) => {
        const active = mission.id === activeMissionId;
        return <article key={mission.id} className="glass-subtle" style={{minWidth:0,display:'grid',gap:'var(--s3-space-3)',padding:'var(--s3-space-4)',borderColor:active?'color-mix(in srgb,var(--s3-primary) 55%,var(--s3-border))':'var(--s3-glass-border)',borderRadius:'var(--s3-radius-card)'}}>
          <header style={{display:'grid',gridTemplateColumns:'36px minmax(0,1fr) auto',alignItems:'center',gap:'var(--s3-space-2)'}}><span style={{width:36,height:36,display:'grid',placeItems:'center',borderRadius:'var(--s3-radius-control)',color:'var(--s3-primary)',background:'var(--s3-info-surface)'}}><Target aria-hidden="true"/></span><span style={{minWidth:0}}><small style={{color:'var(--s3-text-muted)'}}>{mission.area.toUpperCase()}</small><strong style={{display:'block',marginTop:2,fontSize:'var(--s3-type-label)'}}>{mission.title}</strong></span>{active&&<span style={{display:'inline-flex',alignItems:'center',gap:4,color:'var(--s3-success)',fontSize:10,fontWeight:700}}><CheckCircle2 aria-hidden="true"/>ACTIVE</span>}</header>
          <p style={{color:'var(--s3-text-secondary)',fontSize:'var(--s3-type-label)',lineHeight:1.5}}>{mission.reason}</p>
          <span style={{display:'grid',gap:6}}><span style={{display:'flex',justifyContent:'space-between',gap:8,color:'var(--s3-text-secondary)',fontSize:11}}><span>{mission.completedTasks} of {mission.totalTasks} tasks</span><strong>{mission.progress}%</strong></span><progress value={mission.progress} max={100} aria-label={`${mission.title} progress: ${mission.progress}%`}>{mission.progress}%</progress></span>
          <button type="button" onClick={() => onOpenMission(mission)} style={{minHeight:44,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,paddingInline:'var(--s3-space-3)',border:'1px solid var(--s3-border)',borderRadius:'var(--s3-radius-control)',color:'var(--s3-primary)',background:'var(--s3-surface-raised)',font:'inherit',fontSize:'var(--s3-type-label)',fontWeight:700,cursor:'pointer'}}><span>{active?'Continue mission':'Open mission'}</span><ArrowRight aria-hidden="true"/></button>
        </article>;
      })}
    </div>
  </section>;
}
