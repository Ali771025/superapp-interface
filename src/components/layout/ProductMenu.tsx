import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredModal } from '../modals/CenteredModal';
import { AREA_REGISTRY } from '../../data/productRegistry';
import { ContextHelp, ContextHelpTrigger } from '../ui/ContextHelp';
import { SHELL_PRODUCTS } from './shellProducts';
import { CardFanCarousel, type FanCarouselGroup } from '../ui/CardFanCarousel';

export function ProductMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpAnchor, setHelpAnchor] = useState<HTMLButtonElement | null>(null);
  const groups = useMemo<FanCarouselGroup[]>(() => AREA_REGISTRY.map((area) => ({
    id: area.id,
    label: area.label,
    description: area.description,
    icon: area.icon,
    modules: SHELL_PRODUCTS.filter((feature) => feature.area === area.id).map((feature) => ({ id: feature.id, label: feature.label, route: feature.route, icon: feature.icon })),
  })).filter((area) => area.modules.length > 0), []);
  const go = (route: string) => {
    navigate(route);
    onClose();
  };

  return <CenteredModal open={open} onClose={onClose} title="All Modules" closeLabel="Close All Modules" presentation="fullscreen">
    <div className="et-explorer et-explorer--fan">
      <header className="et-explorer-header">
        <div><span className="workspace-eyebrow">Workspace modules</span><h2>Choose a world. Open its module.</h2></div>
        <ContextHelpTrigger label="All Modules" onClick={(element) => { setHelpAnchor(element); setHelpOpen(true); }}/>
      </header>
      <CardFanCarousel groups={groups} onOpenModule={go}/>
      <ContextHelp title="All Modules" description="Choose a topic to reveal its modules. Each selection opens inside the current Workspace." open={helpOpen} anchor={helpAnchor} onClose={() => setHelpOpen(false)}/>
    </div>
  </CenteredModal>;
}
