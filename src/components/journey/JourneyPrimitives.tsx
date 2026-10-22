import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Compass,
  LockKeyhole,
  MessageCircleQuestion,
  Route,
  Sparkles,
  Trophy,
} from '@icons';
import type { JourneyEvent, JourneyImpact, NextBestAction as NextBestActionModel, Requirement } from '../../lib/journey/types';

export type JourneyComponentState = 'default' | 'loading' | 'empty' | 'pending' | 'completed' | 'restricted' | 'error';

function StateIcon({ state }: { state:JourneyComponentState }) {
  if (state === 'completed') return <CheckCircle2 size={16}/>;
  if (state === 'restricted') return <LockKeyhole size={16}/>;
  if (state === 'error') return <AlertTriangle size={16}/>;
  return <CircleDashed size={16}/>;
}

export function MissionHeader({ eyebrow, title, purpose, state = 'default', children }: { eyebrow:string; title:string; purpose:string; state?:JourneyComponentState; children?:React.ReactNode }) {
  return <header className={`journey-primitive mission-header is-${state}`}><span><Route size={18}/></span><div><small>{eyebrow}</small><h2>{title}</h2><p>{purpose}</p></div>{children && <div className="mission-header__actions">{children}</div>}</header>;
}

export function MissionProgress({ label, completed, total, value, state = 'default' }: { label:string; completed:number; total:number; value:number; state?:JourneyComponentState }) {
  return <div className={`journey-primitive mission-progress is-${state}`}><header><strong>{label}</strong><span>{completed} of {total} tasks completed · {value}%</span></header><div role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><i style={{ inlineSize:`${value}%` }}/></div></div>;
}

export function TaskStatus({ title, description, state = 'default' }: { title:string; description:string; state?:JourneyComponentState }) {
  return <div className={`journey-primitive task-status is-${state}`}><span><StateIcon state={state}/></span><div><strong>{title}</strong><p>{description}</p></div></div>;
}

export function ImpactSummary({ title, impact, state = 'completed' }: { title:string; impact:JourneyImpact[]; state?:JourneyComponentState }) {
  return <section className={`journey-primitive impact-summary is-${state}`}><header><Sparkles size={17}/><strong>{title}</strong></header>{impact.length ? <ul>{impact.map((item) => <li key={`${item.kind}-${item.label}`}>{item.label}</li>)}</ul> : <p>No verified impact is available yet.</p>}</section>;
}

export function NextBestAction({ action, onSelect, state = 'default' }: { action:NextBestActionModel; onSelect:()=>void; state?:JourneyComponentState }) {
  return <section className={`journey-primitive next-best-action is-${state}`}><span><Compass size={19}/></span><div><small>Recommended because</small><h3>{action.title}</h3><p>{action.reason}</p></div><button type="button" onClick={onSelect}>{action.title}<ArrowRight size={16}/></button></section>;
}

export function RequirementList({ requirements, state = 'default' }: { requirements:Requirement[]; state?:JourneyComponentState }) {
  return <ul className={`journey-primitive requirement-list is-${state}`}>{requirements.length ? requirements.map((item) => <li key={item.id} className={item.met ? 'is-met' : 'is-unmet'}><span>{item.met ? <CheckCircle2 size={15}/> : <CircleDashed size={15}/>}</span><strong>{item.label}</strong></li>) : <li className="is-empty"><strong>No additional requirements</strong></li>}</ul>;
}

export function AccessStatus({ title, reason, state = 'default' }: { title:string; reason:string; state?:JourneyComponentState }) {
  return <aside className={`journey-primitive access-status is-${state}`}><StateIcon state={state}/><div><strong>{title}</strong><p>{reason}</p></div></aside>;
}

export function ActionSummary({ rows, impact, state = 'default' }: { rows:Array<{ label:string; value:string }>; impact?:JourneyImpact[]; state?:JourneyComponentState }) {
  return <section className={`journey-primitive action-summary is-${state}`}><dl>{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>{impact?.length ? <ImpactSummary title="Expected Journey impact" impact={impact}/> : null}</section>;
}

export function TransactionResult({ title, message, state = 'completed' }: { title:string; message:string; state?:JourneyComponentState }) {
  return <section className={`journey-primitive transaction-result is-${state}`} role={state === 'error' ? 'alert' : 'status'}><StateIcon state={state}/><div><strong>{title}</strong><p>{message}</p></div></section>;
}

export function AchievementReveal({ name, reason, eq, state = 'completed' }: { name:string; reason:string; eq?:number; state?:JourneyComponentState }) {
  return <section className={`journey-primitive achievement-reveal is-${state}`}><span><Trophy size={23}/></span><small>Achievement unlocked</small><h2>{name}</h2><p>{reason}</p>{eq !== undefined && <strong>+{eq} EQ</strong>}</section>;
}

export function LevelUpMoment({ previousLevel, nextLevel, unlocked, state = 'completed' }: { previousLevel:number; nextLevel:number; unlocked:string[]; state?:JourneyComponentState }) {
  return <section className={`journey-primitive level-up-moment is-${state}`}><Sparkles size={24}/><small>Level up</small><h2>{previousLevel} → {nextLevel}</h2><ul>{unlocked.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

export function QoraContextPrompt({ prompt, onSelect, state = 'default' }: { prompt:string; onSelect:()=>void; state?:JourneyComponentState }) {
  return <button type="button" className={`journey-primitive qora-context-prompt is-${state}`} onClick={onSelect}><MessageCircleQuestion size={17}/><span>{prompt}</span><ArrowRight size={15}/></button>;
}

export function RecentImpact({ event, state = 'default' }: { event:JourneyEvent | null; state?:JourneyComponentState }) {
  return <section className={`journey-primitive recent-impact is-${event ? state : 'empty'}`}><small>Recent impact</small>{event ? <><strong>{event.sourceAction}</strong><p>{event.impact.map((item) => item.label).join(' · ')}</p></> : <p>Your first verified impact will remain visible here.</p>}</section>;
}

export function AreaProgress({ area, label, value, state = 'default' }: { area:string; label:string; value:number; state?:JourneyComponentState }) {
  return <div className={`journey-primitive area-progress is-${state}`}><header><strong>{area}</strong><span>{label}</span></header><div role="progressbar" aria-label={`${area}: ${label}`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><i style={{ inlineSize:`${value}%` }}/></div></div>;
}

export function JourneyChip({ label, onExpand, state = 'default' }: { label:string; onExpand:()=>void; state?:JourneyComponentState }) {
  return <button type="button" className={`journey-primitive journey-chip is-${state}`} onClick={onExpand}><Route size={15}/><span>{label}</span><ArrowRight size={15}/></button>;
}

export function MissionHandoffBanner({ task, source, onContinue, state = 'default' }: { task:string; source:string; onContinue:()=>void; state?:JourneyComponentState }) {
  return <aside className={`journey-primitive mission-handoff-banner is-${state}`}><Route size={17}/><div><small>Continued from {source}</small><strong>{task}</strong></div><button type="button" onClick={onContinue}>Continue task<ArrowRight size={15}/></button></aside>;
}
