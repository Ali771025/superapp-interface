import { RadioTower, ShieldCheck } from '@icons';
import { Link } from 'react-router-dom';
import { Badge, Heading, Inline, Stack, Surface, Text } from '../../special3/primitives';

export interface ArticleCardProps {
  slug:string; headline:string; excerpt:string; cover?:string; tag?:string; readingTime?:number; writer?:string;
  verified?:boolean; publishedAt?:Date; echoes?:number; echoed?:boolean; featured?:boolean; onEcho?:()=>void;
}

/** Canonical SPECIAL article carrier retained as a reusable public component. */
export function ArticleCard({ slug,headline,excerpt,cover,tag,readingTime,writer,verified,publishedAt,echoes=0,echoed,featured,onEcho }:ArticleCardProps) {
  return <Surface as="article" variant={featured ? 'raised' : 'default'}><Stack gap={4}>
    {cover && <Link to={`/readiness/articles/${slug}`} className="block overflow-hidden rounded-xl"><img src={cover} alt="" loading="lazy" className="aspect-[16/7] w-full object-cover"/></Link>}
    <Inline>{tag && <Badge tone="primary">{tag}</Badge>}{readingTime && <Text variant="caption" tone="muted">{Math.ceil(readingTime/60)} min read</Text>}</Inline>
    <Heading level={2}><Link to={`/readiness/articles/${slug}`}>{headline}</Link></Heading><Text tone="secondary">{excerpt}</Text>
    <Inline>{writer && <Text variant="caption">By {writer}</Text>}{verified && <ShieldCheck aria-label="Verified author"/>}{publishedAt && <Text variant="caption" tone="muted">{publishedAt.toLocaleDateString()}</Text>}<button type="button" className="s3-secondary-action" onClick={onEcho} aria-pressed={echoed}><RadioTower aria-hidden="true"/>{echoes} echoes</button></Inline>
  </Stack></Surface>;
}
