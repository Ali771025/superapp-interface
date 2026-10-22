import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageTopic } from '../../design-system/pageTopics';
import { ContextHelp, ContextHelpTrigger } from './ContextHelp';
import { useAppLanguage } from '../../lib/useAppLanguage';

export function PageTopic({ title }: { title?: string }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const { language } = useAppLanguage();
  const name = title ?? 'ETERNITY';
  const topic = getPageTopic(pathname, title, language);
  return <>
    <header className="vf-page-head ds-page-topic">
      <h1>{name}</h1>
      <ContextHelpTrigger label={name} onClick={(element) => { setAnchor(element); setOpen(true); }}/>
    </header>
    <ContextHelp title={name} description={topic.details} open={open} anchor={anchor} onClose={() => setOpen(false)}/>
  </>;
}
