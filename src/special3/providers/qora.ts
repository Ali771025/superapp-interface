import { IS_PREVIEW_MODE } from '../../lib/contracts/contractConfig';
import { askMockQora } from '../../qora/mockQoraService';
import type { QoraResponse, QoraUserContext } from '../../qora/types';

export interface QoraProviderResponse extends QoraResponse {
  providerMode: 'preview'|'live';
  sourceLabel: string;
}

export async function askGroundedQora(prompt: string, context: QoraUserContext): Promise<QoraProviderResponse> {
  if (!IS_PREVIEW_MODE) return {
    text:'QORA response generation is unavailable because no Live grounded intelligence provider is configured. No action was prepared or submitted.',
    providerMode:'live',
    sourceLabel:'Live provider unavailable',
  };
  const response = await askMockQora(prompt, context);
  return { ...response, providerMode:'preview', sourceLabel:'Preview grounded Product context' };
}
