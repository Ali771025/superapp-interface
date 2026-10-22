import {
  FAN_DIRECT_USD,
  FAN_LEGEND_REQUIREMENTS,
  FAN_MATCHING,
  FAN_MULTI_LEVEL,
  FAN_PRIZE_POOLS,
  FAN_RENEWAL_USD,
  FAN_UPGRADE_USD,
  type FanAccessItem,
  type FanLegendRank,
  type FanProtocolContext,
  type FanPrizePoolState,
  type FanQuote,
  type FanStar,
} from '../../../products/fan/fanProtocol';
import { ACCESS_FEATURES, isFeatureUnlocked, type AccessLevelKey } from '../../../../data/accessMatrix';

const ETER_USD=1.35;
const amountETER=(usd:number)=>Number((usd/ETER_USD).toFixed(6));
const quote=(operation:FanQuote['operation'],target:FanQuote['target'],usdBasis:number,version=1):FanQuote=>({
  id:`fan-${operation}-${target}-v${version}`, version, operation, target, referralCode:null,
  usdBasis, amountETER:amountETER(usdBasis), token:'ETER', eligible:true, preview:true,
});

const fixtureMembers=[
  {id:'you',parentId:null,name:'ALEX.ETER',wallet:'0xA1...93F',stars:2 as FanStar,generation:'GENESIS' as const,level:0,directs:4,score:88,active:true},
  {id:'sarah',parentId:'you',name:'SARAH.ETER',wallet:'0xB2...14A',stars:3 as FanStar,generation:'GENESIS' as const,level:1,directs:3,score:92,active:true},
  {id:'amir',parentId:'you',name:'AMIR.ETER',wallet:'0xC3...91D',stars:2 as FanStar,generation:'EMERGENCE' as const,level:1,directs:2,score:79,active:true},
  {id:'nora',parentId:'you',name:'NORA.ETER',wallet:'0xD4...76B',stars:1 as FanStar,generation:'EMERGENCE' as const,level:1,directs:1,score:74,active:true},
  {id:'jules',parentId:'sarah',name:'JULES.ETER',wallet:'0xE5...33C',stars:2 as FanStar,generation:'GENESIS' as const,level:2,directs:1,score:81,active:true},
];
const fixtureMessages=[
  {id:'m1',recipient:'sarah',body:'The provider fixture is ready for review.',time:'09:24',direction:'incoming' as const,sender:'SARAH.ETER'},
  {id:'m2',recipient:'amir',body:'Welcome to the Preview community workspace.',time:'10:08',direction:'outgoing' as const},
];

function nextUpgrade(star:FanStar){
  if(star>=4)return undefined;
  const target=(star+1) as FanStar;
  const usd=FAN_UPGRADE_USD[`${star}-${target}` as keyof typeof FAN_UPGRADE_USD];
  return quote('upgrade',target,usd);
}
function legendRequirements(rank:FanLegendRank){
  if(rank==='Elite Legend')return [];
  const next:Exclude<FanLegendRank,'None'|'Legend'>=rank==='None'||rank==='Legend'?'1-Star Legend':rank==='1-Star Legend'?'2-Star Legend':rank==='2-Star Legend'?'3-Star Legend':rank==='3-Star Legend'?'4-Star Legend':'Elite Legend';
  return FAN_LEGEND_REQUIREMENTS[next].map(item=>{
    if(rank==='None')return {...item,providerEvidence:item.id==='legend-contract'?'unmet' as const:'unknown' as const};
    if(item.id==='legend-contract'||item.id.startsWith('current-'))return {...item,providerEvidence:'met' as const};
    const directRank=item.requiredRank;
    const order:FanLegendRank[]=['None','Legend','1-Star Legend','2-Star Legend','3-Star Legend','4-Star Legend','Elite Legend'];
    return {...item,providerEvidence:order.indexOf(directRank)<order.indexOf(rank)?'met' as const:'unmet' as const};
  });
}

function accessItems(active:boolean,fanStar:FanStar,indie:boolean):FanAccessItem[]{
  const level:AccessLevelKey=!active?'none':indie?'indie':fanStar===0?'fan0':`star${fanStar}` as AccessLevelKey;
  const levelLabel:Record<Exclude<AccessLevelKey,'indie'>,string>={none:'Non-FAN',fan0:'0-Star',star1:'1-Star',star2:'2-Star',star3:'3-Star',star4:'4-Star'};
  const destinations:Record<string,string>={forecast:'/forecast',referral:'/fan/referrals',eid:'/eid','fan-income':'/fan/income','1star-prize':'/fan/prize-pools','2star-prize':'/fan/prize-pools','3star-prize':'/fan/prize-pools','4star-prize':'/fan/prize-pools','forecast-discount':'/forecast','forecast-winners-bonus':'/forecast','starred-savior':'/forecast',ees:'/stock','ees-referrer-bonus':'/stock','eits-prize':'/shield'};
  return ACCESS_FEATURES.map(feature=>{
    const unlocked=isFeatureUnlocked(feature,level);
    const source=feature.id.startsWith('forecast')||feature.id==='starred-savior'?'frozen-forecast' as const:feature.id==='ees'||feature.id==='ees-referrer-bonus'?'frozen-stock' as const:feature.id==='eter-exchange'||feature.id==='eid'||feature.id==='eip'||feature.id==='qdrop'||feature.id==='eits-prize'?'current-system' as const:'fan-owner' as const;
    const group=feature.category==='core'?'Community' as const:feature.category==='income'?'Income & Matching' as const:feature.category==='prizes'?'Prize gates' as const:'Cross-Product gates' as const;
    const required=feature.minLevel==='indie'?'4-Star':levelLabel[feature.minLevel];
    return {id:feature.id,label:feature.label,description:feature.description,group,gateLabel:`Required ${required} · ${unlocked?'unlocked':'locked'}`,gateState:unlocked?'unlocked' as const:'locked' as const,source,destination:destinations[feature.id]};
  });
}

export function buildPreviewFanContext(scenario='default'):FanProtocolContext{
  let fanStar:FanStar=2, previousFanStar:FanStar|undefined, active=true, indie=false, legendRank:FanLegendRank='None';
  let renewal:FanProtocolContext['membership']['renewal']='before-window';
  let ecosystemEarningsUsdEquivalent=168;
  if(scenario==='non-member'||scenario==='join-stale'){active=false;fanStar=0;renewal='not-applicable';ecosystemEarningsUsdEquivalent=0}
  if(scenario==='zero-star'){fanStar=0;ecosystemEarningsUsdEquivalent=0}
  if(scenario==='one-star'){fanStar=1;ecosystemEarningsUsdEquivalent=40}
  if(scenario==='two-star'){fanStar=2;ecosystemEarningsUsdEquivalent=168}
  if(scenario==='four-star'){fanStar=4;ecosystemEarningsUsdEquivalent=1220}
  if(scenario==='three-blocked'){fanStar=3;ecosystemEarningsUsdEquivalent=209.99}
  if(scenario==='three-eligible'){fanStar=3;ecosystemEarningsUsdEquivalent=210}
  if(scenario==='renewal-open'||scenario==='renewal-open-2'){fanStar=2;renewal='open'}
  if(scenario==='renewal-open-1'){fanStar=1;renewal='open'}
  if(scenario==='renewal-open-3'){fanStar=3;renewal='open';ecosystemEarningsUsdEquivalent=420}
  if(scenario==='renewal-open-4'){fanStar=4;renewal='open';ecosystemEarningsUsdEquivalent=1220}
  if(scenario==='renewal-missed'){previousFanStar=3;fanStar=1;renewal='missed';ecosystemEarningsUsdEquivalent=420}
  if(scenario==='indie'){fanStar=4;indie=true;renewal='exempt';legendRank='None';ecosystemEarningsUsdEquivalent=910}
  if(scenario==='legend1'){fanStar=4;renewal='exempt';legendRank='1-Star Legend';ecosystemEarningsUsdEquivalent=2480}
  if(scenario==='legend'){fanStar=4;legendRank='Legend';ecosystemEarningsUsdEquivalent=1800}
  if(scenario==='legend2'){fanStar=4;legendRank='2-Star Legend';ecosystemEarningsUsdEquivalent=3200}
  if(scenario==='legend3'){fanStar=4;legendRank='3-Star Legend';ecosystemEarningsUsdEquivalent=5100}
  if(scenario==='legend4'){fanStar=4;legendRank='4-Star Legend';ecosystemEarningsUsdEquivalent=7600}
  if(scenario==='legend-elite'){fanStar=4;legendRank='Elite Legend';ecosystemEarningsUsdEquivalent=12000}
  const generation=active?(scenario==='emergence'?'EMERGENCE' as const:'GENESIS' as const):undefined;
  const upgrade=active?nextUpgrade(fanStar):undefined;
  if(upgrade?.target===4&&ecosystemEarningsUsdEquivalent<210){upgrade.eligible=false;upgrade.reason='Requires at least $210 USD-equivalent ecosystem earnings settled in ETER.'}
  const poolActuals=new Map<FanPrizePoolState['id'],Pick<FanPrizePoolState,'qualification'|'reason'|'balanceETER'|'entitlementETER'>>([
    ['star-1',{qualification:'not-qualified' as const,reason:'Direct and earnings thresholds not met'}],
    ['star-2',{qualification:'qualified' as const,reason:'Provider qualification confirmed',balanceETER:1480,entitlementETER:24.5}],
    ['star-3',{qualification:'not-qualified' as const,reason:'Direct 3-Star threshold not met'}],
    ['star-4',{qualification:'not-qualified' as const,reason:'Direct 4-Star threshold not met'}],
    ['starred-legend',{qualification:'unknown' as const,reason:'Provider qualification evidence unavailable'}],
    ['leg-prize',{qualification:'unknown' as const,reason:'LEG threshold evidence is incomplete'}],
  ]);
  const context:FanProtocolContext={
    source:'preview',sourceLabel:'Preview · Explicit fixture',sourceFreshness:'fresh',sourceDetail:'Provider-owned Preview fixture. No live or on-chain freshness is asserted.',generatedAt:'2026-08-13T12:00:00Z',
    membership:{active,fanStar,previousFanStar,indie,generation,legId:active?(indie?'LEG-IND-044':'LEG-GEN-014'):undefined,legendRank,ecosystemEarningsUsdEquivalent,ecosystemEarningsETERAmount:amountETER(ecosystemEarningsUsdEquivalent),referrerCode:active?(indie?null:'SPONSOR.ETER'):undefined,ownReferralCode:active?(indie?'INDIE.ETER':'ALEX.ETER'):undefined,inviteLink:active?(indie?'https://example.invalid/invite/INDIE.ETER':'https://example.invalid/invite/ALEX.ETER'):undefined,renewal,renewalDate:active?'2026-11-18':undefined,downgradeTarget:renewal==='missed'?'1-Star':undefined,directs:active?4:0,activeNetwork:active?17:0,totalNetwork:active?24:0,quality:active?88:0},
    rates:{ETER_USD},
    quotes:{
      join:{'0':quote('join',0,FAN_DIRECT_USD[0]),'1':quote('join',1,FAN_DIRECT_USD[1]),'2':quote('join',2,FAN_DIRECT_USD[2]),'3':quote('join',3,FAN_DIRECT_USD[3]),indie:quote('join','indie',910)},
      upgrade,
      renewal:renewal==='open'?quote('renew',fanStar,FAN_RENEWAL_USD[fanStar]):undefined,
    },
    benefits:['Community identity and referral access','Provider-gated protocol income views','FAN prize qualification visibility'],
    accessItems:accessItems(active,fanStar,indie),
    legend:{rank:legendRank,requirements:legendRequirements(legendRank),source:'preview'},
    income:{
      multiLevelRows:FAN_MULTI_LEVEL.map((protocolPercent,index)=>({level:(index+1) as 1|2|3|4|5|6|7|8|9|10|11|12|13|14,protocolPercent,eligibleAncestors:index<7?2:undefined,amountETER:index<5?Number((12.4-index*1.17).toFixed(3)):undefined})),
      matchingRows:(Object.entries(FAN_MATCHING) as Array<[string,readonly number[]]>).flatMap(([star,rows])=>rows.map((protocolPercent,index)=>({fanStar:Number(star) as 1|2|3|4,layer:(index+1) as 1|2|3|4,protocolPercent,amountETER:protocolPercent&&Number(star)===fanStar?Number((protocolPercent*0.84).toFixed(3)):undefined}))),
      distributionAmountETER:83.72,
    },
    rewards:{
      prizePools:FAN_PRIZE_POOLS.map(item=>({...item,...(poolActuals.get(item.id)??{qualification:'unknown' as const,reason:'Provider qualification unavailable'})})),currentAwardeePool:'star-2',poolSwitchCapability:false,
      legPrize:{legId:indie?'LEG-IND-044':'LEG-GEN-014',qualification:'unknown',balanceETER:840,sourceThreshold2000:'met',sourceThreshold4000:'unknown',priorContractEarningsIncluded:true,awardeeCount:3},
    },
    network:{source:'preview',sourceLabel:'Preview · Explicit fixture',available:true,disclosure:'Explicit provider fixture · synthetic genealogy and messages for review only.',members:fixtureMembers.map(item=>({...item})),messages:fixtureMessages.map(item=>({...item})),messagingCapability:'preview-simulation'},
  };
  if(!active)return {...context,legend:{rank:'None',requirements:[],source:'preview'},income:{},rewards:{poolSwitchCapability:false},network:{source:'preview',sourceLabel:'Preview · Non-member',available:false,disclosure:'No FanCommunity genealogy or messaging exists before provider-confirmed registration.',members:[],messages:[],messagingCapability:'unavailable'}};
  return context;
}

/** Preview-only URL resolver. Live providers never import or evaluate this fixture. */
export function resolvePreviewFanScenario(search:string):FanProtocolContext{
  const scenario=new URLSearchParams(search).get('fan-scenario')??'default';
  if(scenario==='live-unavailable'){
    const context=buildPreviewFanContext('default');
    return {...context,source:'live',sourceLabel:'Live provider · unavailable',sourceFreshness:'unavailable',sourceDetail:'Injected live FanCommunity provider did not return authoritative state.',generatedAt:undefined,membership:{...context.membership,ownReferralCode:undefined,inviteLink:undefined},network:{source:'live',sourceLabel:'Live provider · unavailable',available:false,disclosure:'No live community graph or messaging capability was returned.',members:[],messages:[],messagingCapability:'unavailable'}};
  }
  if(scenario==='live-messaging-unavailable'){
    const context=buildPreviewFanContext('default');
    return {...context,source:'live',sourceLabel:'Live provider · read-only fixture',sourceDetail:'Live-shaped provider state for fail-closed messaging review.',network:{...context.network,source:'live',sourceLabel:'Live provider · send unavailable',disclosure:'Genealogy is provider supplied. No Live send action is available.',messagingCapability:'unavailable'}};
  }
  return buildPreviewFanContext(scenario);
}

export function getPreviewFanProtocolContext():FanProtocolContext{
  return resolvePreviewFanScenario(typeof window==='undefined'?'':window.location.search);
}

/** Execution may intentionally advance provider state to prove stale-quote rejection. */
export function getPreviewFanExecutionContext():FanProtocolContext{
  const search=typeof window==='undefined'?'':window.location.search;
  const context=resolvePreviewFanScenario(search);
  if(new URLSearchParams(search).get('fan-scenario')==='join-stale'){
    context.quotes.join=Object.fromEntries(Object.entries(context.quotes.join).map(([key,item])=>[key,{...item,version:item.version+1,id:item.id.replace(/-v\d+$/,'-v2')}])) as typeof context.quotes.join;
  }
  return context;
}
