import { useEffect, useRef, useState } from 'react';
import {
  Award, BadgeCheck, BookOpen, ChevronDown, ChevronUp, Fingerprint,
  Medal, Settings2, Trophy, UserRound, WalletCards, X,
} from '@icons';
import { IdentityAvatar } from '../ui/IdentityAvatar';
import { FanLevelStars } from '../ui/FanLevelStars';
import { ThemeToggle } from '../ui/ThemeToggle';
import { mockBadges, mockCertificates, mockPortfolioValue, mockUser } from '../../data/mockAssets';
import type { UserProgressSnapshot } from '../../lib/userState';
import { useNavigate } from 'react-router-dom';

export type MobilePassportMode = 'compact' | 'expanded';
type PassportPanel = 'overview' | 'identity' | 'achievements' | 'reputation' | 'settings';

interface MobilePassportProps {
  mode: MobilePassportMode;
  onModeChange: (mode: MobilePassportMode) => void;
  user: UserProgressSnapshot;
  requestedPanel?: string | null;
}

const panels = [
  { id:'overview', label:'Overview', icon:BookOpen },
  { id:'identity', label:'Identity', icon:Fingerprint },
  { id:'achievements', label:'Achievements', icon:Award },
  { id:'reputation', label:'Reputation', icon:Trophy },
  { id:'settings', label:'Settings', icon:Settings2 },
] as const;

export function MobilePassport({ mode, onModeChange, user, requestedPanel }: MobilePassportProps) {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<PassportPanel>('overview');
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const expansionRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const level = user.isGuest ? 0 : user.level;
  const eq = user.isGuest ? 0 : user.eq;
  const eid = user.isGuest ? 'Guest explorer' : mockUser.primaryEid;
  const levelProgress = user.isGuest ? 0 : mockUser.achievementProgress?.progressPercent ?? 0;
  const remaining = Math.max(0, 100 - levelProgress);
  const milestones = user.isGuest ? [] : [
    { mission:'Create your EID', eq:20, position:12, state:'claimed', route:'/eid' },
    { mission:'Generate ETER', eq:50, position:31, state:'pending', route:'/generator/generate' },
    { mission:'Complete EDGE lesson', eq:100, position:49, state:'failed', route:'/readiness' },
    { mission:'Join Forecast', eq:200, position:68, state:'locked', route:'/forecast' },
    { mission:'Participate in ERA', eq:100, position:86, state:'expired', route:'/era' },
  ];

  useEffect(() => {
    if (mode === 'compact') { setActivePanel('overview'); setActiveMilestone(null); }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setActiveMilestone(null); onModeChange('compact'); ribbonRef.current?.focus(); }
      if (event.key === 'Tab' && mode === 'expanded' && expansionRef.current) {
        const focusable = Array.from(expansionRef.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'));
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    if (mode === 'expanded') window.requestAnimationFrame(() => expansionRef.current?.querySelector<HTMLElement>('button')?.focus());
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, onModeChange]);

  useEffect(() => { setActiveMilestone(null); }, [mode]);

  useEffect(() => {
    const panel = requestedPanel === 'activity' ? 'overview' : requestedPanel;
    if (panels.some((item) => item.id === panel)) setActivePanel(panel as PassportPanel);
  }, [requestedPanel]);

  return <section className={`mobile-passport-shell ${mode === 'expanded' ? 'is-expanded' : ''}`} aria-label="ETERNITY Passport">
    <div
      ref={ribbonRef}
      className="mobile-passport-ribbon"
      onClick={() => onModeChange(mode === 'compact' ? 'expanded' : 'compact')}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onModeChange(mode === 'compact' ? 'expanded' : 'compact'); }}
      aria-expanded={mode === 'expanded'}
      aria-controls="mobile-passport-expanded"
      role="button"
      tabIndex={0}
    >
      <IdentityAvatar identity={eid} level={level} size={40} showLevelBadge={false}/>
      <span className="mobile-passport-identity"><strong>{eid}</strong><small>ETERNITY Passport</small></span>
      <span className="mobile-passport-stat mobile-passport-stars"><small>FAN rank</small><strong><FanLevelStars stars={user.isGuest ? 0 : user.starLevel} size="xs"/></strong></span>
      <span className="mobile-passport-stat"><small>Level</small><strong>{level}</strong></span>
      <span className="mobile-passport-stat"><small>EQ</small><strong>{eq.toLocaleString()}</strong></span>
      <span className="mobile-passport-stat"><small>Next level</small><strong>{remaining}% left</strong></span>
      <span className="mobile-passport-chevron" aria-hidden="true">{mode === 'compact' ? <ChevronDown size={19}/> : <ChevronUp size={19}/>}</span>
      <span className="mobile-passport-progress"><i role="progressbar" aria-label={`Level ${level} progress: ${levelProgress} percent. ${remaining} percent remaining.`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={levelProgress} style={{ width: `${levelProgress}%` }}/>{milestones.map((item,index)=><button key={item.mission} type="button" className={`passport-milestone is-${item.state} ${index === 0 ? 'is-first' : index === milestones.length - 1 ? 'is-last' : ''}`} style={{insetInlineStart:`${item.position}%`}} aria-label={`${item.mission}, ${item.eq} EQ, ${item.state}`} aria-expanded={activeMilestone===index} onClick={(event)=>{event.stopPropagation();if(activeMilestone===index&&(item.state==='failed'||item.state==='locked')){navigate(item.route);return;}setActiveMilestone(activeMilestone===index?null:index);}}>{activeMilestone===index&&<span role="dialog" aria-label={`${item.mission} mission`}><strong>{item.mission}</strong><small>{item.state==='claimed'?`${item.eq} EQ claimed`:item.state==='pending'?'Pending verification':item.state==='failed'?'Verification failed · activate again to retry':item.state==='locked'?'Locked · activate again to view requirements':`${item.eq} EQ expired`}</small></span>}</button>)}</span>
    </div>

    {mode === 'expanded' &&
      <div
        id="mobile-passport-expanded"
        ref={expansionRef}
        className="mobile-passport-expansion"
        role="dialog"
        aria-modal="true"
        aria-label="Expanded Passport"
      >
        <div className="mobile-passport-expanded-inner">
        <button type="button" className="mobile-passport-close" onClick={() => onModeChange('compact')} aria-label="Close Passport"><X size={18}/></button>
        <nav className="mobile-passport-tabs" aria-label="Passport sections">
          {panels.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActivePanel(id)} aria-pressed={activePanel === id}><Icon size={18}/><span>{label}</span></button>)}
        </nav>

        <div className="mobile-passport-panel">
          {activePanel === 'overview' && <div className="mobile-passport-overview">
            <article><WalletCards size={21}/><span><small>Portfolio</small><strong>{user.isGuest ? '—' : `$${mockPortfolioValue.total.toLocaleString()}`}</strong></span></article>
            <article><BadgeCheck size={21}/><span><small>Trust score</small><strong>{user.isGuest ? '—' : `${mockUser.trustScore}/100`}</strong></span></article>
            <article><Trophy size={21}/><span><small>Global position</small><strong aria-label="Unavailable">—</strong></span></article>
            <article><Award size={21}/><span><small>Level progress</small><strong>{remaining}% remaining</strong></span></article>
            <section className="mobile-passport-mission"><span><small>Current mission</small><strong>{user.isGuest ? 'Choose your first guided step' : mockUser.achievementProgress?.nextTask}</strong></span><div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={levelProgress}><i style={{ width: `${levelProgress}%` }}/></div></section>
          </div>}

          {activePanel === 'identity' && <div className="mobile-passport-detail-grid">
            <article><Fingerprint size={22}/><small>Primary EID</small><strong>{eid}</strong></article>
            <article><WalletCards size={22}/><small>Wallet</small><strong>{user.isGuest ? 'Not connected' : `${mockUser.walletAddress.slice(0, 8)}…${mockUser.walletAddress.slice(-6)}`}</strong></article>
            <article><BadgeCheck size={22}/><small>DAO status</small><strong>{user.isGuest ? 'Guest' : mockUser.daoStatus}</strong></article>
          </div>}

          {activePanel === 'achievements' && <div className="mobile-passport-achievements">
            {mockBadges.slice(0, 3).map((badge) => <article key={badge.id}><Medal size={21}/><span><strong>{badge.name}</strong><small>{badge.rarity} badge</small></span></article>)}
            {mockCertificates.slice(0, 2).map((certificate) => <article key={certificate.id}><Award size={21}/><span><strong>{certificate.name}</strong><small>{certificate.level} credential</small></span></article>)}
          </div>}

          {activePanel === 'reputation' && <div className="mobile-passport-detail-grid">
            <article><Trophy size={22}/><small>Ecosystem rank</small><strong aria-label="Unavailable">—</strong></article>
            <article><BadgeCheck size={22}/><small>Trust score</small><strong>{user.isGuest ? '—' : `${mockUser.trustScore}/100`}</strong></article>
            <article><UserRound size={22}/><small>FAN access</small><strong>{user.isGuest ? '0 Star' : `${user.starLevel} Star`}</strong></article>
          </div>}

          {activePanel === 'settings' && <div className="mobile-passport-settings">
            <div><span><Settings2 size={21}/><span><strong>Appearance</strong><small>Choose the interface theme.</small></span></span><ThemeToggle/></div>
            <p>Wallet and identity preferences remain attached to this Passport.</p>
          </div>}
        </div>
        </div>
      </div>
    }
  </section>;
}
