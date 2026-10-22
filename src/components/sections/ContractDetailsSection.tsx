import { useState } from 'react';
import { Copy, ExternalLink, CheckCircle, FileText } from '@icons';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

export interface ContractStat {
  label: string;
  value: string | number;
  accent?: 'primary' | 'success' | 'warning' | 'accent';
}

export interface ContractDetailsProps {
  productName: string;
  address: string;
  explorerUrl?: string;
  stats: ContractStat[];
  secondaryAddresses?: { label: string; address: string }[];
  lastSynced?: string;
}

const accentClass = {
  primary: 'text-primary-500',
  success: 'text-success-DEFAULT',
  warning: 'text-warning-DEFAULT',
  accent: 'text-accent-DEFAULT',
};

export function ContractDetailsSection({ productName, address, explorerUrl, stats, secondaryAddresses, lastSynced }: ContractDetailsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 1500);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <FileText size={15} className="text-accent-DEFAULT" />
          </div>
          <p className={cn('text-sm font-bold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>Contract Details</p>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', isDark ? 'bg-dark-border text-dark-textSecondary' : 'bg-light-border text-light-textSecondary')}>{productName}</span>
        </div>

        {/* Main address */}
        <AddressRow label="Contract" address={address} copied={copiedAddr === address} onCopy={handleCopy} isDark={isDark} explorerUrl={explorerUrl} />

        {/* Secondary addresses */}
        {secondaryAddresses?.map((sa) => (
          <AddressRow key={sa.address} label={sa.label} address={sa.address} copied={copiedAddr === sa.address} onCopy={handleCopy} isDark={isDark} />
        ))}
      </div>

      {/* Stats grid */}
      <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className={cn('rounded-xl p-3', isDark ? 'bg-dark-surface' : 'bg-light-bg')}>
              <p className={cn('text-xs mb-0.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{stat.label}</p>
              <p className={cn('text-sm font-bold', stat.accent ? accentClass[stat.accent] : isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {lastSynced && (
        <p className={cn('text-xs text-center', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
          Last synced: {lastSynced}
        </p>
      )}
    </div>
  );
}

function AddressRow({ label, address, copied, onCopy, isDark, explorerUrl }: {
  label: string; address: string; copied: boolean;
  onCopy: (a: string) => void; isDark: boolean; explorerUrl?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 p-2.5 rounded-xl mb-2 last:mb-0', isDark ? 'bg-dark-surface' : 'bg-light-bg')}>
      <span className={cn('text-xs font-semibold flex-shrink-0 w-16', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{label}</span>
      <span className={cn('flex-1 text-xs font-mono truncate', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>
        {address.length > 20 ? `${address.slice(0, 10)}...${address.slice(-6)}` : address}
      </span>
      <button onClick={() => onCopy(address)} className={cn('transition-colors flex-shrink-0', copied ? 'text-success-DEFAULT' : isDark ? 'text-dark-textSecondary hover:text-primary-500' : 'text-light-textSecondary')}>
        {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
      </button>
      {explorerUrl && (
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className={cn('flex-shrink-0', isDark ? 'text-dark-textSecondary hover:text-accent-DEFAULT' : 'text-light-textSecondary')}>
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}
