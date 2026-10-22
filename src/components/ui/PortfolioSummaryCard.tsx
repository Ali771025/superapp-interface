import { ArrowRight, WalletCards } from '@icons';

export interface PortfolioAllocation {
  code: string;
  percent: number;
  tone: 'primary' | 'violet' | 'cyan' | 'neutral';
}

interface PortfolioSummaryCardProps {
  title: string;
  balance: string;
  delta?: number;
  helper: string;
  allocations: PortfolioAllocation[];
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
}

export function PortfolioSummaryCard({
  title,
  balance,
  delta,
  helper,
  allocations,
  actionLabel,
  actionDisabled,
  onAction,
}: PortfolioSummaryCardProps) {
  return <section className="portfolio-summary-card" aria-label={title}>
    <header>
      <div><span className="workspace-eyebrow">{title}</span><small>{helper}</small></div>
      <button type="button" onClick={onAction} disabled={actionDisabled}><WalletCards size={18}/>{actionLabel}<ArrowRight size={15}/></button>
    </header>
    <div className="portfolio-summary-balance"><strong><bdi>{balance}</bdi></strong>{typeof delta === 'number' && <span>+{delta}%</span>}</div>
    <div className="portfolio-summary-divider"/>
    <div className="portfolio-allocation" aria-label="Portfolio allocation">
      {allocations.map((allocation) => <div key={allocation.code} style={{ width: `${allocation.percent}%` }}>
        <i className={`is-${allocation.tone}`}/>
        <span>{allocation.code}</span>
        <strong>{allocation.percent}%</strong>
      </div>)}
    </div>
  </section>;
}
