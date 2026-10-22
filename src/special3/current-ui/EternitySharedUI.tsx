import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ArrowLeft, Check, ChevronDown, CircleAlert, CircleCheck, CircleX, Clock3, Info, LoaderCircle, X } from '@icons';
import { NavLink } from 'react-router-dom';
import { QoraOrb } from '../../components/qora/QoraOrb';
import './eternity-shared-ui.css';

export type ModuleNavItem = { label:string; to:string; end?:boolean };

export function QoraContextStage({ title, insight, action, state='idle' }: { title:string; insight:string; action?:{label:string;to:string}; state?:'idle'|'thinking'|'action-ready' }) {
  return <section className={`eu-qora-stage is-${state}`} aria-labelledby="eu-qora-title">
    <div className="eu-qora-stage__waves" aria-hidden="true"><i/><i/><i/></div>
    <NavLink to="/qora" className="eu-qora-stage__orb" aria-label="Open Full QORA">
      <QoraOrb size="hero" pixelSize={112} state={state} living decorative/>
    </NavLink>
    <div className="eu-qora-stage__copy"><h1 id="eu-qora-title">{title}</h1><p>{insight}</p></div>
    {action && <NavLink className="eu-qora-stage__action" to={action.to}>{action.label}</NavLink>}
  </section>;
}

export function ModuleLocalNav({ items, label='Module sections', activeLabel, family }: { items:ModuleNavItem[]; label?:string; activeLabel?:string; family?:string }) {
  const navRef=useRef<HTMLElement>(null);
  useEffect(()=>{navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});},[items]);
  return <nav ref={navRef} className="eu-local-nav" aria-label={label} data-module-navigation={family}>{items.map(item=><NavLink data-module-nav-item key={`${item.to}-${item.label}`} to={item.to} end={item.end} aria-current={activeLabel?activeLabel===item.label?'page':false:undefined} className={({isActive})=>(activeLabel?activeLabel===item.label:isActive)?'is-active':undefined}>{item.label}</NavLink>)}</nav>;
}

type ActionProps = ButtonHTMLAttributes<HTMLButtonElement> & { children:ReactNode; busy?:boolean };
function Button({kind,children,busy=false,...props}:ActionProps&{kind:string}){return <button {...props} type={props.type??'button'} className={`eu-action ${kind} ${props.className??''}`.trim()} disabled={busy||props.disabled} aria-busy={busy||undefined}>{busy&&<LoaderCircle className="eu-spin" aria-hidden="true"/>}{children}</button>}
export const ActionKey=(p:ActionProps)=><Button {...p} kind="is-primary"/>;
export const SecondaryAction=(p:ActionProps)=><Button {...p} kind="is-secondary"/>;
export const TertiaryAction=(p:ActionProps)=><Button {...p} kind="is-tertiary"/>;
export const DestructiveAction=(p:ActionProps)=><Button {...p} kind="is-destructive"/>;
export const IconAction=({label,...p}:ActionProps&{label:string})=><Button {...p} kind="is-icon" aria-label={label}>{p.children}</Button>;

type FieldProps=InputHTMLAttributes<HTMLInputElement>&{label:string;helper?:string;error?:string};
export function EternityField({label,helper,error,id,...props}:FieldProps){const generated=useId();const fieldId=id??generated;return <label className={`eu-field${error?' has-error':''}`} htmlFor={fieldId}><span>{label}</span><input {...props} id={fieldId} aria-invalid={Boolean(error)} aria-describedby={helper||error?`${fieldId}-note`:undefined}/>{(helper||error)&&<small id={`${fieldId}-note`} role={error?'alert':undefined}>{error??helper}</small>}</label>}
export const AmountField=(p:FieldProps)=><EternityField {...p} inputMode="decimal"/>;
export const AddressOrEIDField=(p:FieldProps)=><EternityField {...p} autoComplete="off" spellCheck={false}/>;

type SelectProps=SelectHTMLAttributes<HTMLSelectElement>&{label:string;helper?:string;options:Array<{label:string;value:string}>};
export function EternitySelect({label,helper,options,id,...props}:SelectProps){const generated=useId();const fieldId=id??generated;return <label className="eu-field eu-select" htmlFor={fieldId}><span>{label}</span><span className="eu-select__control"><select {...props} id={fieldId}>{options.map(option=><option value={option.value} key={option.value}>{option.label}</option>)}</select><ChevronDown aria-hidden="true"/></span>{helper&&<small>{helper}</small>}</label>}
export const TokenSelector=(p:Omit<SelectProps,'options'> & {tokens?:string[]})=><EternitySelect {...p} options={(p.tokens??['ETER','ET','USDT','Q']).map(token=>({label:token,value:token}))}/>;

export function Toggle({label,checked,onChange,description}:{label:string;checked:boolean;onChange:(value:boolean)=>void;description?:string}){return <label className="eu-toggle"><span><strong>{label}</strong>{description&&<small>{description}</small>}</span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><i aria-hidden="true"/></label>}
export function SegmentedControl({label,options,value,onChange}:{label:string;options:string[];value:string;onChange:(value:string)=>void}){return <fieldset className="eu-segmented"><legend>{label}</legend><div>{options.map(option=><button type="button" key={option} className={option===value?'is-active':undefined} aria-pressed={option===value} onClick={()=>onChange(option)}>{option}</button>)}</div></fieldset>}
export function ProgressTrack({label,value,max=100}:{label:string;value:number;max?:number}){const pct=Math.max(0,Math.min(100,Math.round(value/max*100)));return <div className="eu-progress"><span><strong>{label}</strong><b>{pct}%</b></span><progress value={value} max={max}/></div>}

type ModalProps={open:boolean;title:string;children:ReactNode;onClose:()=>void;footer?:ReactNode};
export function EternityModal({open,title,children,onClose,footer}:ModalProps){useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[open,onClose]);if(!open)return null;return <div className="eu-modal-layer" role="presentation" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><section className="eu-modal" role="dialog" aria-modal="true" aria-labelledby="eu-modal-title"><header><button type="button" onClick={onClose} aria-label="Back"><ArrowLeft/></button><h2 id="eu-modal-title">{title}</h2><button type="button" onClick={onClose} aria-label="Close"><X/></button></header><div className="eu-modal__body">{children}</div>{footer&&<footer>{footer}</footer>}</section></div>}
export function EternitySheet(props:ModalProps){if(!props.open)return null;return <div className="eu-modal-layer is-sheet" role="presentation" onMouseDown={e=>{if(e.currentTarget===e.target)props.onClose()}}><section className="eu-modal eu-sheet" role="dialog" aria-modal="true" aria-labelledby="eu-sheet-title"><header><span/><h2 id="eu-sheet-title">{props.title}</h2><button type="button" onClick={props.onClose} aria-label="Close"><X/></button></header><div className="eu-modal__body">{props.children}</div>{props.footer&&<footer>{props.footer}</footer>}</section></div>}

export type ReviewRow={label:string;value:string};
export function ActionReview({module,action,rows,warnings=[]}:{module:string;action:string;rows:ReviewRow[];warnings?:string[]}){return <div className="eu-review"><div className="eu-review__identity"><small>PRODUCT REVIEW</small><strong>{module}</strong><span>{action}</span></div><dl>{rows.map(row=><div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>{warnings.map(warning=><InlineStatus key={warning} tone="warning">{warning}</InlineStatus>)}<p className="eu-review__boundary">Product review precedes wallet authorization.</p></div>}

type StatusTone='info'|'warning'|'success'|'failure'|'danger'|'pending';
const statusIcons={info:Info,warning:CircleAlert,success:CircleCheck,failure:CircleX,danger:CircleX,pending:Clock3};
export function InlineStatus({tone='info',children}:{tone?:StatusTone;children:ReactNode}){const StatusIcon=statusIcons[tone];return <div className={`eu-inline-status is-${tone}`} role={tone==='failure'?'alert':'status'}><StatusIcon aria-hidden="true"/><span>{children}</span></div>}
export function Toast({tone='success',children,onDismiss}:{tone?:StatusTone;children:ReactNode;onDismiss:()=>void}){return <div className={`eu-toast is-${tone}`} role="status" aria-live="polite"><InlineStatus tone={tone}>{children}</InlineStatus><button onClick={onDismiss} aria-label="Dismiss"><X/></button></div>}

function StateObject({kind,title,detail,action}:{kind:StatusTone;title:string;detail:string;action?:ReactNode}){const StateIcon=statusIcons[kind];return <section className={`eu-state is-${kind}`}><StateIcon aria-hidden="true"/><h2>{title}</h2><p>{detail}</p>{action}</section>}
export const EmptyState=(p:Omit<Parameters<typeof StateObject>[0],'kind'>)=><StateObject {...p} kind="info"/>;
export const UnavailableState=(p:Omit<Parameters<typeof StateObject>[0],'kind'>)=><StateObject {...p} kind="warning"/>;
export const PendingState=(p:Omit<Parameters<typeof StateObject>[0],'kind'>)=><StateObject {...p} kind="pending"/>;
export const SuccessState=(p:Omit<Parameters<typeof StateObject>[0],'kind'>)=><StateObject {...p} kind="success"/>;
export const FailureState=(p:Omit<Parameters<typeof StateObject>[0],'kind'>)=><StateObject {...p} kind="failure"/>;

export function MetricObject({label,value,detail,icon}:{label:string;value:string;detail?:string;icon?:ReactNode}){return <article className="eu-object eu-metric">{icon&&<span>{icon}</span>}<small>{label}</small><strong>{value}</strong>{detail&&<p>{detail}</p>}</article>}
export function AssetObject({symbol,name,balance,value,action,image}:{symbol:string;name:string;balance:string;value:string;action?:ReactNode;image?:string}){return <article className="eu-object eu-asset">{image?<img className="eu-asset__logo" src={image} alt={`${symbol} asset logo`}/>:<span className="eu-asset__logo" aria-hidden="true">{symbol.slice(0,2)}</span>}<div><strong>{symbol}</strong><small>{name}</small></div><dl><div><dt>Holding</dt><dd>{balance}</dd></div><div><dt>Value</dt><dd>{value}</dd></div></dl>{action}</article>}
export function NFTObject({eyebrow,title,detail,image,children}:{eyebrow:string;title:string;detail:string;image?:string;children?:ReactNode}){return <article className="eu-object eu-nft">{image?<img src={image} alt=""/>:<span className="eu-nft__art" aria-hidden="true"><i/><i/><Check/></span>}<div><small>{eyebrow}</small><h2>{title}</h2><p>{detail}</p>{children}</div></article>}
export function PrizeObject({title,detail,status='Provider-owned'}:{title:string;detail:string;status?:string}){return <article className="eu-object eu-prize"><span aria-hidden="true"><CircleCheck/></span><div><small>{status}</small><h3>{title}</h3><p>{detail}</p></div></article>}
export function ProposalObject({id,title,status,children}:{id:string;title:string;status:string;children?:ReactNode}){return <article className="eu-object eu-proposal"><small>{id} · {status}</small><h3>{title}</h3>{children}</article>}
export function PredictionTicket({title,numbers,status}:{title:string;numbers:string[];status:string}){return <article className="eu-object eu-ticket"><header><strong>{title}</strong><small>{status}</small></header><div>{numbers.slice(0,5).map((number,index)=><span key={`${number}-${index}`}>{number}</span>)}</div></article>}
export function JourneyNode({title,status,detail}:{title:string;status:'complete'|'current'|'locked';detail:string}){return <article className={`eu-object eu-journey-node is-${status}`}><span>{status==='complete'?<Check/>:status==='current'?<LoaderCircle/>:<Clock3/>}</span><div><strong>{title}</strong><small>{detail}</small></div></article>}
export const LearningObject=JourneyNode;
export const CredentialObject=JourneyNode;
export function NetworkObject({title,nodes,detail}:{title:string;nodes:number;detail:string}){return <article className="eu-object eu-network"><div aria-hidden="true"><i/><i/><i/><i/></div><span><strong>{nodes}</strong><small>{title}</small><p>{detail}</p></span></article>}
