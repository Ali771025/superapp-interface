import { useState } from 'react';
import { Activity, Copy, QrCode, Route, Users } from '@icons';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { cn } from '../lib/utils';
import { mockFanProfile, mockUser } from '../data/mockAssets';
import { FanLevelStars } from '../components/ui/FanLevelStars';
import { CommunityOrbit } from '../components/fan/CommunityOrbit';
import { SectionTabs } from '../components/ui/SectionTabs';

const growthPath = [
  { id: 'fan', stars: 0, label: 'FAN access', requirement: 'Join the community' }, { id: 'one', stars: 1, label: 'FAN access', requirement: 'Activate annual membership' },
  { id: 'two', stars: 2, label: 'FAN access', requirement: 'Complete the next slot' }, { id: 'three', stars: 3, label: 'FAN access', requirement: 'Complete the third slot' },
  { id: 'four', stars: 4, label: 'FAN access', requirement: 'Complete all four slots' },
  { id: 'legioner', stars: 4, label: 'LEGIONER', requirement: 'Build and maintain a qualified community' },
  { id: 'legend', stars: 4, label: 'LEGEND', requirement: 'Reach the Legend community milestone' },
  { id: 'legend-one', stars: 1, label: 'LEGEND', requirement: 'Legend progression · first star' },
];

export function CommunityPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'status' | 'growth' | 'community'>('community');
  const [copied, setCopied] = useState(false);
  const invite = `https://example.invalid/invite/${mockUser.primaryEid}`;
  const copy = () => { navigator.clipboard.writeText(invite); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <AppShell title="FAN Community" showBack wide><div className="space-y-4">
    <section className="brand-surface flex items-center justify-between gap-4 p-4"><div><p className="eyebrow">Community profile</p><h1 className="section-title mt-1">{mockUser.primaryEid}</h1></div><button type="button" onClick={() => navigate('/leaderboard')} className="min-w-20 text-right focus-ring"><span className="data-label block">RANK</span><strong className="text-2xl text-primary-500">#18</strong></button></section>
    <SectionTabs label="FAN community views" items={[{ key: 'status', label: 'Status', icon: Activity }, { key: 'community', label: 'Your Community', icon: Users }, { key: 'growth', label: 'Growth Path', icon: Route }]} active={tab} onChange={(key) => setTab(key as typeof tab)} />
    {tab === 'status' && <div className="space-y-4 animate-fade-in"><section className="brand-surface p-5"><div className="flex items-start justify-between gap-3"><div><p className="data-label">Current FAN access</p><FanLevelStars stars={mockFanProfile.starLevel} size="lg" animated className="mt-3" /></div><button onClick={() => navigate('/fan/upgrade')} className="cut-button cut-button--primary px-4">Upgrade</button></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">{[['Direct fans', mockFanProfile.directReferrals], ['Community fans', mockFanProfile.totalDownline], ['Quality', `${mockFanProfile.referralQualityScore}/100`], ['Network income', `${mockFanProfile.claimableIncome} ETER`]].map(([label, value]) => <div key={label} className="data-surface p-3"><p className="text-xs text-[var(--muted)]">{label}</p><p className="text-lg font-bold mt-1">{value}</p></div>)}</div></section><section className="surface p-4"><p className="text-sm font-bold">Invite link</p><p className="text-xs text-[var(--muted)] mt-1">The active EID is embedded in this link.</p><div className="data-surface flex items-center gap-2 p-3 mt-3"><span className="min-w-0 flex-1 truncate font-mono text-xs">{invite}</span><button onClick={copy} className="invite-link-cta cut-button px-3"><Copy size={14} /> {copied ? 'Copied' : 'Copy'}</button></div><div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]"><QrCode size={18} /> QR sharing uses the same identity link.</div></section></div>}
    {tab === 'community' && <CommunityOrbit />}
    {tab === 'growth' && <div className="space-y-2 animate-fade-in">{growthPath.map((level) => <article key={level.id} className={cn('surface p-4 flex items-center gap-3', level.id === ['fan', 'one', 'two', 'three', 'four'][mockFanProfile.starLevel] && 'outline outline-2 outline-primary-500')}><div className="min-w-24"><FanLevelStars stars={level.stars} size="sm" /></div><div className="flex-1"><p className="text-sm font-bold">{level.label}</p><p className="text-xs text-[var(--muted)] mt-1">{level.requirement}</p></div>{level.id === ['fan', 'one', 'two', 'three', 'four'][mockFanProfile.starLevel] && <span className="text-xs font-bold text-primary-500">Current</span>}</article>)}<button onClick={() => navigate('/fan/upgrade')} className="cut-button cut-button--primary w-full px-4">Upgrade level</button></div>}
  </div></AppShell>;
}
