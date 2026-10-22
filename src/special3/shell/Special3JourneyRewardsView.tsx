import { ArrowRight, Gift, Info } from '@icons';

export interface JourneyRewardSummary {
  id: string;
  source: string;
  amount: number;
  token: string;
  status: string;
}

interface Special3JourneyRewardsViewProps {
  rewards: readonly JourneyRewardSummary[] | null;
  sourceDetail: string;
  onOpenEarn: () => void;
}

export function Special3JourneyRewardsView({ rewards, sourceDetail, onOpenEarn }: Special3JourneyRewardsViewProps) {
  const claimable = rewards?.filter((reward) => reward.status === 'claimable') ?? [];
  return <section aria-labelledby="journey-rewards-title" style={{display:'grid',gap:'var(--s3-space-3)'}}>
    <header style={{display:'flex',alignItems:'end',justifyContent:'space-between',gap:'var(--s3-space-3)'}}><span><small style={{color:'var(--s3-text-muted)'}}>JOURNEY REWARD CONTEXT · READ-ONLY</small><h2 id="journey-rewards-title" style={{marginTop:4}}>Reward context</h2></span><strong style={{color:'var(--s3-primary)'}}>{rewards===null?'Unavailable':`${claimable.length} source${claimable.length===1?'':'s'} ready`}</strong></header>
    <div role="note" style={{display:'flex',alignItems:'flex-start',gap:8,padding:'var(--s3-space-3)',borderRadius:'var(--s3-radius-control)',color:'var(--s3-text-secondary)',background:'var(--s3-info-surface)',fontSize:'var(--s3-type-label)',lineHeight:1.5}}><Info aria-hidden="true" style={{flex:'0 0 auto',color:'var(--s3-info)'}}/><span>Economy owns the full Reward workspace. Journey provides only this compact context and never claims, withdraws, or infers Reward truth.</span></div>
    <article className="glass-subtle" style={{minHeight:92,display:'grid',gridTemplateColumns:'38px minmax(0,1fr)',alignItems:'center',gap:'var(--s3-space-3)',padding:'var(--s3-space-4)',borderRadius:'var(--s3-radius-card)'}}><span aria-hidden="true" style={{color:'var(--s3-primary)'}}><Gift/></span><span style={{minWidth:0}}><small style={{display:'block',color:'var(--s3-text-muted)'}}>Provider context</small><strong style={{display:'block',marginTop:4}}>{rewards===null?'Reward source unavailable':`${rewards.length} classified source${rewards.length===1?'':'s'}`}</strong><small style={{display:'block',marginTop:4,color:'var(--s3-text-muted)',lineHeight:1.4}}>{sourceDetail}</small></span></article>
    <button type="button" onClick={onOpenEarn} style={{minHeight:44,display:'inline-flex',width:'fit-content',alignItems:'center',gap:8,paddingInline:'var(--s3-space-4)',border:'1px solid var(--s3-border)',borderRadius:'var(--s3-radius-control)',color:'var(--s3-primary)',background:'var(--s3-surface)',font:'inherit',fontWeight:700,cursor:'pointer'}}>Open Economy Reward <ArrowRight aria-hidden="true"/></button>
  </section>;
}
