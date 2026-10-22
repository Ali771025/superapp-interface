import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, ChevronRight, ExternalLink, Loader2, ShieldCheck, Wallet, X } from '@icons';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { QoraActionSchema } from '../../qora/types';
import { useWallet } from '../../lib/wallet-context';
import { qoraModuleRegistry } from '../../qora/moduleRegistry';
import { LearningNudge } from './QoraActionCard';
import { isSpecial3ShellEnabled } from '../../special3/shell/featureFlag';
import { useAppMode } from '../../lib/app-mode-context';
import { IS_PREVIEW_MODE } from '../../lib/contracts/contractConfig';
import { useJourney } from '../../lib/journey/journey-context';
import { useEternityUserState } from '../../lib/userState';
import { missionForProduct } from '../../lib/journey/missionRegistry';

type Step = 'summary' | 'configure' | 'review' | 'pending' | 'success';

const SPECIAL_STEPS: readonly Step[] = ['summary', 'review'];
const LEGACY_STEPS: readonly Step[] = ['summary', 'configure', 'review', 'pending', 'success'];

function specialHandoffLabel(action: QoraActionSchema) {
  const labels: Record<string, string> = {
    edge: 'Open EDGE to continue',
    learning: 'Open EDGE to continue',
    generator: 'Open Generator to review',
    swap: 'Open Swap to review',
    forecast: 'Open Forecast',
    era: 'Open ERA',
  };
  return labels[action.moduleId] ?? 'Open Product to continue';
}

export function MiniAppSheet({ action, onClose }: { action: QoraActionSchema | null; onClose: () => void }) {
  const [step, setStep] = useState<Step>('summary');
  const { isConnected, connect, isConnecting, isCorrectNetwork, switchNetwork } = useWallet();
  const navigate = useNavigate();
  const { setMode } = useAppMode();
  const journey = useJourney();
  const user = useEternityUserState();
  const sheetRef = useRef<HTMLElement>(null);
  useEffect(()=>{ if(action) setStep('summary'); },[action]);
  useEffect(() => {
    if (!action) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const first = window.setTimeout(() => sheetRef.current?.querySelector<HTMLElement>('button, input, select, [href]')?.focus(), 0);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !sheetRef.current) return;
      const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const firstItem = focusable[0];
      const lastItem = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      window.clearTimeout(first);
      document.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [action, onClose]);
  if (!action) return null;
  const module=qoraModuleRegistry[action.moduleId];
  const financial=action.requiresConfirmation;
  const special3 = isSpecial3ShellEnabled();
  const visibleSteps = special3 ? SPECIAL_STEPS : LEGACY_STEPS;
  const next=async()=>{
    if(action.requiresWallet&&!isConnected){await connect();return;}
    if(action.requiresWallet&&isConnected&&!isCorrectNetwork){await switchNetwork();return;}
    if(step==='summary'){setStep(special3?'review':financial?'configure':'review');return;}
    if(step==='configure'){setStep('review');return;}
    if(step==='review'&&special3){openAdvanced();return;}
    if(step==='review'){setStep('pending');window.setTimeout(()=>setStep('success'),900);}
  };
  const label=!isConnected&&action.requiresWallet?'Connect wallet':isConnected&&!isCorrectNetwork&&action.requiresWallet?'Switch network':step==='summary'?(special3?'Continue':financial?'Review inputs':'Continue'):step==='configure'?'Review action':step==='review'&&special3?specialHandoffLabel(action):step==='review'?'Confirm in wallet':'Continue';
  const openAdvanced = () => {
    if (!action.advancedRoute) return;
    const mission = missionForProduct(action.moduleId, user);
    if (mission) journey.startMission({
      missionId:mission.id,
      taskId:mission.taskId,
      source:'qora',
      destinationProduct:mission.productId,
      expectedAction:mission.expectedAction,
      returnPath:'/qora',
    });
    setMode('workspace');
    navigate(action.advancedRoute);
  };
  return createPortal(<div className="s3-qora-sheet-layer" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}><section ref={sheetRef} className="s3-qora-mini-sheet" role="dialog" aria-modal="true" aria-labelledby="mini-title">
    <header><button onClick={step==='summary'?onClose:()=>setStep('summary')} aria-label={step==='summary'?'Close':'Back'}>{step==='summary'?<X size={19}/>:<ArrowLeft size={19}/>}</button><div><small>Embedded mini app</small><h2 id="mini-title">{action.title}</h2></div><span>{module?.riskLevel ?? 'low'} risk</span></header>
    <div className="s3-qora-mini-progress" aria-label={`Step ${visibleSteps.indexOf(step)+1} of ${visibleSteps.length}`}>{visibleSteps.map((item)=><i key={item} className={item===step?'active':''}/>)}</div>
    <div className="s3-qora-mini-body">
      {step==='summary'&&<><div className="s3-qora-mini-symbol"><ShieldCheck size={24}/></div><h3>{action.summary}</h3><div className="s3-qora-mini-result"><span>Result</span><strong>{action.expectedOutcome}</strong></div>{financial&&<LearningNudge onStart={()=>navigate('/readiness')}/>}</>}
      {step==='configure'&&<><h3>Choose</h3><ConfigureFields moduleId={action.moduleId}/></>}
      {step==='review'&&special3&&<><h3>Ready to continue</h3><div className="s3-qora-confirm-list"><div><span>Action</span><strong>{action.title}</strong></div>{action.rows?.map((row)=><div key={`${row.label}:${row.value}`}><span>{row.label}</span><strong>{row.value}</strong></div>)}{module?.title&&<div><span>Destination</span><strong>{module.title}</strong></div>}</div><div className="s3-qora-mini-result"><span>Expected outcome</span><strong>{action.expectedOutcome}</strong></div>{action.risk&&<div className="s3-qora-mini-warning"><AlertTriangle size={17}/>{action.risk}</div>}<details className="s3-qora-technical-details"><summary>Technical details</summary><div><span>Product owner</span><strong>{module?.title}</strong></div></details></>}
      {step==='review'&&!special3&&<><h3>Confirm</h3><div className="s3-qora-confirm-list"><div><span>Action</span><strong>{action.title}</strong></div><div><span>Amount</span><strong>25.00 USDT</strong></div><div><span>Network</span><strong>Polygon</strong></div><div><span>Fee</span><strong>0.02 POL</strong></div><div><span>Reversible</span><strong>No</strong></div></div>{action.risk&&<div className="s3-qora-mini-warning"><AlertTriangle size={17}/>{action.risk}</div>}<details className="s3-qora-technical-details"><summary>Technical details</summary><div><span>Adapter</span><strong>{module?.adapter}</strong></div></details></>}
      {step==='pending'&&<div className="s3-qora-mini-center"><Loader2 size={34} className="animate-spin"/><h3>{IS_PREVIEW_MODE ? 'Running feature preview' : 'Waiting for wallet'}</h3><p>{IS_PREVIEW_MODE ? 'No signature or contract call is being made.' : 'No result yet.'}</p></div>}
      {step==='success'&&<div className="s3-qora-mini-center is-success"><span><Check size={28}/></span><h3>{IS_PREVIEW_MODE ? 'Preview complete' : 'Confirmed'}</h3><p>{IS_PREVIEW_MODE ? 'Nothing was submitted and no reward was granted.' : 'Timeline updated.'}</p>{action.eqReward && !isSpecial3ShellEnabled() && <div className="s3-qora-eq-reward">{IS_PREVIEW_MODE ? `Potential +${action.eqReward} EQ` : `+${action.eqReward} EQ`}</div>}<button onClick={onClose}>Done <ChevronRight size={15}/></button></div>}
    </div>
    {step!=='pending'&&step!=='success'&&<footer><button onClick={next} disabled={isConnecting} className="s3-qora-mini-primary">{isConnecting?<Loader2 size={16} className="animate-spin"/>:action.requiresWallet&&!isConnected?<Wallet size={16}/>:null}{label}<ChevronRight size={16}/></button>{!special3&&action.advancedRoute&&<button onClick={openAdvanced} className="s3-qora-mini-advanced">View advanced details <ExternalLink size={14}/></button>}</footer>}
  </section></div>,document.body);
}

function ConfigureFields({moduleId}:{moduleId:string}){
  if(moduleId==='forecast')return <><label className="s3-qora-mini-field"><span>Prediction format</span><select defaultValue="standard"><option value="standard">Standard prediction</option><option value="special">Special prediction</option></select></label><label className="s3-qora-mini-field"><span>Your selection</span><select defaultValue=""><option value="" disabled>Choose after reviewing the question</option><option>Option 1</option><option>Option 2</option></select><small>This remains your decision, not QORA’s.</small></label></>;
  if(moduleId==='fan')return <><label className="s3-qora-mini-field"><span>Community access</span><select defaultValue="one"><option value="one">1 star</option><option value="two">2 stars</option><option value="three">3 stars</option></select></label><label className="s3-qora-mini-field"><span>Payment token</span><select defaultValue="USDT"><option>USDT</option><option>ETER</option><option>Q</option></select></label></>;
  if(moduleId==='ees')return <><label className="s3-qora-mini-field"><span>Multiplier</span><select defaultValue="1"><option value="1">1× multiplier</option><option value="2">2× multiplier</option><option value="5">5× multiplier</option><option value="10">10× multiplier</option></select></label><label className="s3-qora-mini-field"><span>Payment source</span><select defaultValue="ETER"><option>ETER balance</option><option>USDT balance</option></select></label></>;
  if(moduleId==='swap')return <><label className="s3-qora-mini-field"><span>You send</span><select defaultValue="USDT"><option>USDT</option><option>ETER</option><option>ET</option><option>Q</option></select></label><label className="s3-qora-mini-field"><span>You receive</span><select defaultValue="ETER"><option>ETER</option><option>ET</option><option>Q</option><option>USDT</option></select></label><label className="s3-qora-mini-field"><span>Amount</span><input inputMode="decimal" defaultValue="25.00"/></label></>;
  return <><label className="s3-qora-mini-field"><span>Payment source</span><select defaultValue="USDT"><option>USDT balance</option><option>ETER balance</option><option>Q balance</option></select></label><label className="s3-qora-mini-field"><span>Amount</span><input inputMode="decimal" defaultValue="25.00"/><small>Available: 340.00 USDT</small></label></>;
}
