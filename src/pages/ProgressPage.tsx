import { Award, BookOpen, Check, ChevronRight, Fingerprint, Flag, GraduationCap, ShieldCheck, Sparkles, Target, Trophy, Wallet } from '@icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { IdentityAvatar } from '../components/ui/IdentityAvatar';
import { mockUser } from '../data/mockAssets';
import { IS_PREVIEW_MODE } from '../lib/contracts/contractConfig';
import { useWallet } from '../lib/wallet-context';
import { committedEqHistory } from '../special3/progression/eqPresentation';
import { BrowserProgressionPersistence } from '../special3/progression/persistence';
import type { EqLedgerEntry } from '../special3/progression/types';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { SpecialProgressPage } from '../special3/system/SpecialSystemPages';

const journey=[
  {title:'Entered through an ETERNITY invite',detail:'You reviewed the ecosystem before connecting a wallet.',time:'March 15',icon:Flag,state:'complete'},
  {title:'Created ALEX.ETER',detail:'Your EID became the identity for profile and referrals.',time:'March 15',icon:Fingerprint,state:'complete'},
  {title:'Completed wallet safety',detail:'EDGE verified the approval and signature lesson.',time:'March 18',icon:GraduationCap,state:'complete'},
  {title:'Joined FAN Community',detail:'Your first community access became active.',time:'April 2',icon:ShieldCheck,state:'complete'},
  {title:'Current mission · Reward review',detail:'One verified reward action remains.',time:'Now',icon:Target,state:'current'},
  {title:'Next · Responsible participant',detail:'Complete the current mission to unlock this achievement.',time:'Next',icon:Trophy,state:'next'},
];

export function ProgressPage() {
  if (isSpecial3ShellEnabled()) return <SpecialProgressPage/>;
  return <LegacyProgressPage/>;
}

function LegacyProgressPage() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const progress = mockUser.achievementProgress!;
  const special3 = isSpecial3ShellEnabled();
  const [ledgerEntries, setLedgerEntries] = useState<EqLedgerEntry[]>([]);
  const [ledgerStatus, setLedgerStatus] = useState<'loading' | 'available' | 'empty' | 'preview-unavailable' | 'unavailable'>('loading');

  useEffect(() => {
    if (!special3) return;
    if (!wallet.address) {
      setLedgerEntries([]);
      setLedgerStatus(IS_PREVIEW_MODE ? 'preview-unavailable' : 'empty');
      return;
    }
    let active = true;
    new BrowserProgressionPersistence(window.localStorage).load(wallet.address)
      .then((state) => {
        if (!active) return;
        const committed = committedEqHistory(state);
        setLedgerEntries(committed);
        setLedgerStatus(committed.length ? 'available' : (IS_PREVIEW_MODE ? 'preview-unavailable' : 'empty'));
      })
      .catch(() => {
        if (!active) return;
        setLedgerEntries([]);
        setLedgerStatus('unavailable');
      });
    return () => { active = false; };
  }, [special3, wallet.address]);

  const specialLedgerMessage = ledgerStatus === 'loading'
    ? 'Loading verified EQ ledger…'
    : ledgerStatus === 'preview-unavailable'
      ? 'Verified EQ history unavailable in Preview'
      : ledgerStatus === 'empty'
        ? 'No verified EQ ledger entries available'
        : ledgerStatus === 'unavailable'
          ? 'Verified EQ history unavailable'
          : '';

  return <AppShell title="Progress" wide><div className="qf-progress-page">
    <section className="qf-progress-hero"><div className="qf-progress-person"><IdentityAvatar identity={mockUser.walletAddress} level={progress.level}/><span><small>Your growth journey</small><h2>Level {progress.level}</h2><p>{progress.eqPoints.toLocaleString()} EQ · 1,180 to next level</p></span></div><div className="qf-level-track"><header><span>Progress to Level {progress.level+1}</span><strong>{progress.progressPercent}%</strong></header><div><i style={{width:`${progress.progressPercent}%`}}/></div><p>Every EQ event remains traceable to a completed action, lesson or contribution.</p></div></section>
    <section className="qf-level-map"><header><div><span>19-level journey</span><h2>A visible path without pressure</h2></div><small>Current accent evolves with level</small></header><div>{Array.from({length:19},(_,index)=>index+1).map(level=><span key={level} className={level<progress.level?'complete':level===progress.level?'current':''}>{level<progress.level?<Check size={12}/>:level}</span>)}</div></section>
    <div className="qf-progress-layout"><section className="qf-journey-timeline"><header><div><span>Journey timeline</span><h2>Your story in human language</h2></div><button disabled title="Timeline filtering is not available">Filter unavailable</button></header><div>{journey.map(({title,detail,time,icon:Icon,state})=><article key={title} className={`is-${state}`}><div className="qf-timeline-line"><span><Icon size={17}/></span><i/></div><div><time>{time}</time><h3>{title}</h3><p>{detail}</p>{state==='current'&&<button onClick={()=>navigate('/qora?prompt=Continue my current mission')}>Continue with QORA <ChevronRight size={14}/></button>}</div></article>)}</div></section>
      <aside className="qf-growth-details"><section><header><Award size={18}/><h2>Near achievements</h2></header><div className="qf-near-achievement"><Trophy size={22}/><span><strong>Responsible participant</strong><small>Review one verified action</small></span><em>80%</em></div><div className="qf-near-achievement"><Sparkles size={22}/><span><strong>Guided explorer</strong><small>Complete one EDGE lesson</small></span><em>60%</em></div></section><section><header><BookOpen size={18}/><h2>Knowledge tracks</h2></header>{[['Wallet safety','72%'],['Feature understanding','70%'],['Community ethics','88%']].map(([label,value])=><div className="qf-knowledge" key={label}><span>{label}</span><div><i style={{width:value}}/></div><small>{value}</small></div>)}<button onClick={()=>navigate('/readiness')}>Open contextual learning <ChevronRight size={14}/></button></section>
        <section data-special3-eq-history={special3 ? ledgerStatus : undefined}>
          <header><Wallet size={18}/><h2>{special3 ? 'Verified EQ ledger' : 'Recent EQ'}</h2>{!special3 && IS_PREVIEW_MODE ? <small>Preview · Mock history</small> : null}</header>
          {special3 ? (
            ledgerEntries.length ? <dl>{ledgerEntries.slice(0, 5).map((entry) => <div key={entry.ledgerEntryId}><dt>{entry.product} · {entry.achievementId} · {entry.classification}</dt><dd>+{entry.eqDelta.toLocaleString()} EQ</dd></div>)}</dl>
              : <p className="text-sm text-[var(--muted)]">{specialLedgerMessage}</p>
          ) : <dl><div><dt>EDGE lesson</dt><dd>+20 EQ</dd></div><div><dt>Community quality</dt><dd>+35 EQ</dd></div><div><dt>Governance review</dt><dd>+15 EQ</dd></div></dl>}
        </section>
      </aside>
    </div>
  </div></AppShell>;
}
