import { Bell, ChevronRight, CircleHelp, LogOut, Moon, Settings2, SlidersHorizontal, Sparkles, Sun, WalletCards } from '@icons';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { IdentityAvatar } from '../../components/ui/IdentityAvatar';
import { CHAIN_CONFIG } from '../../lib/contracts/contractConfig';
import { useTheme } from '../../lib/theme-context';
import { useWallet } from '../../lib/wallet-context';
import { special3SystemProvider } from '../providers';
import './phase17-settings.css';

export const phase17SettingSections = ['overview', 'appearance', 'notifications', 'wallet', 'data', 'support'] as const;
export type Phase17SettingSection = typeof phase17SettingSections[number];

export function resolvePhase17SettingSection(value: string | null): Phase17SettingSection {
  return phase17SettingSections.includes(value as Phase17SettingSection) ? value as Phase17SettingSection : 'overview';
}

const sectionMeta = [
  { id:'overview', label:'Overview', detail:'Account and system summary', icon:Settings2 },
  { id:'appearance', label:'Appearance', detail:'Local theme preference', icon:Sparkles },
  { id:'notifications', label:'Notifications', detail:'Feed and provider availability', icon:Bell },
  { id:'wallet', label:'Wallet', detail:'Connection and network', icon:WalletCards },
  { id:'data', label:'Data', detail:'Permissions and boundaries', icon:SlidersHorizontal },
  { id:'support', label:'Support', detail:'Help and contract details', icon:CircleHelp },
] as const;

function SettingRow({ icon:Icon, label, detail, onClick, status }: { icon:typeof Settings2; label:string; detail:string; onClick:()=>void; status?:string }) {
  return <button type="button" className="phase17-setting-row" onClick={onClick}><Icon aria-hidden="true"/><span><strong>{label}</strong><small>{detail}</small></span>{status && <em>{status}</em>}<ChevronRight aria-hidden="true"/></button>;
}

function UnavailableNotice({ title, children }: { title:string; children:string }) {
  return <div className="phase17-settings__notice" role="status"><strong>{title}</strong><p>{children}</p></div>;
}

export function Phase17SettingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const active = resolvePhase17SettingSection(searchParams.get('section'));
  const { theme, toggleTheme } = useTheme();
  const wallet = useWallet();
  const userResult = special3SystemProvider.user();

  useEffect(() => {
    const requested = searchParams.get('section');
    if (requested && !phase17SettingSections.includes(requested as Phase17SettingSection)) {
      const next = new URLSearchParams(searchParams);
      next.delete('section');
      setSearchParams(next, { replace:true });
    }
  }, [searchParams, setSearchParams]);

  const selectSection = (section: Phase17SettingSection) => {
    const next = new URLSearchParams(searchParams);
    if (section === 'overview') next.delete('section'); else next.set('section', section);
    setSearchParams(next);
  };

  const overview = <div className="phase17-settings__rows">
    {userResult.data ? <button type="button" className="phase17-setting-row phase17-setting-row--identity" onClick={() => navigate('/profile')}>
      <IdentityAvatar identity={userResult.data.walletAddress} level={userResult.data.achievementProgress?.level ?? 0} size={44}/><span><strong>{userResult.data.username}</strong><small>{userResult.data.primaryEid} · Open Profile</small></span><ChevronRight aria-hidden="true"/>
    </button> : <UnavailableNotice title="Profile unavailable">A verified profile source is not available in the current environment.</UnavailableNotice>}
    <SettingRow icon={theme === 'dark' ? Moon : Sun} label="Appearance" detail="Local theme preference" status={theme === 'dark' ? 'Dark' : 'Light'} onClick={() => selectSection('appearance')}/>
    <SettingRow icon={WalletCards} label="Wallet" detail="Connection and network details" status={wallet.isConnected ? 'Connected' : 'Guest'} onClick={() => selectSection('wallet')}/>
    <SettingRow icon={Bell} label="Notifications" detail="Event feed and preference availability" onClick={() => selectSection('notifications')}/>
    <SettingRow icon={SlidersHorizontal} label="Data & Permissions" detail="Provider-backed controls only" onClick={() => selectSection('data')}/>
    <SettingRow icon={CircleHelp} label="Help & Support" detail="Help and verified contract routes" onClick={() => selectSection('support')}/>
  </div>;

  const panels: Record<Phase17SettingSection, JSX.Element> = {
    overview,
    appearance:<div className="phase17-settings__panel-stack"><p className="phase17-settings__lead">Your theme is stored locally and applied by the existing ETERNITY theme provider.</p><button type="button" className="phase17-theme-control" role="switch" aria-checked={theme === 'dark'} onClick={toggleTheme}><span>{theme === 'dark' ? <Moon aria-hidden="true"/> : <Sun aria-hidden="true"/>}<b>Dark mode</b><small>{theme === 'dark' ? 'On · switch to Light' : 'Off · switch to Dark'}</small></span><i aria-hidden="true" className={theme === 'dark' ? 'is-on' : ''}/></button><p className="phase17-settings__footnote">This is the only appearance mutation exposed in Phase17.</p></div>,
    notifications:<div className="phase17-settings__panel-stack"><p className="phase17-settings__lead">Notifications is a readable provider feed. Device preference mutation is not integrated.</p><SettingRow icon={Bell} label="Open notifications" detail="Review the existing event feed" onClick={() => navigate('/notifications')}/><UnavailableNotice title="Notification preferences unavailable">No integrated device preference provider is available, so no switch is shown.</UnavailableNotice></div>,
    wallet:<div className="phase17-settings__panel-stack"><dl className="phase17-wallet-facts"><div><dt>Status</dt><dd>{wallet.isConnected ? 'Connected' : 'Guest'}</dd></div><div><dt>Public address</dt><dd>{wallet.address ?? 'Unavailable until connected'}</dd></div><div><dt>Network</dt><dd>{wallet.isConnected ? `${CHAIN_CONFIG.name} · Chain ${wallet.chainId ?? 'unavailable'}` : `${CHAIN_CONFIG.name} · read-only`}</dd></div></dl>{wallet.error && <UnavailableNotice title="Wallet action unavailable">{wallet.error}</UnavailableNotice>}<div className="phase17-settings__actions">{wallet.isConnected ? <button type="button" className="phase17-settings__action is-danger" onClick={wallet.disconnect}><LogOut aria-hidden="true"/>Disconnect wallet</button> : <button type="button" className="phase17-settings__action" onClick={() => void wallet.connect()} disabled={wallet.isConnecting}><WalletCards aria-hidden="true"/>{wallet.isConnecting ? 'Connecting…' : 'Connect wallet'}</button>}<button type="button" className="phase17-settings__action is-secondary" onClick={() => navigate('/contract-details')}>Contract details<ChevronRight aria-hidden="true"/></button></div><p className="phase17-settings__footnote">Only the public address and read-only network state are displayed.</p></div>,
    data:<div className="phase17-settings__panel-stack"><UnavailableNotice title="Data controls unavailable">No verified permission or data-management provider is integrated. This section fails closed and exposes no fabricated toggles.</UnavailableNotice><p className="phase17-settings__footnote">QORA may explain this boundary, but cannot change data or permission state.</p></div>,
    support:<div className="phase17-settings__panel-stack"><p className="phase17-settings__lead">Use the existing Help and Contract Details routes. No chat, ticket, or support mutation is fabricated.</p><SettingRow icon={CircleHelp} label="Help" detail="Open the ETERNITY Help workspace" onClick={() => navigate('/help')}/><SettingRow icon={WalletCards} label="Contract details" detail="Review configured network contracts" onClick={() => navigate('/contract-details')}/></div>,
  };

  const activeMeta = sectionMeta.find((item) => item.id === active)!;
  const ActiveIcon = activeMeta.icon;
  return <AppShell title="Settings" showBack>
    <div className="phase17-settings" data-phase17-settings data-settings-section={active}>
      <header className="phase17-settings__intro"><p>ETERNITY · SYSTEM</p><h1>Settings</h1><span>Manage local appearance, wallet access and provider-backed system preferences.</span></header>
      <label className="phase17-settings__mobile-select"><span>Settings section</span><select value={active} onChange={(event) => selectSection(event.target.value as Phase17SettingSection)}>{sectionMeta.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <div className="phase17-settings__layout">
        <nav className="phase17-settings__nav" aria-label="Settings sections">{sectionMeta.map(({id,label,detail,icon:Icon}) => <button type="button" key={id} className={active === id ? 'is-active' : ''} aria-current={active === id ? 'page' : undefined} onClick={() => selectSection(id)}><Icon aria-hidden="true"/><span><strong>{label}</strong><small>{detail}</small></span></button>)}</nav>
        <section className="phase17-settings__detail" aria-labelledby="phase17-settings-panel-title"><header><ActiveIcon aria-hidden="true"/><div><p>System preference</p><h2 id="phase17-settings-panel-title">{activeMeta.label}</h2></div></header>{panels[active]}</section>
      </div>
    </div>
  </AppShell>;
}
