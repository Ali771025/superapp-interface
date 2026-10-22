import { useDeferredValue, useMemo, useState } from 'react';
import { ArrowRight, PenLine, RadioTower, Search, ShieldCheck } from '@icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { BrowseTemplate, DetailTemplate } from '../special3/interaction/PageTemplates';
import { EmptyState, FieldCarrier, FieldInput, FieldSelect, FieldTextarea, LocalNav, PrimaryAction, SemanticNotice, SourceDisclosure } from '../special3/interaction/SharedComponents';
import { Badge, Container, Grid, Heading, Inline, Stack, Surface, Text } from '../special3/primitives';
import { publicSurfaceProvider, type ArticleRecord } from '../special3/providers/publicSurfaces';

type SortMode = 'explore' | 'latest';
const sortItems = [{ id:'explore', label:'Top echoed' },{ id:'latest', label:'Latest' }] as const;

function ArticleResultCard({ article, echoed, onEcho, featured }: { article:ArticleRecord; echoed:boolean; onEcho:()=>void; featured:boolean }) {
  return <Surface as="article" variant={featured ? 'raised' : 'default'} className={featured ? 'md:col-span-2' : ''}><Stack gap={4}>
    <Link to={`/readiness/articles/${article.slug}`} className="block overflow-hidden rounded-xl"><img src={article.cover} alt="" loading="lazy" className="aspect-[16/7] w-full object-cover"/></Link>
    <Inline gap={2}><Badge tone="primary">{article.category}</Badge><Text variant="caption" tone="muted">{article.readingMinutes} min read</Text></Inline>
    <Stack gap={2}><Heading level={2}><Link to={`/readiness/articles/${article.slug}`}>{article.title}</Link></Heading><Text tone="secondary">{article.excerpt}</Text></Stack>
    <Inline gap={3}><Text variant="caption">By {article.author}</Text>{article.verified && <ShieldCheck aria-label="Verified author"/>}<Text variant="caption" tone="muted">{new Date(article.publishedAt).toLocaleDateString()}</Text><button type="button" className="s3-secondary-action" aria-pressed={echoed} onClick={onEcho}><RadioTower aria-hidden="true"/>{article.echoes + Number(echoed)} echoes</button></Inline>
  </Stack></Surface>;
}

export function ArticlesPage() {
  const navigate = useNavigate();
  const result = publicSurfaceProvider.articles();
  const [query,setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [sort,setSort] = useState<SortMode>('explore');
  const [echoed,setEchoed] = useState<Set<string>>(new Set());
  const filtered = useMemo(() => (result.data?.entries ?? []).filter((article) => `${article.title} ${article.excerpt} ${article.category} ${article.tags.join(' ')}`.toLowerCase().includes(deferredQuery.trim().toLowerCase())).sort((a,b) => sort === 'explore' ? (b.echoes + Number(echoed.has(b.slug))) - (a.echoes + Number(echoed.has(a.slug))) : b.publishedAt.localeCompare(a.publishedAt)), [deferredQuery,echoed,result.data,sort]);
  const toggleEcho = (slug:string) => setEchoed((current) => { const next = new Set(current); if (next.has(slug)) next.delete(slug); else next.add(slug); return next; });
  return <AppShell title="Articles" showBack wide><BrowseTemplate eyebrow="Learning reference" title="Articles" titleOwner="shell" intro="Readable, practical thinking from controlled editorial sources." status={result.data ? <SourceDisclosure value={result.data.source} compact/> : undefined} actions={<PrimaryAction onClick={() => navigate('/readiness/articles/new')}><PenLine aria-hidden="true"/>Open publishing workspace</PrimaryAction>}>
    {result.state === 'unavailable' || !result.data ? <EmptyState title="Verified editorial content unavailable" detail={result.detail}/> : <Stack gap={5} data-special3 data-source="visible-provider-disclosure">
      <FieldCarrier id="article-search" label="Search articles" description="Filter by title, category, tag, or summary."><FieldInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, category or tag" type="search"/></FieldCarrier>
      <LocalNav label="Article order" items={sortItems} activeId={sort} onChange={(id) => setSort(id as SortMode)}/>
      <Grid columns={2}>{filtered.map((article,index) => <ArticleResultCard key={article.slug} article={article} echoed={echoed.has(article.slug)} onEcho={() => toggleEcho(article.slug)} featured={index === 0}/>)}</Grid>
      {!filtered.length && <EmptyState title="No articles found" detail="Try a broader topic or another category." action={<Search aria-hidden="true"/>}/>} 
    </Stack>}
  </BrowseTemplate></AppShell>;
}

export function ArticleDetailPage() {
  const { slug } = useParams();
  const result = publicSurfaceProvider.articles();
  const article = result.data?.entries.find((item) => item.slug === slug);
  if (result.state === 'unavailable' || !result.data) return <AppShell title="Article" showBack><BrowseTemplate title="Article" titleOwner="shell"><EmptyState title="Verified editorial content unavailable" detail={result.detail}/></BrowseTemplate></AppShell>;
  if (!article) return <AppShell title="Article" showBack><BrowseTemplate title="Article" titleOwner="shell" status={<SourceDisclosure value={result.data.source} compact/>}><EmptyState title="Article not found" detail="The requested Preview editorial record is unavailable." action={<Link className="s3-secondary-action" to="/readiness/articles">Back to Articles</Link>}/></BrowseTemplate></AppShell>;
  return <AppShell title={article.title} showBack><DetailTemplate eyebrow={article.category} title={article.title} titleOwner="shell" intro={article.excerpt} status={<SourceDisclosure value={result.data.source} compact/>}>
    <Container size="reading"><Stack gap={5} data-special3 data-source="visible-provider-disclosure">
      <Surface><Inline gap={3}><Text variant="label">{article.author}</Text>{article.verified && <ShieldCheck aria-label="Verified author"/>}<Text variant="caption" tone="muted">{new Intl.DateTimeFormat('en',{dateStyle:'long'}).format(new Date(article.publishedAt))}</Text><Text variant="caption" tone="muted">{article.readingMinutes} min read</Text></Inline></Surface>
      <Stack gap={4}>{article.body.map((paragraph) => <Text key={paragraph} className="text-lg leading-8">{paragraph}</Text>)}</Stack>
      <Surface><Inline gap={3}><Text variant="label">Continue the conversation</Text><Link className="s3-secondary-action" to="/qora?prompt=Help me apply what I learned in this article">Discuss with QORA<ArrowRight aria-hidden="true"/></Link></Inline></Surface>
    </Stack></Container>
  </DetailTemplate></AppShell>;
}

export function ArticleEditorPage() {
  const result = publicSurfaceProvider.articles();
  const publishingCapability = result.data?.publishing ?? { canPublish:false as const, reason:'Authoritative publishing capability is unavailable.' };
  return <AppShell title="Publish article" showBack><BrowseTemplate eyebrow="Publishing" title="Publish article" titleOwner="shell" intro="Qualified contributors can prepare reviewed knowledge only when the authoritative publishing capability is available." status={result.data ? <SourceDisclosure value={result.data.source} compact/> : undefined}>
    <Stack gap={5}>
      <SemanticNotice tone="warning" title="Publishing unavailable">{publishingCapability.reason}</SemanticNotice>
      <Surface><Stack gap={4}>
        <FieldCarrier id="article-editor-title" label="Title" required state="disabled"><FieldInput disabled placeholder="A clear, useful title"/></FieldCarrier>
        <FieldCarrier id="article-editor-category" label="Category" required state="disabled"><FieldSelect disabled defaultValue=""><option value="" disabled>Select a category</option><option>Safety</option><option>Identity</option><option>Feature</option><option>Participation</option></FieldSelect></FieldCarrier>
        <FieldCarrier id="article-editor-excerpt" label="Excerpt" required state="disabled"><FieldTextarea disabled rows={3} placeholder="What will the reader learn?"/></FieldCarrier>
        <FieldCarrier id="article-editor-body" label="Article" required state="disabled"><FieldTextarea disabled rows={12} placeholder="Write with clarity and cite sources where needed."/></FieldCarrier>
        <PrimaryAction disabled><PenLine aria-hidden="true"/>Submit for review</PrimaryAction>
      </Stack></Surface>
    </Stack>
  </BrowseTemplate></AppShell>;
}
