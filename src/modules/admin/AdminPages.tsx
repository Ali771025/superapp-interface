import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Activity, Database, Download,
  Settings, FileText, MessageCircle, List,
  XCircle, ChevronRight,
  Shield, Layers, Fingerprint, Trophy, ArrowLeftRight, CreditCard, UserCircle,
  Edit2, Save, ToggleRight,
} from '@icons';
import {
  ACCESS_LEVELS, ACCESS_FEATURES, CATEGORY_LABELS,
  isFeatureUnlocked, type AccessLevelKey,
} from '../../data/accessMatrix';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { mockAdminUsers, mockModuleStatuses, mockOnChainLogs, mockOffChainLogs, mockChatLogs, mockTransactionLogs, mockAuditTrail, mockBackups } from '../../data/mockLogs';
import { eidOwnerDelegateAdminCapabilityManifest } from './eidOwnerDelegateAdminContract';

function AdminShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  return (
    <div className={cn('min-h-screen max-w-4xl mx-auto', isDark ? 'bg-dark-bg' : 'bg-light-bg')}>
      <header className={cn('sticky top-0 z-40 flex items-center px-4 py-3 border-b gap-3', isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border shadow-sm')}>
        <button onClick={() => navigate(-1)} className={cn('text-xs font-semibold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>← Back</button>
        <div className="w-px h-4 bg-current opacity-20" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className={cn('font-bold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>ETERNITY Admin</span>
        </div>
        {title && <span className={cn('text-sm', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>/ {title}</span>}
      </header>
      <main className="p-4 pb-8">{children}</main>
    </div>
  );
}

function Badge({ label, variant }: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }) {
  const colors = {
    success: 'bg-success-DEFAULT/10 text-success-DEFAULT',
    warning: 'bg-warning-DEFAULT/10 text-warning-DEFAULT',
    danger: 'bg-danger-DEFAULT/10 text-danger-DEFAULT',
    info: 'bg-primary-500/10 text-primary-500',
  };
  return <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', colors[variant])}>{label}</span>;
}

export function AdminOverviewPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = [
    { label: 'Total Users', value: '42,300', icon: <Users size={16} />, color: 'text-primary-500' },
    { label: 'Transactions', value: '184,921', icon: <Activity size={16} />, color: 'text-success-DEFAULT' },
    { label: 'Active Modules', value: '8/8', icon: <Layers size={16} />, color: 'text-accent-DEFAULT' },
    { label: 'Failed Txns (24h)', value: '3', icon: <XCircle size={16} />, color: 'text-danger-DEFAULT' },
  ];

  const navItems = [
    { label: 'User Management', path: '/admin/users', icon: <Users size={16} /> },
    { label: 'Module Status', path: '/admin/modules', icon: <Activity size={16} /> },
    { label: 'Access Matrix', path: '/admin/access-matrix', icon: <ToggleRight size={16} /> },
    { label: 'EID Management', path: '/admin/eid', icon: <Fingerprint size={16} /> },
    { label: 'Achievement Logs', path: '/admin/achievements', icon: <Trophy size={16} /> },
    { label: 'Profile Logs', path: '/admin/profile-logs', icon: <UserCircle size={16} /> },
    { label: 'On-chain Logs', path: '/admin/onchain-logs', icon: <Database size={16} /> },
    { label: 'Off-chain Logs', path: '/admin/offchain-logs', icon: <FileText size={16} /> },
    { label: 'QORA Agent Chat Logs', path: '/admin/chat-logs', icon: <MessageCircle size={16} /> },
    { label: 'Transaction Logs', path: '/admin/transaction-logs', icon: <List size={16} /> },
    { label: 'Swap Logs', path: '/admin/swap-logs', icon: <ArrowLeftRight size={16} /> },
    { label: 'Payment Settings', path: '/admin/payment-settings', icon: <CreditCard size={16} /> },
    { label: 'Backup Center', path: '/admin/backups', icon: <Download size={16} /> },
    { label: 'API & Contracts', path: '/admin/api-settings', icon: <Settings size={16} /> },
    { label: 'Audit Trail', path: '/admin/audit-trail', icon: <Shield size={16} /> },
  ];

  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
              <div className="flex items-center gap-2 mb-1">
                <span className={s.color}>{s.icon}</span>
                <span className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{s.label}</span>
              </div>
              <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl transition-colors text-left',
                isDark ? 'hover:bg-dark-card text-dark-textPrimary' : 'hover:bg-light-card text-light-textPrimary shadow-sm'
              )}
            >
              <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>{item.icon}</span>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight size={14} className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} />
            </button>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminUsersPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell title="Users">
      <div className="space-y-2">
        {mockAdminUsers.map((u) => (
          <div key={u.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={cn('font-semibold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{u.username}</p>
                <p className={cn('text-xs font-mono', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{u.eid}</p>
              </div>
              <Badge label={u.status} variant={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'danger' : 'warning'} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Role</p><p className={cn('font-semibold capitalize', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{u.role}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Trust</p><p className="font-semibold text-success-DEFAULT">{u.trustScore}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>FAN</p><p className={cn('font-semibold capitalize', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{u.fanLevel}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminModulesPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell title="Module Status">
      <div className="space-y-2">
        {mockModuleStatuses.map((m) => (
          <div key={m.name} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-2">
              <p className={cn('font-semibold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{m.name}</p>
              <Badge label={m.status} variant={m.status === 'active' ? 'success' : m.status === 'error' ? 'danger' : 'warning'} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>API</p><p className={cn('font-semibold', m.apiStatus === 'online' ? 'text-success-DEFAULT' : 'text-danger-DEFAULT')}>{m.apiStatus}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Adapter</p><p className={cn('font-semibold', m.contractAdapterStatus === 'synced' ? 'text-success-DEFAULT' : 'text-warning-DEFAULT')}>{m.contractAdapterStatus}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Errors</p><p className={cn('font-semibold', m.errorCount > 0 ? 'text-danger-DEFAULT' : 'text-success-DEFAULT')}>{m.errorCount}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminOnChainLogsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell title="On-chain Logs">
      <div className="space-y-2">
        {mockOnChainLogs.map((log) => (
          <div key={log.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={cn('font-semibold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.eventName}</p>
                <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{log.module}</p>
              </div>
              <Badge label={log.syncStatus} variant={log.syncStatus === 'synced' ? 'success' : log.syncStatus === 'failed' ? 'danger' : 'warning'} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Block</p><p className={cn('font-semibold font-mono', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.blockNumber}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Time</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{new Date(log.timestamp).toLocaleString()}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminOffChainLogsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell title="Off-chain Logs">
      <div className="space-y-2">
        {mockOffChainLogs.map((log) => (
          <div key={log.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={cn('font-semibold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.actionType}</p>
                <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{log.module} / {log.page}</p>
              </div>
              <Badge label={log.result} variant={log.result === 'success' ? 'success' : log.result === 'failure' ? 'danger' : 'warning'} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>User</p><p className={cn('font-semibold font-mono truncate', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.walletAddress.slice(0, 10)}…</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Time</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{new Date(log.timestamp).toLocaleString()}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminChatLogsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell title="QORA Agent Chat Logs">
      <div className="space-y-2">
        {mockChatLogs.map((log) => (
          <div key={log.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-2">
              <p className={cn('font-semibold text-sm flex-1 mr-2 truncate', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.prompt}</p>
              {log.safetyWarning && <Badge label="Safety" variant="warning" />}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Intent</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.intent}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Action</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.suggestedAction}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminTransactionLogsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell title="Transaction Logs">
      <div className="space-y-2">
        {mockTransactionLogs.map((log) => (
          <div key={log.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={cn('font-semibold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.action}</p>
                <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{log.module}</p>
              </div>
              <Badge label={log.status} variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'danger' : 'warning'} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Amount</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.amount} {log.token}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Gas</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{log.gasEstimate ?? '—'}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Time</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{new Date(log.createdAt).toLocaleTimeString()}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminBackupsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell title="Backup Center">
      <div className="space-y-3">
        <button className="w-full py-3 rounded-2xl gradient-primary text-white text-sm font-bold">
          Create Manual Backup
        </button>
        <div className="space-y-2">
          {mockBackups.map((b) => (
            <div key={b.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={cn('font-semibold text-sm capitalize', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{b.type} Backup</p>
                  <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{b.size}</p>
                </div>
                <Badge label={b.status} variant={b.status === 'success' ? 'success' : b.status === 'failed' ? 'danger' : 'warning'} />
              </div>
              <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{new Date(b.createdAt).toLocaleString()}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {b.includes.map((inc) => (
                  <span key={inc} className={cn('text-xs px-1.5 py-0.5 rounded-full', isDark ? 'bg-dark-border text-dark-textSecondary' : 'bg-light-border text-light-textSecondary')}>{inc}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminAPISettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const settings = [
    { label: 'RPC Endpoint', value: 'https://example.invalid', status: 'online' },
    { label: 'IPFS Gateway', value: 'https://example.invalid', status: 'online' },
    { label: 'Price Oracle', value: 'https://example.invalid', status: 'online' },
    { label: 'Backup RPC', value: 'https://example.invalid', status: 'degraded' },
  ];

  return (
    <AdminShell title="API & Contracts">
      <div className="space-y-3">
        {settings.map((s) => (
          <div key={s.label} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-1">
              <p className={cn('text-sm font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{s.label}</p>
              <Badge label={s.status} variant={s.status === 'online' ? 'success' : 'warning'} />
            </div>
            <p className={cn('text-xs font-mono', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{s.value}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminAuditTrailPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AdminShell title="Audit Trail">
      <div className="space-y-2">
        {mockAuditTrail.map((entry) => (
          <div key={entry.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-2">
              <p className={cn('font-semibold text-sm', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{entry.action}</p>
              <Badge label={entry.result} variant={entry.result === 'success' ? 'success' : 'danger'} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Admin</p><p className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>{entry.adminUser}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Target</p><p className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>{entry.target}</p></div>
              <div className="col-span-2"><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Timestamp</p><p className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>{new Date(entry.timestamp).toLocaleString()}</p></div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminEidCapabilityPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const groups = Array.from(new Set(eidOwnerDelegateAdminCapabilityManifest.capabilities.map((capability) => capability.group)));

  return (
    <AdminShell title="EID Capability Gateway">
      <div className="space-y-4" data-admin-eid-gateway="capability-only">
        <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>Owner Delegate capability gateway</p>
              <p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                Provider-owned EID policy boundaries are mounted here without enabling production writes.
              </p>
            </div>
            <Badge label="Read-only" variant="warning" />
          </div>
          <p className="text-xs font-semibold text-warning-DEFAULT mt-3" role="status">
            Provider/admin authorization not connected
          </p>
          <p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            DEV/mock admin access does not grant Owner Delegate authority. No configuration action is available.
          </p>
        </div>

        {groups.map((group) => (
          <section key={group} aria-labelledby={`eid-admin-${group.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>
            <p
              id={`eid-admin-${group.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
              className={cn('text-xs font-bold uppercase tracking-wide mb-2', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}
            >
              {group}
            </p>
            <div className="space-y-2">
              {eidOwnerDelegateAdminCapabilityManifest.capabilities.filter((capability) => capability.group === group).map((capability) => (
                <article key={capability.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className={cn('text-sm font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{capability.label}</p>
                    <Badge label={capability.actionAvailability === 'Unavailable' ? 'Unavailable' : 'Provider-enforced'} variant="info" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Ownership</p><p className={cn('font-semibold mt-0.5', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{capability.ownership}</p></div>
                    <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Integration</p><p className={cn('font-semibold mt-0.5', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{capability.integrationStatus}</p></div>
                    <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Production authorization</p><p className="font-semibold text-warning-DEFAULT mt-0.5">{capability.productionAuthorizationStatus}</p></div>
                  </div>
                  <p className={cn('text-xs mt-3', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Action availability · {capability.actionAvailability}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}

export function AdminAccessMatrixPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [editingFee, setEditingFee] = useState<string | null>(null);
  const [fees, setFees] = useState<Record<string, number>>(
    Object.fromEntries(ACCESS_LEVELS.map((l) => [l.key, l.subscriptionFeeUSD]))
  );
  const [auditLog, setAuditLog] = useState<{ time: string; action: string }[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<Record<AccessLevelKey, boolean>>>>({});

  const logAction = (action: string) => {
    setAuditLog((prev) => [{ time: new Date().toLocaleTimeString(), action }, ...prev.slice(0, 9)]);
  };

  const toggleFeature = (featureId: string, levelKey: AccessLevelKey) => {
    setOverrides((prev) => {
      const featureOverrides = prev[featureId] ?? {};
      const current = featureOverrides[levelKey];
      const feature = ACCESS_FEATURES.find((f) => f.id === featureId);
      const wasUnlocked = current !== undefined ? current : isFeatureUnlocked(feature!, levelKey);
      const newVal = !wasUnlocked;
      logAction(`${newVal ? 'Enabled' : 'Disabled'} "${feature?.label}" for ${ACCESS_LEVELS.find((l) => l.key === levelKey)?.label}`);
      return { ...prev, [featureId]: { ...featureOverrides, [levelKey]: newVal } };
    });
  };

  const isEffectivelyUnlocked = (featureId: string, levelKey: AccessLevelKey): boolean => {
    const feature = ACCESS_FEATURES.find((f) => f.id === featureId)!;
    const override = overrides[featureId]?.[levelKey];
    return override !== undefined ? override : isFeatureUnlocked(feature, levelKey);
  };

  const categories = Array.from(new Set(ACCESS_FEATURES.map((f) => f.category)));

  return (
    <AdminShell title="Access Matrix">
      <div className="space-y-4">
        <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <p className={cn('text-sm font-bold mb-1', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>Access & Benefits Matrix</p>
          <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            Toggle features per FAN level and manage subscription fees. Changes are logged in audit trail.
          </p>
        </div>

        <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <p className={cn('text-xs font-bold mb-3 uppercase tracking-wide', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Subscription Fees</p>
          <div className="grid grid-cols-3 gap-2">
            {ACCESS_LEVELS.map((level) => (
              <div key={level.key} className={cn('rounded-xl p-3', isDark ? 'bg-dark-surface' : 'bg-light-bg')}>
                <p className={cn('text-xs font-semibold mb-2', level.color)}>{level.label}</p>
                {editingFee === level.key ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-warning-DEFAULT">$</span>
                    <input
                      type="number"
                      value={fees[level.key]}
                      onChange={(e) => setFees((p) => ({ ...p, [level.key]: Number(e.target.value) }))}
                      className={cn('w-16 text-xs px-1.5 py-1 rounded-lg outline-none', isDark ? 'bg-dark-card text-dark-textPrimary border border-dark-border' : 'bg-light-card text-light-textPrimary border border-light-border')}
                    />
                    <button onClick={() => { setEditingFee(null); logAction(`Updated ${level.label} fee to $${fees[level.key]}`); }} className="w-6 h-6 rounded bg-success-DEFAULT/20 flex items-center justify-center">
                      <Save size={10} className="text-success-DEFAULT" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-warning-DEFAULT">${fees[level.key]}/yr</span>
                    <button onClick={() => setEditingFee(level.key)} className="w-5 h-5 rounded bg-primary-500/20 flex items-center justify-center">
                      <Edit2 size={9} className="text-primary-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[680px] text-xs border-collapse">
            <thead>
              <tr>
                <th className={cn('text-left p-3 font-semibold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Feature</th>
                {ACCESS_LEVELS.map((level) => (
                  <th key={level.key} className={cn('p-3 text-center font-bold', level.color)}>{level.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <React.Fragment key={cat}>
                  <tr>
                    <td colSpan={ACCESS_LEVELS.length + 1} className={cn('px-3 py-2 text-xs font-bold uppercase tracking-wider', isDark ? 'text-dark-textSecondary bg-dark-surface' : 'text-light-textSecondary bg-light-bg')}>
                      {CATEGORY_LABELS[cat]}
                    </td>
                  </tr>
                  {ACCESS_FEATURES.filter((f) => f.category === cat).map((feature) => (
                    <tr key={feature.id} className={cn('border-t', isDark ? 'border-dark-border' : 'border-light-border')}>
                      <td className="p-3">
                        <p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{feature.label}</p>
                        <p className={cn('text-xs mt-0.5 max-w-48', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{feature.description}</p>
                      </td>
                      {ACCESS_LEVELS.map((level) => {
                        const unlocked = isEffectivelyUnlocked(feature.id, level.key);
                        const isOverridden = overrides[feature.id]?.[level.key] !== undefined;
                        return (
                          <td key={level.key} className="p-3 text-center">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => toggleFeature(feature.id, level.key)}
                                className={cn(
                                  'w-9 h-5 rounded-full transition-all relative flex items-center px-0.5',
                                  unlocked ? 'bg-success-DEFAULT' : isDark ? 'bg-dark-border' : 'bg-light-border',
                                  isOverridden ? 'ring-2 ring-warning-DEFAULT/60' : ''
                                )}
                              >
                                <span className={cn(
                                  'w-4 h-4 rounded-full bg-white shadow transition-transform',
                                  unlocked ? 'translate-x-4' : 'translate-x-0'
                                )} />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {auditLog.length > 0 && (
          <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <p className={cn('text-xs font-bold mb-2', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Recent Changes</p>
            <div className="space-y-1">
              {auditLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={cn('font-mono flex-shrink-0', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{entry.time}</span>
                  <span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>{entry.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
