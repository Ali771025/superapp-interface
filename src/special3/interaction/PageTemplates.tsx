import type { ReactNode } from 'react';
import { PageActions, PageHeader, PageIntro, Special3Page } from './SharedComponents';
import type { PageTemplateProps, QoraSurfaceMode } from './types';

function TemplateFrame({ type, title, titleOwner = 'template', eyebrow, intro, actions, status, children, aside, className = '', qoraMode }: PageTemplateProps & { type: 'overview'|'browse'|'detail'|'action'|'review'|'result'; qoraMode?: QoraSurfaceMode }) {
  return <Special3Page className={`s3-template s3-template--${type} ${className}`.trim()} data-s3-template={type} data-s3-qora-mode={qoraMode}>
    <PageHeader eyebrow={eyebrow} title={title} titleOwner={titleOwner} status={status}>{intro && <PageIntro>{intro}</PageIntro>}</PageHeader>
    <div className="s3-template__layout"><div className="s3-template__main">{children}</div>{aside && <aside className="s3-template__aside">{aside}</aside>}</div>
    {actions && <PageActions>{actions}</PageActions>}
  </Special3Page>;
}

export function OverviewTemplate(props: PageTemplateProps) { return <TemplateFrame type="overview" {...props}/>; }
export function BrowseTemplate(props: PageTemplateProps) { return <TemplateFrame type="browse" {...props}/>; }
export function DetailTemplate(props: PageTemplateProps) { return <TemplateFrame type="detail" {...props}/>; }
type TransactionTemplateProps = PageTemplateProps & { qora?: ReactNode; qoraMode?: QoraSurfaceMode };

function resolveQoraAside({ aside, qora, qoraMode = 'shell' }: TransactionTemplateProps): ReactNode {
  if (aside) return aside;
  return qoraMode === 'compact' ? qora : undefined;
}

export function ActionFormTemplate(props: TransactionTemplateProps) {
  const qoraMode = props.qoraMode ?? 'shell';
  return <TemplateFrame type="action" {...props} qoraMode={qoraMode} aside={resolveQoraAside({ ...props, qoraMode })}/>;
}
export function ReviewTemplate(props: TransactionTemplateProps) {
  const qoraMode = props.qoraMode ?? 'shell';
  return <TemplateFrame type="review" {...props} qoraMode={qoraMode} aside={resolveQoraAside({ ...props, qoraMode })}/>;
}
export function ResultTemplate(props: TransactionTemplateProps) {
  const qoraMode = props.qoraMode ?? 'shell';
  return <TemplateFrame type="result" {...props} qoraMode={qoraMode} aside={resolveQoraAside({ ...props, qoraMode })}/>;
}
