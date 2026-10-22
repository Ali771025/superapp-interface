export type RuntimeBinding = {
  wireframeId: string;
  path: string;
  state: string;
  component: string;
  owner: string;
};

const product = (wireframeId:string,path:string,state:string,component:string,owner='Configured product provider'):RuntimeBinding => ({wireframeId,path,state,component,owner});
const virtual = (wireframeId:string,path:string,state:string,component:string,owner:string):RuntimeBinding => ({wireframeId,path,state,component,owner});

/**
 * Canonical Phase17.5B.3 route/state identity. The wireframe ID is derived from
 * the public path plus a real UI state; it is never accepted from URL input.
 */
export const runtimeBindings:RuntimeBinding[] = [
  product('WF-SYS-SHELL','/home','global-shell','GlobalAppShell','System shell'),
  product('WF-HOME-01','/home','overview','HomeMissionControl','System and product providers'),
  product('WF-ACH-01','/journey','overview','AchievementOverview','Journey provider'),
  product('WF-ECO-01','/economy','overview','EconomyControlRoom','Economy providers'),
  product('WF-ERA-01','/era','overview','EraGovernanceOverview','ERA provider'),
  product('WF-PRO-01','/profile','overview','ProfileIdentitySurface','Identity providers'),
  product('WF-SYS-02-QORA','/qora','overview','QoraIntelligenceRoom','QORA provider'),
  product('WF-EID-01','/eid','overview','EidOverview','EID provider'),
  product('WF-EID-02','/eid/mint','overview','EidMintWorkspace','EID provider + wallet authorization'),
  product('WF-EID-03','/eid/my-names','overview','OwnedEidGallery','EID provider'),
  product('WF-EID-04','/eid/alex.eter','overview','EidIdentityDetail','EID provider'),
  product('WF-EID-05','/eid/referral','overview','EidReferralWorkspace','EID monetary referral provider'),
  product('WF-EID-06','/eid/settings','overview','EidIdentitySettings','EID provider'),
  product('WF-GEN-01','/generator','overview','GeneratorProductionOverview','Generator provider'),
  product('WF-GEN-02','/generator/generate','overview','GeneratorGenerateWorkspace','Generator provider'),
  product('WF-GEN-03','/generator/sell','overview','GeneratorSellWorkspace','Generator provider + wallet authorization'),
  product('WF-GEN-04','/generator/history','overview','GeneratorActivityLedger','Generator provider'),
  product('WF-SHD-01','/shield','overview','ShieldProtectedValueOverview','SHIELD provider'),
  product('WF-SHD-02','/shield/mint','overview','ShieldMintConfigurator','SHIELD provider + wallet authorization'),
  product('WF-SHD-03','/shield/my-shields','overview','OwnedShieldGallery','SHIELD provider'),
  product('WF-SHD-04','/shield/1000/1','overview','ShieldAssetDetail','SHIELD provider'),
  product('WF-SHD-05','/shield/buyback','overview','ShieldBuybackWorkspace','SHIELD provider + wallet authorization'),
  product('WF-SHD-06','/shield/distribution','overview','ShieldDistributionVisualization','SHIELD provider'),
  product('WF-SHD-07','/shield/rewards','overview','ShieldPrizeWorkspace','SHIELD Prize provider'),
  product('WF-SHD-08','/shield/activity','referral','ShieldReferralNetwork','SHIELD provider'),
  product('WF-SHD-09','/shield/inheritance','overview','ShieldHeirWorkspace','SHIELD provider + wallet authorization'),
  product('WF-SHD-10','/shield/activity','overview','ShieldActivityLedger','SHIELD provider'),
  product('WF-FOR-01','/forecast','overview','ForecastOverview','Forecast provider'),
  product('WF-FOR-02','/forecast/enter','overview','ForecastPredictionTicket','Forecast provider + wallet authorization'),
  product('WF-FOR-03','/forecast/tickets','overview','ForecastTicketHistory','Forecast provider'),
  product('WF-FOR-04','/forecast/results','overview','ForecastResultWorkspace','Forecast provider'),
  product('WF-FOR-05','/forecast/rewards','overview','ForecastPrizeWorkspace','Forecast Prize provider'),
  product('WF-FOR-06','/forecast/treasury','overview','ForecastPreviousTreasury','Previous Forecast Treasury provider'),
  product('WF-FAN-01','/fan','overview','FanCommunityOverview','FanCommunity provider'),
  product('WF-FAN-02','/fan/status','overview','FanStatusWorkspace','FanCommunity provider'),
  product('WF-FAN-03','/fan/network','overview','FanNetworkExplorer','FanCommunity provider'),
  product('WF-FAN-04','/fan/access','overview','FanAccessSummary','Fan Access Matrix'),
  product('WF-FAN-05','/fan/rewards','overview','FanPrizeWorkspace','Fan Prize provider'),
  product('WF-FAN-06','/community','chat','FanCommunityChat','FanCommunity messaging provider'),
  product('WF-FAN-07','/fan/join','overview','FanJoinWorkspace','FanCommunity provider + wallet authorization'),
  product('WF-FAN-08','/fan/referrals','overview','FanReferralWorkspace','FanCommunity provider'),
  product('WF-STK-01','/stock','overview','StockBuyWorkspace','STOCK provider + wallet authorization'),
  product('WF-STK-02','/stock/my-stock','overview','OwnedStockPositions','STOCK provider'),
  product('WF-STK-03','/stock/status','overview','StockStatusWorkspace','STOCK provider'),
  product('WF-STK-04','/stock/prize','overview','StockPrizeWorkspace','STOCK Prize provider'),
  product('WF-STK-05','/stock/referrals','overview','StockReferralCapacity','STOCK provider'),
  product('WF-STK-06','/stock/history','overview','StockActivityLedger','STOCK provider'),
  product('WF-EDGE-01','/readiness','overview','EdgeReadinessOverview','EDGE provider'),
  product('WF-EDGE-02','/readiness','map','EdgeLearningMap','EDGE provider'),
  product('WF-EDGE-03','/readiness','assessment','EdgeAssessmentWorkspace','EDGE provider'),
  product('WF-EDGE-04','/certificates','overview','EdgeCredentialGallery','EDGE provider'),
  product('WF-QOR-01','/qora/missions','overview','QoraMissionWorkspace','QORA recommendation + Journey provider'),
  product('WF-SYS-01','/welcome','overview','WelcomeOnboarding','System onboarding'),
  product('WF-SYS-03','/notifications','overview','NotificationCenter','System notification provider'),
  product('WF-SYS-04','/settings','overview','SystemSettingsOverview','System settings'),
  product('WF-SYS-09','/settings','wallet-network','WalletNetworkSettings','Wallet + network settings'),
  product('WF-SYS-10','/settings','data-permissions','DataPermissionSettings','Privacy and permission settings'),
  product('WF-SYS-05','/help','overview','HelpCenter','System help'),
  product('WF-SYS-06','/contract-details','overview','ContractDetailSurface','Configured contract registry'),
  product('WF-SYS-07','/leaderboard','overview','EternityLeaderboard','Leaderboard provider'),
  product('WF-SYS-08','/__not_found__','not-found','SystemNotFound','System router'),
  product('WF-ACT-01','/generator/generate','configure','GeneratorConfigureAction','Generator action provider'),
  product('WF-ACT-02','/generator/generate','review','GeneratorReviewAction','Generator action provider'),
  product('WF-ACT-03','/generator/generate','wallet-authorization-submitted','GeneratorWalletAuthorization','Wallet authorization'),
  product('WF-ACT-04','/generator/history','confirmed','GeneratorConfirmedReceipt','Generator provider'),
  product('WF-ACT-05','/transactions','failure-ineligible','TransactionFailureState','Product eligibility provider'),
  product('WF-EXP-01','/assets','detail','AssetDetailInspector','Economy providers'),
  product('WF-EXP-02','/shield/my-shields','history','ShieldHistoryInspector','SHIELD provider'),
  product('WF-EXP-03','/forecast/history','network','ForecastHistoryNetwork','Forecast provider'),
  product('WF-EXP-04','/transactions','prize','PrizeTransactionInspector','Product Prize providers'),
  product('WF-ACH-02','/journey','journey','AchievementJourneyMap','Journey provider'),
  product('WF-ACH-03','/missions','overview','MissionWorkspace','Journey provider'),
  product('WF-ACH-04','/achievements','overview','AchievementGallery','Achievement provider'),
  product('WF-ACH-05','/progress','overview','LevelProgressWorkspace','Achievement provider'),
  product('WF-ACH-06','/achievements/ERA-042','overview','AchievementDetail','Achievement provider'),
  product('WF-ECO-02','/assets','overview','EconomyAssetRegistry','Economy providers'),
  product('WF-ECO-03','/earn','overview','EconomyRewardWorkspace','Reward providers'),
  product('WF-ECO-04','/economy','prize','EconomyPrizeOverview','Product Prize providers'),
  product('WF-ECO-05','/transactions','overview','EconomyActivityLedger','Transaction providers'),
  product('WF-ECO-06','/swap','overview','EconomySwapWorkspace','Swap provider + wallet authorization'),
  product('WF-PRO-02','/profile/edit','overview','ProfileIdentityEditor','Identity provider'),
  product('WF-PRO-03','/profile/certificates','overview','ProfileCredentialGallery','Credential providers'),
  product('WF-PRO-04','/profile/community','overview','ProfileCommunitySurface','FanCommunity provider'),
  product('WF-PRO-05','/profile','activity','ProfileActivitySurface','Activity providers'),
  product('WF-PRO-06','/profile/trust-score','overview','ProfileTrustSignals','Identity providers'),
  product('WF-ERA-02','/era/proposals','overview','EraProposalList','ERA provider'),
  product('WF-ERA-03','/era/proposals/ERA-042','overview','EraProposalDetail','ERA provider'),
  product('WF-ERA-04','/era/create','overview','EraSuggestionWorkspace','ERA provider + wallet authorization'),
  product('WF-ERA-05','/era/elite','overview','EraElitePrizeWorkspace','ERA Prize provider'),
  product('WF-ERA-06','/era','history','EraDecisionHistory','ERA provider'),
];

if (runtimeBindings.length !== 90) throw new Error(`Expected 90 runtime bindings, found ${runtimeBindings.length}`);

export function stateFromHash(hash:string, fallback:string){
  const state=decodeURIComponent(hash.replace(/^#/,''));
  return state || fallback;
}

export function resolveRuntimeBinding(pathname:string,state:string){
  const aliases:Record<string,string>={
    '/profile/achievements':'/achievements','/profile/eid':'/eid/my-names','/profile/badges':'/profile/certificates','/profile/access':'/profile/community','/eid/active':'/eid/settings','/eid/invite':'/eid/referral','/trust-score':'/profile/trust-score',
    '/forecast/current':'/forecast/enter','/forecast/my-forecasts':'/forecast/tickets','/forecast/claim':'/forecast/results','/forecast/savior':'/forecast/rewards','/forecast/contributor':'/forecast/rewards','/forecast/pools':'/forecast/rewards','/shield/status':'/shield/activity',
    '/stock/buy':'/stock','/stock/activity':'/stock/history','/stock/metadata':'/stock/status','/era/vote':'/era/proposals',
  };
  let canonical=aliases[pathname]??pathname;
  const dedicated:Record<string,RuntimeBinding>={
    '/generator/burn':virtual('WF-GEN-05','/generator/burn','overview','GeneratorBurnWorkspace','Generator provider + wallet authorization'),
    '/generator/donate':virtual('WF-GEN-06','/generator/donate','overview','GeneratorDonateWorkspace','Generator provider + wallet authorization'),
    '/generator/transfer':virtual('WF-GEN-07','/generator/transfer','overview','GeneratorTransferWorkspace','Generator provider + wallet authorization'),
    '/fan/upgrade':virtual('WF-FAN-09','/fan/upgrade','overview','FanUpgradeWorkspace','FanCommunity provider + wallet authorization'),
    '/fan/renewal':virtual('WF-FAN-10','/fan/renewal','overview','FanRenewalWorkspace','FanCommunity provider + wallet authorization'),
    '/fan/income':virtual('WF-FAN-11','/fan/income','overview','FanIncomeWorkspace','FanCommunity provider'),
    '/fan/prize-pools':virtual('WF-FAN-12','/fan/prize-pools','overview','FanPrizePoolWorkspace','Fan Prize provider'),
    '/fan/legion':virtual('WF-FAN-13','/fan/legion','overview','FanLegionWorkspace','FanCommunity provider'),
    '/fan/indie':virtual('WF-FAN-14','/fan/indie','overview','FanIndieWorkspace','FanCommunity provider'),
    '/stock/transfer':virtual('WF-STK-07','/stock/transfer','overview','StockTransferWorkspace','STOCK provider + wallet authorization'),
    '/stock/dividends':virtual('WF-STK-DERIVED-DIVIDENDS','/stock/dividends','overview','StockDividendWorkspace','STOCK Dividend provider'),
    '/stock/income':virtual('WF-STK-DERIVED-INCOME','/stock/income','overview','StockIncomeWorkspace','STOCK Income provider'),
  };
  if(dedicated[canonical])return {...dedicated[canonical],state};
  if(/^\/eid\/[^/]+$/.test(pathname)&&!['/eid/mint','/eid/my-names','/eid/referral','/eid/settings'].includes(pathname))return {...runtimeBindings.find((entry)=>entry.wireframeId==='WF-EID-04')!,path:pathname,state};
  if(/^\/shield\/\d+\/\d+$/.test(pathname))return {...runtimeBindings.find((entry)=>entry.wireframeId==='WF-SHD-04')!,path:pathname,state};
  if(/^\/shield\/[^/]+$/.test(pathname)&&!['/shield/mint','/shield/my-shields','/shield/distribution','/shield/rewards','/shield/inheritance','/shield/buyback','/shield/activity','/shield/status'].includes(pathname))return {...runtimeBindings.find((entry)=>entry.wireframeId==='WF-SHD-04')!,path:pathname,state};
  if(/^\/achievements\/[^/]+$/.test(pathname))return {...runtimeBindings.find((entry)=>entry.wireframeId==='WF-ACH-06')!,path:pathname,state};
  if(/^\/era\/proposals\/[^/]+$/.test(pathname))return {...runtimeBindings.find((entry)=>entry.wireframeId==='WF-ERA-03')!,path:pathname,state};
  return runtimeBindings.find((entry)=>entry.path===canonical&&entry.state===state)
    ?? runtimeBindings.find((entry)=>entry.path===canonical&&entry.state==='overview')
    ?? runtimeBindings.find((entry)=>entry.path===canonical)
    ?? runtimeBindings.find((entry)=>entry.wireframeId==='WF-SYS-08')!;
}

export function runtimeUrl(binding:RuntimeBinding){
  const defaultState = binding.state==='overview'||binding.state==='chat'||binding.state==='not-found';
  return defaultState ? binding.path : `${binding.path}#${encodeURIComponent(binding.state)}`;
}
