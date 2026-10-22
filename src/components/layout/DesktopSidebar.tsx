import { Boxes, Compass, Landmark, Settings2, Target, UserRound } from '@icons';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAppLanguage } from '../../lib/useAppLanguage';
import { QoraOrb } from '../qora/QoraOrb';
import { isSpaceActive } from './navigationSpaces';

export function DesktopSidebar({ onExplore }: { onExplore: () => void }) {
  const { copy } = useAppLanguage();
  const { pathname } = useLocation();
  const destinations = [
    { icon: Target, label: copy.journey, path: '/home', active: isSpaceActive(pathname, 'journey') },
    { icon: Compass, label: copy.world, path: '/world', active: isSpaceActive(pathname, 'world') },
    { icon: Landmark, label: copy.economy, path: '/economy', active: isSpaceActive(pathname, 'economy') },
    { icon: UserRound, label: copy.passport, path: '/passport', active: isSpaceActive(pathname, 'passport') },
  ];
  return <aside className="ds-desktop-rail nexus-rail hidden lg:flex" aria-label="Primary navigation">
    <nav className="nexus-rail-nav">
      {destinations.slice(0, 2).map(({ icon: Icon, label, path, active }) => <RailLink key={path} icon={Icon} label={label} path={path} active={active}/>) }
      <NavLink to="/qora" className={cn('nexus-rail-qora', isSpaceActive(pathname, 'qora') && 'is-active')} aria-label="QORA Agent"><QoraOrb size="compact" decorative/><small>{copy.qora}</small></NavLink>
      {destinations.slice(2).map(({ icon: Icon, label, path, active }) => <RailLink key={path} icon={Icon} label={label} path={path} active={active}/>) }
    </nav>
    <div className="nexus-rail-tools">
      <button type="button" onClick={onExplore} className="nexus-rail-explore" aria-label={copy.explore}><Boxes size={20}/><span>{copy.explore}</span></button>
      <RailLink icon={Settings2} label={copy.settings} path="/settings"/>
    </div>
  </aside>;
}

function RailLink({ icon: Icon, label, path, active }: { icon: typeof Target; label: string; path: string; active?: boolean }) {
  return <NavLink to={path} className={cn('nexus-rail-link', active && 'is-active')} aria-current={active ? 'page' : undefined} aria-label={label}><Icon size={20} strokeWidth={1.7}/><span>{label}</span></NavLink>;
}
