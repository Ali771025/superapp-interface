import { ArrowRight, CheckCircle2, ExternalLink, Sparkles, Trophy } from '@icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../../lib/journey/journey-context';
import { trackJourneyEvent } from '../../lib/journey/analytics';
import { useAppLanguage } from '../../lib/useAppLanguage';
import { CenteredModal } from '../modals/CenteredModal';

export function JourneyImpactSheet() {
  const navigate = useNavigate();
  const journey = useJourney();
  const { language } = useAppLanguage();
  const fa = language === 'fa';
  const event = journey.pendingImpact;

  useEffect(() => {
    if (event) trackJourneyEvent('impact_sheet_viewed', {
      productId:event.sourceProduct,
      missionId:event.missionId,
      taskId:event.taskId,
    });
  }, [event]);

  const continueJourney = () => {
    const destination = journey.nextAction?.destination ?? '/home';
    if (journey.nextAction) trackJourneyEvent('next_action_clicked', {
      productId:event?.sourceProduct,
      missionId:event?.missionId,
      taskId:event?.taskId,
      route:destination,
    });
    journey.dismissImpact();
    navigate(destination);
  };

  return (
    <CenteredModal
      open={Boolean(event)}
      onClose={journey.dismissImpact}
      title={fa ? 'اثر اقدام شما' : 'Your Journey impact'}
      maxWidth="journey-impact-modal"
      closeLabel={fa ? 'بستن خلاصه اثر' : 'Close impact summary'}
    >
      {event && <div className="journey-impact-sheet">
        <header>
          <span className="journey-impact-sheet__success"><CheckCircle2 size={28}/></span>
          <div><small>{fa ? 'تسک کامل شد' : 'Task completed'}</small><h2>{event.sourceAction}</h2><p>{fa ? 'اقدام شما تأیید شد و مسیرتان به‌روزرسانی شده است.' : 'Your action was confirmed and your Journey has been updated.'}</p></div>
        </header>
        <section className="journey-impact-sheet__changes">
          <small>{fa ? 'چه چیزی تغییر کرد؟' : 'What changed?'}</small>
          <ul>{event.impact.map((impact) => <li key={`${impact.kind}-${impact.label}`} className={`is-${impact.kind}`}>
            <span>{impact.kind === 'achievement' ? <Trophy size={17}/> : <Sparkles size={17}/>}</span>
            <strong>{fa ? impact.faLabel : impact.label}</strong>
            {impact.before !== undefined && impact.after !== undefined && <div><i style={{ inlineSize:`${impact.after}%` }}/><bdi>{impact.before}% → {impact.after}%</bdi></div>}
          </li>)}</ul>
        </section>
        {event.transactionHash && <a href={`https://polygonscan.com/tx/${event.transactionHash}`} target="_blank" rel="noreferrer">{fa ? 'مشاهده تراکنش' : 'View transaction'}<ExternalLink size={15}/></a>}
        {journey.nextAction && <section className="journey-impact-sheet__next">
          <small>{fa ? 'گام پیشنهادی بعدی' : 'Next recommended step'}</small>
          <h3>{fa ? journey.nextAction.faTitle : journey.nextAction.title}</h3>
          <p>{fa ? journey.nextAction.faReason : journey.nextAction.reason}</p>
        </section>}
        <footer>
          <button type="button" onClick={continueJourney}>{journey.nextAction ? (fa ? `ادامه: ${journey.nextAction.faTitle}` : `Continue: ${journey.nextAction.title}`) : (fa ? 'ادامه مسیر' : 'Continue Journey')}<ArrowRight size={17}/></button>
          <button type="button" onClick={journey.dismissImpact}>{fa ? 'فعلاً همین‌جا بمان' : 'Stay here'}</button>
        </footer>
      </div>}
    </CenteredModal>
  );
}
