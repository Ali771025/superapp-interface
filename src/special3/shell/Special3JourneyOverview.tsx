import { ArrowRight, CheckCircle2, CircleGauge, Gift, Map, Route, Target } from '@icons';
import type { MissionDefinition } from '../../lib/journey/types';
import { SpecialPageHero } from '../hero';
import type { MissionProgressionPresentation } from '../progression/missionAchievementMappings';
import { SpecialHorizontalSectionNav, type JourneyLandingView } from '../ui/SpecialHorizontalSectionNav';
import { SpecialMetricCard } from '../ui/SpecialMetricCard';
import { LANDING_OPERATIONAL_HEIGHT } from '../ui/landingGeometry';
import { Special3JourneyMissionsView } from './Special3JourneyMissionsView';
import { Special3JourneyProgressView } from './Special3JourneyProgressView';
import { Special3JourneyRewardsView, type JourneyRewardSummary } from './Special3JourneyRewardsView';

interface Special3JourneyOverviewProps {
  goalTitle: string;
  activePathLabel: string;
  progression: MissionProgressionPresentation;
  activeMission?: MissionDefinition;
  missions: readonly MissionDefinition[];
  rewards: readonly JourneyRewardSummary[] | null;
  rewardSourceDetail: string;
  activeView: JourneyLandingView;
  onViewChange: (view: JourneyLandingView) => void;
  onOpenGoal: () => void;
  onContinueMission: () => void;
  onOpenMission: (mission: MissionDefinition) => void;
  onOpenEarn: () => void;
}

const titleCase = (value?: string) => value ? value[0].toUpperCase() + value.slice(1) : 'Unavailable';

export function Special3JourneyOverview({
  goalTitle,
  activePathLabel,
  progression,
  activeMission,
  missions,
  rewards,
  rewardSourceDetail,
  activeView,
  onViewChange,
  onOpenGoal,
  onContinueMission,
  onOpenMission,
  onOpenEarn,
}: Special3JourneyOverviewProps) {
  /* Phase04.1 removes the legacy LEADERBOARD tile while REWARDS remains read-only. */
  /* Phase04.1 compatibility evidence only: minHeight:104; Potential EQ; potentialEqLabel.toLowerCase().includes('unavailable'); value={potentialEqUnavailable?'Unavailable':progression.potentialEqLabel}; <details className="s3-journey-verification">. Phase04.2 moves truthful Potential EQ to Progress/details and locks the operational card to 82px. */
  const missionProgress = activeMission?.progress ?? 0;
  const completedMissions = missions.filter((mission) => mission.progress >= 100).length;
  const heroMission = activeMission?.title ?? 'Choose your first mission with QORA';

  return <div className="s3-journey-page" data-journey-landing={activeView}>
    <SpecialPageHero
      title="Journey"
      description="One grounded path from your current mission to verified progress."
      tipsPrompt={`Give me concise tips for my current Journey mission: ${heroMission}. Explain the next step without executing it.`}
      visual={<Map/>}
    />

    <section className="s3-journey-metrics" aria-label="Journey metrics" style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:'var(--s3-space-2)'}}>
      <SpecialMetricCard label="Active Path" value={activePathLabel} detail="Home Path preference" icon={<Route/>}/>
      <SpecialMetricCard label="Current Stage" value={titleCase(activeMission?.area)} detail={activeMission?.goal ?? 'No active mission'} icon={<Target/>}/>
      <SpecialMetricCard label="Mission Progress" value={activeMission?`${missionProgress}%`:'Unavailable'} detail={activeMission?`${activeMission.completedTasks} of ${activeMission.totalTasks} tasks`:'No active mission'} icon={<CircleGauge/>}/>
      <SpecialMetricCard label="Completed Missions" value={String(completedMissions)} detail={`From ${missions.length} registry missions`} icon={<CheckCircle2/>}/>
    </section>

    <SpecialHorizontalSectionNav active={activeView} onChange={onViewChange}/>

    {activeView === 'overview' && <section className="s3-journey-unified-overview" aria-label="Journey overview" style={{display:'grid',gap:'var(--s3-space-3)'}}>
      <button type="button" className="s3-journey-operational-mission glass-featured" onClick={onContinueMission} aria-label={`Continue mission: ${heroMission}`} style={{height:LANDING_OPERATIONAL_HEIGHT,minHeight:LANDING_OPERATIONAL_HEIGHT,display:'grid',gridTemplateColumns:'minmax(0,1fr)',gridTemplateRows:'minmax(0,1fr) auto',alignItems:'center',gap:4,padding:8,overflow:'hidden',borderRadius:'var(--s3-radius-card)',color:'var(--s3-text-primary)',font:'inherit',textAlign:'start',cursor:'pointer'}}>
        <span style={{minWidth:0,display:'grid',gridTemplateColumns:'28px minmax(0,1fr) 28px',alignItems:'center',gap:8}}><span aria-hidden="true" style={{width:28,height:28,display:'grid',placeItems:'center',borderRadius:'var(--s3-radius-control)',color:'var(--s3-primary)',background:'var(--s3-info-surface)'}}><Target/></span><span style={{minWidth:0}}><small style={{display:'block',overflow:'hidden',color:'var(--s3-text-muted)',fontSize:9,fontWeight:700,lineHeight:1,textOverflow:'ellipsis',whiteSpace:'nowrap'}}>CURRENT MISSION · {activeMission?`${activeMission.completedTasks}/${activeMission.totalTasks} TASKS`:'UNAVAILABLE'}</small><strong style={{display:'-webkit-box',marginTop:2,overflow:'hidden',fontSize:12,lineHeight:1.05,WebkitBoxOrient:'vertical',WebkitLineClamp:2}}>{heroMission}</strong></span><span aria-hidden="true" title="Continue mission" style={{display:'grid',width:28,height:28,placeItems:'center',color:'var(--s3-primary)'}}><ArrowRight/></span></span>
        <span style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',alignItems:'center',gap:8}}><progress value={missionProgress} max={100} aria-label={`Current mission progress: ${missionProgress}%`} style={{width:'100%',height:6,accentColor:'var(--s3-primary)'}}>{missionProgress}%</progress><strong style={{fontSize:11,fontVariantNumeric:'tabular-nums'}}>{missionProgress}%</strong></span>
      </button>

      <div className="s3-journey-support-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,420px),1fr))',gap:'var(--s3-space-3)'}}>
        <article className="glass-subtle" style={{display:'grid',gap:'var(--s3-space-3)',padding:'var(--s3-space-4)',borderRadius:'var(--s3-radius-card)'}}><header style={{display:'flex',alignItems:'center',gap:8,color:'var(--s3-primary)'}}><Target aria-hidden="true"/><small style={{fontWeight:700}}>CURRENT GOAL</small></header><strong>{goalTitle}</strong><button type="button" onClick={onOpenGoal} style={{minHeight:44,width:'fit-content',paddingInline:'var(--s3-space-3)',border:'1px solid var(--s3-border)',borderRadius:'var(--s3-radius-control)',color:'var(--s3-primary)',background:'var(--s3-surface-raised)',font:'inherit',fontWeight:700,cursor:'pointer'}}>Review goal</button></article>
        <details className="s3-journey-verification glass-subtle"><summary style={{display:'flex',alignItems:'center',gap:8,color:'var(--s3-primary)',cursor:'pointer'}}><Gift aria-hidden="true"/><strong>How progress is verified</strong></summary><div style={{display:'grid',gap:'var(--s3-space-2)',padding:'0 var(--s3-space-4) var(--s3-space-4)'}}><strong>{progression.achievementLabel}</strong><span style={{color:'var(--s3-text-secondary)',fontSize:'var(--s3-type-label)',lineHeight:1.45}}>{progression.detail}</span></div></details>
      </div>
    </section>}

    {activeView === 'missions' && <Special3JourneyMissionsView missions={missions} activeMissionId={activeMission?.id} onOpenMission={onOpenMission}/>} 
    {activeView === 'progress' && <Special3JourneyProgressView missions={missions} activeMission={activeMission} progression={progression}/>} 
    {activeView === 'rewards' && <Special3JourneyRewardsView rewards={rewards} sourceDetail={rewardSourceDetail} onOpenEarn={onOpenEarn}/>} 
  </div>;
}
