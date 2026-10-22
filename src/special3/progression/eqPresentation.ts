import type { JourneyImpact } from '../../lib/journey/types';
import type { EqLedgerEntry, ProgressionState } from './types';

export type GroundedEqPresentationSource =
  | 'locked-achievement-rule'
  | 'normalized-progression-impact'
  | 'committed-personal-ledger'
  | 'committed-referral-ledger'
  | 'controlled-simulation';

export interface GroundedReviewEqPresentation {
  source: GroundedEqPresentationSource;
  impacts: JourneyImpact[];
  achievementId?: string;
  ruleBasis?: string;
}

const sourceHasRequiredEvidence = (input: GroundedReviewEqPresentation) => {
  if (input.source === 'locked-achievement-rule') return Boolean(input.achievementId);
  if (input.source === 'controlled-simulation') return Boolean(input.ruleBasis);
  return true;
};

/** Presentation-only adapter. Legacy Journey impact is never treated as protocol EQ evidence. */
export function specialReviewImpactPresentation(
  legacyOrGenericImpact: JourneyImpact[],
  grounded?: GroundedReviewEqPresentation,
) {
  const nonEqImpact = legacyOrGenericImpact.filter((impact) => impact.kind !== 'eq');
  const groundedEqImpact = grounded && sourceHasRequiredEvidence(grounded)
    ? grounded.impacts.filter((impact) => impact.kind === 'eq')
    : [];

  if (groundedEqImpact.length) {
    return {
      state:'grounded' as const,
      items:[...nonEqImpact, ...groundedEqImpact],
      source:grounded?.source,
    };
  }

  if (legacyOrGenericImpact.some((impact) => impact.kind === 'eq')) {
    return {
      state:'pending-verification' as const,
      items:[
        ...nonEqImpact,
        {
          kind:'task' as const,
          label:'Pending verified Achievement evaluation',
          faLabel:'در انتظار ارزیابی دستاورد تأییدشده',
        },
      ],
      source:'unavailable' as const,
    };
  }

  return { state:'non-eq' as const, items:nonEqImpact, source:'none' as const };
}

export function committedEqHistory(state: ProgressionState | null): EqLedgerEntry[] {
  if (!state) return [];
  return [...state.eqLedger, ...state.referralEqLedger]
    .filter((entry) => entry.status === 'committed')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
