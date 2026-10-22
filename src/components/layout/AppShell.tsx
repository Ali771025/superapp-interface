import React, { createContext, useContext } from 'react';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { useLocation } from 'react-router-dom';
import { productByRoute } from '../../data/productRegistry';
import { useEternityUserState } from '../../lib/userState';
import { MobileUnifiedShell } from './MobileUnifiedShell';
import { GuestProductExperience } from '../journey/GuestProductExperience';
import { isSpecial3ShellEnabled } from '../../special3/shell/featureFlag';
import { RouteLoading } from '../ui/RouteLoading';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showTopBar?: boolean;
  showBottomNav?: boolean;
  noPadding?: boolean;
  fillHeight?: boolean;
  wide?: boolean;
  showPageTopic?: boolean;
  showJourneyPresence?: boolean;
}

const EmbeddedWorkspaceContext = createContext(false);
const Special3Shell = React.lazy(async () => {
  const module = await import('../../special3/shell/Special3Shell');
  return { default: module.Special3Shell };
});

export function EmbeddedWorkspace({ children }: { children: React.ReactNode }) {
  return <EmbeddedWorkspaceContext.Provider value>{children}</EmbeddedWorkspaceContext.Provider>;
}

export function AppShell({
  children,
  title,
  showBack,
  showTopBar = true,
  showBottomNav = true,
  noPadding = false,
  fillHeight = false,
  wide = false,
  showPageTopic = true,
  showJourneyPresence = false,
}: AppShellProps) {
  // Compatibility-only input: the standalone Journey Presence surface is globally prohibited.
  void showJourneyPresence;
  const embedded = useContext(EmbeddedWorkspaceContext);
  const { theme } = useTheme();
  const location = useLocation();
  const user = useEternityUserState();
  const currentProduct = productByRoute(`${location.pathname}${location.search}`);
  const guestSensitiveProducts = ['fan','community','rewards','transactions','leaderboard','achievements','levels-eq','reputation','certificates','badges','qora-missions'];
  const gateGuestProduct = Boolean(currentProduct && (currentProduct.requiresWallet || currentProduct.requiresEid || guestSensitiveProducts.includes(currentProduct.id)));
  const isDark = theme === 'dark';
  const topLevelRoutes = new Set(['/home','/achievements','/economy','/era','/profile','/eid','/eid/mint','/shield','/forecast','/fan','/generator','/journey','/qora']);
  const shouldShowBack = showBack ?? !topLevelRoutes.has(location.pathname);
  const workspaceContent = user.isGuest && currentProduct && gateGuestProduct
    ? <GuestProductExperience product={currentProduct} />
    : children;

  if (embedded) return <>{children}</>;

  if (isSpecial3ShellEnabled()) return <React.Suspense fallback={<RouteLoading/>}>
    <Special3Shell
      title={title}
      showBack={shouldShowBack}
      showTopBar={showTopBar}
      noPadding={noPadding}
      wide={wide}
      showPageTopic={showPageTopic}
      showJourneyPresence={false}
      currentProduct={currentProduct}
      fillHeight={fillHeight}
    >
      {workspaceContent}
    </Special3Shell>
  </React.Suspense>;

  return <div className={cn('ds-app-shell qora-app-shell nexus-shell min-h-dvh w-full', isDark ? 'bg-dark-bg' : 'bg-light-bg')}>
    <MobileUnifiedShell
      title={title}
      showBack={shouldShowBack}
      showTopBar={showTopBar}
      noPadding={noPadding}
      wide={wide}
      showPageTopic={showPageTopic}
      showJourneyPresence={false}
      currentProduct={currentProduct}
      fillHeight={fillHeight}
      showBottomNav={showBottomNav}
    >
      {workspaceContent}
    </MobileUnifiedShell>
  </div>;
}
