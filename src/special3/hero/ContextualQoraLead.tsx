import { MessageCircle, Route } from '@icons';
import type { ReactNode } from 'react';
import { useQoraShell } from '../shell/QoraShellContext';
import { SpecialText } from './SpecialText';

interface ContextualQoraLeadProps {
  prompt?: string;
  text?: string;
  journey?: { label: string; onOpen: () => void; progressLabel?: string };
  trailing?: ReactNode;
}

export function ContextualQoraLead({ prompt, text, journey, trailing }: ContextualQoraLeadProps) {
  const { context, openFullQora } = useQoraShell();
  const guidance = text ?? context.recommendation;
  const groundedPrompt = prompt ?? `Explain ${context.system} in the current route context. Clarify the safest next step without executing any action.`;
  return <div className="s3-contextual-qora" data-qora-context-path={context.pathname}>
    <div className="s3-contextual-qora__copy">
      <small>QORA · {context.outputMode}</small>
      <SpecialText text={guidance}/>
      <span>{context.dataSource} · QORA explains and prepares; protected actions remain in their Product.</span>
    </div>
    <div className="s3-contextual-qora__actions">
      <button type="button" className="s3-contextual-qora__ask" onClick={()=>openFullQora(groundedPrompt)}><MessageCircle aria-hidden="true"/><span>Ask QORA</span></button>
      {trailing}
    </div>
    {journey && <button type="button" className="s3-contextual-qora__journey" onClick={journey.onOpen} aria-label={journey.label} title={journey.progressLabel ?? 'Journey'}><Route aria-hidden="true"/><span>{journey.progressLabel ?? 'Journey'}</span></button>}
  </div>;
}
