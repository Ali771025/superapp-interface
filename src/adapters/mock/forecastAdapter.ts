import { mockCurrentForecast, mockForecastEntries } from '../../data/mockAssets';
import type { ForecastWeek, ForecastEntry } from '../../lib/types';
import type { ForecastClaimGuard, ForecastEnterInput, ForecastParticipationQuote, ForecastProtocolContext, ForecastTicketGiftQuote } from '../../special3/products/forecast/forecastProtocol';
import { contributorEligibility, isForecastEntitlement, starredSaviorEligibility, validateForecastEntry } from '../../special3/products/forecast/forecastProtocol';

export const forecastAdapter = {
  async getCurrentForecast(): Promise<ForecastWeek> {
    return mockCurrentForecast;
  },

  async getMyEntries(_address: string): Promise<ForecastEntry[]> {
    return mockForecastEntries;
  },

  async enterForecast(params: ForecastEnterInput | { prediction: string; tickets: number }, context?: ForecastProtocolContext): Promise<{ txHash: string }> {
    if (!('predictions' in params)) throw new Error('Legacy Forecast entry execution is unavailable. Open the provider-owned Forecast flow.');
    const quote=params.mode==='gift' ? forecastAdapter.buildGiftQuote(params.beneficiary??'',context) : undefined;
    validateForecastEntry(params, context, quote);
    if(params.mode==='free'){
      const sourceQuote=context?.quotes.free;const ticket=context?.tickets.find((item)=>item.id===params.freeTicketId);
      if(!context||!sourceQuote||!ticket||!ticket.owned||ticket.status!=='available'||ticket.weekId!==context.week.id||ticket.activatesAt!==sourceQuote.freeTicketActivatesAt||sourceQuote.fanStarLevel<1||context.ticketProgress?.usedThisWeek)throw new Error('Forecast free ticket source record is not valid for this wallet and week.');
    }
    return { txHash: '0xmock_forecast_enter_' + Date.now() };
  },

  buildGiftQuote(address:string, context?:ForecastProtocolContext):ForecastParticipationQuote {
    if(!context) throw new Error('Authoritative Forecast context is unavailable.');
    const normalized=address.trim();const ineligible=!normalized||normalized.toLowerCase().includes('ineligible');const atLimit=normalized.toLowerCase().includes('limit');const nonFan=normalized.toLowerCase().includes('nonfan');const usdFee=nonFan?2.6:1.4;
    const rate=(asset:'USDT'|'ETER'|'ET')=>asset==='USDT'?usdFee:Number((usdFee/(asset==='ETER'?1.35:0.42)).toFixed(6));
    return {...context.quotes.gift,id:`gift-${context.week.id}-${normalized.toLowerCase()}`,beneficiary:normalized,beneficiaryEligible:!ineligible&&!atLimit,isFanMember:!nonFan,fanStarLevel:nonFan?0:2,weeklyUsedEntries:atLimit?15:4,weeklyEntryLimit:nonFan?5:15,usdFee,paymentPerEntry:{USDT:rate('USDT'),ETER:rate('ETER'),ET:rate('ET')}};
  },

  async quoteForecastParticipation(params:{mode:'gift';beneficiary:string;predictionCount:number},context?:ForecastProtocolContext){
    void params.predictionCount;return {quote:forecastAdapter.buildGiftQuote(params.beneficiary,context),source:'preview' as const};
  },

  async verifyForecastBeneficiary(address:string, context?:ForecastProtocolContext) {
    const quote=forecastAdapter.buildGiftQuote(address,context);return {eligible:Boolean(quote.beneficiaryEligible),quote,source:'preview' as const};
  },

  buildTicketGiftQuote(ticketId:string,beneficiary:string,context?:ForecastProtocolContext):ForecastTicketGiftQuote {
    if(!context)throw new Error('Authoritative Forecast context is unavailable.');
    const normalized=beneficiary.trim();const ticket=context.tickets.find(item=>item.id===ticketId);const atLimit=normalized.toLowerCase().includes('limit');const ineligible=!normalized||normalized.toLowerCase().includes('ineligible');
    return {id:`ftg-${context.week.id}-${ticketId.toLowerCase()}-${normalized.toLowerCase()}`,version:1,ticketId,beneficiary:normalized,eligible:Boolean(ticket?.owned&&ticket.status==='available'&&ticket.weekId===context.week.id&&!atLimit&&!ineligible),beneficiaryIsFan:true,beneficiaryStarLevel:2,beneficiaryWeeklyUse:atLimit?15:4,beneficiaryWeeklyLimit:15,methods:{...context.ticketGiftCapabilities},costRequired:false,source:context.source};
  },

  async quoteForecastTicketGift(params:{ticketId:string;beneficiary:string},context?:ForecastProtocolContext){
    const quote=forecastAdapter.buildTicketGiftQuote(params.ticketId,params.beneficiary,context);return {quote,source:'preview' as const};
  },

  async giftForecastTicket(params:{ticketId:string;beneficiary:string;method:'signature'|'transaction';expectedQuoteId:string;expectedQuoteVersion:number},context?:ForecastProtocolContext){
    if(!context)throw new Error('Authoritative Forecast context is unavailable.');const ticket=context.tickets.find(item=>item.id===params.ticketId);const quote=forecastAdapter.buildTicketGiftQuote(params.ticketId,params.beneficiary,context);
    if(!ticket||!ticket.owned||ticket.status!=='available'||ticket.weekId!==context.week.id||!quote.eligible||quote.beneficiary!==params.beneficiary.trim()||quote.beneficiaryWeeklyLimit===undefined||quote.beneficiaryWeeklyUse>=quote.beneficiaryWeeklyLimit||!quote.methods[params.method]||quote.id!==params.expectedQuoteId||quote.version!==params.expectedQuoteVersion||(quote.costRequired&&!quote.cost))throw new Error('Forecast ticket gift quote changed or gifting is unavailable.');
    return {txHash:'0xmock_forecast_ticket_gift_'+Date.now()};
  },

  async checkForecastPrize(context?:ForecastProtocolContext) {
    if(!context) throw new Error('Authoritative Forecast context is unavailable.');
    if(context.savior.starredSavior&&!starredSaviorEligibility(context.savior)) throw new Error('Starred Savior source state is invalid.');
    if(!context.claim.claimId||!context.claim.scope||context.claim.phase!=='check'||context.claim.status!=='unchecked') throw new Error('Forecast CHECK state is stale or the window is not open.');
    return { entitlement:context.claim.entitlement, source:'preview' as const };
  },

  async withdrawForecastPrize(context?:ForecastProtocolContext, expected?:ForecastClaimGuard) {
    if(!context || context.claim.phase!=='withdraw' || context.claim.status!=='withdrawable' || !isForecastEntitlement(context.claim.entitlement)) throw new Error('Verified Forecast withdrawal is unavailable.');
    if(!expected||expected.claimId!==context.claim.claimId||expected.version!==context.claim.version||expected.scope!==context.claim.scope||expected.entryId!==context.claim.entryId||expected.expectedEntitlement.amount!==context.claim.entitlement.amount||expected.expectedEntitlement.token!==context.claim.entitlement.token) throw new Error('Forecast claim scope or entitlement changed. Check again.');
    return { txHash:'0xmock_forecast_withdraw_'+Date.now(), entitlement:context.claim.entitlement };
  },

  async donateForecastPool(params:{pool:'main'|'savior'|'savior-prizes';amount:number;asset:'USDT'|'ETER'|'ET'}, context?:ForecastProtocolContext) {
    if(!context?.pools.donationCapability || !context.pools.donationCapabilities[params.pool] || !context.pools.acceptedDonationAssets.includes(params.asset) || !(params.amount>0)) throw new Error('Forecast donation capability is unavailable.');
    return { txHash:'0xmock_forecast_donate_'+Date.now() };
  },

  async checkContributorReward(context?:ForecastProtocolContext) {
    if(!context || !context.contributor.eligible || !contributorEligibility(context.contributor) || context.contributor.claim.phase!=='check'||context.contributor.claim.status!=='unchecked'||!context.contributor.claim.claimId) throw new Error('Contributor CHECK state is stale or eligibility is not verified.');
    return { contributor:context.contributor, source:'preview' as const };
  },

  async withdrawContributorReward(context?:ForecastProtocolContext, expected?:ForecastClaimGuard) {
    const claim=context?.contributor.claim;
    if(!context?.contributor.eligible || !contributorEligibility(context.contributor) || !claim || claim.phase!=='withdraw' || claim.status!=='withdrawable' || !isForecastEntitlement(claim.entitlement)) throw new Error('Verified Contributor withdrawal is unavailable.');
    if(!expected||expected.claimId!==claim.claimId||expected.version!==claim.version||expected.scope!==claim.scope||expected.entryId!==claim.entryId||expected.expectedEntitlement.amount!==claim.entitlement.amount||expected.expectedEntitlement.token!==claim.entitlement.token) throw new Error('Contributor claim scope or entitlement changed. Check again.');
    return { txHash:'0xmock_contributor_withdraw_'+Date.now(), entitlement:claim.entitlement };
  },

  async giftTicket(params: { to: string; tickets: number }): Promise<{ txHash: string }> {
    void params;
    return { txHash: '0xmock_gift_' + Date.now() };
  },

  async getResults(_weekNumber: number): Promise<{ winner: string; saviors: number }> {
    return { winner: '1M - 2M', saviors: 42 };
  },

  async claimPrize(_entryId: string): Promise<{ txHash: string; amount: number }> {
    throw new Error('Legacy Forecast claim execution is unavailable. Open Forecast Rewards for CHECK and WITHDRAW.');
  },
};
