import { useMemo } from 'react';
import { mockUser } from '../data/mockAssets';
import { IS_PREVIEW_MODE } from './contracts/contractConfig';
import { useWallet } from './wallet-context';

export type EternityUserState =
  | 'guest'
  | 'wallet-connected'
  | 'wrong-network'
  | 'connected-without-eid'
  | 'member'
  | 'returning-member'
  | 'loading'
  | 'syncing'
  | 'indexer-delayed'
  | 'demo-preview'
  | 'error';

export interface UserProgressSnapshot {
  state: EternityUserState;
  isGuest: boolean;
  isDemo: boolean;
  walletConnected: boolean;
  correctNetwork: boolean;
  hasEid: boolean;
  isMember: boolean;
  safetyReady: boolean;
  level: number;
  eq: number;
  starLevel: number;
}

export function useEternityUserState(): UserProgressSnapshot {
  const wallet = useWallet();
  return useMemo(() => {
    if (!wallet.isConnected) {
      return {
        state:'guest',
        isGuest:true,
        isDemo:false,
        walletConnected:false,
        correctNetwork:false,
        hasEid:false,
        isMember:false,
        safetyReady:false,
        level:0,
        eq:0,
        starLevel:0,
      };
    }
    if (!wallet.isCorrectNetwork) {
      return {
        state:'wrong-network',
        isGuest:false,
        isDemo:false,
        walletConnected:true,
        correctNetwork:false,
        hasEid:false,
        isMember:false,
        safetyReady:false,
        level:0,
        eq:0,
        starLevel:0,
      };
    }
    if (IS_PREVIEW_MODE) {
      return {
        state:'demo-preview',
        isGuest:false,
        isDemo:true,
        walletConnected:true,
        correctNetwork:true,
        hasEid:Boolean(mockUser.primaryEid),
        isMember:true,
        safetyReady:true,
        level:mockUser.achievementProgress?.level ?? 0,
        eq:mockUser.eqPoints,
        starLevel:mockUser.starLevel,
      };
    }
    return {
      state:'connected-without-eid',
      isGuest:false,
      isDemo:false,
      walletConnected:true,
      correctNetwork:true,
      hasEid:false,
      isMember:false,
      safetyReady:false,
      level:0,
      eq:0,
      starLevel:0,
    };
  }, [wallet.isConnected, wallet.isCorrectNetwork]);
}

export type JourneyStageId = 'arrival' | 'identity' | 'learning' | 'participation' | 'economy' | 'ownership' | 'governance';
export type JourneyStageStatus = 'complete' | 'current' | 'available' | 'requirements-incomplete';

export interface JourneyStage {
  id: JourneyStageId;
  label: string;
  faLabel: string;
  route: string;
  status: JourneyStageStatus;
  reason: string;
  faReason: string;
  progress: number;
}

export function buildJourney(snapshot: UserProgressSnapshot): JourneyStage[] {
  const identityComplete = snapshot.hasEid;
  const learningComplete = snapshot.safetyReady;
  const participationComplete = snapshot.isMember;
  const economyAvailable = snapshot.walletConnected && snapshot.correctNetwork;
  const ownershipAvailable = snapshot.level >= 4 && identityComplete && learningComplete;
  const governanceAvailable = ownershipAvailable;
  const firstIncomplete =
    !identityComplete ? 'identity'
      : !learningComplete ? 'learning'
        : !participationComplete ? 'participation'
          : !economyAvailable ? 'economy'
            : !ownershipAvailable ? 'ownership'
              : !governanceAvailable ? 'governance'
                : null;
  const statusFor = (id: JourneyStageId, complete: boolean, available = true): JourneyStageStatus => {
    if (complete) return 'complete';
    if (id === firstIncomplete) return 'current';
    return available ? 'available' : 'requirements-incomplete';
  };
  return [
    { id:'arrival', label:'Arrival', faLabel:'ورود', route:'/qora', status:'complete', reason:'You entered ETERNITY and can explore without a wallet.', faReason:'وارد اترنیتی شده‌اید و بدون کیف پول می‌توانید کاوش کنید.', progress:100 },
    { id:'identity', label:'Identity', faLabel:'هویت', route:snapshot.hasEid ? '/profile' : '/eid/mint', status:statusFor('identity', identityComplete), reason:identityComplete ? 'Your EID is active.' : 'Create an EID when you are ready to establish identity.', faReason:identityComplete ? 'EID شما فعال است.' : 'برای شکل‌دادن هویت، هر زمان آماده بودید EID بسازید.', progress:identityComplete ? 100 : 0 },
    { id:'learning', label:'Learning', faLabel:'یادگیری', route:'/readiness', status:statusFor('learning', learningComplete), reason:learningComplete ? 'Safety readiness is complete.' : 'A short safety path prepares you for on-chain actions.', faReason:learningComplete ? 'آمادگی امنیتی کامل است.' : 'یک مسیر کوتاه امنیتی شما را برای اقدامات آنچین آماده می‌کند.', progress:learningComplete ? 100 : 0 },
    { id:'participation', label:'Participation', faLabel:'مشارکت', route:'/missions', status:statusFor('participation', participationComplete), reason:participationComplete ? 'Your participation record is active.' : 'Choose a mission or explore FAN Community.', faReason:participationComplete ? 'سابقه مشارکت شما فعال است.' : 'یک مأموریت انتخاب کنید یا FAN Community را بررسی کنید.', progress:participationComplete ? 100 : 0 },
    { id:'economy', label:'Economy', faLabel:'اقتصاد', route:'/economy', status:statusFor('economy', false, economyAvailable), reason:economyAvailable ? 'Verified economic tools are available for review.' : 'Connect on Polygon to load verified economic state.', faReason:economyAvailable ? 'ابزارهای اقتصادی تأییدشده قابل بررسی‌اند.' : 'برای دریافت وضعیت اقتصادی معتبر، به Polygon متصل شوید.', progress:0 },
    { id:'ownership', label:'Ownership', faLabel:'مالکیت', route:'/shield', status:statusFor('ownership', false, learningComplete), reason:learningComplete ? 'Explore SHIELD and STOCK; every ownership action remains user-confirmed.' : 'Explore ownership now; complete safety readiness before minting.', faReason:learningComplete ? 'SHIELD و STOCK را بررسی کنید؛ هر اقدام مالکیت به تأیید شما نیاز دارد.' : 'مالکیت را بررسی کنید؛ پیش از ساخت، آمادگی امنیتی را کامل کنید.', progress:0 },
    { id:'governance', label:'Governance', faLabel:'حکمرانی', route:'/era', status:statusFor('governance', false, governanceAvailable), reason:governanceAvailable ? 'Governance eligibility can be verified on-chain.' : 'Explore governance before you become eligible to vote.', faReason:governanceAvailable ? 'شرایط حکمرانی را می‌توان آنچین بررسی کرد.' : 'پیش از واجد شرایط‌شدن برای رأی، حکمرانی را بررسی کنید.', progress:0 },
  ];
}

export function nextBestStage(snapshot: UserProgressSnapshot) {
  return buildJourney(snapshot).find((stage) => stage.status === 'current')
    ?? buildJourney(snapshot).find((stage) => stage.status === 'available')
    ?? buildJourney(snapshot)[0];
}
