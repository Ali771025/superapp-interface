import { Activity, Award, Fingerprint, ShieldCheck, Sparkles, UserRound, Users, WalletCards } from '@icons';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useEternityUserState } from '../lib/userState';
import { useWallet } from '../lib/wallet-context';
import { SpecialPageHero } from '../special3/hero';
import { EmptyState, SourceDisclosure, type SourceFreshness } from '../special3/interaction';
import { special3SystemProvider } from '../special3/providers';
import type { ProfileProjection } from '../special3/providers/profile';
import { SpecialMetricCard } from '../special3/ui/SpecialMetricCard';
import './profile-phase13.css';

const views = [
  { id:'overview', label:'Overview' }, { id:'identity', label:'Identity' }, { id:'progress', label:'Progress' },
  { id:'ownership', label:'Community' }, { id:'activity', label:'Activity' },
] as const;
type ProfileView = typeof views[number]['id'];
const legacyView: Record<string, ProfileView> = { growth:'progress', reputation:'overview', credentials:'progress', participation:'progress', governance:'activity', 'privacy-edit':'identity' };
const value = (input:string|number|null|undefined) => input === null || input === undefined || input === '' ? 'Unavailable' : String(input);
const numberValue = (input:number|null|undefined) => input === null || input === undefined ? 'Unavailable' : input.toLocaleString();

export function RecoveryProfilePage() {
  const snapshot=useEternityUserState(); const wallet=useWallet(); const navigate=useNavigate(); const [params,setParams]=useSearchParams();
  const result=special3SystemProvider.profile(); const requested=params.get('section') ?? 'overview';
  const active=views.some((item)=>item.id===requested) ? requested as ProfileView : legacyView[requested] ?? 'overview';
  const projection=snapshot.isGuest ? null : result.data;
  const source=useMemo<SourceFreshness>(()=>({ source:result.mode==='preview'?'preview':'live', freshness:result.state==='ready'?'fresh':'unavailable', label:result.sourceLabel, detail:result.detail }),[result.detail,result.mode,result.sourceLabel,result.state]);
  const setActive=(id:ProfileView)=>{const next=new URLSearchParams(params);if(id==='overview')next.delete('section');else next.set('section',id);setParams(next,{replace:true})};
  return <AppShell title="Profile" wide showJourneyPresence={false}><main data-special3 className="s3-profile" data-profile-state={snapshot.isGuest?'guest':result.state}>
    <SpecialPageHero title="Profile" description="Your identity is your greatest asset." tipsPrompt="Explain my Profile sources and boundaries. Do not edit identity or execute any protected action." visual={<UserRound/>} identity={<SourceDisclosure value={source} compact/>} compactControls journey={{label:'Open Profile Journey context',progressLabel:'Journey',onOpen:()=>navigate('/journey?product=Profile')}}/>
    {!snapshot.isGuest && projection && <section className="s3-profile__identity-card" aria-label="Profile identity"><div className="s3-profile__identity-orb"><Fingerprint/><b>{projection.progress.level}</b></div><div><h2>{projection.identity.displayName ?? 'ALEX'}</h2><p><ShieldCheck/> EID ACTIVE</p><strong>Level {projection.progress.level} <i>•</i> Nova</strong></div><dl><div><dt>Influence</dt><dd>INVEST · DEVELOP · LEARN</dd></div><div><dt>Rank</dt><dd>{projection.community.rank}</dd></div></dl><NavLink to="/profile/edit">Invite Link</NavLink></section>}
    <section className="s3-product__metrics s3-profile__metrics" aria-label="Profile metrics">
      <SpecialMetricCard label="Rank" value={value(projection?.community.rank)} detail="Top 12%" icon={<Sparkles/>}/>
      <SpecialMetricCard label="EQ" value={numberValue(projection?.progress.personalEq)} detail="Top 8%" icon={<Award/>}/>
      <SpecialMetricCard label="Total Fan" value="183,366" detail="Top 15%" icon={<Users/>}/>
      <SpecialMetricCard label="Total Supply" value={numberValue(projection?.ownership.totalPositions)} detail="Provider projection" icon={<WalletCards/>}/>
    </section>
    <ProfileNav active={active} onChange={setActive}/>
    <section className="s3-profile__workspace" aria-live="polite">{snapshot.isGuest?<GuestState connect={wallet.connect} connecting={wallet.isConnecting} error={wallet.error}/>:!projection?<UnavailableProfile detail={result.detail}/>:<ProfileViewContent active={active} profile={projection} source={source}/>}</section>
    <footer className="s3-profile__source"><SourceDisclosure value={source}/><p>Profile is a read-only projection. Product protocols and wallet authorization remain authoritative.</p></footer>
  </main></AppShell>;
}

function ProfileNav({active,onChange}:{active:ProfileView;onChange:(id:ProfileView)=>void}){
  const hostRef=useRef<HTMLElement|null>(null);const refs=useRef<Record<string,HTMLButtonElement|null>>({});
  useEffect(()=>{const item=refs.current[active];if(!hostRef.current||!item)return;const frame=requestAnimationFrame(()=>item.scrollIntoView({block:'nearest',inline:'center',behavior:'auto'}));return()=>cancelAnimationFrame(frame)},[active]);
  return <nav ref={hostRef} className="s3-local-nav s3-profile__nav" aria-label="Profile sections">{views.map((item)=><button ref={(node)=>{refs.current[item.id]=node}} key={item.id} type="button" aria-current={active===item.id?'page':undefined} onClick={()=>onChange(item.id)}>{item.label}</button>)}</nav>;
}

function ProfileViewContent({active,profile,source}:{active:ProfileView;profile:ProfileProjection;source:SourceFreshness}){
  if(active==='identity')return <IdentityView profile={profile} source={source}/>;if(active==='progress')return <ProgressView profile={profile}/>;if(active==='ownership')return <OwnershipView profile={profile}/>;if(active==='activity')return <ActivityView profile={profile} source={source}/>;return <OverviewView profile={profile}/>;
}

function OverviewView({profile}:{profile:ProfileProjection}){return <div className="s3-profile__overview">
  <ProfilePanel icon={<Fingerprint/>} eyebrow="Display identity" title={value(profile.identity.displayName)} detail={profile.identity.activeEid?'Your active EID is the friendly identity displayed across ETERNITY.':'No active EID is supplied; the connected wallet remains the fallback.'}><NavLink to="/eid/my-names">Open EID</NavLink></ProfilePanel>
  <ProfilePanel icon={<Award/>} eyebrow="Progression" title={`Level ${value(profile.progress.level)}`} detail={`${numberValue(profile.progress.personalEq)} Personal EQ · ${numberValue(profile.progress.completedAchievements)} verified completions`}><NavLink to="/achievements">Open Achievement</NavLink></ProfilePanel>
  <ProfilePanel icon={<Users/>} eyebrow="Community" title={value(profile.community.rank)} detail="Community Rank is projected from FAN and remains distinct from Global Level."><NavLink to="/fan">Open FanCommunity</NavLink></ProfilePanel>
  <ProfilePanel icon={<ShieldCheck/>} eyebrow="Authority boundary" title="Wallet confirmed" detail="Profile can explain and navigate. It cannot sign, submit, transfer, vote, claim, or change protected state."/>
  {profile.reputation===null&&<p className="s3-profile__optional-state">Reputation source is unavailable. Profile does not substitute a score.</p>}
  </div>}

function IdentityView({profile,source}:{profile:ProfileProjection;source:SourceFreshness}){return <section className="s3-profile__panel"><header><Fingerprint/><div><small>IDENTITY BOUNDARY</small><h2>Friendly identity, technical authority</h2></div></header><dl className="s3-profile__records">
  <Record label="Active display identity" recordValue={value(profile.identity.activeEid)} detail="Optional friendly EID display"/><Record label="Owned EID NFTs" recordValue={numberValue(profile.identity.ownedEids)} detail="Provider ownership count"/><Record label="Authorization wallet" recordValue={profile.identity.walletAddress} detail="Full technical ownership and signing identity" mono/>
  </dl><div className="s3-profile__actions"><NavLink to="/eid/my-names">Manage active EID in EID</NavLink></div><SourceDisclosure value={source}/></section>}

function ProgressView({profile}:{profile:ProfileProjection}){const percent=profile.progress.progressPercent;return <section className="s3-profile__panel"><header><Sparkles/><div><small>PROGRESSION PROJECTION</small><h2>Achievement and community state</h2></div></header><div className="s3-profile__stat-grid">
  <Stat label="Level" statValue={numberValue(profile.progress.level)} detail="Achievement provider"/><Stat label="Personal EQ" statValue={numberValue(profile.progress.personalEq)} detail="Personal progression ledger"/><Stat label="Referral EQ" statValue={numberValue(profile.progress.referralEq)} detail="No verified source supplied"/><Stat label="Community Rank" statValue={value(profile.community.rank)} detail="FAN Product Rank"/>
  </div><div className="s3-profile__progress"><span><strong>Level progress</strong><b>{percent===null?'Unavailable':`${percent}%`}</b></span><div role="progressbar" aria-label="Achievement level progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent??undefined}><i style={{width:`${percent??0}%`}}/></div><small>{profile.progress.nextLevelRequired===null?'Next-level threshold is unavailable.':`${profile.progress.nextLevelRequired.toLocaleString()} EQ next-level threshold · source projection only`}</small></div><div className="s3-profile__actions"><NavLink to="/achievements">Open Achievement</NavLink><NavLink to="/journey">Open Journey</NavLink><NavLink to="/fan">Open FanCommunity</NavLink></div></section>}

function OwnershipView({profile}:{profile:ProfileProjection}){const ownership=profile.ownership;return <section className="s3-profile__panel"><header><WalletCards/><div><small>OWNERSHIP PROJECTION</small><h2>Provider-backed position counts</h2></div></header>{ownership.totalPositions===0?<EmptyState title="No owned positions supplied" detail="Ownership remains empty until the configured providers return verified records."/>:<><div className="s3-profile__ownership"><OwnershipCard label="EID NFTs" count={ownership.eid} to="/eid/my-names"/><OwnershipCard label="Token assets" count={ownership.tokens} to="/economy"/><OwnershipCard label="SHIELD" count={ownership.shields} to="/shield/my-shields"/><OwnershipCard label="STOCK / EES" count={ownership.stocks} to="/stock/my-stock"/></div>{ownership.totalPositions===null&&<p className="s3-profile__optional-state">The total is unavailable because one or more provider categories are unavailable.</p>}</>}<p className="s3-profile__boundary">Detailed balances, eligibility, financial actions, and lifecycle management remain inside their Product workspaces.</p></section>}

function ActivityView({profile,source}:{profile:ProfileProjection;source:SourceFreshness}){if(profile.activity===null)return <UnavailableProfile detail="Verified activity source is unavailable."/>;return <section className="s3-profile__panel"><header><Activity/><div><small>VERIFIED ACTIVITY</small><h2>Recent provider records</h2></div></header>{profile.activity.length===0?<EmptyState title="No verified activity yet" detail="Confirmed provider records will appear here without changing Achievement or EQ state."/>:<div className="s3-profile__activity">{profile.activity.slice(0,8).map((entry)=><article key={entry.id}><span className={`is-${entry.status}`}>{entry.status}</span><div><small>{entry.module}</small><strong>{entry.action.replace(/_/g,' ')}</strong><p>{entry.amount.toLocaleString()} {entry.token} · {new Date(entry.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</p></div>{entry.explorerUrl&&<a href={entry.explorerUrl} target="_blank" rel="noreferrer" aria-label={`Open ${entry.action.replace(/_/g,' ')} transaction in explorer`}>Explorer</a>}</article>)}</div>}<SourceDisclosure value={source}/></section>}

function ProfilePanel({icon,eyebrow,title,detail,children}:{icon:ReactNode;eyebrow:string;title:string;detail:string;children?:ReactNode}){return <article className="s3-profile__summary-card"><span>{icon}</span><div><small>{eyebrow}</small><h2>{title}</h2><p>{detail}</p>{children}</div></article>}
function Record({label,recordValue,detail,mono=false}:{label:string;recordValue:string;detail:string;mono?:boolean}){return <div><dt>{label}</dt><dd className={mono?'is-mono':''}>{recordValue}</dd><small>{detail}</small></div>}
function Stat({label,statValue,detail}:{label:string;statValue:string;detail:string}){return <article><small>{label}</small><strong>{statValue}</strong><p>{detail}</p></article>}
function OwnershipCard({label,count,to}:{label:string;count:number|null;to:string}){return <NavLink to={to}><span><small>{label}</small><strong>{numberValue(count)}</strong></span><b>Open</b></NavLink>}
function GuestState({connect,connecting,error}:{connect:()=>void;connecting:boolean;error:string|null}){return <section className="s3-profile__guest"><UserRound/><h2>Your Profile is private until you connect.</h2><p>Connect a wallet to request source-backed identity, progression, ownership, and activity. Exploring ETERNITY remains available without connecting.</p><button type="button" onClick={connect} disabled={connecting}>{connecting?'Connecting…':'Connect wallet'}</button>{error&&<small role="alert">{error}</small>}</section>}
function UnavailableProfile({detail}:{detail:string}){return <section className="s3-profile__unavailable"><UserRound/><h2>Profile source unavailable</h2><p>{detail}</p><small>Live mode fails closed and never substitutes Preview records.</small></section>}
