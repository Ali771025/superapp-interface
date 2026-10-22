import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ChevronLeft, ChevronRight, type LucideIcon } from '@icons';

export interface FanCarouselModule {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
}

export interface FanCarouselGroup {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  modules: FanCarouselModule[];
}

interface CardFanCarouselProps {
  groups: FanCarouselGroup[];
  onOpenModule: (route: string) => void;
}

export function CardFanCarousel({ groups, onOpenModule }: CardFanCarouselProps) {
  const [centerIndex, setCenterIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  const focusCard = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-fan-index="${index}"]`);
    if (!rail || !card) return;
    setCenterIndex(index);
    rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2, behavior });
  }, []);

  const cycle = useCallback((direction: -1 | 1) => {
    if (!groups.length) return;
    focusCard((centerIndex + direction + groups.length) % groups.length);
  }, [centerIndex, focusCard, groups.length]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const syncFocusedCard = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const center = rail.scrollLeft + rail.clientWidth / 2;
        const cards = [...rail.querySelectorAll<HTMLElement>('[data-fan-index]')];
        const closest = cards.reduce((best, card) =>
          Math.abs(card.offsetLeft + card.clientWidth / 2 - center) < Math.abs(best.offsetLeft + best.clientWidth / 2 - center) ? card : best,
        cards[0]);
        if (closest) setCenterIndex(Number(closest.dataset.fanIndex));
      });
    };
    rail.addEventListener('scroll', syncFocusedCard, { passive: true });
    return () => { cancelAnimationFrame(frame); rail.removeEventListener('scroll', syncFocusedCard); };
  }, [groups.length]);

  if (!groups.length) return null;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); cycle(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); cycle(1); }
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const rail = railRef.current;
    if (!rail) return;
    dragRef.current = { active: true, startX: event.clientX, scrollLeft: rail.scrollLeft, moved: false };
    rail.setPointerCapture(event.pointerId);
    rail.classList.add('is-dragging');
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !dragRef.current.active) return;
    const delta = event.clientX - dragRef.current.startX;
    if (Math.abs(delta) > 5) dragRef.current.moved = true;
    rail.scrollLeft = dragRef.current.scrollLeft - delta;
  };
  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !dragRef.current.active) return;
    dragRef.current.active = false;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    rail.classList.remove('is-dragging');
    focusCard(centerIndex);
  };

  return <section className="fan-carousel" aria-label="ETERNITY module categories">
    <div
      ref={railRef}
      className="fan-carousel-stage"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      aria-roledescription="carousel"
    >
      {groups.map((group, index) => {
        const Icon = group.icon;
        return <article key={group.id} data-fan-index={index} className={`fan-carousel-item ${index === centerIndex ? 'is-center' : ''}`}>
          <button
            type="button"
            className="fan-carousel-visual"
            onClick={() => { if (!dragRef.current.moved) focusCard(index); dragRef.current.moved = false; }}
            aria-label={`Focus ${group.label}`}
            aria-pressed={index === centerIndex}
          >
            <Icon size={64}/>
            <strong>{group.label}</strong>
          </button>
          <div className="fan-carousel-module-list" aria-label={`${group.label} features`}>
            {group.modules.map((module) => {
              const ModuleIcon = module.icon;
              return <button type="button" key={module.id} onClick={() => { if (!dragRef.current.moved) onOpenModule(module.route); dragRef.current.moved = false; }}>
                <ModuleIcon size={20}/><span>{module.label}</span>
              </button>;
            })}
          </div>
        </article>;
      })}
    </div>
    <div className="fan-carousel-controls">
      <button type="button" onClick={() => cycle(-1)} aria-label="Previous module category"><ChevronLeft size={20}/></button>
      <span><bdi>{centerIndex + 1}</bdi> / <bdi>{groups.length}</bdi></span>
      <button type="button" onClick={() => cycle(1)} aria-label="Next module category"><ChevronRight size={20}/></button>
    </div>
  </section>;
}
