import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { QoraContextContract } from './qoraContext';

export interface QoraShellApi {
  isOpen: boolean;
  initialPrompt: string;
  promptSequence: number;
  presentationContext: QoraPresentationContext | null;
  context: QoraContextContract;
  openQora: (initialPrompt?: string, presentationContext?: QoraPresentationContext) => void;
  openQoraWithPrompt: (initialPrompt: string, presentationContext?: QoraPresentationContext) => void;
  closeQora: () => void;
  toggleQora: () => void;
  openFullQora: (initialPrompt?: string) => void;
}

export interface QoraPresentationContext {
  kind: 'path' | 'tips';
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  planningFocus: string;
}

const QoraShellContext = createContext<QoraShellApi | null>(null);

export function QoraShellProvider({ children, context }: { children: ReactNode; context: QoraContextContract }) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeKey = `${location.pathname}${location.search}`;
  const openFullQora = useCallback((prompt = '') => {
    const groundedPrompt = prompt.trim() || undefined;
    navigate('/qora', {
      state: {
        contextPath: routeKey,
        ...(groundedPrompt ? { initialPrompt: groundedPrompt } : {}),
      },
    });
  }, [navigate, routeKey]);
  const openQora = useCallback((prompt = '') => openFullQora(prompt), [openFullQora]);
  const openQoraWithPrompt = useCallback((prompt: string) => openFullQora(prompt), [openFullQora]);
  const closeQora = useCallback(() => undefined, []);
  const toggleQora = useCallback(() => openFullQora(), [openFullQora]);

  const value = useMemo<QoraShellApi>(() => ({
    isOpen:false,
    initialPrompt:'',
    promptSequence:0,
    presentationContext:null,
    context,
    openQora,
    openQoraWithPrompt,
    closeQora,
    toggleQora,
    openFullQora,
  }), [closeQora, context, openFullQora, openQora, openQoraWithPrompt, toggleQora]);

  return <QoraShellContext.Provider value={value}>{children}</QoraShellContext.Provider>;
}

export function useQoraShell() {
  const context = useContext(QoraShellContext);
  if (!context) throw new Error('useQoraShell must be used within QoraShellProvider');
  return context;
}
