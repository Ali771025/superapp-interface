import { evidenceReference } from './eventIdentity.ts';
import { UNRESOLVED_SOURCE, type AchievementEvaluation, type EqLedgerEntry, type ProductEventEnvelope, type ProgressionState, type ReferralContext, type RewardLedgerEntry } from './types.ts';

function personalEntryId(eventId: string, achievementId: string) {
  return `eq:${eventId}:${achievementId}:personal`;
}

function referralEntryId(eventId: string, achievementId: string, sponsorAccountKey: string) {
  return `eq:${eventId}:${achievementId}:referral:${sponsorAccountKey.toLowerCase()}`;
}

export function commitPersonalEq(state: ProgressionState, event: ProductEventEnvelope, evaluations: readonly AchievementEvaluation[], now: string) {
  const entries: EqLedgerEntry[] = [];
  const rewards: RewardLedgerEntry[] = [];
  for (const evaluation of evaluations.filter((item) => item.status === 'completed' && item.eqDelta > 0)) {
    const ledgerEntryId = personalEntryId(event.eventId, evaluation.achievementId);
    if (state.eqLedger.some((entry) => entry.ledgerEntryId === ledgerEntryId)) continue;
    entries.push({
      ledgerEntryId,
      eventId:event.eventId,
      achievementId:evaluation.achievementId,
      accountKey:state.accountKey,
      userId:event.userId,
      walletAddress:event.walletAddress,
      product:evaluation.product,
      eqDelta:evaluation.eqDelta,
      classification:'personal',
      source:event.source,
      evidenceRef:evidenceReference(event),
      createdAt:now,
      status:'committed',
      referralEligible:evaluation.referralEligible,
    });
    rewards.push({
      rewardEntryId:`reward:${event.eventId}:${evaluation.achievementId}`,
      eventId:event.eventId,
      achievementId:evaluation.achievementId,
      accountKey:state.accountKey,
      effect:UNRESOLVED_SOURCE,
      status:'requires-protocol-resolution',
      createdAt:now,
    });
  }
  return { entries, rewards };
}

export function createReferralEqEntries(personalEntries: readonly EqLedgerEntry[], context: ReferralContext | undefined, now: string) {
  if (!context || !context.isLineOne || context.sourceClassification !== 'personal' || context.directLevel > context.sponsorLevel) return [];
  if (personalEntries.some((entry) => entry.accountKey.toLowerCase() === context.sponsorAccountKey.toLowerCase())) return [];
  return personalEntries.filter((entry) => entry.referralEligible).map<EqLedgerEntry>((entry) => ({
    ledgerEntryId:referralEntryId(entry.eventId, entry.achievementId, context.sponsorAccountKey),
    eventId:entry.eventId,
    achievementId:entry.achievementId,
    accountKey:context.sponsorAccountKey,
    product:entry.product,
    eqDelta:entry.eqDelta * 0.1,
    classification:'referral',
    source:entry.source,
    evidenceRef:entry.evidenceRef,
    createdAt:now,
    status:'committed',
    referralEligible:false,
  }));
}

export function ledgerTotal(entries: readonly EqLedgerEntry[]) {
  return entries.filter((entry) => entry.status === 'committed').reduce((sum, entry) => sum + entry.eqDelta, 0);
}

export function personalEqTotal(state: ProgressionState) {
  return (state.openingSnapshot?.personalEq ?? 0) + ledgerTotal(state.eqLedger.filter((entry) => entry.classification === 'personal'));
}

export function referralEqTotal(state: ProgressionState) {
  return ledgerTotal(state.referralEqLedger);
}
