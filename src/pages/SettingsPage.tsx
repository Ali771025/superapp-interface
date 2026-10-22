import { useState } from 'react';
import { Bell, ChevronRight, FileCode2, HelpCircle, LogOut, Moon, Plus, Shield, Sun, User, WalletCards } from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { useTheme } from '../lib/theme-context';
import { useWallet } from '../lib/wallet-context';
import { mockUser } from '../data/mockAssets';
import { useNavigate } from 'react-router-dom';
import { TokenMark } from '../components/ui/TokenMark';
import { IdentityAvatar } from '../components/ui/IdentityAvatar';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { Phase17SettingsPage } from '../special3/system/Phase17SettingsPage';

export function SettingsPage() {
  if (isSpecial3ShellEnabled()) return <Phase17SettingsPage/>;
  return <LegacySettingsPage/>;
}

function LegacySettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { disconnect } = useWallet();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [tokenMenu, setTokenMenu] = useState(false);
  const [addedTokens, setAddedTokens] = useState<string[]>([]);

  return <AppShell title="Settings" showBack><div className="vf-settings-page">
    <section className="vf-settings-profile">
      <div className="vf-settings-identity">
        <IdentityAvatar identity={mockUser.walletAddress} level={mockUser.achievementProgress?.level ?? 0} size={56}/>
        <span><strong>{mockUser.username}</strong><small>{mockUser.primaryEid}</small></span>
      </div>
      <button onClick={() => navigate('/profile')}>Profile<ChevronRight size={17}/></button>
    </section>

    <section className="vf-settings-group"><header>{theme === 'dark' ? <Moon size={18}/> : <Sun size={18}/>}<strong>Appearance</strong></header><SettingToggle label="Dark theme" value={theme === 'dark'} onChange={toggleTheme}/></section>

    <section className="vf-settings-group"><header><Bell size={18}/><strong>Notifications</strong></header><SettingToggle label="Push notifications" value={notifications} onChange={() => setNotifications((value) => !value)}/></section>

    <section className="vf-settings-group"><header><Shield size={18}/><strong>Security</strong></header><SettingToggle label="Biometric lock" value={biometric} onChange={() => setBiometric((value) => !value)}/><button className="vf-settings-row" onClick={() => navigate('/trust-score')}><span><User size={17}/>Trust score</span><ChevronRight size={17}/></button></section>

    <section className="vf-settings-group"><header><WalletCards size={18}/><strong>Wallet tokens</strong></header><button className="vf-settings-row" onClick={() => setTokenMenu((open) => !open)} aria-expanded={tokenMenu}><span><Plus size={17}/>Add token to wallet</span><ChevronRight size={17} className={tokenMenu ? 'rotate-90' : ''}/></button>{tokenMenu && <div className="vf-token-add-list">{(['ETER','ET','Q'] as const).map((token) => <button key={token} disabled={addedTokens.includes(token)} onClick={() => setAddedTokens((items) => [...items, token])}><TokenMark token={token} size={28}/><strong>{token}</strong><span>{addedTokens.includes(token) ? 'Added' : <Plus size={16}/>}</span></button>)}</div>}</section>

    <section className="vf-settings-group"><header><FileCode2 size={18}/><strong>On-chain information</strong></header><button className="vf-settings-row" onClick={() => navigate('/contract-details')}><span><FileCode2 size={17}/>Contract details</span><ChevronRight size={17}/></button></section>

    <button onClick={() => navigate('/help')} className="vf-settings-help"><HelpCircle size={18}/><span>Help center</span><ChevronRight size={17}/></button>
    <button onClick={disconnect} className="vf-settings-disconnect"><LogOut size={17}/>Disconnect wallet</button>
    <p className="vf-settings-safety">Never share your seed phrase.</p>
  </div></AppShell>;
}

function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) { return <button className="vf-settings-toggle" onClick={onChange} role="switch" aria-checked={value}><span>{label}</span><i className={value ? 'is-on' : ''}/></button>; }
