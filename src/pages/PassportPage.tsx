import { useState } from 'react';
import {
  ArrowRight, Award, BadgeCheck, BookOpen, Check, CheckCircle2, Copy,
  Edit3, History, Landmark, Medal,
  Sparkles, Trophy, UserRound, Users, Vote, WalletCards,
} from '@icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { IdentityAvatar } from '../components/ui/IdentityAvatar';
import { FanLevelStars } from '../components/ui/FanLevelStars';
import { SectionTabs, type SectionTab } from '../components/ui/SectionTabs';
import { mockBadges, mockCertificates, mockEESStocks, mockPortfolioValue, mockUser } from '../data/mockAssets';
import { formatCurrency } from '../lib/utils';
import { useEternityUserState } from '../lib/userState';
import { useWallet } from '../lib/wallet-context';
import { useJourney } from '../lib/journey/journey-context';
import type { JourneyEvent } from '../lib/journey/types';
import { CommunityOrbit } from '../components/fan/CommunityOrbit';
import { JourneyMemory, JourneyMemoryRow } from '../components/journey/JourneyMemory';

const tabs = ['overview','activity','growth','credentials','community','governance'] as const;
type PassportTab = typeof tabs[number];

const tabItems: SectionTab<PassportTab>[] = [
  { key:'overview', label:'Overview', icon:Sparkles },
  { key:'activity', label:'Activity', icon:History },
  { key:'growth', label:'Growth', icon:Award },
  { key:'credentials', label:'Skills', icon:BadgeCheck },
  { key:'community', label:'Your Community', icon:Users },
  { key:'governance', label:'Governance', icon:Landmark },
];

export function PassportPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const user = useEternityUserState();
  const wallet = useWallet();
  const journey = useJourney();
  const [copied, setCopied] = useState<'idle' | 'done' | 'error'>('idle');
  const requested = params.get('tab') as PassportTab | null;
  const active: PassportTab = requested && tabs.includes(requested) ? requested : 'overview';
  const progress = mockUser.achievementProgress!;
  const levelProgress = Math.min(100, Math.max(0, progress.progressPercent));
  const displayEid = mockUser.primaryEid.replace(/\.eter$/i, '');
  const nextLevel = progress.level + 1;
  const nextLevelEQ = 7500;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(mockUser.eidInviteLink);
      setCopied('done');
    } catch {
      setCopied('error');
    }
    window.setTimeout(() => setCopied('idle'), 1600);
  };

  if (user.isGuest) {
    return <AppShell title="ETERNITY Passport" wide>
      <div className="passport-workspace"><section className="passport-guest">
        <span><UserRound size={30}/></span>
        <h1>Your Passport is not active yet.</h1>
        <p>Explore ETERNITY without connecting, or connect a wallet when you are ready.</p>
        <div><button type="button" onClick={() => navigate('/world')}>Explore first<ArrowRight size={17}/></button><button type="button" onClick={wallet.connect} disabled={wallet.isConnecting}>{wallet.isConnecting ? 'Connecting…' : 'Connect wallet'}<WalletCards size={17}/></button></div>
        {wallet.error && <small role="alert">{wallet.error}</small>}
      </section></div>
    </AppShell>;
  }

  return <AppShell title="ETERNITY Passport" wide>
    <div className="passport-workspace passport-vnext">
      {user.isDemo && <div className="demo-profile-banner" role="status"><strong>Demo profile</strong><span>These values are examples and are not connected to your wallet.</span></div>}

      <section className="passport-identity">
        <div className="passport-avatar-control">
          <span className="passport-avatar-frame" aria-hidden="true">
            <IdentityAvatar identity={mockUser.walletAddress} level={progress.level} size={82} className="passport-round-avatar"/>
          </span>
          <button type="button" className="passport-avatar-edit" onClick={() => navigate('/profile/edit')} aria-label="Edit profile image">
            <Edit3 size={15}/><span>Edit</span>
          </button>
        </div>
        <div className="passport-identity-copy">
          <h1>
            <button type="button" className="passport-eid-link" onClick={() => navigate(`/eid/${displayEid.toLowerCase()}`)} aria-label={`Open ${displayEid} EID page`}>
              <bdi>{displayEid}</bdi><ArrowRight size={18}/>
            </button>
          </h1>
        </div>
        <button className="passport-copy passport-invite-link invite-link-cta" onClick={copyInvite} aria-label="Copy invite link">
          {copied === 'done' ? <Check size={18}/> : <Copy size={18}/>}
          <span>{copied === 'done' ? 'Invite copied' : copied === 'error' ? 'Copy unavailable' : 'Invite link'}</span>
        </button>
        <div className="passport-identity-meta">
          <span className="passport-generation">GEN: <strong>GENESIS</strong></span>
          <button className="passport-fan-stars" onClick={() => navigate('/fan')} aria-label={`${mockUser.starLevel} star FAN access`}>
            <FanLevelStars stars={mockUser.starLevel} size="sm"/>
          </button>
        </div>
        <button className="passport-level-progress" onClick={() => navigate('/achievements')} aria-label="Open achievement progress">
          <header><span>Achievement progress</span><strong>{levelProgress}%</strong></header>
          <div role="progressbar" aria-label="Achievement progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={levelProgress}><i style={{ width:`${levelProgress}%` }}/></div>
          <footer>
            <small><bdi>{progress.eqPoints.toLocaleString()}</bdi> EQ</small>
            <small>Level <bdi>{nextLevel}</bdi> · <bdi>{nextLevelEQ.toLocaleString()}</bdi> EQ</small>
          </footer>
        </button>
      </section>

      <SectionTabs className="passport-tabs passport-tabs-vnext" label="Passport sections" items={tabItems} active={active} onChange={(tab) => setParams(tab === 'overview' ? {} : { tab }, { replace:true })}/>

      {active === 'overview' && <PassportOverview navigate={navigate} events={journey.events}/>}
      {active === 'activity' && <PassportActivity events={journey.events} navigate={navigate}/>}
      {active === 'growth' && <SectionPanel icon={Sparkles} title="Growth & achievements" text="Your level, EQ, milestones and activity ledger in one coherent path." action="Open achievements" onAction={() => navigate('/achievements')}/>}
      {active === 'credentials' && <CredentialPanel/>}
      {active === 'community' && <CommunityOrbit/>}
      {active === 'governance' && <SectionPanel icon={Vote} title="Governance" text="Review proposals, voting history and eligibility without losing context." action="Open ERA" onAction={() => navigate('/era')}/>}
    </div>
  </AppShell>;
}

function PassportOverview({ navigate, events }: { navigate:(path:string)=>void; events:JourneyEvent[] }) {
  const progress = mockUser.achievementProgress!;
  const cards = [
    { eyebrow:'Current mission', title:'Complete wallet safety', detail:'2 tasks left · 20 EQ', icon:BookOpen, action:'Continue mission', route:'/home' },
    { eyebrow:'Latest achievement', title:'Safe start', detail:'Verified milestone', icon:Medal, action:'View growth', route:'/achievements' },
    { eyebrow:'Achievements', title:`${mockBadges.length} milestones`, detail:`Level ${progress.level} · ${progress.eqPoints.toLocaleString()} EQ`, icon:BadgeCheck, action:'View achievements', route:'/achievements' },
    { eyebrow:'Ownership', title:formatCurrency(mockPortfolioValue.total), detail:'Preview estimated value', icon:WalletCards, action:'View economy', route:'/economy' },
    { eyebrow:'Governance', title:'9 ecosystem votes', detail:'Verified participation', icon:Landmark, action:'View ERA', route:'/era' },
  ];
  const votingRights = mockEESStocks.reduce((total, stock) => total + stock.votingPower, 0);
  return <div className="passport-overview">
    <section className="passport-metrics">{[['Level',String(progress.level)],['EQ',progress.eqPoints.toLocaleString()],['Voting rights',String(votingRights)],['Reputation',String(mockUser.trustScore)]].map(([label,value]) => <div key={label}><strong>{value}</strong><small>{label}</small></div>)}</section>
    <button className="passport-leaderboard-card" onClick={() => navigate('/leaderboard')}>
      <span><Trophy size={22}/></span>
      <span><small>Leaderboard</small><strong>Rank #18</strong></span>
      <span>Open ranking<ArrowRight size={16}/></span>
    </button>
    <section className="passport-card-carousel" aria-label="Passport highlights">{cards.map(({ icon:Icon, ...card }) => <article key={card.eyebrow} className="passport-feature-card">
      <Icon size={25} aria-hidden="true"/>
      <span>{card.eyebrow}</span><h2>{card.title}</h2><p>{card.detail}</p>
      <button onClick={() => navigate(card.route)}>{card.action}<ArrowRight size={16}/></button>
    </article>)}</section>
    <JourneyMemory events={events} preview onViewAll={() => navigate('/passport?tab=activity')}/>
  </div>;
}

function PassportActivity({ events, navigate }: { events:JourneyEvent[]; navigate:(path:string)=>void }) {
  return <section className="passport-activity"><header><span><History size={25}/></span><div><h2>Growth & impact history</h2><p>Every action, feature, Journey impact, EQ change and transaction reference in one readable timeline.</p></div></header>
    {events.length ? <div className="passport-activity__timeline">{events.map((event) => <JourneyMemoryRow key={event.id} event={event}/>)}</div> : <div className="passport-activity__empty"><History size={28}/><h3>Your history begins with your first verified action.</h3><p>Explore, choose a relevant mission and review its impact before signing.</p><button onClick={() => navigate('/home')}>Open Journey<ArrowRight size={16}/></button></div>}
  </section>;
}

function SectionPanel({ icon:Icon, title, text, action, onAction }: { icon:typeof Award; title:string; text:string; action:string; onAction:()=>void }) {
  return <section className="passport-section-panel"><span><Icon size={28}/></span><h2>{title}</h2><p>{text}</p><button onClick={onAction}>{action}<ArrowRight size={17}/></button></section>;
}

function CredentialPanel() {
  return <section className="passport-credentials"><header><Award size={26}/><div><h2>Skills & credentials</h2><p>Learning credentials and provable badges.</p></div></header><div>{mockCertificates.map((item) => <article key={item.id}><span><CheckCircle2 size={18}/></span><strong>{item.name}</strong><small>{item.level}</small></article>)}{mockBadges.slice(0,3).map((item) => <article key={item.id}><span><Medal size={18}/></span><strong>{item.name}</strong><small>{item.rarity}</small></article>)}</div></section>;
}
