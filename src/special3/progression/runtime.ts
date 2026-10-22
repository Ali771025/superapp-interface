import lockedRuleMapJson from '../../../docs/special3/inventories/achievement-eq-map.json' with { type:'json' };
import { getConfiguredProgressionMode } from './mode.ts';
import { runProgressionPipeline } from './pipeline.ts';
import { createEmptyProgressionState, type ProgressionPersistence } from './persistence.ts';
import { createAchievementRuleRegistry } from './ruleRegistry.ts';
import type { LockedAchievementMap, ProductEventEnvelope, ProgressionMode, ProgressionState, ReferralContext } from './types.ts';

const lockedRuleMap = lockedRuleMapJson as unknown as LockedAchievementMap;
const registry = createAchievementRuleRegistry(lockedRuleMap);

export function getRuntimeAchievementRegistry() {
  return registry;
}

export interface ProcessProductEventInput {
  event: ProductEventEnvelope;
  accountKey: string;
  persistence: ProgressionPersistence;
  mode?: ProgressionMode;
  expectedChainId?: number;
  activeMissionId?: string;
  referralContext?: ReferralContext;
  referralPersistence?: ProgressionPersistence;
  allowMockVerification?: boolean;
}

export async function processProductEvent(input: ProcessProductEventInput) {
  const state = await input.persistence.load(input.accountKey) ?? createEmptyProgressionState(input.accountKey, input.event.observedAt);
  let referralState: ProgressionState | undefined;
  if (input.referralContext && input.referralPersistence) {
    referralState = await input.referralPersistence.load(input.referralContext.sponsorAccountKey)
      ?? createEmptyProgressionState(input.referralContext.sponsorAccountKey, input.event.observedAt);
  }
  const mode = input.mode ?? getConfiguredProgressionMode();
  const result = runProgressionPipeline({
    mode,
    event:input.event,
    registry,
    state,
    expectedChainId:input.expectedChainId,
    activeMissionId:input.activeMissionId,
    referralContext:input.referralContext,
    referralState,
    allowMockVerification:input.allowMockVerification,
  });
  if (result.writesApplied) {
    await input.persistence.save(input.accountKey, result.nextState);
    if (result.nextReferralState && input.referralPersistence && input.referralContext) {
      await input.referralPersistence.save(input.referralContext.sponsorAccountKey, result.nextReferralState);
    }
  }
  return result;
}
