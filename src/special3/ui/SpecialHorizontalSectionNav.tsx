import type { CSSProperties } from 'react';

export type JourneyLandingView = 'overview' | 'missions' | 'progress' | 'rewards';

interface SpecialHorizontalSectionNavProps {
  active: JourneyLandingView;
  onChange: (view: JourneyLandingView) => void;
}

const views: readonly JourneyLandingView[] = ['overview', 'missions', 'progress', 'rewards'];
const visibleLabels: Record<JourneyLandingView,string> = {
  overview:'Overview',
  missions:'Missions',
  progress:'Progress',
  rewards:'Reward',
};
const navStyle: CSSProperties = { display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:4, marginBlock:'var(--s3-space-3)', padding:4, overflowX:'auto', borderRadius:'var(--s3-radius-card)', scrollbarWidth:'none' };

export function SpecialHorizontalSectionNav({ active, onChange }: SpecialHorizontalSectionNavProps) {
  return <nav className="s3-special-section-nav glass-subtle" style={navStyle} aria-label="Journey sections" role="tablist">
    {views.map((view) => {
      const selected = active === view;
      return <button key={view} type="button" role="tab" aria-selected={selected} onClick={() => onChange(view)} style={{minWidth:76,minHeight:44,paddingInline:'var(--s3-space-2)',border:0,borderRadius:'var(--s3-radius-control)',color:selected?'#fff':'var(--s3-text-secondary)',background:selected?'var(--s3-primary)':'transparent',font:'inherit',fontSize:'var(--s3-type-label)',fontWeight:700,whiteSpace:'nowrap',cursor:'pointer'}}>{visibleLabels[view]}</button>;
    })}
  </nav>;
}
