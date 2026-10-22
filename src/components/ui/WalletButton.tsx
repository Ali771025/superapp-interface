import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Loader2, LogOut, Copy, Settings, History, ChevronDown } from '@icons';
import { useWallet } from '../../lib/wallet-context';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { useAppLanguage } from '../../lib/useAppLanguage';

export function WalletButton() {
  const { isConnected, isConnecting, isCorrectNetwork, formattedAddress, connect, disconnect, switchNetwork, error } = useWallet();
  const { theme } = useTheme();
  const { copy } = useAppLanguage();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', closeOutside);
    window.addEventListener('keydown', closeEscape);
    return () => {
      window.removeEventListener('pointerdown', closeOutside);
      window.removeEventListener('keydown', closeEscape);
    };
  }, [open]);

  if (isConnected) {
    return (
      <div ref={menuRef} className="relative flex items-center gap-1">
        {!isCorrectNetwork && (
          <button type="button" onClick={switchNetwork} className="cut-button min-h-11 px-3 text-primary-500 focus-ring">
            Switch to Polygon
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={cn(
            'ds-wallet-control flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 py-1 border text-xs font-medium',
            isDark ? 'bg-dark-card border border-dark-border text-dark-textSecondary' : 'bg-light-border text-light-textSecondary'
          )}
        >
          <span className="w-1.5 h-1.5 bg-primary-500" />
          <span className="font-mono">{formattedAddress}</span>
          <ChevronDown size={13} />
        </button>
        {open && <div role="menu" className={cn('ds-wallet-menu absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-2xl border p-2 shadow-xl', isDark ? 'bg-dark-card border-dark-border' : 'bg-light-card border-light-border')}>
          <button role="menuitem" type="button" onClick={() => navigator.clipboard.writeText(formattedAddress)} className="w-full min-h-11 flex items-center gap-3 rounded-xl px-3 text-sm"><Copy size={15} /> Copy address</button>
          <Link role="menuitem" to="/transactions" onClick={() => setOpen(false)} className="w-full min-h-11 flex items-center gap-3 rounded-xl px-3 text-sm"><History size={15} /> Transactions</Link>
          <Link role="menuitem" to="/settings" onClick={() => setOpen(false)} className="w-full min-h-11 flex items-center gap-3 rounded-xl px-3 text-sm"><Settings size={15} /> Wallet settings</Link>
          <button role="menuitem" type="button" onClick={() => { disconnect(); setOpen(false); }} className="w-full min-h-11 flex items-center gap-3 rounded-xl px-3 text-sm text-danger-DEFAULT"><LogOut size={15} /> {copy.disconnect}</button>
        </div>}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={connect}
        disabled={isConnecting}
        aria-describedby={error ? 'wallet-error' : undefined}
        className="ds-button ds-button-primary cut-button cut-button--primary min-h-11 flex items-center gap-2 px-3 disabled:opacity-40 focus-ring"
      >
        {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
        {isConnecting ? 'Connecting…' : copy.connect}
      </button>
      {error && (
        <span
          id="wallet-error"
          role="alert"
          className={cn(
            'ds-wallet-error absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 border-2 px-3 py-2 text-xs leading-relaxed',
            isDark ? 'border-danger-DEFAULT/30 bg-dark-card text-danger-DEFAULT' : 'border-danger-DEFAULT/30 bg-white text-danger-DEFAULT'
          )}
        >
          {error}
        </span>
      )}
    </div>
  );
}
