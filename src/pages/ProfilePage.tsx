import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Check, Copy, Fingerprint, LockKeyhole, Medal, Pencil, Settings, ShieldCheck, Sparkles, Trophy, UserRound, Wallet } from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { CenteredModal } from '../components/modals/CenteredModal';
import { IdentityAvatar } from '../components/ui/IdentityAvatar';
import { mockBadges, mockCertificates, mockEESStocks, mockPortfolioValue, mockShields, mockUser } from '../data/mockAssets';
import { formatCurrency } from '../lib/utils';
import { getAchievementLevelColor } from '../lib/theme/achievementLevels';

type Detail = 'growth' | 'ownership' | 'identity';

export function ProfilePage() {
  const navigate = useNavigate();
  const progress = mockUser.achievementProgress!;
  const levelColor = getAchievementLevelColor(progress.level);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detail, setDetail] = useState<Detail>('growth');
  const [eid, setEid] = useState(mockUser.primaryEid);
  const [description, setDescription] = useState('Building a trusted community across ETERNITY.');
  const copyInvite = async () => { await navigator.clipboard.writeText(mockUser.eidInviteLink); setCopied(true); window.setTimeout(() => setCopied(false), 1400); };

  return <AppShell title="Profile"><div className="vf-profile-page">
    <section className="vf-profile-hero vf-social-profile" style={{ '--level-gradient': levelColor.gradient } as React.CSSProperties}>
      <div className="vf-profile-banner"/>
      <button className="vf-profile-edit" onClick={() => setEditOpen(true)} aria-label="Edit profile"><Pencil size={17}/></button>
      <button className="vf-profile-rank" onClick={() => navigate('/leaderboard')}><small>Rank</small><strong>#18</strong></button>
      <div className="vf-profile-person"><IdentityAvatar identity={mockUser.walletAddress} level={progress.level} size={88} showLevelBadge={false} className="vf-profile-avatar"/><div><h1>{mockUser.username}</h1><button onClick={() => navigate('/eid/my-names')}><Fingerprint size={16}/>{mockUser.primaryEid}</button><span><UserRound size={15}/>Community builder</span></div></div>
      <div className="vf-profile-social-stats"><span><strong>{progress.level}</strong><small>Level</small></span><span><strong>{progress.eqPoints.toLocaleString()}</strong><small>EQ</small></span><span><strong>{mockUser.trustScore}</strong><small>Reputation</small></span></div>
      <div className="vf-profile-actions"><button className="vf-invite-beacon invite-link-cta" onClick={copyInvite}>{copied ? <Check size={17}/> : <Copy size={17}/>}<span>{copied ? 'Copied' : 'Invite community'}</span></button></div>
    </section>

    <section className="vf-profile-shortcuts" aria-label="Profile progress">
      <button type="button" onClick={() => navigate('/leaderboard')}><Trophy size={23}/><span><small>Leaderboard</small><strong>Rank #18</strong></span><b>View</b></button>
      <button type="button" onClick={() => navigate('/achievements')}><Award size={23}/><span><small>Achievements</small><strong>{mockBadges.length} milestones</strong></span><b>View</b></button>
    </section>

    <section className="vf-profile-achievements"><header><h2>Highlights</h2><button onClick={() => navigate('/achievements')}>View all</button></header><div><Achievement icon={ShieldCheck} title="Safe start" state="earned"/><Achievement icon={Medal} title="Explorer" state="earned"/><Achievement icon={Trophy} title="Responsible" state="near"/></div></section>

    <section className="vf-profile-journey"><header><h2>Journey</h2><button onClick={() => navigate('/progress')}>Full path</button></header><div><JourneyStep icon={Fingerprint} label="EID" complete/><JourneyStep icon={BookOpen} label="Learn" complete/><JourneyStep icon={Award} label="Mission" active/><JourneyStep icon={Trophy} label="Level 5"/></div></section>

    <section className="vf-profile-details"><nav aria-label="Profile details"><button className={detail === 'growth' ? 'is-active' : ''} onClick={() => setDetail('growth')}><Sparkles size={16}/>Growth</button><button className={detail === 'ownership' ? 'is-active' : ''} onClick={() => setDetail('ownership')}><Wallet size={16}/>Ownership</button><button className={detail === 'identity' ? 'is-active' : ''} onClick={() => setDetail('identity')}><LockKeyhole size={16}/>Identity</button></nav>
      {detail === 'growth' && <div className="vf-detail-metrics"><Metric value="72%" label="Confidence"/><Metric value={`${mockCertificates.length}`} label="Certificates"/><Metric value={`${mockBadges.length}`} label="Achievements"/></div>}
      {detail === 'ownership' && <div className="vf-detail-metrics"><Metric value={formatCurrency(mockPortfolioValue.total)} label="Portfolio"/><Metric value={`${mockShields.length}`} label="SHIELD"/><Metric value={`${mockEESStocks.length}`} label="Stock"/></div>}
      {detail === 'identity' && <div className="vf-detail-metrics"><Metric value={`${mockUser.trustScore}`} label="Reputation"/><Metric value="Public" label="EID"/><Metric value="Private" label="Details"/></div>}
    </section>

    <button onClick={() => navigate('/settings')} className="vf-profile-settings"><Settings size={18}/><span>Preferences</span></button>
    <CenteredModal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" maxWidth="max-w-lg"><div className="p-5 space-y-4"><label className="block text-sm font-bold">Profile image<input type="file" accept="image/*" className="field-control p-2 mt-2"/></label><label className="block text-sm font-bold">Primary EID<select value={eid} onChange={(event) => setEid(event.target.value)} className="field-control px-3 mt-2"><option>{mockUser.primaryEid}</option><option>builder.eter</option></select></label><label className="block text-sm font-bold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value.slice(0, 160))} maxLength={160} rows={3} className="field-control p-3 mt-2"/><span className="block text-right text-xs text-[var(--muted)] mt-1">{description.length}/160</span></label><button onClick={() => setEditOpen(false)} className="cut-button cut-button--primary w-full px-4">Save</button></div></CenteredModal>
  </div></AppShell>;
}

function Achievement({ icon: Icon, title, state }: { icon: typeof Trophy; title: string; state: 'earned' | 'near' }) { return <button className={`vf-achievement is-${state}`}><span><Icon size={24}/>{state === 'earned' && <i><Check size={11}/></i>}</span><strong>{title}</strong><small>{state === 'earned' ? 'Unlocked' : '1 step'}</small></button>; }
function JourneyStep({ icon: Icon, label, complete, active }: { icon: typeof Trophy; label: string; complete?: boolean; active?: boolean }) { return <div className={`${complete ? 'is-complete' : ''} ${active ? 'is-active' : ''}`}><span><Icon size={18}/></span><strong>{label}</strong></div>; }
function Metric({ value, label }: { value: string; label: string }) { return <div><strong>{value}</strong><small>{label}</small></div>; }
