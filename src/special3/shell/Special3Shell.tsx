import '@fontsource-variable/inter';
import { useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { ProductDefinition } from '../../data/productRegistry';
import { useEternityUserState } from '../../lib/userState';
import { useWallet } from '../../lib/wallet-context';
import { useJourney } from '../../lib/journey/journey-context';
import { JourneyPresence } from '../../components/journey/JourneyPresence';
import { getConfiguredProgressionReadiness } from '../progression';
import { resolveSpecial3ShellMode } from './modes';
import { resolveQoraContext } from './qoraContext';
import { RecoveryHeader, RecoveryPrimaryNav, WorkspaceFrame } from './RecoveryShellComponents';
import { QoraShellProvider } from './QoraShellContext';
import { RecoveryBackSlot } from './RecoveryBackSlot';
import './shell.css';
import './recovery-shell.css';
import '../products/run02-products.css';

export interface Special3ShellProps {
  children: ReactNode; title?: string; showBack: boolean; showTopBar: boolean; noPadding: boolean; wide: boolean;
  showPageTopic: boolean; showJourneyPresence: boolean; currentProduct?: ProductDefinition; fillHeight?: boolean;
}

export function Special3Shell({ children, title, showBack, showTopBar, noPadding, wide, showPageTopic, showJourneyPresence, currentProduct, fillHeight = false }: Special3ShellProps) {
  const location = useLocation();
  const user = useEternityUserState();
  const wallet = useWallet();
  const journey = useJourney();
  const mode = resolveSpecial3ShellMode(location.pathname, location.search);
  const readiness = getConfiguredProgressionReadiness();
  const context = useMemo(() => resolveQoraContext({ pathname:location.pathname, search:location.search, product:currentProduct, user, wallet, journey }), [location.pathname, location.search, currentProduct, user, wallet, journey]);
  return <QoraShellProvider context={context}><Special3ShellComposition children={children} title={title} showBack={showBack} showTopBar={showTopBar} noPadding={noPadding} wide={wide} showPageTopic={showPageTopic} showJourneyPresence={showJourneyPresence} currentProduct={currentProduct} fillHeight={fillHeight} mode={mode} readinessMode={readiness.effectiveMode} pathname={location.pathname}/></QoraShellProvider>;
}

function Special3ShellComposition({ children, title, showBack, showTopBar, noPadding, wide, showJourneyPresence, currentProduct, fillHeight, mode, readinessMode, pathname }: Special3ShellProps & { mode: ReturnType<typeof resolveSpecial3ShellMode>; readinessMode: string; pathname: string }) {
  const isJourneyRoot = pathname === '/journey';
  const targetRoots = new Set(['/home','/achievements','/economy','/era','/profile','/eid','/eid/mint','/shield','/forecast','/fan','/generator']);
  const hasBackSlot = showTopBar && showBack && !targetRoots.has(pathname);
  return <div data-special3 data-s3-shell data-s3-mode={mode} data-s3-progression-mode={readinessMode} data-s3-qora-model="contextual-direct" data-s3-back-slot={String(hasBackSlot)} className={`s3-adaptive-shell recovery-shell ${hasBackSlot ? 'has-back-slot' : ''} ${fillHeight ? 'is-fill-height' : ''} ${wide ? 'is-wide' : ''}`}>
    {showTopBar && <RecoveryHeader title={title} showBack={showBack && pathname !== '/home'}/>} 
    {hasBackSlot && <RecoveryBackSlot/>}
    <div className="recovery-shell__body">
      <RecoveryPrimaryNav placement="desktop"/>
      <section className="s3-workspace" aria-label="Workspace">
        <WorkspaceFrame label={`${currentProduct?.label ?? title ?? 'ETERNITY'} workspace`}>
          {!isJourneyRoot && !noPadding && showJourneyPresence && <JourneyPresence/>}
          <div className={`s3-workspace-content ${noPadding ? 'has-no-padding' : ''}`}>{children}</div>
        </WorkspaceFrame>
      </section>
    </div>
    <RecoveryPrimaryNav placement="mobile"/>
    <div id="s3-action-overlay-region" className="s3-action-overlay-region" aria-live="polite" aria-atomic="true"/>
    <div id="s3-portal-root" data-special3 data-s3-portal-root data-s3-theme={document.documentElement.dataset.theme ?? 'dark'}/>
  </div>;
}
