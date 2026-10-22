import { mockCurrentForecast, mockFanProfile, mockRewards, mockShields, mockTokenAssets, mockUser } from '../data/mockAssets';
import { productPresentationProvider } from '../special3/providers/products';
import { CHAIN_CONFIG } from '../lib/contracts/contractConfig';
import type { FanProfile, ForecastWeek, Reward, Shield, TokenAsset, User } from '../lib/types';
import { formatCurrency, formatNumber } from '../lib/utils';
import { EDGE_WALLET_APPROVAL_LESSON } from '../modules/edge/edgeProduct';
import { STOCK_BASE_VALUE_ETER, STOCK_MULTIPLIERS } from '../modules/ees/stockProduct';
import { GENERATOR_PAYMENT_TOKENS } from '../modules/generator/generatorProduct';

export type GroundedRow = { label: string; value: string };

export const generatorProductRows = (): GroundedRow[] => [
  { label:'Network', value:CHAIN_CONFIG.name },
  { label:'Payment options', value:GENERATOR_PAYMENT_TOKENS.join(' · ') },
];
export const swapProductRows = (): GroundedRow[] => [{ label:'Network', value:CHAIN_CONFIG.name }];
export const forecastProductRows = (forecast: ForecastWeek = mockCurrentForecast): GroundedRow[] => [
  { label:'Pool', value:`${forecast.poolSize.toLocaleString()} ETER` },
  { label:'Entry', value:`${forecast.entryFee} ETER` },
];
export const shieldProductRows = (shield: Shield | undefined = mockShields[0]): GroundedRow[] => shield ? [
  { label:'Paid', value:`${shield.paidAmount}/${shield.totalAmount} USDT` },
  { label:'Inheritance', value:shield.inheritanceSet ? 'Configured' : 'Needs action' },
] : [];
export const fanProductRows = (profile: FanProfile = mockFanProfile): GroundedRow[] => [
  { label:'Active network', value:String(profile.activeDownline) },
  { label:'Claimable', value:`${profile.claimableIncome} ETER` },
];
export const stockProductRows = (): GroundedRow[] => [
  { label:'Base value', value:`${STOCK_BASE_VALUE_ETER} ETER` },
  { label:'Multiplier range', value:`${STOCK_MULTIPLIERS[0]}× – ${STOCK_MULTIPLIERS[STOCK_MULTIPLIERS.length - 1]}×` },
];
export const eraProductRows = (): GroundedRow[] => {
  const context=productPresentationProvider.data.eraProtocolContext;
  if(!context)return [{label:'ERA source',value:'Provider context unavailable'}];
  return [
    {label:'Active vote',value:context.activeVote?.name??'No active vote'},
    {label:'Voting eligibility',value:context.user.votingEligibilityReason},
    {label:'Quorum',value:context.activeVote?.voting?`${context.activeVote.voting.participantCount}/${context.activeVote.voting.requiredParticipantCount} required`:'Provider unavailable'},
    {label:'Queue',value:`${context.queue.length} provider-owned record${context.queue.length===1?'':'s'}`},
  ];
};
export const rewardsProductRows = (rewards: Reward[] = mockRewards): GroundedRow[] => rewards.filter((reward) => reward.status === 'claimable').slice(0, 4).map((reward) => ({ label:reward.source, value:`${reward.amount} ${reward.token}` }));
export const learningProductRows = (): GroundedRow[] => [
  { label:'Duration', value:`${EDGE_WALLET_APPROVAL_LESSON.durationMinutes} minutes` },
  { label:'Learning context', value:EDGE_WALLET_APPROVAL_LESSON.context },
];
export const assetProductRows = (assets: TokenAsset[] = mockTokenAssets): GroundedRow[] => assets.map((token) => ({ label:token.symbol, value:`${formatNumber(token.balance)} · ${formatCurrency(token.usdValue)}` }));
export const eidProductRows = (persona: string, _user: User = mockUser): GroundedRow[] => {
  const context=productPresentationProvider.data.eidProtocolContext;
  if(!context)return [{label:'EID source',value:'Provider context unavailable'}];
  return [
    {label:'Active identity',value:context.user.activeEid??context.user.wallet},
    {label:'Owned EID NFTs',value:String(context.owned.length)},
    {label:'Next acquisition',value:`#${context.user.nextAcquisitionOrdinal}`},
    {label:'Payment identities',value:context.policy.acceptedPaymentAssets.join(' · ')},
    {label:'Persona',value:persona},
  ];
};
