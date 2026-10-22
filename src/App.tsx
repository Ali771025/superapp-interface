import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import './special3/convergence/runtimeEvidenceRegistry';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './lib/ThemeContext';
import { WalletProvider } from './lib/WalletContext';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import { RouteLoading } from './components/ui/RouteLoading';
import { mockUser } from './data/mockAssets';
import { AppModeProvider } from './lib/AppModeContext';
import { getReleaseReadiness } from './lib/contracts/contractConfig';
import { JourneyProvider } from './lib/journey/JourneyContext';

const lazyPage = (loader: () => Promise<Record<string, unknown>>, exportName: string) => lazy(async () => {
  const module = await loader();
  return { default: module[exportName] as ComponentType };
});

const DesignSystemPage = lazyPage(() => import('./pages/DesignSystemPage'), 'DesignSystemPage');
const ExperienceSimulatorPage = lazyPage(() => import('./simulator/ExperienceSimulatorPage'), 'ExperienceSimulatorPage');

const FinalHomePage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalHomePage');
const FinalAchievementPage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalAchievementPage');
const FinalEconomyPage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalEconomyPage');
const FinalEraPage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalEraPage');
const FinalProfilePage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalProfilePage');
const FinalShieldPage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalShieldPage');
const FinalForecastPage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalForecastPage');
const FinalFanPage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalFanPage');
const FinalGeneratorPage = lazyPage(() => import('./special3/convergence/FinalConvergencePages'), 'FinalGeneratorPage');
const CurrentDesignProductPage = lazyPage(() => import('./special3/current-ui/CurrentDesignProductPage'), 'CurrentDesignProductPage');
const QoraFullWorkspace = lazyPage(() => import('./special3/current-ui/QoraFullWorkspace'), 'QoraFullWorkspace');

const AdminOverviewPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminOverviewPage');
const AdminUsersPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminUsersPage');
const AdminModulesPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminModulesPage');
const AdminOnChainLogsPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminOnChainLogsPage');
const AdminOffChainLogsPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminOffChainLogsPage');
const AdminChatLogsPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminChatLogsPage');
const AdminTransactionLogsPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminTransactionLogsPage');
const AdminBackupsPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminBackupsPage');
const AdminAPISettingsPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminAPISettingsPage');
const AdminAuditTrailPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminAuditTrailPage');
const AdminAccessMatrixPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminAccessMatrixPage');
const AdminEidCapabilityPage = lazyPage(() => import('./modules/admin/AdminPages'), 'AdminEidCapabilityPage');

function RequireAdmin({ children }: { children: ReactNode }) {
  return import.meta.env.DEV && mockUser.role === 'admin' ? children : <Navigate to="/journey" replace />;
}

export default function App() {
  const readiness = getReleaseReadiness();
  if (!readiness.ready) {
    return <DeploymentGuard missingContracts={readiness.missingContracts} adaptersAudited={readiness.adaptersAudited}/>;
  }
  return (
    <ThemeProvider>
      <WalletProvider>
        <AppErrorBoundary>
          <AppModeProvider>
          <BrowserRouter>
            <JourneyProvider>
              <SkipLink />
              <Suspense fallback={<RouteLoading />}>
                <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/welcome" element={<CurrentDesignProductPage />} />
                <Route path="/journey" element={<FinalAchievementPage />} />
                <Route path="/home" element={<FinalHomePage />} />
                <Route path="/missions" element={<CurrentDesignProductPage />} />
                <Route path="/progress" element={<CurrentDesignProductPage />} />
                <Route path="/world" element={<Navigate to="/home" replace />} />
                <Route path="/economy" element={<FinalEconomyPage />} />
                <Route path="/assets" element={<CurrentDesignProductPage />} />
                <Route path="/earn" element={<CurrentDesignProductPage />} />
                <Route path="/community" element={<CurrentDesignProductPage />} />
                <Route path="/qora" element={<QoraFullWorkspace />} />

                <Route path="/profile" element={<FinalProfilePage />} />
                <Route path="/profile/edit" element={<CurrentDesignProductPage />} />
                <Route path="/profile/community" element={<CurrentDesignProductPage />} />
                <Route path="/profile/achievements" element={<CurrentDesignProductPage />} />
                <Route path="/profile/eid" element={<CurrentDesignProductPage />} />
                <Route path="/profile/certificates" element={<CurrentDesignProductPage />} />
                <Route path="/profile/badges" element={<CurrentDesignProductPage />} />
                <Route path="/profile/trust-score" element={<CurrentDesignProductPage />} />
                <Route path="/profile/access" element={<CurrentDesignProductPage />} />
                <Route path="/passport" element={<Navigate to="/profile" replace />} />
                <Route path="/notifications" element={<CurrentDesignProductPage />} />
                <Route path="/settings" element={<CurrentDesignProductPage />} />
                <Route path="/transactions" element={<CurrentDesignProductPage />} />
                <Route path="/contract-details" element={<CurrentDesignProductPage />} />
                <Route path="/help" element={<CurrentDesignProductPage />} />
                <Route path="/design-system" element={import.meta.env.DEV ? <DesignSystemPage /> : import.meta.env.VITE_SPECIAL3_PHASE04_GALLERY === 'true' ? <DesignSystemPage /> : <Navigate to="/journey" replace />} />
                <Route path="/experience-lab" element={(import.meta.env.DEV || import.meta.env.VITE_EXPERIENCE_LAB === 'true') ? <ExperienceSimulatorPage /> : <Navigate to="/qora" replace />} />

                <Route path="/swap" element={<CurrentDesignProductPage />} />
                <Route path="/achievements" element={<CurrentDesignProductPage />} />
                <Route path="/achievements/:id" element={<CurrentDesignProductPage />} />

                <Route path="/eid" element={<CurrentDesignProductPage />} />
                <Route path="/eid/search" element={<Navigate to="/eid/mint" replace />} />
                <Route path="/eid/mint" element={<CurrentDesignProductPage />} />
                <Route path="/eid/my-names" element={<CurrentDesignProductPage />} />
                <Route path="/eid/market" element={<Navigate to="/eid/mint" replace />} />
                <Route path="/eid/active" element={<CurrentDesignProductPage />} />
                <Route path="/eid/invite" element={<Navigate to="/eid/referral" replace />} />
                <Route path="/eid/referral" element={<CurrentDesignProductPage />} />
                <Route path="/eid/settings" element={<CurrentDesignProductPage />} />
                <Route path="/eid/:eidName" element={<CurrentDesignProductPage />} />

                <Route path="/readiness" element={<CurrentDesignProductPage />} />
                <Route path="/readiness/articles" element={<Navigate to="/readiness" replace />} />
                <Route path="/readiness/articles/new" element={<Navigate to="/readiness" replace />} />
                <Route path="/readiness/articles/:slug" element={<Navigate to="/readiness" replace />} />
                <Route path="/articles" element={<Navigate to="/readiness" replace />} />
                <Route path="/certificates" element={<CurrentDesignProductPage />} />
                <Route path="/trust-score" element={<CurrentDesignProductPage />} />

                <Route path="/generator" element={<FinalGeneratorPage />} />
                <Route path="/generator/generate" element={<CurrentDesignProductPage />} />
                <Route path="/generator/buy" element={<Navigate to="/generator/generate" replace />} />
                <Route path="/generator/sell" element={<CurrentDesignProductPage />} />
                <Route path="/generator/burn" element={<CurrentDesignProductPage />} />
                <Route path="/generator/donate" element={<CurrentDesignProductPage />} />
                <Route path="/generator/transfer" element={<CurrentDesignProductPage />} />
                <Route path="/generator/history" element={<CurrentDesignProductPage />} />

                <Route path="/fan" element={<FinalFanPage />} />
                <Route path="/fan/join" element={<CurrentDesignProductPage />} />
                <Route path="/fan/upgrade" element={<CurrentDesignProductPage />} />
                <Route path="/fan/renewal" element={<CurrentDesignProductPage />} />
                <Route path="/fan/referrals" element={<CurrentDesignProductPage />} />
                <Route path="/fan/network" element={<CurrentDesignProductPage />} />
                <Route path="/fan/status" element={<CurrentDesignProductPage />} />
                <Route path="/fan/income" element={<CurrentDesignProductPage />} />
                <Route path="/fan/rewards" element={<CurrentDesignProductPage />} />
                <Route path="/fan/prize-pools" element={<CurrentDesignProductPage />} />
                <Route path="/fan/legion" element={<CurrentDesignProductPage />} />
                <Route path="/fan/indie" element={<CurrentDesignProductPage />} />
                <Route path="/fan/access" element={<CurrentDesignProductPage />} />

                <Route path="/forecast" element={<FinalForecastPage />} />
                <Route path="/forecast/enter" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/tickets" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/results" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/claim" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/savior" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/current" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/history" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/treasury" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/my-forecasts" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/rewards" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/contributor" element={<CurrentDesignProductPage />} />
                <Route path="/forecast/pools" element={<CurrentDesignProductPage />} />

                <Route path="/shield" element={<FinalShieldPage />} />
                <Route path="/shield/mint" element={<CurrentDesignProductPage />} />
                <Route path="/shield/my-shields" element={<CurrentDesignProductPage />} />
                <Route path="/shield/distribution" element={<CurrentDesignProductPage />} />
                <Route path="/shield/rewards" element={<CurrentDesignProductPage />} />
                <Route path="/shield/:priceGroup/:tokenId" element={<CurrentDesignProductPage />} />
                <Route path="/shield/:id" element={<CurrentDesignProductPage />} />
                <Route path="/shield/inheritance" element={<CurrentDesignProductPage />} />
                <Route path="/shield/buyback" element={<CurrentDesignProductPage />} />
                <Route path="/shield/activity" element={<CurrentDesignProductPage />} />
                <Route path="/shield/status" element={<CurrentDesignProductPage />} />
                <Route path="/shield/reports/sales" element={<Navigate to="/shield" replace />} />
                <Route path="/insurance/my-shields" element={<Navigate to="/shield/my-shields" replace />} />
                <Route path="/insurance/shield/:id" element={<CurrentDesignProductPage />} />
                <Route path="/insurance/buy-shield" element={<Navigate to="/shield/mint" replace />} />
                <Route path="/insurance/inheritance" element={<Navigate to="/shield/inheritance" replace />} />
                <Route path="/insurance/*" element={<Navigate to="/shield" replace />} />

                <Route path="/stock" element={<CurrentDesignProductPage />} />
                <Route path="/stock/buy" element={<CurrentDesignProductPage />} />
                <Route path="/stock/my-stock" element={<CurrentDesignProductPage />} />
                <Route path="/stock/status" element={<CurrentDesignProductPage />} />
                <Route path="/stock/transfer" element={<CurrentDesignProductPage />} />
                <Route path="/stock/prize" element={<CurrentDesignProductPage />} />
                <Route path="/stock/dividends" element={<CurrentDesignProductPage />} />
                <Route path="/stock/history" element={<CurrentDesignProductPage />} />
                <Route path="/stock/income" element={<CurrentDesignProductPage />} />
                <Route path="/stock/referrals" element={<CurrentDesignProductPage />} />
                <Route path="/stock/activity" element={<CurrentDesignProductPage />} />
                <Route path="/stock/metadata" element={<CurrentDesignProductPage />} />
                <Route path="/stock/reports/sales" element={<Navigate to="/stock/status" replace />} />
                <Route path="/ees/buy" element={<Navigate to="/stock/buy" replace />} />
                <Route path="/ees/my-stocks" element={<Navigate to="/stock/my-stock" replace />} />
                <Route path="/ees/status" element={<Navigate to="/stock/status" replace />} />
                <Route path="/ees/dividends" element={<Navigate to="/stock/dividends" replace />} />
                <Route path="/ees/*" element={<Navigate to="/stock" replace />} />

                <Route path="/era" element={<FinalEraPage />} />
                <Route path="/era/proposals" element={<CurrentDesignProductPage />} />
                <Route path="/era/proposals/:id" element={<CurrentDesignProductPage />} />
                <Route path="/era/create" element={<CurrentDesignProductPage />} />
                <Route path="/era/vote" element={<CurrentDesignProductPage />} />
                <Route path="/era/elite" element={<CurrentDesignProductPage />} />

                <Route path="/qora/missions" element={<QoraFullWorkspace />} />
                <Route path="/qora/social-rewards" element={<Navigate to="/journey" replace />} />
                <Route path="/qora/circles" element={<Navigate to="/journey" replace />} />
                <Route path="/qora/avatar" element={<Navigate to="/qora" replace />} />

                <Route path="/leaderboard" element={<CurrentDesignProductPage />} />
                <Route path="/leaderboard/:tab" element={<Navigate to="/leaderboard" replace />} />

                <Route path="/admin" element={<RequireAdmin><AdminRoutes /></RequireAdmin>} />
                <Route path="/admin/*" element={<RequireAdmin><AdminRoutes /></RequireAdmin>} />
                <Route path="*" element={<CurrentDesignProductPage />} />
                </Routes>
              </Suspense>
            </JourneyProvider>
          </BrowserRouter>
          </AppModeProvider>
        </AppErrorBoundary>
      </WalletProvider>
    </ThemeProvider>
  );
}

function SkipLink() {
  return <a href="#main-content" className="skip-link">Skip to main content</a>;
}

function DeploymentGuard({ missingContracts, adaptersAudited }: { missingContracts: string[]; adaptersAudited: boolean }) {
  return <main className="deployment-guard" id="main-content">
    <section>
      <span>ETERNITY</span>
      <h1>Production data is not configured</h1>
      <p>This build will not display simulated balances or submit placeholder transactions. Configure audited adapters and contract addresses before disabling preview mode.</p>
      {!adaptersAudited && <p><strong>Adapter audit:</strong> incomplete</p>}
      {missingContracts.length > 0 && <><strong>Missing contracts</strong><ul>{missingContracts.map((item) => <li key={item}><code>{item}</code></li>)}</ul></>}
    </section>
  </main>;
}

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminOverviewPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="modules" element={<AdminModulesPage />} />
      <Route path="onchain-logs" element={<AdminOnChainLogsPage />} />
      <Route path="offchain-logs" element={<AdminOffChainLogsPage />} />
      <Route path="chat-logs" element={<AdminChatLogsPage />} />
      <Route path="transaction-logs" element={<AdminTransactionLogsPage />} />
      <Route path="backups" element={<AdminBackupsPage />} />
      <Route path="api-settings" element={<AdminAPISettingsPage />} />
      <Route path="audit-trail" element={<AdminAuditTrailPage />} />
      <Route path="access-matrix" element={<AdminAccessMatrixPage />} />
      <Route path="eid" element={<AdminEidCapabilityPage />} />
      <Route path="achievements" element={<AdminUsersPage />} />
      <Route path="swap-logs" element={<AdminTransactionLogsPage />} />
      <Route path="payment-settings" element={<AdminAPISettingsPage />} />
      <Route path="profile-logs" element={<AdminOffChainLogsPage />} />
    </Routes>
  );
}
