import {
  Activity,
  Award,
  BadgeCheck,
  BookOpen,
  Bot,
  BrainCircuit,
  BarChart3,
  CircleDollarSign,
  Crosshair,
  FileClock,
  FileText,
  Fingerprint,
  Gift,
  GraduationCap,
  Gavel,
  Handshake,
  KeyRound,
  Landmark,
  ListChecks,
  Medal,
  MessagesSquare,
  Orbit,
  PanelsTopLeft,
  PieChart,
  ReceiptText,
  Repeat2,
  Route,
  ScanFace,
  Scale,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Vote,
  WalletCards,
  type LucideIcon,
} from '@icons';

export type ProductStatus =
  | 'active'
  | 'preview'
  | 'coming-soon'
  | 'temporarily-unavailable'
  | 'deprecated';

export type ProductArea =
  | 'identity'
  | 'intelligence'
  | 'learning'
  | 'participation'
  | 'economy'
  | 'ownership'
  | 'governance';

export type PrimarySpace = 'journey' | 'world' | 'qora' | 'economy' | 'passport';

export interface AccessPolicy {
  minimumLevel?: number;
  safetyReady?: boolean;
  membership?: boolean;
  description: string;
  faDescription: string;
}

export interface ProductDefinition {
  id: string;
  route: string;
  icon: LucideIcon;
  label: string;
  faLabel: string;
  shortDescription: string;
  faShortDescription: string;
  area: ProductArea;
  primarySpace: PrimarySpace;
  status: ProductStatus;
  visibleInExplorer: boolean;
  accessPolicy?: AccessPolicy;
  requiresWallet?: boolean;
  requiresEid?: boolean;
  qoraModuleId?: string;
}

export interface AreaDefinition {
  id: ProductArea;
  label: string;
  faLabel: string;
  description: string;
  faDescription: string;
  icon: LucideIcon;
}

export const AREA_REGISTRY: AreaDefinition[] = [
  { id:'identity', label:'Identity', faLabel:'هویت', description:'Identity, reputation and proof', faDescription:'هویت، اعتبار و مدارک', icon:ScanFace },
  { id:'intelligence', label:'Intelligence', faLabel:'هوشمندی', description:'Guidance, intent and safe actions', faDescription:'راهنمایی، هدف و اقدام امن', icon:BrainCircuit },
  { id:'learning', label:'Learning', faLabel:'یادگیری', description:'Readiness, knowledge and safety', faDescription:'آمادگی، دانش و امنیت', icon:GraduationCap },
  { id:'participation', label:'Participation', faLabel:'مشارکت', description:'Missions, community and contribution', faDescription:'مأموریت، کامیونیتی و مشارکت', icon:Handshake },
  { id:'economy', label:'Economy', faLabel:'اقتصاد', description:'Assets, exchange and rewards', faDescription:'دارایی، تبادل و پاداش', icon:PieChart },
  { id:'ownership', label:'Ownership', faLabel:'مالکیت', description:'On-chain positions and rights', faDescription:'دارایی‌های آنچین و حقوق مالکیت', icon:KeyRound },
  { id:'governance', label:'Governance', faLabel:'حکمرانی', description:'Proposals, voting and influence', faDescription:'پیشنهاد، رأی و اثرگذاری', icon:Scale },
];

const active = 'active' as const;

export const PRODUCT_REGISTRY: ProductDefinition[] = [
  { id:'economy', route:'/journey?view=economy', icon:CircleDollarSign, label:'Economy', faLabel:'اقتصاد', shortDescription:'A verified view of value, liquidity and ownership', faShortDescription:'نمای تأییدشده ارزش، نقدینگی و مالکیت', area:'economy', primarySpace:'economy', status:active, visibleInExplorer:false, requiresWallet:true, qoraModuleId:'economy' },
  { id:'assets', route:'/journey?view=assets', icon:WalletCards, label:'Assets', faLabel:'دارایی‌ها', shortDescription:'Verified token and collectible positions', faShortDescription:'سبد توکن‌ها و دارایی‌های کلکسیونی', area:'economy', primarySpace:'economy', status:active, visibleInExplorer:false, requiresWallet:true, qoraModuleId:'assets' },
  { id:'generator', route:'/generator', icon:Sparkles, label:'Generator', faLabel:'جنریتور', shortDescription:'Generate, sell and manage ETER', faShortDescription:'تولید، فروش و مدیریت ETER', area:'economy', primarySpace:'economy', status:active, visibleInExplorer:true, requiresWallet:true, qoraModuleId:'generator' },
  { id:'swap', route:'/swap', icon:Repeat2, label:'Swap', faLabel:'تبدیل', shortDescription:'Review and prepare token exchanges', faShortDescription:'بررسی و آماده‌سازی تبدیل توکن', area:'economy', primarySpace:'economy', status:active, visibleInExplorer:true, requiresWallet:true, qoraModuleId:'swap' },
  { id:'rewards', route:'/earn', icon:Gift, label:'Reward', faLabel:'پاداش', shortDescription:'Canonical Economy workspace for classified Reward sources', faShortDescription:'محیط اصلی اقتصاد برای منابع طبقه‌بندی‌شده پاداش', area:'economy', primarySpace:'economy', status:active, visibleInExplorer:false, requiresWallet:true, qoraModuleId:'rewards' },
  { id:'transactions', route:'/transactions', icon:ReceiptText, label:'Transaction History', faLabel:'تاریخچه تراکنش', shortDescription:'Review indexed wallet activity', faShortDescription:'مرور فعالیت ایندکس‌شده کیف پول', area:'economy', primarySpace:'economy', status:active, visibleInExplorer:true, requiresWallet:true },

  { id:'shield', route:'/shield', icon:ShieldCheck, label:'SHIELD', faLabel:'شیلد', shortDescription:'ETERNITY Insurance Policy (EIP) financial protection product', faShortDescription:'محصول حفاظت مالی اترنیتی', area:'ownership', primarySpace:'economy', status:active, visibleInExplorer:true, requiresWallet:true, requiresEid:true, qoraModuleId:'shield', accessPolicy:{ safetyReady:true, description:'Safety readiness is required before minting SHIELD.', faDescription:'برای ساخت، آمادگی امنیتی لازم است.' } },
  { id:'ees', route:'/stock', icon:Landmark, label:'STOCK', faLabel:'استاک', shortDescription:'ETERNITY Electoral Stock (EES): ownership, distributions and voting rights', faShortDescription:'مالکیت، توزیع و حق رأی', area:'ownership', primarySpace:'economy', status:active, visibleInExplorer:true, requiresWallet:true, requiresEid:true, qoraModuleId:'ees', accessPolicy:{ minimumLevel:4, safetyReady:true, description:'Minting requires EID, safety readiness and the required level.', faDescription:'ساخت به EID، آمادگی امنیتی و سطح لازم نیاز دارد.' } },

  { id:'fan', route:'/fan', icon:Orbit, label:'FAN', faLabel:'فن', shortDescription:'FAN Community membership, growth path and network income', faShortDescription:'عضویت، مسیر رشد و درآمد شبکه', area:'participation', primarySpace:'world', status:active, visibleInExplorer:true, qoraModuleId:'fan' },
  { id:'forecast', route:'/forecast', icon:BarChart3, label:'Forecast', faLabel:'پیش‌بینی', shortDescription:'Prediction cycles, results and claims', faShortDescription:'چرخه‌های پیش‌بینی، نتایج و دریافت', area:'participation', primarySpace:'world', status:active, visibleInExplorer:true, requiresWallet:true, qoraModuleId:'forecast' },
  { id:'missions', route:'/journey?view=missions', icon:Target, label:'Missions', faLabel:'مأموریت‌ها', shortDescription:'Goal-based paths and verified tasks', faShortDescription:'مسیرهای هدف‌محور و تسک‌های کوچک', area:'participation', primarySpace:'journey', status:active, visibleInExplorer:false, qoraModuleId:'missions' },
  { id:'referral', route:'/fan/referrals', icon:Route, label:'Referral', faLabel:'معرفی', shortDescription:'Invitation identity and referral quality', faShortDescription:'هویت دعوت و کیفیت معرفی', area:'participation', primarySpace:'world', status:active, visibleInExplorer:true, requiresEid:true },
  { id:'leaderboard', route:'/leaderboard', icon:Trophy, label:'Leaderboard', faLabel:'رتبه‌بندی', shortDescription:'Transparent ecosystem participation ranks', faShortDescription:'رتبه‌های شفاف مشارکت در اکوسیستم', area:'participation', primarySpace:'passport', status:active, visibleInExplorer:true },

  { id:'eid', route:'/eid/mint', icon:Fingerprint, label:'EID', faLabel:'EID', shortDescription:'Create and manage a unified ecosystem name', faShortDescription:'ساخت و مدیریت نام یکپارچه اکوسیستم', area:'identity', primarySpace:'passport', status:active, visibleInExplorer:true, requiresWallet:true, qoraModuleId:'eid' },
  { id:'achievements', route:'/achievements', icon:Award, label:'Achievements', faLabel:'دستاوردها', shortDescription:'Milestones proven by verified activity', faShortDescription:'نقاط عطف اثبات‌شده با فعالیت معتبر', area:'identity', primarySpace:'passport', status:active, visibleInExplorer:true },
  { id:'levels-eq', route:'/progress', icon:Activity, label:'Levels & EQ', faLabel:'سطح و EQ', shortDescription:'Progress thresholds and verified EQ', faShortDescription:'آستانه‌های رشد و EQ تأییدشده', area:'identity', primarySpace:'passport', status:active, visibleInExplorer:true },
  { id:'reputation', route:'/journey?passport=reputation', icon:BadgeCheck, label:'Reputation & Trust', faLabel:'اعتبار و اعتماد', shortDescription:'Quality and history of participation', faShortDescription:'کیفیت و سابقه مشارکت', area:'identity', primarySpace:'passport', status:active, visibleInExplorer:true },
  { id:'certificates', route:'/certificates', icon:ScrollText, label:'Certificates', faLabel:'گواهی‌ها', shortDescription:'Verified learning credentials', faShortDescription:'اعتبارنامه‌های یادگیری تأییدشده', area:'identity', primarySpace:'passport', status:active, visibleInExplorer:true },
  { id:'badges', route:'/achievements?view=badges', icon:Medal, label:'Badges', faLabel:'نشان‌ها', shortDescription:'Visible proofs of meaningful milestones', faShortDescription:'نشانه‌های قابل مشاهده نقاط عطف', area:'identity', primarySpace:'passport', status:active, visibleInExplorer:true },

  { id:'edge', route:'/readiness', icon:BookOpen, label:'EDGE', faLabel:'EDGE', shortDescription:'Guided Web3 learning and readiness', faShortDescription:'یادگیری هدایت‌شده وب۳ و آمادگی', area:'learning', primarySpace:'world', status:active, visibleInExplorer:true, qoraModuleId:'edge' },
  { id:'readiness', route:'/readiness', icon:ListChecks, label:'Readiness', faLabel:'آمادگی', shortDescription:'Understand prerequisites before actions', faShortDescription:'درک پیش‌نیازها پیش از اقدام', area:'learning', primarySpace:'world', status:active, visibleInExplorer:true },
  { id:'safety-learning', route:'/readiness?topic=safety', icon:ShieldAlert, label:'Safety Learning', faLabel:'آموزش امنیت', shortDescription:'Wallet, signature and transaction safety', faShortDescription:'امنیت کیف پول، امضا و تراکنش', area:'learning', primarySpace:'world', status:active, visibleInExplorer:true },

  { id:'era', route:'/era', icon:Gavel, label:'ERA Governance', faLabel:'حکمرانی ERA', shortDescription:'Understand proposals and collective decisions', faShortDescription:'درک پیشنهادها و تصمیم‌های جمعی', area:'governance', primarySpace:'world', status:active, visibleInExplorer:true, requiresWallet:true, requiresEid:true, qoraModuleId:'era' },
  { id:'dao', route:'/era', icon:Users, label:'DAO', faLabel:'دائو', shortDescription:'On-chain ecosystem governance', faShortDescription:'حکمرانی آنچین اکوسیستم', area:'governance', primarySpace:'world', status:active, visibleInExplorer:true },
  { id:'proposals', route:'/era/proposals', icon:FileText, label:'Proposals', faLabel:'پیشنهادها', shortDescription:'Review active and completed proposals', faShortDescription:'مرور پیشنهادهای فعال و تکمیل‌شده', area:'governance', primarySpace:'world', status:active, visibleInExplorer:true },
  { id:'voting', route:'/era/vote', icon:Vote, label:'Voting', faLabel:'رأی‌گیری', shortDescription:'Review eligibility before choosing', faShortDescription:'بررسی شرایط پیش از انتخاب', area:'governance', primarySpace:'world', status:active, visibleInExplorer:true, requiresWallet:true, requiresEid:true },
  { id:'governance-history', route:'/era/proposals?view=history', icon:FileClock, label:'Governance History', faLabel:'تاریخچه حکمرانی', shortDescription:'Past proposals and execution status', faShortDescription:'پیشنهادهای قبلی و وضعیت اجرا', area:'governance', primarySpace:'world', status:active, visibleInExplorer:true },

  { id:'qora', route:'/qora', icon:Bot, label:'QORA', faLabel:'کورا', shortDescription:'AI-guided entrance to ETERNITY', faShortDescription:'دروازه هوشمند و راهنمای اترنیتی', area:'intelligence', primarySpace:'qora', status:active, visibleInExplorer:true, qoraModuleId:'qora' },
  { id:'qora-missions', route:'/qora/missions', icon:Crosshair, label:'QORA Missions', faLabel:'مأموریت‌های کورا', shortDescription:'Recommendations connected to verified goals', faShortDescription:'پیشنهادهای متصل به اهداف تأییدشده', area:'intelligence', primarySpace:'qora', status:active, visibleInExplorer:true, qoraModuleId:'qora-missions' },
  { id:'qora-history', route:'/qora?view=history', icon:MessagesSquare, label:'QORA History', faLabel:'تاریخچه کورا', shortDescription:'Conversation history scoped to your session', faShortDescription:'تاریخچه گفتگو محدود به نشست شما', area:'intelligence', primarySpace:'qora', status:active, visibleInExplorer:true },
  { id:'qora-actions', route:'/qora?view=actions', icon:PanelsTopLeft, label:'Action Cards', faLabel:'کارت‌های اقدام', shortDescription:'Reviewable actions that never sign for you', faShortDescription:'اقدام‌های قابل بررسی بدون امضای خودکار', area:'intelligence', primarySpace:'qora', status:active, visibleInExplorer:true },
];

export const EXPLORER_PRODUCTS = PRODUCT_REGISTRY.filter((product) => product.visibleInExplorer && product.status === 'active');

export function productsForArea(area: ProductArea) {
  return EXPLORER_PRODUCTS.filter((product) => product.area === area);
}

export function productByRoute(locationValue: string) {
  const [pathname, query = ''] = locationValue.split('?');
  const search = new URLSearchParams(query);
  const candidates = PRODUCT_REGISTRY.filter((product) => {
    const [routePath, routeQuery = ''] = product.route.split('?');
    const pathMatches = pathname === routePath || pathname.startsWith(`${routePath}/`);
    if (!pathMatches) return false;
    const required = new URLSearchParams(routeQuery);
    return [...required.entries()].every(([key, value]) => search.get(key) === value);
  });
  return candidates.sort((a, b) => {
    const [aPath, aQuery = ''] = a.route.split('?');
    const [bPath, bQuery = ''] = b.route.split('?');
    const aScore = aPath.length * 10 + [...new URLSearchParams(aQuery)].length;
    const bScore = bPath.length * 10 + [...new URLSearchParams(bQuery)].length;
    return bScore - aScore;
  })[0];
}

export function productById(id: string) {
  return PRODUCT_REGISTRY.find((product) => product.id === id);
}
