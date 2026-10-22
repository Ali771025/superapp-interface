import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Grid2X2, MoreVertical, Settings2, X } from '@icons';
import { WalletButton } from '../ui/WalletButton';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ProductMenu } from './ProductMenu';
import { cn } from '../../lib/utils';
import { EternityLogo } from '../ui/EternityLogo';
import { useAppLanguage } from '../../lib/useAppLanguage';

interface TopBarProps { title?: string; showBack?: boolean; showActions?: boolean; transparent?: boolean; notificationCount?: number; onOpenProducts?: () => void; }

export function TopBar({ showBack = false, showActions = true, transparent = false, onOpenProducts }: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const { copy } = useAppLanguage();
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fabOpen) return;
    const close = (event: PointerEvent) => { if (!fabRef.current?.contains(event.target as Node)) setFabOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setFabOpen(false); };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', escape); };
  }, [fabOpen]);

  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }
    const root = location.pathname.split('/').filter(Boolean)[0];
    const fallback: Record<string,string> = { insurance:'/world', forecast:'/world', generator:'/economy', ees:'/economy', era:'/world', fan:'/world', readiness:'/world', eid:'/profile', achievements:'/profile', leaderboard:'/profile', profile:'/profile', settings:'/profile', notifications:'/home' };
    navigate(fallback[root] ?? '/home', { replace:true });
  };
  return <>
    <header className={cn('ds-topbar nexus-topbar vf-topbar', transparent && 'is-transparent')}>
      <div className="nexus-topbar-brand">
        {showBack && <button onClick={goBack} aria-label="Go back" className="nexus-topbar-icon"><ChevronLeft size={20}/></button>}
        <Link to="/home" aria-label="ETERNITY Mission"><EternityLogo className="h-7 max-w-[148px] sm:h-8"/></Link>
      </div>
      {showActions && <div className="nexus-topbar-actions vf-topbar-actions">
        <WalletButton/>
        <div className="vf-header-fab" ref={fabRef}>
          <button type="button" onClick={() => setFabOpen((open) => !open)} aria-label={fabOpen ? 'Close quick actions' : 'Open quick actions'} aria-expanded={fabOpen} className="vf-fab-trigger">{fabOpen ? <X size={19}/> : <MoreVertical size={20}/>}</button>
          {fabOpen && <div className="vf-fab-menu" role="menu">
            {onOpenProducts && <button type="button" role="menuitem" onClick={() => { setFabOpen(false); onOpenProducts(); }}><Grid2X2 size={18}/><span>All Modules</span></button>}
            <Link role="menuitem" to="/settings" onClick={() => setFabOpen(false)}><Settings2 size={18}/><span>{copy.settings}</span></Link>
            <div className="vf-fab-theme"><span>{copy.appearance}</span><ThemeToggle/></div>
          </div>}
        </div>
      </div>}
    </header>
    {!onOpenProducts && <ProductMenu open={productMenuOpen} onClose={() => setProductMenuOpen(false)}/>} 
  </>;
}
