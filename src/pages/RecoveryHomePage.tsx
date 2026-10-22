import { Activity, ArrowRight, BadgeCheck, Building2, CircleGauge, Coins, Fingerprint, Gift, GraduationCap, HandCoins, Landmark, LineChart, Rocket, ShieldCheck, Trophy, UserRound, Users, Zap } from '@icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useJourney } from '../lib/journey/journey-context';
import { useWallet } from '../lib/wallet-context';
import { usePathPreference } from '../special3/home/usePathPreference';
import type { PathPreference } from '../special3/home/pathPreference';
import { getPathQoraGuidance } from '../special3/home/pathQoraGuidance';
import { ContextualQoraLead } from '../special3/hero';
import './recovery-pages.css';

const paths = [
  {id:'investment',label:'Investment',icon:Landmark},
  {id:'stockholder',label:'Stockholder',icon:Building2},
  {id:'earn',label:'Earn',icon:HandCoins},
  {id:'learn',label:'Learn',icon:GraduationCap},
  {id:'development',label:'Development',icon:Rocket},
] as const satisfies ReadonlyArray<{id:PathPreference;label:string;icon:typeof Activity}>;

const products = [
  {label:'Generator',to:'/generator',icon:Zap},
  {label:'SHIELD',to:'/shield',icon:ShieldCheck},
  {label:'STOCK / EES',to:'/stock',icon:LineChart},
  {label:'Forecast',to:'/forecast',icon:CircleGauge},
  {label:'FanCommunity',to:'/fan',icon:Users},
  {label:'EID',to:'/eid/mint',icon:Fingerprint},
  {label:'Swap',to:'/swap',icon:Coins},
  {label:'EDGE',to:'/readiness',icon:BadgeCheck},
] as const;

export function RecoveryHomePage() {
  return <AppShell title="Home" wide showJourneyPresence={false}><HomeWorkspace/></AppShell>;
}

function HomeWorkspace() {
  const wallet=useWallet(); const journey=useJourney(); const navigate=useNavigate();
  const { selectedPath,selectPath }=usePathPreference();
  const selectedGuidance=selectedPath ? getPathQoraGuidance(selectedPath) : null;
  const choosePath=(path:PathPreference)=>selectPath(path);
  return <div className="recovery-page recovery-home">
    <section className="home-context-hero" aria-labelledby="home-context-title" data-shared-hero="qora-contextual-open">
      <div className="home-context-hero__heading"><span><small>QORA</small><strong id="home-context-title">{wallet.isConnected ? 'Welcome back, ALEX' : 'Welcome to ETERNITY'}</strong><small>{wallet.isConnected && journey.handoff ? `Your next best action: ${journey.handoff.expectedAction}` : 'Explore safely. Connect only when you are ready.'}</small></span></div>
      <ContextualQoraLead
        text={selectedGuidance?.presentation.description ?? 'Explore safely, choose a path, and ask QORA when you want grounded guidance.'}
        prompt={selectedGuidance?.initialPrompt ?? 'Help me understand ETERNITY and choose a safe path to begin.'}
        journey={{label:'Open Journey',progressLabel:'Journey',onOpen:()=>navigate('/journey')}}
        trailing={!wallet.isConnected ? <button type="button" className="home-connect-inline" onClick={()=>void wallet.connect()} disabled={wallet.isConnecting}><Coins/>{wallet.isConnecting?'Connecting…':'Connect'}</button> : undefined}
      />
    </section>
    <section className="home-identity" aria-label="Identity snapshot">
      <div className="home-identity__orb"><span><UserRound/></span><b>7</b></div>
      <div><h2>{wallet.isConnected?'ALEX':'Guest'}</h2><p><ShieldCheck/> {wallet.isConnected?'EID Active':'Explore mode'}</p><strong>Level 7 <i>•</i> Nova</strong></div>
      <dl><div><dt>Influence</dt><dd><GraduationCap/> {selectedPath ? paths.find((item)=>item.id===selectedPath)?.label : 'INVEST · DEVELOP · LEARN'}</dd></div><div><dt>Rank</dt><dd><Trophy/> 3.5</dd></div></dl>
    </section>
    <section className="home-quick-actions" aria-label="Quick actions">
      <NavLink to="/swap"><Coins/><span>Swap</span></NavLink><NavLink to="/generator"><Zap/><span>Generate ETER</span></NavLink><NavLink to="/fan/heir"><UserRound/><span>Heir</span></NavLink><NavLink to="/eid/mint"><Fingerprint/><span>Mint EID</span></NavLink>
    </section>
    <section className="home-paths" aria-labelledby="home-path-title"><h2 id="home-path-title">Path</h2><div>{paths.map(({id,label,icon:PathIcon})=><button key={id} type="button" data-path={id} className={selectedPath===id?'is-selected':''} aria-pressed={selectedPath===id} onClick={()=>choosePath(id)}><PathIcon/><span>{label}</span></button>)}</div></section>
    <nav className="home-highlights" aria-label="Rewards and leaderboard"><NavLink to="/earn"><Gift/><strong>Reward</strong><ArrowRight/></NavLink><NavLink to="/leaderboard"><Trophy/><strong>Leaderboard</strong><ArrowRight/></NavLink></nav>
    <section className="home-products" aria-labelledby="products-heading"><header><h2 id="products-heading">Products</h2><span>All Systems Operational <i/></span></header><div>{products.filter((item)=>item.label!=='Swap').map(({label,to,icon:ProductIcon})=><NavLink key={label} to={to}><ProductIcon/><span><strong>{label}</strong><small>● {label==='SHIELD'?'Secure':'Active'}</small></span></NavLink>)}</div></section>
    <section className="home-system-pulse" aria-label="System pulse">{[['Total ETER','12,586.27','+6.33%'],['Active EIDs','27,969','+4.21%'],['System Uptime','99.97%','Excellent'],['Community','183,366','+7.12%']].map(([label,total,trend])=><article key={label}><small>{label}</small><strong>{total}</strong><b>{trend}</b><i/></article>)}</section>
  </div>;
}
