import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Coins, Grid2X2, Loader2 } from '@icons';
import { TopBar } from './TopBar';
import { ProductMenu } from './ProductMenu';
import { MobilePassport, type MobilePassportMode } from './MobilePassport';
import { MobileLiveWidgets } from './MobileLiveWidgets';
import { QoraOrb } from '../qora/QoraOrb';
import { VoiceComposer } from '../qora/VoiceComposer';
import { PageTopic } from '../ui/PageTopic';
import { JourneyPresence } from '../journey/JourneyPresence';
import { JourneyImpactSheet } from '../journey/JourneyImpactSheet';
import { useEternityUserState } from '../../lib/userState';
import { cn } from '../../lib/utils';
import type { ProductDefinition } from '../../data/productRegistry';
import { IS_PREVIEW_MODE, IS_QA_CONNECTED_USER } from '../../lib/contracts/contractConfig';
import { useWallet } from '../../lib/wallet-context';

const QoraExperience = lazy(async () => {
  const module = await import('../../pages/QoraPage');
  return { default: module.QoraExperience };
});

interface MobileUnifiedShellProps {
  children: ReactNode;
  title?: string;
  showBack: boolean;
  showTopBar: boolean;
  noPadding: boolean;
  wide: boolean;
  showPageTopic: boolean;
  showJourneyPresence: boolean;
  currentProduct?: ProductDefinition;
  fillHeight?: boolean;
  showBottomNav?: boolean;
}

const contextByArea: Record<ProductDefinition['area'], { title: string; description: string }> = {
  identity:{ title:'Your identity at a glance', description:'Review verified progress before choosing your next identity action.' },
  intelligence:{ title:'QORA is ready', description:'Ask for guidance, compare options or prepare your next safe step.' },
  learning:{ title:'Build readiness first', description:'QORA can explain the current topic and connect it to your goal.' },
  participation:{ title:'Your next participation step', description:'See what matters now and how it advances your current mission.' },
  economy:{ title:'Review before you act', description:'QORA can explain values and risks. You approve every wallet action.' },
  ownership:{ title:'Ownership guidance', description:'Review requirements and outcomes before preparing an on-chain action.' },
  governance:{ title:'Understand before voting', description:'QORA can summarize context while the final decision remains yours.' },
};

export function MobileUnifiedShell({
  children,
  title,
  showBack,
  showTopBar,
  noPadding,
  wide,
  showPageTopic,
  showJourneyPresence,
  currentProduct,
  fillHeight = false,
}: MobileUnifiedShellProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useEternityUserState();
  const wallet = useWallet();
  const journeyView = searchParams.get('view');
  const isHome = location.pathname === '/journey' && !journeyView;
  const isQoraRoute = location.pathname === '/qora';
  const [passportMode, setPassportMode] = useState<MobilePassportMode>('compact');
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [qoraOpen, setQoraOpen] = useState(false);
  const [qoraPrompt, setQoraPrompt] = useState<string | null>(null);
  const [entering, setEntering] = useState(true);
  const context = useMemo(() => currentProduct ? contextByArea[currentProduct.area] : {
    title:isHome ? 'Your next step' : 'QORA is hosting this workspace',
    description:isHome ? 'Continue your mission or ask QORA to help choose what matters now.' : 'Ask for guidance without leaving your current workspace.',
  }, [currentProduct, isHome]);
  const fullQoraOpen = qoraOpen || isQoraRoute;

  useEffect(() => {
    const hasSeenIntro = window.sessionStorage.getItem('eternity:intro-seen') === '1';
    if (!isHome || hasSeenIntro) { setEntering(false); return; }
    const timer = window.setTimeout(() => {
      setEntering(false);
      window.sessionStorage.setItem('eternity:intro-seen', '1');
    }, 2350);
    return () => window.clearTimeout(timer);
  }, [isHome]);

  useEffect(() => {
    setPassportMode('compact');
    setProductMenuOpen(false);
    if (!isQoraRoute) setQoraOpen(false);
  }, [isQoraRoute, location.pathname]);

  useEffect(() => {
    const requested = searchParams.get('passport');
    if (!requested) return;
    setPassportMode('expanded');
  }, [searchParams]);

  useEffect(() => {
    if (!fullQoraOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isQoraRoute) navigate('/journey');
        else setQoraOpen(false);
      }
    };
    window.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', escape);
    };
  }, [fullQoraOpen, isQoraRoute, navigate]);

  const openProducts = useCallback(() => {
    setPassportMode('compact');
    setQoraOpen(false);
    setProductMenuOpen(true);
  }, []);
  const openQora = useCallback((prompt?: string) => {
    setProductMenuOpen(false);
    setPassportMode('compact');
    setQoraPrompt(prompt ?? null);
    setQoraOpen(true);
  }, []);
  const closeQora = useCallback(() => {
    setQoraPrompt(null);
    if (isQoraRoute) navigate('/journey');
    else setQoraOpen(false);
  }, [isQoraRoute, navigate]);
  const changePassportMode = useCallback((mode: MobilePassportMode) => {
    if (mode !== 'compact') {
      setProductMenuOpen(false);
      setQoraOpen(false);
    }
    setPassportMode(mode);
    if (mode === 'compact' && searchParams.has('passport')) {
      const next = new URLSearchParams(searchParams);
      next.delete('passport');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return <div className={cn('mobile-unified-shell responsive-unified-shell', entering && 'is-entering', IS_PREVIEW_MODE && 'has-preview', !showTopBar && 'has-no-topbar', isHome && 'is-home-workspace', isQoraRoute && 'is-qora-route', fillHeight && 'is-fill-height', passportMode === 'expanded' && 'has-expanded-passport')}>
    {entering && <div className="eternity-entry-intro" aria-hidden="true"><QoraOrb state="thinking" size="hero" living decorative/></div>}
    <ProductMenu open={productMenuOpen} onClose={() => setProductMenuOpen(false)}/>
    {showTopBar && <TopBar showBack={showBack} onOpenProducts={openProducts}/>} 
    {IS_PREVIEW_MODE && <div className="ds-preview-banner mobile-shell-preview" role="status"><span>{IS_QA_CONNECTED_USER ? 'QA · 2 Star · Level 5' : 'Preview · no real transaction'}</span></div>}

    {wallet.isConnected && <MobilePassport mode={passportMode} onModeChange={changePassportMode} user={user} requestedPanel={searchParams.get('passport')}/>} 

    <div className="unified-shell-body">
      <aside className="mobile-qora-panel" aria-label="QORA host">
        <section className="mobile-qora-host" aria-label="QORA contextual guidance">
          <div><small>{currentProduct ? `${currentProduct.label} context` : 'QORA guidance'}</small><strong>{context.title}</strong><p>{context.description}</p></div>
          <QoraOrb state="idle" size="standard" pixelSize={88} living interactive onClick={() => openQora()} className="mobile-qora-host-orb"/>
        </section>
        {!fullQoraOpen && <footer className="mobile-qora-command" aria-label="Message QORA">
          <VoiceComposer language="en" microphoneFirst onSend={(message) => openQora(message)}/>
        </footer>}
      </aside>

      <section className="mobile-workspace-region">
        <header className="mobile-workspace-header">
          <button type="button" onClick={() => navigate('/journey?view=economy')} aria-label="Open economy tools"><Coins size={19}/><span>Economy</span></button>
          <strong>{currentProduct?.label ?? title ?? 'Workspace'}</strong>
          <button type="button" onClick={openProducts} aria-label="Open all modules"><span>All Modules</span><Grid2X2 size={19}/></button>
        </header>
        <main id="main-content" tabIndex={-1} className={cn('ds-main-content mobile-workspace-scroll', wide ? 'is-wide' : 'is-standard', noPadding && 'has-no-padding')}>
          {!isQoraRoute && !isHome && !noPadding && showPageTopic && <PageTopic title={title}/>} 
          {!isQoraRoute && !isHome && !noPadding && showJourneyPresence && <JourneyPresence/>}
          {!isQoraRoute && children}
        </main>
        {isHome && !journeyView && <MobileLiveWidgets/>}
      </section>
    </div>

    {fullQoraOpen && <section className="mobile-qora-fullscreen" role="dialog" aria-modal="true" aria-label="QORA fullscreen">
      <header className="mobile-overlay-header"><div><QoraOrb size="compact" decorative/><span><small>ETERNITY intelligence</small><strong>QORA</strong></span></div><button type="button" onClick={closeQora} aria-label="Collapse QORA"><ChevronDown size={21}/></button></header>
      <div className="mobile-qora-fullscreen-content">
        {isQoraRoute ? children : <Suspense fallback={<div className="mobile-qora-loading"><Loader2 size={24} className="animate-spin"/><span>Opening QORA…</span></div>}><QoraExperience initialPrompt={qoraPrompt}/></Suspense>}
      </div>
    </section>}

    <JourneyImpactSheet/>
  </div>;
}
