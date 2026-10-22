export type FanStar = 0 | 1 | 2 | 3 | 4;
export type FanGeneration = 'GENESIS' | 'EMERGENCE';
export type FanRenewalState = 'before-window' | 'open' | 'missed' | 'exempt' | 'not-applicable';
export type FanLegendRank = 'None' | 'Legend' | '1-Star Legend' | '2-Star Legend' | '3-Star Legend' | '4-Star Legend' | 'Elite Legend';
export type FanProviderEvidence = 'met' | 'unmet' | 'unknown';
export type FanQualification = 'qualified' | 'not-qualified' | 'unknown';

export interface FanMembershipState {
  active: boolean;
  fanStar: FanStar;
  previousFanStar?: FanStar;
  indie: boolean;
  generation?: FanGeneration;
  legId?: string;
  legendRank: FanLegendRank;
  ecosystemEarningsUsdEquivalent: number;
  ecosystemEarningsETERAmount?: number;
  /** Upstream identity bound at registration. */
  referrerCode?: string | null;
  /** Provider-owned identity this member shares with future referees. */
  ownReferralCode?: string;
  /** Provider/referral-service-owned invitation link. */
  inviteLink?: string;
  renewal: FanRenewalState;
  renewalDate?: string;
  downgradeTarget?: '1-Star';
  directs: number;
  activeNetwork: number;
  totalNetwork: number;
  quality: number;
}

export interface FanLegendRequirement {
  id: string;
  label: string;
  requiredRank: FanLegendRank;
  directCountRequired: number;
  providerEvidence?: FanProviderEvidence;
}

export interface FanLegendState {
  rank: FanLegendRank;
  requirements: FanLegendRequirement[];
  source: 'preview' | 'live';
}

export interface FanMemberNode { id:string; parentId:string|null; name:string; wallet:string; stars:FanStar; generation?:FanGeneration; level:number; directs:number; score:number; active:boolean }
export interface FanMessage { id:string; recipient:string; body:string; time:string; direction:'incoming'|'outgoing'; sender?:string }
export interface FanNetworkState {
  source: 'preview' | 'live';
  sourceLabel: string;
  available: boolean;
  disclosure: string;
  members: FanMemberNode[];
  messages: FanMessage[];
  messagingCapability: 'preview-simulation' | 'live-provider' | 'unavailable';
}

export interface FanQuote {
  id: string;
  version: number;
  operation: 'join' | 'upgrade' | 'renew';
  target: FanStar | 'indie';
  referralCode: string | null;
  usdBasis: number;
  amountETER: number;
  token: 'ETER';
  eligible: boolean;
  reason?: string;
  preview: boolean;
}

export interface FanMultiLevelRow {
  level: 1|2|3|4|5|6|7|8|9|10|11|12|13|14;
  protocolPercent: number;
  eligibleAncestors?: number;
  amountETER?: number;
}

export interface FanMatchingRow {
  fanStar: 1|2|3|4;
  layer: 1|2|3|4;
  protocolPercent: number;
  amountETER?: number;
}

export interface FanPrizePoolState {
  id: 'star-1'|'star-2'|'star-3'|'star-4'|'starred-legend'|'leg-prize';
  name: string;
  sharePercent: number;
  qualification: FanQualification;
  reason?: string;
  balanceETER?: number;
  entitlementETER?: number;
}

export interface FanLegPrizeState {
  legId: string;
  qualification: FanQualification;
  balanceETER?: number;
  sourceThreshold2000?: FanProviderEvidence;
  sourceThreshold4000?: FanProviderEvidence;
  priorContractEarningsIncluded: boolean;
  awardeeCount?: number;
  entitlementETER?: number;
}

export interface FanJoinIdentity {
  fanStar: FanStar;
  indie: boolean;
  generation: FanGeneration;
  legId: string;
  legendRank: FanLegendRank;
  referrerCode: string | null;
  ownReferralCode?: string;
  inviteLink?: string;
}

export interface FanAccessItem {
  id: string;
  label: string;
  description: string;
  group: 'Community' | 'Income & Matching' | 'Prize gates' | 'Cross-Product gates';
  gateLabel: string;
  gateState: 'unlocked' | 'locked' | 'provider-required';
  source: 'fan-owner' | 'frozen-forecast' | 'frozen-stock' | 'current-system';
  destination?: string;
}

export interface FanProtocolContext {
  source: 'preview' | 'live';
  sourceLabel: string;
  sourceFreshness: 'fresh' | 'stale' | 'unavailable';
  sourceDetail: string;
  generatedAt?: string;
  membership: FanMembershipState;
  rates: { ETER_USD:number };
  quotes: { join:Record<'0'|'1'|'2'|'3'|'indie',FanQuote>; upgrade?:FanQuote; renewal?:FanQuote };
  benefits: string[];
  accessItems?: FanAccessItem[];
  legend: FanLegendState;
  income: { multiLevelRows?:FanMultiLevelRow[]; matchingRows?:FanMatchingRow[]; distributionAmountETER?:number };
  rewards: { prizePools?:FanPrizePoolState[]; currentAwardeePool?:FanPrizePoolState['id']; poolSwitchCapability:boolean; legPrize?:FanLegPrizeState; claimableEntitlementETER?:number };
  network: FanNetworkState;
}

export const FAN_DIRECT_USD = {0:0,1:10,2:50,3:210} as const;
export const FAN_UPGRADE_USD = {'0-1':10,'1-2':40,'2-3':160,'3-4':700} as const;
/** Canonical cumulative Star-path USD basis; provider converts this basis to ETER. */
export const FAN_RENEWAL_USD:Readonly<Record<FanStar,number>> = {0:0,1:10,2:50,3:210,4:910};
/** Phase10 reconciliation markers: ecosystemEarningsETER>=210 was superseded by provider-owned USD-equivalent evidence; quotes still settle with token:'ETER'. */
export const FAN_DISTRIBUTION = [
  ['Personal reward',2],['Burn',5],['Referral',10],['Multi-Level',50],['Matching',15],['Named active Prize Pools',12],['Unassigned current prize-pool allocation · provider-owned',6],
] as const;
export const FAN_MULTI_LEVEL = [12,10,8,7,5,4,6,8,6,4,5,7,8,10] as const;
export const FAN_MATCHING = {1:[0,0,0,0],2:[5,7,0,0],3:[5,7,8,0],4:[5,7,8,10]} as const;
export const FAN_PRIZE_POOLS = [
  {id:'star-1',name:'1-Star Pool',sharePercent:2,condition:'40 direct 1-Star · $300 total earnings settled in ETER'},
  {id:'star-2',name:'2-Star Pool',sharePercent:2,condition:'30 direct 2-Star · $1,000 total earnings settled in ETER'},
  {id:'star-3',name:'3-Star Pool',sharePercent:2,condition:'20 direct 3-Star · $3,000 total earnings settled in ETER'},
  {id:'star-4',name:'4-Star Pool',sharePercent:2,condition:'10 direct 4-Star · $10,000 total earnings settled in ETER'},
  {id:'starred-legend',name:'Starred Legend',sharePercent:2,condition:'Provider qualification required'},
  {id:'leg-prize',name:'LEG Prize',sharePercent:2,condition:'Within assigned LEG'},
] as const;

export const FAN_LEGEND_REQUIREMENTS: Readonly<Record<Exclude<FanLegendRank,'None'|'Legend'>, readonly Omit<FanLegendRequirement,'providerEvidence'>[]>> = {
  '1-Star Legend': [
    {id:'legend-contract',label:'FAN becomes LEGEND through the LEGION contract',requiredRank:'Legend',directCountRequired:0},
    {id:'direct-legend',label:'At least one direct LEGEND',requiredRank:'Legend',directCountRequired:1},
  ],
  '2-Star Legend': [
    {id:'current-1-star',label:'Current rank is 1-Star LEGEND',requiredRank:'1-Star Legend',directCountRequired:0},
    {id:'direct-1-star',label:'At least one direct 1-Star LEGEND',requiredRank:'1-Star Legend',directCountRequired:1},
    {id:'direct-legend',label:'At least one direct LEGEND',requiredRank:'Legend',directCountRequired:1},
  ],
  '3-Star Legend': [
    {id:'current-2-star',label:'Current rank is 2-Star LEGEND',requiredRank:'2-Star Legend',directCountRequired:0},
    {id:'direct-2-star',label:'At least one direct 2-Star LEGEND',requiredRank:'2-Star Legend',directCountRequired:1},
    {id:'direct-1-star',label:'At least one direct 1-Star LEGEND',requiredRank:'1-Star Legend',directCountRequired:1},
    {id:'direct-legend',label:'At least one direct LEGEND',requiredRank:'Legend',directCountRequired:1},
  ],
  '4-Star Legend': [
    {id:'current-3-star',label:'Current rank is 3-Star LEGEND',requiredRank:'3-Star Legend',directCountRequired:0},
    {id:'direct-3-star',label:'At least one direct 3-Star LEGEND',requiredRank:'3-Star Legend',directCountRequired:1},
    {id:'direct-2-star',label:'At least one direct 2-Star LEGEND',requiredRank:'2-Star Legend',directCountRequired:1},
    {id:'direct-1-star',label:'At least one direct 1-Star LEGEND',requiredRank:'1-Star Legend',directCountRequired:1},
    {id:'direct-legend',label:'At least one direct LEGEND',requiredRank:'Legend',directCountRequired:1},
  ],
  'Elite Legend': [
    {id:'current-4-star',label:'Current rank is 4-Star LEGEND',requiredRank:'4-Star Legend',directCountRequired:0},
    {id:'direct-4-star',label:'At least one direct 4-Star LEGEND',requiredRank:'4-Star Legend',directCountRequired:1},
  ],
};

export function normalizeFanReferral(value:string|null|undefined,target:FanQuote['target']):string|null {
  if(target==='indie') return null;
  const normalized=(value??'').trim();
  if(!normalized){if(target===0)throw new Error('0-Star registration requires a valid upstream wallet or unique EID referrer.');return null}
  if(/^0x[a-fA-F0-9]{40}$/.test(normalized)) return normalized.toLowerCase();
  if(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,62}\.ETER$/i.test(normalized)) return normalized.toUpperCase();
  throw new Error('Referral must be a 0x wallet address or a unique NAME.ETER identity.');
}

function referralFingerprint(value:string|null):string {
  const input=value??'none'; let hash=2166136261;
  for(const character of input){hash^=character.charCodeAt(0);hash=Math.imul(hash,16777619)}
  return (hash>>>0).toString(16).padStart(8,'0');
}

export function bindFanJoinQuote(base:FanQuote,referralCode:string|null|undefined):FanQuote {
  if(base.operation!=='join') throw new Error('Only Join quotes can bind a referral identity.');
  const normalized=normalizeFanReferral(referralCode,base.target);
  return {...base,id:`${base.id}-r${referralFingerprint(normalized)}`,referralCode:normalized};
}

export function validateFanQuote(context:FanProtocolContext,quote:FanQuote,operation:FanQuote['operation']):FanQuote {
  if(quote.operation!==operation||quote.token!=='ETER'||!quote.eligible) throw new Error(quote.reason??'Fan quote is not eligible');
  if(operation==='join'&&quote.target===0&&!quote.referralCode) throw new Error('0-Star registration requires a provider-validated upstream referrer.');
  if(operation==='upgrade'&&quote.target===4){
    if(context.membership.fanStar!==3) throw new Error('4-Star upgrade requires current 3-Star membership.');
    if(context.membership.ecosystemEarningsUsdEquivalent<210) throw new Error('4-Star requires at least $210 USD-equivalent ecosystem earnings settled in ETER.');
    if(quote.usdBasis!==700) throw new Error('4-Star upgrade must use the $700 USD-basis provider quote.');
  }
  return quote;
}
