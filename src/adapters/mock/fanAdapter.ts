import { mockFanProfile, mockRewards } from '../../data/mockAssets';
import type { FanProfile, Reward } from '../../lib/types';
import type { FanJoinIdentity, FanProtocolContext, FanQuote } from '../../special3/products/fan/fanProtocol';
import { bindFanJoinQuote, normalizeFanReferral, validateFanQuote } from '../../special3/products/fan/fanProtocol';

const receipt=(label:string)=>({txHash:`0xpreview_fan_${label}_${Date.now()}`});
function assertGuard(quote:FanQuote,params:{expectedQuoteId:string;expectedQuoteVersion:number;expectedAmountETER:number}){
  if(quote.id!==params.expectedQuoteId||quote.version!==params.expectedQuoteVersion||quote.amountETER!==params.expectedAmountETER)throw new Error('Fan quote is stale or does not match the confirmed review snapshot.');
}
function revalidatePreviewReferrer(referralCode:string|null,target:FanQuote['target']){
  if(target!==0)return referralCode;
  if(!referralCode)throw new Error('0-Star registration requires a valid upstream referrer.');
  if(referralCode==='UNKNOWN.ETER'||/^0x0{40}$/.test(referralCode))throw new Error('The upstream referrer could not be resolved by the Preview provider.');
  return referralCode;
}
function expected(context:FanProtocolContext,params:{expectedQuoteId:string;expectedQuoteVersion:number;expectedAmountETER:number},operation:'upgrade'|'renew'){
  const quote=operation==='upgrade'?context.quotes.upgrade:context.quotes.renewal;
  if(!quote)throw new Error('Fan quote is stale or unavailable.');
  assertGuard(quote,params);
  return validateFanQuote(context,quote,operation);
}

export const fanAdapter={
  async quoteFanMembership(params:{operation:'join'|'upgrade'|'renew';target?:0|1|2|3|4|'indie';referralCode?:string|null},context:FanProtocolContext){
    const base=params.operation==='join'?context.quotes.join[String(params.target??0) as keyof typeof context.quotes.join]:params.operation==='upgrade'?context.quotes.upgrade:context.quotes.renewal;
    if(!base)throw new Error('No provider quote is available for this operation.');
    const quote=params.operation==='join'?bindFanJoinQuote(base,revalidatePreviewReferrer(normalizeFanReferral(params.referralCode,base.target),base.target)):base;
    return {quote:validateFanQuote(context,quote,params.operation),source:context.source};
  },
  async joinFan(params:{expectedQuoteId:string;expectedQuoteVersion:number;expectedAmountETER:number;target:0|1|2|3|'indie';referralCode?:string|null},context:FanProtocolContext){
    if(context.membership.active)throw new Error('Active members cannot rejoin.');
    const normalized=revalidatePreviewReferrer(normalizeFanReferral(params.referralCode,params.target),params.target);
    const base=context.quotes.join[String(params.target) as keyof typeof context.quotes.join];
    if(!base)throw new Error('Requested Fan join target is unavailable.');
    const bound=bindFanJoinQuote(base,normalized);
    assertGuard(bound,params);
    validateFanQuote(context,bound,'join');
    const ownReferralCode=params.target==='indie'?'INDIE.NEW.ETER':'NEWFAN.ETER';
    const identity:FanJoinIdentity={fanStar:params.target==='indie'?4:params.target,indie:params.target==='indie',generation:'EMERGENCE',legId:params.target==='indie'?'LEG-IND-NEW':'LEG-EMR-NEW',legendRank:'None',referrerCode:normalized,ownReferralCode,inviteLink:`https://example.invalid/invite/${ownReferralCode}`};
    return {...receipt('join'),quoteId:bound.id,identity};
  },
  async upgradeFanRank(params:{expectedQuoteId:string;expectedQuoteVersion:number;expectedAmountETER:number},context:FanProtocolContext){const quote=expected(context,params,'upgrade');return {...receipt('upgrade'),quoteId:quote.id}},
  async renewFan(params:{expectedQuoteId:string;expectedQuoteVersion:number;expectedAmountETER:number},context:FanProtocolContext){if(context.membership.renewal!=='open')throw new Error('Renewal is not currently available.');const quote=expected(context,params,'renew');return {...receipt('renew'),quoteId:quote.id}},
  async sendFanCommunityMessage(params:{recipientId:string;body:string;expectedNetworkSource:'preview'|'live'},context:FanProtocolContext){
    if(context.network.source!=='preview'||params.expectedNetworkSource!=='preview'||context.network.messagingCapability!=='preview-simulation')throw new Error('FanCommunity message sending is unavailable without a matching provider capability.');
    if(!context.network.members.some(member=>member.id===params.recipientId))throw new Error('Message recipient is unavailable in the current provider network.');
    const body=params.body.trim();if(!body)throw new Error('Message body is required.');if(body.length>500)throw new Error('Message body exceeds the Preview provider limit.');
    return {source:'preview' as const,message:{id:`preview-send-${Date.now()}`,recipient:params.recipientId,body,time:'12:04',direction:'outgoing' as const}};
  },
  async getFanLevel(_address:string):Promise<string>{return mockFanProfile.level},
  async getFanProfile(_address:string):Promise<FanProfile>{return mockFanProfile},
  async getReferrals(_address:string):Promise<{direct:number;downline:number}>{return {direct:mockFanProfile.directReferrals,downline:mockFanProfile.totalDownline}},
  async getRewards(_address:string):Promise<Reward[]>{return mockRewards.filter((reward)=>reward.type==='fan')},
  async upgradeFan(_address:string,_targetLevel:string):Promise<{txHash:string}>{throw new Error('Legacy Fan financial action disabled: use a provider quote and the Phase10 action contract.')},
  async claimFanRewards(_address:string):Promise<{txHash:string;amount:number}>{throw new Error('Fan reward claim unavailable without a provider-owned entitlement.')},
};
