import type { AchievementEvaluation, EqLedgerEntry, JourneyImpactStatus, JourneyProgressionHandoff, NormalizedProgressionPayload, ProductEventEnvelope } from './types.ts';

export function createJourneyHandoffs(event: ProductEventEnvelope, evaluations: readonly AchievementEvaluation[], personalEntries: readonly EqLedgerEntry[], referralEntries: readonly EqLedgerEntry[]) {
  const payload = event.payload as NormalizedProgressionPayload;
  return personalEntries.map<JourneyProgressionHandoff>((entry) => {
    const evaluation = evaluations.find((item) => item.achievementId === entry.achievementId)!;
    const referralEqDelta = referralEntries.filter((item) => item.eventId === event.eventId && item.achievementId === entry.achievementId).reduce((sum, item) => sum + item.eqDelta, 0);
    return {
      eventId:event.eventId,
      product:evaluation.product,
      achievementId:evaluation.achievementId,
      impactCategory:evaluation.journeyImpactCategory,
      eqDelta:entry.eqDelta + referralEqDelta,
      personalEqDelta:entry.eqDelta,
      referralEqDelta,
      verified:true,
      progressionCommitId:entry.ledgerEntryId,
      missionCandidates:payload.missionCandidates,
      unresolved:evaluation.unresolved,
    };
  });
}

export function evaluateJourneyMapping(handoff: JourneyProgressionHandoff, activeMissionId?: string, appliedCommitIds: readonly string[] = []): { status: JourneyImpactStatus; missionId?: string } {
  if (appliedCommitIds.includes(handoff.progressionCommitId)) return { status:'duplicate' };
  if (!handoff.missionCandidates?.length) return { status:'mapping-unresolved' };
  if (!activeMissionId || !handoff.missionCandidates.includes(activeMissionId)) return { status:'no-matching-journey-impact' };
  return { status:'applied', missionId:activeMissionId };
}
