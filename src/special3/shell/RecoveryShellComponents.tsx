import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Award, Home, Landmark, UserRound, Vote, WalletCards } from '@icons';
import { NavLink, useLocation, useNavigationType } from 'react-router-dom';
import { EternityLogo } from '../../components/ui/EternityLogo';
import { useWallet } from '../../lib/wallet-context';
import { ActionKey, EternityModal, InlineStatus, SecondaryAction } from '../current-ui/EternitySharedUI';
import { SystemFab } from '../system/SystemFab';

const primary = [
  { to:'/home', label:'Home', icon:Home },
  { to:'/journey', label:'Achievement', icon:Award },
  { to:'/economy', label:'Economy', icon:Landmark },
  { to:'/era', label:'ERA', icon:Vote },
  { to:'/profile', label:'Profile', icon:UserRound },
] as const;

export function RecoveryHeader({ title, showBack }: { title?: string; showBack: boolean }) {
  void showBack;
  const wallet = useWallet();
  const [walletOpen,setWalletOpen]=useState(false);
  return <header className="recovery-header" aria-label={`${title ?? 'ETERNITY'} global controls`}>
    <div className="recovery-header__start"><NavLink to="/home" className="recovery-brand" aria-label="ETERNITY Home"><span className="recovery-brand__mark"><EternityLogo/></span></NavLink></div>
    <div className="recovery-header__actions">
      <SystemFab/>
      {wallet.isConnected
        ? <button type="button" className="recovery-wallet-connect is-connected" onClick={()=>setWalletOpen(true)} aria-label={`Wallet ${wallet.formattedAddress}. Open wallet controls`}><WalletCards/><span>{wallet.formattedAddress||'CONNECTED'}</span></button>
        : <button type="button" className="recovery-wallet-connect" onClick={() => void wallet.connect()} disabled={wallet.isConnecting} aria-label={wallet.isConnecting ? 'Connecting wallet' : 'Connect wallet'}><WalletCards/><span>{wallet.isConnecting ? 'CONNECTING…' : 'CONNECT'}</span></button>}
    </div>
    <EternityModal open={walletOpen} onClose={()=>setWalletOpen(false)} title="Wallet control" footer={<><SecondaryAction onClick={()=>setWalletOpen(false)}>Close</SecondaryAction><ActionKey onClick={()=>{wallet.disconnect();setWalletOpen(false)}}>Disconnect</ActionKey></>}><InlineStatus tone="success">Connected wallet: {wallet.formattedAddress||wallet.address}</InlineStatus>{!wallet.isCorrectNetwork&&<InlineStatus tone="warning">The connected network is not the configured ETERNITY network.</InlineStatus>}</EternityModal>
  </header>;
}

export function RecoveryPrimaryNav({ placement }: { placement:'desktop'|'mobile' }) {
  return <nav className={`recovery-primary-nav is-${placement}`} aria-label="Primary navigation">{primary.map(({to,label,icon:NavIcon}) => <NavLink key={to} to={to} className={({isActive})=>isActive?'is-active':''}><NavIcon aria-hidden="true"/><span>{label}</span></NavLink>)}</nav>;
}

const scrollPositions = new Map<string,number>();
export function WorkspaceFrame({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLElement>(null); const location=useLocation(); const navigationType=useNavigationType(); const key=location.key||`${location.pathname}${location.search}`;
  useEffect(()=>{ const el=ref.current; if(!el)return; el.scrollTo({top:navigationType==='POP'?(scrollPositions.get(key)??0):0,behavior:'auto'}); return()=>{scrollPositions.set(key,el.scrollTop)}; },[key,navigationType]);
  return <main ref={ref} id="main-content" tabIndex={-1} className="s3-workspace-scroll" aria-label={label}>{children}</main>;
}
