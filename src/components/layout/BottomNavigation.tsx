import { NavLink, useLocation } from 'react-router-dom';
import { Bot, Compass, Landmark, Target, UserRound } from '@icons';
import { cn } from '../../lib/utils';
import { QoraOrb } from '../qora/QoraOrb';
import { useAppLanguage, type UiCopy } from '../../lib/useAppLanguage';
import { isSpaceActive } from './navigationSpaces';

const items = [
  { icon: Target, label: 'journey' as keyof UiCopy, path: '/home', space: 'journey' as const },
  { icon: Compass, label: 'world' as keyof UiCopy, path: '/world', space: 'world' as const },
  { icon: Bot, label: 'qora' as keyof UiCopy, path: '/qora', qora: true, space: 'qora' as const },
  { icon: Landmark, label: 'economy' as keyof UiCopy, path: '/economy', space: 'economy' as const },
  { icon: UserRound, label: 'passport' as keyof UiCopy, path: '/passport', space: 'passport' as const },
];

export function BottomNavigation() {
  const location = useLocation();
  const { copy } = useAppLanguage();
  return <nav aria-label="Mobile navigation" className="ds-mobile-dock nexus-dock safe-bottom lg:hidden">
    {items.map(({ icon: Icon, label, path, qora, space }) => {
      const active = isSpaceActive(location.pathname, space);
      return <NavLink key={path} to={path} aria-label={copy[label]} className={cn('nexus-dock-link', qora && 'is-qora', active && 'is-active')}>
        {qora ? <QoraOrb size="compact" decorative/> : <Icon size={20} strokeWidth={active ? 2.2 : 1.6}/>}<small>{copy[label]}</small>
      </NavLink>;
    })}
  </nav>;
}
