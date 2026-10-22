import { Gift, Target, Trophy } from '@icons';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell, EmbeddedWorkspace } from '../components/layout/AppShell';
import { useEternityUserState } from '../lib/userState';
import { useJourney } from '../lib/journey/journey-context';
import { buildMissionRegistry, defaultMission } from '../lib/journey/missionRegistry';
import type { MissionDefinition } from '../lib/journey/types';
import { trackJourneyEvent } from '../lib/journey/analytics';
import { CurrentMissionCard } from '../components/journey/CurrentMissionCard';
import { GlowingShadow } from '../components/ui/GlowingShadow';
import { AssetsPage } from './AssetsPage';
import { EconomyPage } from './EconomyPage';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { Special3JourneyOverview } from '../special3/shell/Special3JourneyOverview';
import { missionProgressionPresentation } from '../special3/progression/missionAchievementMappings';
import { special3SystemProvider } from '../special3/providers';
import type { JourneyLandingView } from '../special3/ui/SpecialHorizontalSectionNav';
import { usePathPreference } from '../special3/home/usePathPreference';
import type { PathPreference } from '../special3/home/pathPreference';

type JourneyView = JourneyLandingView | 'assets' | 'economy';
const PATH_LABELS: Record<PathPreference,string> = { investment:'Investment', stockholder:'Stockholder', earn:'Earn', learn:'Learn', development:'Development' };

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const view: JourneyView = ['assets', 'economy', 'missions', 'progress', 'rewards'].includes(requestedView ?? '')
    ? requestedView as JourneyView
    : 'overview';
  const user = useEternityUserState();
  const journey = useJourney();
  const { selectedPath } = usePathPreference();
  const missions = useMemo(() => buildMissionRegistry(user), [user]);
  const activeMission = missions.find((mission) => mission.id === journey.plan?.activeMissionId) ?? defaultMission(user);
  const legacyExpectedEQ = activeMission
    ? Number(activeMission.legacyExpectedImpact.find((item) => item.kind === 'eq')?.value?.replace(/[^\d]/g, '') ?? 0)
    : 0;
  const legacyReceivedEQ = Math.round(legacyExpectedEQ * ((activeMission?.progress ?? 0) / 100));
  const goalProgress = activeMission?.progress ?? 0;
  const specialProgression = missionProgressionPresentation(activeMission?.id);

  useEffect(() => {
    trackJourneyEvent('journey_viewed', { missionId: activeMission?.id, taskId: activeMission?.taskId, route: '/journey' });
  }, [activeMission?.id, activeMission?.taskId]);

  const continueMission = () => {
    if (!activeMission) {
      navigate('/qora?prompt=Help me choose my first goal');
      return;
    }
    journey.startMission({
      missionId: activeMission.id,
      taskId: activeMission.taskId,
      source: 'journey',
      destinationProduct: activeMission.productId,
      expectedAction: activeMission.expectedAction,
      returnPath: '/journey',
    });
    navigate(activeMission.route);
  };

  const openMission = (mission: MissionDefinition) => {
    journey.startMission({
      missionId: mission.id,
      taskId: mission.taskId,
      source: 'journey',
      destinationProduct: mission.productId,
      expectedAction: mission.expectedAction,
      returnPath: '/journey?view=missions',
    });
    navigate(mission.route);
  };

  const special3ShellEnabled = isSpecial3ShellEnabled();
  const specialRewardResult = special3SystemProvider.rewards();

  const workspaceTitle = view === 'overview' ? 'Journey' : view[0].toUpperCase() + view.slice(1);
  const embeddedView = view === 'assets' ? <AssetsPage />
    : view === 'economy' ? <EconomyPage />
    : null;

  return <AppShell title={workspaceTitle} wide showJourneyPresence={false}>
    {embeddedView ? <EmbeddedWorkspace><div className="journey-embedded-view" data-journey-view={view}>{embeddedView}</div></EmbeddedWorkspace> :
    special3ShellEnabled ? <Special3JourneyOverview
      goalTitle={journey.plan?.goalTitle ?? activeMission?.goal ?? 'Define your first goal with QORA'}
      progression={specialProgression}
      activePathLabel={selectedPath ? PATH_LABELS[selectedPath] : 'Not selected'}
      activeMission={activeMission}
      missions={missions}
      rewards={specialRewardResult.state === 'ready' ? specialRewardResult.data : null}
      rewardSourceDetail={specialRewardResult.detail}
      activeView={view as JourneyLandingView}
      onViewChange={(nextView) => {
        if (nextView === 'missions') navigate('/journey?view=missions');
        else if (nextView === 'progress') navigate('/journey?view=progress');
        else if (nextView === 'rewards') navigate('/journey?view=rewards');
        else navigate('/journey');
      }}
      onOpenGoal={() => navigate('/qora?prompt=I want to review and change my current goal')}
      onContinueMission={continueMission}
      onOpenMission={openMission}
      onOpenEarn={() => navigate('/earn')}
    /> : <div className="journey-vnext">
      <GlowingShadow className="journey-goal-card journey-home-tile" role="link" tabIndex={0} onClick={() => navigate('/qora?prompt=I want to review and change my current goal')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate('/qora?prompt=I want to review and change my current goal'); }} aria-label="Open current goal">
        <header className="journey-tile-heading"><Target size={26}/><div className="journey-goal-copy"><span>GOAL</span><h2>{journey.plan?.goalTitle ?? activeMission?.goal ?? 'Define your first goal with QORA'}</h2><p>Review or update your current direction</p></div></header>
        <div className="journey-goal-progress">
          <header><strong>{goalProgress}%</strong><span><b>{legacyReceivedEQ}</b> / {legacyExpectedEQ} EQ</span></header>
          <div role="progressbar" aria-label="Current goal progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={goalProgress}>
            <i style={{ width: `${goalProgress}%` }}/>
          </div>
        </div>
      </GlowingShadow>

      <CurrentMissionCard title={activeMission?.title ?? 'Choose your first mission with QORA'} expectedEQ={legacyExpectedEQ} onContinue={continueMission}/>

      <GlowingShadow className="journey-leaderboard-card journey-home-tile" role="link" tabIndex={0} onClick={() => navigate('/leaderboard')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate('/leaderboard'); }} aria-label="Open leaderboard">
        <header className="journey-tile-heading"><Trophy size={24}/><div><small>LEADERBOARD</small><strong>Open ranking</strong><p>Provider-supplied participation positions</p></div></header>
      </GlowingShadow>

      <GlowingShadow className="journey-reward-card journey-home-tile" role="link" tabIndex={0} onClick={() => navigate('/earn')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate('/earn'); }} aria-label="Open Economy reward workspace">
        <header className="journey-tile-heading"><Gift size={24}/><div><small>REWARD</small><strong>Economy reward workspace</strong><p>Review provider-classified Reward sources</p></div></header>
      </GlowingShadow>
    </div>}
  </AppShell>;
}
