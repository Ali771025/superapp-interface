import type { CSSProperties, ReactNode } from 'react';
import { LANDING_METRIC_MIN_HEIGHT } from './landingGeometry';

interface SpecialMetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}

const cardStyle: CSSProperties = { position:'relative', minWidth:0, minHeight:LANDING_METRIC_MIN_HEIGHT, display:'block', padding:8, borderRadius:'var(--s3-radius-card)' };

export function SpecialMetricCard({ label, value, detail, icon }: SpecialMetricCardProps) {
  return <article className="s3-special-metric glass-subtle" style={cardStyle} aria-label={`${label}: ${value}`}>
    <span aria-hidden="true" style={{position:'absolute',insetInlineEnd:6,insetBlockStart:6,width:16,height:16,display:'grid',placeItems:'center',color:'var(--s3-primary)'}}>{icon}</span>
    <span style={{display:'grid',minWidth:0,gap:2}}>
      <small style={{minHeight:20,paddingInlineEnd:14,color:'var(--s3-text-muted)',fontSize:'9px',fontWeight:700,lineHeight:1.1}}>{label}</small>
      <strong style={{fontSize:'10px',lineHeight:1.15,letterSpacing:'-.1px',fontVariantNumeric:'tabular-nums',overflowWrap:'normal',wordBreak:'normal'}}>{value}</strong>
      <small title={detail} style={{overflow:'hidden',color:'var(--s3-text-secondary)',fontSize:'9px',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{detail}</small>
    </span>
  </article>;
}
