import { useRef, useState, type WheelEvent as ReactWheelEvent } from 'react';
import { WalletCards } from '@icons';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AREA_REGISTRY, productsForArea, type ProductArea } from '../data/productRegistry';
import { useEternityUserState } from '../lib/userState';

export function WorldPage() {
  const navigate = useNavigate();
  const user = useEternityUserState();
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<ProductArea, HTMLElement>());
  const animationFrame = useRef<number | null>(null);
  const [focused, setFocused] = useState<ProductArea>('learning');

  const focusArea = (id: ProductArea, moveFocus = false) => {
    setFocused(id);
    const card = cardRefs.current.get(id);
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    if (moveFocus) card?.querySelector<HTMLButtonElement>('button')?.focus();
  };

  const moveArea = (direction: -1 | 1) => {
    const index = AREA_REGISTRY.findIndex((area) => area.id === focused);
    const nextIndex = Math.max(0, Math.min(AREA_REGISTRY.length - 1, index + direction));
    focusArea(AREA_REGISTRY[nextIndex].id, true);
  };

  const syncCenteredCard = () => {
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      const rail = railRef.current;
      if (!rail) return;
      const railCenter = rail.getBoundingClientRect().left + rail.clientWidth / 2;
      const closest = AREA_REGISTRY.reduce<{ id: ProductArea; distance: number } | undefined>((best, area) => {
        const box = cardRefs.current.get(area.id)?.getBoundingClientRect();
        if (!box) return best;
        const distance = Math.abs(box.left + box.width / 2 - railCenter);
        return !best || distance < best.distance ? { id: area.id, distance } : best;
      }, undefined);
      if (closest) setFocused(closest.id);
    });
  };

  const translateWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const direction = Math.sign(event.deltaY);
    const canScroll = direction > 0
      ? rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 2
      : rail.scrollLeft > 2;
    if (!canScroll) return;
    event.preventDefault();
    rail.scrollBy({ left: event.deltaY, behavior: 'smooth' });
  };

  const selectedArea = AREA_REGISTRY.find((area) => area.id === focused) ?? AREA_REGISTRY[0];
  const selectedFeatures = productsForArea(selectedArea.id);
  const selectedRestricted = selectedFeatures.some((feature) => feature.requiresWallet && !user.walletConnected);

  return (
    <AppShell title="World" wide>
      <main className="world-deck">
        <section className="world-deck-carousel" aria-label="ETERNITY areas">
          <div
            className="world-deck-rail"
            ref={railRef}
            onScroll={syncCenteredCard}
            onWheel={translateWheel}
          >
            {AREA_REGISTRY.map((area) => {
              const isFocused = area.id === focused;
              return (
                <article
                  key={area.id}
                  ref={(node) => {
                    if (node) cardRefs.current.set(area.id, node);
                    else cardRefs.current.delete(area.id);
                  }}
                  className={`world-deck-card${isFocused ? ' is-centered' : ''}`}
                >
                  <button
                    type="button"
                    aria-pressed={isFocused}
                    onClick={() => focusArea(area.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowLeft') { event.preventDefault(); moveArea(-1); }
                      if (event.key === 'ArrowRight') { event.preventDefault(); moveArea(1); }
                    }}
                  >
                    <span className="world-deck-art" data-area={area.id} aria-hidden="true"><i/><i/><b/></span>
                    <span className="world-deck-copy">
                      <strong>{area.label}</strong>
                      <small>{area.description}</small>
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="world-deck-features" aria-live="polite" aria-labelledby="world-area-title">
          <header>
            <small>Selected area</small>
            <h2 id="world-area-title">{selectedArea.label} features</h2>
          </header>
          <div>
            {selectedFeatures.map((feature) => (
              <button type="button" key={feature.id} onClick={() => navigate(feature.route)}>
                <span>
                  <strong>{feature.label}</strong>
                  <small>{feature.shortDescription}</small>
                </span>
              </button>
            ))}
          </div>
          {selectedRestricted && (
            <p className="world-deck-requirement">
              <WalletCards size={15}/>A wallet is requested only when an on-chain action begins.
            </p>
          )}
        </section>
      </main>
    </AppShell>
  );
}
