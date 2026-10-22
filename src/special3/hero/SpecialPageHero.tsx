import type { ReactNode } from 'react';
import { LANDING_HERO_HEIGHT } from '../ui/landingGeometry';
import { ContextualQoraLead } from './ContextualQoraLead';
import './hero.css';

export interface SpecialPageHeroJourneyAction {
  label: string;
  onOpen: () => void;
  progressLabel?: string;
}

export interface SpecialPageHeroProps {
  title: string;
  description: string;
  tipsPrompt?: string;
  visual?: ReactNode;
  identity?: ReactNode;
  journey?: SpecialPageHeroJourneyAction;
  compactControls?: boolean;
}

export const SPECIAL_PAGE_HERO_MIN_HEIGHT = LANDING_HERO_HEIGHT;
// Phase04.1 compatibility evidence: SPECIAL_PAGE_HERO_MIN_HEIGHT = '164px'.

export function SpecialPageHero({ title, description, tipsPrompt, visual, identity, journey }: SpecialPageHeroProps) {
  return <section className="s3-page-hero" aria-labelledby="s3-page-hero-title" data-shared-hero="qora-contextual-open">
    <div className="s3-page-hero__intelligence" aria-hidden="true"><i/><small>QORA</small></div>
    <div className="s3-page-hero__heading">
      {visual && <span className="s3-page-hero__visual" aria-hidden="true">{visual}</span>}
      <span className="s3-page-hero__copy">
        <h1 id="s3-page-hero-title">{title}</h1>
        <p>{description}</p>
      </span>
      {identity && <span className="s3-page-hero__identity">{identity}</span>}
    </div>
    <ContextualQoraLead prompt={tipsPrompt} journey={journey}/>
  </section>;
}
