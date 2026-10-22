import { CheckCircle, AlertTriangle, Gift, HandCoins, Vote } from '@icons';
import { AppShell } from '../components/layout/AppShell';
import { useTheme } from '../lib/theme-context';
import { cn } from '../lib/utils';
import { isSpecial3ShellEnabled } from '../special3/shell/featureFlag';
import { SpecialNotificationsPage } from '../special3/system/SpecialSystemPages';

const notifications = [
  { id: 'n1', icon: <Gift size={16} />, title: 'Reward ready to claim', body: 'Your FAN direct bonus of 45.5 ETER is claimable.', time: '2m ago', read: false, color: 'text-success-DEFAULT' },
  { id: 'n2', icon: <AlertTriangle size={16} />, title: 'Forecast closes in 8 hours', body: 'Week 28 prediction window is about to close.', time: '1h ago', read: false, color: 'text-warning-DEFAULT' },
  { id: 'n3', icon: <Vote size={16} />, title: 'New governance proposal', body: '"Reduce Generator Buy Fee" is now open for voting.', time: '4h ago', read: false, color: 'text-primary-500' },
  { id: 'n4', icon: <CheckCircle size={16} />, title: 'SHIELD payment confirmed', body: 'Your SHIELD #1042 payment of 100 USDT was processed.', time: '1d ago', read: true, color: 'text-success-DEFAULT' },
  { id: 'n5', icon: <HandCoins size={16} />, title: 'EES dividend available', body: 'Electoral Stock #0044 dividend of 28.5 USDT is ready.', time: '2d ago', read: true, color: 'text-warning-DEFAULT' },
];

export function NotificationsPage() {
  if (isSpecial3ShellEnabled()) return <SpecialNotificationsPage/>;
  return <LegacyNotificationsPage/>;
}

function LegacyNotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AppShell title="Notifications" showBack>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-2xl',
              isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm',
              !n.read && 'ring-1 ring-primary-500/20'
            )}
          >
            <div className={cn('w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5', n.color)}>
              {n.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className={cn('text-sm font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
              </div>
              <p className={cn('text-xs mt-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{n.body}</p>
              <p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
