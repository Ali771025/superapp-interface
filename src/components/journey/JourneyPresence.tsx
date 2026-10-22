import { ArrowRight, ChevronDown, Compass, LockKeyhole, MessageCircleQuestion, Route, Sparkles } from '@icons';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productByRoute } from '../../data/productRegistry';
import { useJourney } from '../../lib/journey/journey-context';
import { trackJourneyEvent } from '../../lib/journey/analytics';
import { buildProductJourneyContext } from '../../lib/journey/missionRegistry';
import { useAppLanguage } from '../../lib/useAppLanguage';
import { useEternityUserState } from '../../lib/userState';
import { CenteredModal } from '../modals/CenteredModal';
import { isSpecial3ShellEnabled } from '../../special3/shell/featureFlag';

export function JourneyPresence() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useEternityUserState();
  const journey = useJourney();
  const { language } = useAppLanguage();
  const fa = language === 'fa';
  const [mobileOpen, setMobileOpen] = useState(false);
  const product = useMemo(() => productByRoute(location.pathname), [location.pathname]);
  const context = useMemo(
    () => product ? buildProductJourneyContext(product, user, journey.handoff?.missionId) : null,
    [journey.handoff?.missionId, product, user],
  );
  const specialImpact = isSpecial3ShellEnabled() ? context?.impact.filter((item) => item.kind !== 'eq') ?? [] : context?.impact ?? [];

  if (!product || !context || ['missions','qora','passport'].includes(product.id)) return null;

  const task = fa ? context.faCurrentTask : context.currentTask;
  const label = task ?? (fa ? context.faEyebrow : context.eyebrow);
  const activateMission = () => {
    if (context.mission) {
      journey.startMission({
        missionId:context.mission.id,
        taskId:context.mission.taskId,
        source:'journey',
        destinationProduct:product.id,
        expectedAction:context.mission.expectedAction,
        returnPath:'/home',
      });
    }
    const action = document.querySelector<HTMLElement>('.cut-button--primary:not(:disabled), [data-primary-action]:not(:disabled)');
    action?.scrollIntoView({ behavior:'smooth', block:'center' });
    action?.focus({ preventScroll:true });
    setMobileOpen(false);
  };
  const askQora = () => {
    if (context.mission) {
      journey.startMission({
        missionId:context.mission.id,
        taskId:context.mission.taskId,
        source:'qora',
        destinationProduct:product.id,
        expectedAction:context.mission.expectedAction,
        returnPath:location.pathname,
      });
    }
    trackJourneyEvent('qora_help_requested', { productId:product.id, route:location.pathname });
    navigate(`/qora?prompt=${encodeURIComponent(`Why is ${product.label} relevant to my Journey and what should I review before acting?`)}`);
  };

  return (
    <>
      <section className={`journey-presence is-${context.mode}`} aria-label={fa ? 'زمینه مسیر' : 'Journey context'}>
        <div className="journey-presence__identity">
          <span><Route size={16}/></span>
          <div>
            <small>{fa ? context.faEyebrow : context.eyebrow}</small>
            <strong>{label}</strong>
          </div>
        </div>
        {context.progress !== undefined && (
          <div className="journey-presence__progress">
            <span>{fa ? context.faProgressLabel : context.progressLabel}</span>
            <div role="progressbar" aria-label={fa ? context.faProgressLabel : context.progressLabel} aria-valuenow={context.progress} aria-valuemin={0} aria-valuemax={100}><i style={{ inlineSize:`${context.progress}%` }}/></div>
          </div>
        )}
        <div className="journey-presence__why">
          <small>{fa ? 'چرا اینجا هستم؟' : 'Why am I here?'}</small>
          <p>{fa ? context.faReason : context.reason}</p>
        </div>
        <div className="journey-presence__impact">
          <small>{fa ? 'چه چیزی تغییر می‌کند؟' : 'What will change?'}</small>
          {specialImpact.length ? <ul>{specialImpact.slice(0,2).map((item) => <li key={`${item.kind}-${item.label}`}><Sparkles size={13}/>{fa ? item.faLabel : item.label}</li>)}</ul> : <p>{isSpecial3ShellEnabled() ? 'Progression is resolved only after verified Achievement evaluation.' : (fa ? 'ابتدا نتیجه و پیش‌نیازها را مرور کنید.' : 'Review the outcome and requirements first.')}</p>}
        </div>
        <div className="journey-presence__actions">
          <button type="button" className="journey-presence__primary" onClick={activateMission} data-primary-action>
            {context.mode === 'not-recommended' ? <LockKeyhole size={16}/> : <Compass size={16}/>}
            {context.mode === 'direct' ? (fa ? 'بررسی قابلیت' : 'Explore feature') : (fa ? 'ادامه تسک' : 'Continue task')}
          </button>
          <button type="button" onClick={askQora} aria-label={fa ? 'پرسیدن از کورا درباره این صفحه' : 'Ask QORA about this page'}><MessageCircleQuestion size={17}/></button>
        </div>
        <button type="button" className="journey-presence__mobile-trigger" onClick={() => {
          setMobileOpen(true);
          trackJourneyEvent('journey_context_expanded', { productId:product.id, route:location.pathname });
        }}>
          <span><Route size={15}/>{label}</span><ChevronDown size={16}/>
        </button>
      </section>
      <CenteredModal open={mobileOpen} onClose={() => setMobileOpen(false)} title={fa ? 'زمینه مسیر' : 'Journey context'} maxWidth="journey-context-sheet">
        <div className="journey-context-sheet__content">
          <span className={`journey-context-status is-${context.mode}`}>{fa ? context.faStatus : context.status}</span>
          <h2>{label}</h2>
          <p>{fa ? context.faReason : context.reason}</p>
          {context.progress !== undefined && <div className="journey-context-sheet__progress"><span>{fa ? context.faProgressLabel : context.progressLabel}</span><i><b style={{ inlineSize:`${context.progress}%` }}/></i></div>}
          {specialImpact.length > 0 && <div><small>{fa ? 'اثر مورد انتظار' : 'Expected impact'}</small><ul>{specialImpact.map((item) => <li key={`${item.kind}-${item.label}`}><Sparkles size={14}/>{fa ? item.faLabel : item.label}</li>)}</ul></div>}
          <section><small>{fa ? 'گام بعدی' : 'What should I do next?'}</small><strong>{fa ? context.nextAction.faTitle : context.nextAction.title}</strong><p>{fa ? context.nextAction.faReason : context.nextAction.reason}</p></section>
          <div className="journey-context-sheet__actions"><button onClick={activateMission}>{context.mode === 'direct' ? (fa ? 'بررسی قابلیت' : 'Explore feature') : (fa ? 'ادامه تسک' : 'Continue task')}<ArrowRight size={16}/></button><button onClick={askQora}>{fa ? 'از کورا بپرس' : 'Ask QORA'}</button></div>
        </div>
      </CenteredModal>
    </>
  );
}
