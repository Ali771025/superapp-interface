import { mockAchievementProgress } from '../../data/mockAssets';
import type { TokenAsset } from '../../lib/types';
import type { FanMembershipState } from '../products/fan/fanProtocol';
import { getPreviewEidProtocolContext, previewProductData } from './products/preview/data';
import { getPreviewFanProtocolContext } from './products/preview/fanData';
import type { SpecialTransaction } from './contracts';
import { buildProfileProjection, resolvePreviewProfileProjection, type ProfileProjection } from './profile';

function rankFromFanMembership(membership: FanMembershipState): string | null {
  if (!membership.active) return null;
  if (membership.indie) return 'INDIE';
  if (membership.legendRank !== 'None') return membership.legendRank;
  return `${membership.fanStar}-Star FAN`;
}

export interface PreviewProfileDependencies {
  tokenAssets: readonly TokenAsset[] | null;
  activity: SpecialTransaction[] | null;
  search: string;
}

/**
 * The only Preview composition boundary for Profile. It projects current Product provider
 * contexts without recreating EID, FAN, Achievement, SHIELD, STOCK, or activity truth.
 */
export function getPreviewProfileProjection(input: PreviewProfileDependencies): ProfileProjection {
  const eid = getPreviewEidProtocolContext();
  const fan = getPreviewFanProtocolContext();
  const eidAvailable = eid.source.freshness !== 'unavailable';
  const fanAvailable = fan.sourceFreshness !== 'unavailable';

  const projection = buildProfileProjection({
    identity: {
      walletAddress: eid.user.wallet,
      activeEid: eidAvailable ? eid.user.activeEid ?? null : null,
      ownedEids: eidAvailable ? eid.owned.length : null,
    },
    achievement: mockAchievementProgress
      ? {
          level: mockAchievementProgress.level,
          personalEq: mockAchievementProgress.eqPoints,
          completedAchievements: mockAchievementProgress.completedTasks,
          activeAchievements: mockAchievementProgress.activeTasks,
          progressPercent: mockAchievementProgress.progressPercent,
          nextLevelRequired: mockAchievementProgress.nextLevelRequired,
        }
      : null,
    fan: fanAvailable
      ? {
          rank: rankFromFanMembership(fan.membership),
          membership: fan.membership.active
            ? fan.membership.indie
              ? 'indie'
              : `${fan.membership.fanStar}-star`
            : null,
        }
      : null,
    ownership: {
      tokens: input.tokenAssets?.length ?? null,
      shields: previewProductData.shields.length,
      stocks: previewProductData.stocks.length,
    },
    activity: input.activity,
    reputation: null,
  });

  return resolvePreviewProfileProjection(projection, input.search);
}
