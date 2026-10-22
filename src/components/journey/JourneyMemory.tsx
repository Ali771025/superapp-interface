import { ArrowRight, CheckCircle2, ExternalLink, History } from '@icons';
import type { JourneyEvent } from '../../lib/journey/types';

type JourneyMemoryProps = {
  events: JourneyEvent[];
  onViewAll?: () => void;
  preview?: boolean;
};

export function JourneyMemory({ events, onViewAll, preview = false }: JourneyMemoryProps) {
  const visibleEvents = preview ? events.slice(0, 2) : events.slice(0, 5);
  return (
    <section className="passport-activity-preview journey-memory" aria-labelledby="journey-memory-title">
      <header>
        <div>
          <History size={20}/>
          <span>
            <strong id="journey-memory-title">Journey memory</strong>
            <small>The impact of your verified actions</small>
          </span>
        </div>
        {onViewAll && (
          <button type="button" onClick={onViewAll}>
            View all<ArrowRight size={15}/>
          </button>
        )}
      </header>
      {visibleEvents.length ? (
        <div>{visibleEvents.map((event) => <JourneyMemoryRow key={event.id} event={event}/>)}</div>
      ) : (
        <p>No verified action has been recorded yet. Complete a task and its impact will remain here.</p>
      )}
    </section>
  );
}

export function JourneyMemoryRow({ event }: { event: JourneyEvent }) {
  const eq = event.impact.find((item) => item.kind === 'eq');
  return (
    <article className="passport-activity-row">
      <span><CheckCircle2 size={17}/></span>
      <div>
        <strong>{event.sourceAction}</strong>
        <small>{event.sourceProduct} · {new Intl.DateTimeFormat('en', { dateStyle:'medium', timeStyle:'short' }).format(event.timestamp)}</small>
        <p>{event.impact.map((item) => item.label).join(' · ')}</p>
      </div>
      <div>
        {eq && <bdi>{eq.label}</bdi>}
        {event.transactionHash && (
          <a href={`https://polygonscan.com/tx/${event.transactionHash}`} target="_blank" rel="noreferrer" aria-label="View transaction">
            <ExternalLink size={15}/>
          </a>
        )}
      </div>
    </article>
  );
}
