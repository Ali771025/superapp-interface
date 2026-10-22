import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HelpCircle, MessageCircle, X } from '@icons';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

type PopoverPosition = { top: number; left: number; origin: string };

function getPosition(anchor: HTMLElement): PopoverPosition {
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(360, window.innerWidth - 24);
  const estimatedHeight = 260;
  const spaceBelow = window.innerHeight - rect.bottom;
  const top = spaceBelow >= estimatedHeight + 12 ? rect.bottom + 10 : Math.max(12, rect.top - estimatedHeight - 10);
  const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.right - width));
  return { top, left, origin: spaceBelow >= estimatedHeight + 12 ? 'top right' : 'bottom right' };
}

export function ContextHelp({ title, description, open, onClose, anchor }: { title: string; description: string; open: boolean; onClose: () => void; anchor: HTMLElement | null }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const update = () => setPosition(getPosition(anchor));
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [anchor, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => { window.removeEventListener('keydown', close); previous?.focus(); };
  }, [onClose, open]);

  if (!open || !anchor || !position) return null;
  return createPortal(
    <div className="vf-help-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="vf-help-sheet" style={{ top: position.top, left: position.left, transformOrigin: position.origin }} role="dialog" aria-modal="false" aria-labelledby="vf-help-title">
        <header><span><HelpCircle size={17}/><strong id="vf-help-title">{title}</strong></span><button ref={closeRef} onClick={onClose} aria-label="Close information"><X size={18}/></button></header>
        <p>{description}</p>
        <footer><button onClick={() => { onClose(); navigate(`/qora?prompt=${encodeURIComponent(`Explain ${title} and guide me through the next safe step`)}`); }}><MessageCircle size={16}/>Ask QORA</button><button onClick={onClose}>Got it</button></footer>
      </section>
    </div>,
    document.body,
  );
}

export function ContextHelpTrigger({ label, onClick }: { label: string; onClick: (anchor: HTMLButtonElement) => void }) {
  return <button type="button" onClick={(event) => onClick(event.currentTarget)} className="vf-help-trigger" aria-label={`Information about ${label}`}><HelpCircle size={18}/></button>;
}
