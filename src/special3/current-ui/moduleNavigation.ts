import type { ModuleNavItem } from './EternitySharedUI';

export type ModuleNavigationFamily =
  | 'achievement'
  | 'economy'
  | 'profile'
  | 'eid'
  | 'generator'
  | 'fan'
  | 'forecast'
  | 'shield'
  | 'stock'
  | 'era'
  | 'edge'
  | 'system';

export const moduleNavigation: Readonly<Record<ModuleNavigationFamily, readonly ModuleNavItem[]>> = {
  achievement: [
    { label:'Overview', to:'/journey' }, { label:'Journey', to:'/journey#journey' },
    { label:'Missions', to:'/missions' }, { label:'Achievements', to:'/achievements' }, { label:'Levels', to:'/progress' },
  ],
  economy: [
    { label:'Overview', to:'/economy' }, { label:'Assets', to:'/assets' }, { label:'Rewards', to:'/earn' },
    { label:'Prize', to:'/economy#prize' }, { label:'Activity', to:'/transactions' },
  ],
  profile: [
    { label:'Overview', to:'/profile' }, { label:'Identity', to:'/profile/edit' }, { label:'Assets', to:'/profile/eid' },
    { label:'Community', to:'/profile/community' }, { label:'Activity', to:'/profile#activity' },
  ],
  eid: [
    { label:'Mint', to:'/eid/mint' }, { label:'My EIDs', to:'/eid/my-names' }, { label:'Active', to:'/eid/active' },
    { label:'Referral', to:'/eid/referral' }, { label:'Settings', to:'/eid/settings' },
  ],
  generator: [
    { label:'Overview', to:'/generator' }, { label:'Generate', to:'/generator/generate' }, { label:'Sell', to:'/generator/sell' },
    { label:'Burn', to:'/generator/burn' }, { label:'Donate', to:'/generator/donate' },
    { label:'Transfer', to:'/generator/transfer' }, { label:'History', to:'/generator/history' },
  ],
  fan: [
    { label:'Overview', to:'/fan' }, { label:'Status', to:'/fan/status' }, { label:'Community', to:'/fan/network' },
    { label:'Access', to:'/fan/access' }, { label:'Prize', to:'/fan/rewards' }, { label:'Chat', to:'/community' },
  ],
  forecast: [
    { label:'Overview', to:'/forecast' }, { label:'Prediction', to:'/forecast/enter' },
    { label:'My Predictions', to:'/forecast/tickets' }, { label:'Results', to:'/forecast/results' },
    { label:'Prize', to:'/forecast/rewards' }, { label:'Treasury', to:'/forecast/treasury' },
  ],
  shield: [
    { label:'Overview', to:'/shield' }, { label:'Mint', to:'/shield/mint' }, { label:'My SHIELDs', to:'/shield/my-shields' },
    { label:'Prize', to:'/shield/rewards' }, { label:'Referral', to:'/shield/activity#referral' }, { label:'Heir', to:'/shield/inheritance' },
  ],
  stock: [
    { label:'Overview', to:'/stock' }, { label:'Buy', to:'/stock/buy' }, { label:'My Stocks', to:'/stock/my-stock' },
    { label:'Status', to:'/stock/status' }, { label:'Prize', to:'/stock/prize' },
    { label:'Dividends', to:'/stock/dividends' }, { label:'Income', to:'/stock/income' },
  ],
  era: [
    { label:'Overview', to:'/era' }, { label:'Proposals', to:'/era/proposals' }, { label:'Suggestion', to:'/era/create' },
    { label:'Vote', to:'/era/vote' }, { label:'Prize', to:'/era/elite' },
  ],
  edge: [
    { label:'Readiness', to:'/readiness' }, { label:'Placement', to:'/readiness?view=placement' },
    { label:'Learn', to:'/readiness?view=learn' }, { label:'Credentials', to:'/certificates' }, { label:'Leaderboard', to:'/leaderboard' },
  ],
  system: [
    { label:'Welcome', to:'/welcome' }, { label:'Settings', to:'/settings' }, { label:'Help', to:'/help' },
  ],
} as const;

export function getModuleNavigation(family: ModuleNavigationFamily): ModuleNavItem[] {
  return moduleNavigation[family].map((item) => ({ ...item }));
}
