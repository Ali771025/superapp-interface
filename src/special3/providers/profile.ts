import type { SpecialTransaction } from './contracts';

export interface ProfileProjection {
  identity: { displayName: string | null; activeEid: string | null; ownedEids: number | null; walletAddress: string };
  progress: { level: number | null; personalEq: number | null; referralEq: number | null; completedAchievements: number | null; activeAchievements: number | null; progressPercent: number | null; nextLevelRequired: number | null };
  community: { rank: string | null; membership: string | null };
  reputation: number | null;
  ownership: { eid: number | null; tokens: number | null; shields: number | null; stocks: number | null; totalPositions: number | null };
  activity: SpecialTransaction[] | null;
}

/** Neutral, source-labelled values. Product providers own every field before it reaches Profile. */
export interface ProfileProjectionInput {
  identity: { walletAddress: string; activeEid: string | null; ownedEids: number | null };
  achievement: { level: number | null; personalEq: number | null; completedAchievements: number | null; activeAchievements: number | null; progressPercent: number | null; nextLevelRequired: number | null } | null;
  fan: { rank: string | null; membership: string | null } | null;
  ownership: { tokens: number | null; shields: number | null; stocks: number | null };
  activity: SpecialTransaction[] | null;
  reputation: number | null;
}

const totalIfAuthoritative = (values: Array<number | null>) =>
  values.every((item): item is number => item !== null)
    ? values.reduce((sum, item) => sum + item, 0)
    : null;

export function buildProfileProjection(input: ProfileProjectionInput): ProfileProjection {
  const eid = input.identity.ownedEids;
  const totalPositions = totalIfAuthoritative([
    eid,
    input.ownership.tokens,
    input.ownership.shields,
    input.ownership.stocks,
  ]);
  return {
    identity: {
      displayName: input.identity.activeEid ?? input.identity.walletAddress,
      activeEid: input.identity.activeEid,
      ownedEids: eid,
      walletAddress: input.identity.walletAddress,
    },
    progress: {
      level: input.achievement?.level ?? null,
      personalEq: input.achievement?.personalEq ?? null,
      referralEq: null,
      completedAchievements: input.achievement?.completedAchievements ?? null,
      activeAchievements: input.achievement?.activeAchievements ?? null,
      progressPercent: input.achievement?.progressPercent ?? null,
      nextLevelRequired: input.achievement?.nextLevelRequired ?? null,
    },
    community: {
      rank: input.fan?.rank ?? null,
      membership: input.fan?.membership ?? null,
    },
    reputation: input.reputation,
    ownership: {
      eid,
      tokens: input.ownership.tokens,
      shields: input.ownership.shields,
      stocks: input.ownership.stocks,
      totalPositions,
    },
    activity: input.activity?.map((entry) => ({ ...entry })) ?? null,
  };
}

/** Preview scenarios stay inside the Preview provider and never become React business logic. */
export function resolvePreviewProfileProjection(base: ProfileProjection, search: string): ProfileProjection {
  const scenario = new URLSearchParams(search).get('profile-scenario');
  const projection: ProfileProjection = {
    ...base,
    identity: { ...base.identity },
    progress: { ...base.progress },
    community: { ...base.community },
    ownership: { ...base.ownership },
    activity: base.activity?.map((entry) => ({ ...entry })) ?? null,
  };
  if (scenario === 'no-eid') {
    projection.identity.activeEid = null;
    projection.identity.displayName = projection.identity.walletAddress;
    projection.identity.ownedEids = 0;
    projection.ownership.eid = 0;
    projection.ownership.totalPositions = totalIfAuthoritative([
      projection.ownership.eid,
      projection.ownership.tokens,
      projection.ownership.shields,
      projection.ownership.stocks,
    ]);
  } else if (scenario === 'zero-ownership') {
    projection.identity.ownedEids = 0;
    projection.ownership = { eid: 0, tokens: 0, shields: 0, stocks: 0, totalPositions: 0 };
  } else if (scenario === 'activity-unavailable') {
    projection.activity = null;
  } else if (scenario === 'missing-reputation') {
    projection.reputation = null;
  }
  return projection;
}
