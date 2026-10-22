import { AppShell } from '../../components/layout/AppShell';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

export function QORAMissionsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const missions = [
    { id: 'm1', label: 'Make 5 ecosystem transactions', progress: 60, reward: 50 },
    { id: 'm2', label: 'Complete Web3 Safety course', progress: 85, reward: 100 },
    { id: 'm3', label: 'Invite 1 active referral', progress: 100, reward: 75 },
    { id: 'm4', label: 'Vote on 1 ERA proposal', progress: 0, reward: 80 },
    { id: 'm5', label: 'Enter 3 Forecast rounds', progress: 67, reward: 60 },
  ];

  return (
    <AppShell title="QORA Agent Missions" showBack>
      <div className="space-y-3">
        <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <p className={cn('text-xs mb-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Total EQ Points</p>
          <p className="text-2xl font-bold text-warning-DEFAULT">4,820 EQ</p>
        </div>
        {missions.map((m) => (
          <div key={m.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-start justify-between mb-2">
              <p className={cn('text-sm font-semibold flex-1', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{m.label}</p>
              <span className="text-xs text-warning-DEFAULT font-bold ml-2">+{m.reward} EQ</span>
            </div>
            <div className={cn('w-full rounded-full h-1.5 mb-1', isDark ? 'bg-dark-border' : 'bg-light-border')}>
              <div className={cn('h-1.5 rounded-full', m.progress === 100 ? 'bg-success-DEFAULT' : 'bg-primary-500')} style={{ width: `${m.progress}%` }} />
            </div>
            <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{m.progress}%</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
