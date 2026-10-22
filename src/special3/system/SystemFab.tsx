import { useEffect, useRef, useState } from 'react';
import { Bell, CircleHelp, Grid2X2, Settings2, SlidersHorizontal, Sparkles, WalletCards, X } from '@icons';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../../lib/theme-context';

export function SystemFab() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLAnchorElement>(null);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => firstActionRef.current?.focus());
    const outside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && event.target !== triggerRef.current) close(true);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', key);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return <div className="recovery-system">
    <button ref={triggerRef} className="recovery-system-fab" type="button" aria-label={open ? 'Close system controls' : 'Open system controls'} aria-expanded={open} aria-haspopup="dialog" aria-controls="recovery-system-menu" onClick={() => setOpen((value) => !value)}>
      {open ? <X aria-hidden="true"/> : <Grid2X2 aria-hidden="true"/>}
    </button>
    {open && <div ref={menuRef} id="recovery-system-menu" className="recovery-system-menu" role="dialog" aria-modal="false" aria-label="System controls">
      <NavLink ref={firstActionRef} to="/settings" onClick={() => close(false)}><Settings2 aria-hidden="true"/><span><strong>Settings</strong><small>Open system workspace</small></span></NavLink>
      <button type="button" role="switch" aria-checked={theme === 'dark'} onClick={toggleTheme}><Sparkles aria-hidden="true"/><span><strong>Appearance</strong><small>{theme === 'dark' ? 'Dark theme' : 'Light theme'}</small></span><i aria-hidden="true" className={theme === 'dark' ? 'is-on' : ''}/></button>
      <NavLink to="/settings?section=wallet" onClick={() => close(false)}><WalletCards aria-hidden="true"/><span><strong>Wallet &amp; Network</strong><small>Connection and network</small></span></NavLink>
      <NavLink to="/settings?section=notifications" onClick={() => close(false)}><Bell aria-hidden="true"/><span><strong>Notification settings</strong><small>Feed and availability</small></span></NavLink>
      <NavLink to="/settings?section=data" onClick={() => close(false)}><SlidersHorizontal aria-hidden="true"/><span><strong>Data &amp; Permissions</strong><small>Provider boundaries</small></span></NavLink>
      <NavLink to="/help" onClick={() => close(false)}><CircleHelp aria-hidden="true"/><span><strong>Help &amp; Support</strong><small>Open Help</small></span></NavLink>
    </div>}
  </div>;
}
