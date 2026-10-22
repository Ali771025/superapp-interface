import React, { useEffect, useId, useRef } from 'react';
import { X } from '@icons';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

interface CenteredModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  showClose?: boolean;
  closeLabel?: string;
  presentation?: 'dialog' | 'fullscreen';
}

export function CenteredModal({
  open,
  onClose,
  children,
  title,
  maxWidth = 'max-w-sm',
  showClose = true,
  closeLabel = 'Close dialog',
  presentation = 'dialog',
}: CenteredModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const previousFocus = document.activeElement as HTMLElement | null;
      const timer = window.setTimeout(() => {
        const firstFocusable = panelRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();
      }, 0);
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
        if (event.key !== 'Tab' || !panelRef.current) return;
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        window.clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        previousFocus?.focus();
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [onClose, open]);

  if (!open) return null;

  const modal = (
    <div
      className={cn(
        'ds-modal-layer fixed inset-0 flex items-center justify-center overflow-hidden p-4 overscroll-contain',
        presentation === 'fullscreen' && 'ds-modal-layer--fullscreen',
      )}
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="ds-modal-scrim absolute inset-0" />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'ds-modal-panel relative w-full max-h-[90dvh] overflow-y-auto overscroll-contain animate-fade-in border',
          presentation === 'fullscreen' && 'ds-modal-panel--fullscreen',
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="ds-modal-header sticky top-0 z-10 flex items-center justify-between border-b px-5 pt-4 pb-3">
            {title && (
              <h2 id={titleId} className="font-bold text-base">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                aria-label={closeLabel}
                className="ds-modal-close ml-auto w-11 h-11 flex items-center justify-center focus-ring"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  const specialPortal = document.getElementById('s3-portal-root');
  return createPortal(modal, specialPortal ?? document.body);
}
