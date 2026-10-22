import { useId, useRef, useState } from 'react';
import { Send } from '@icons';
import type { AppLanguage } from '../../lib/language';
import { getQoraCopy } from '../../lib/language';

export function TextComposer({ onSend, disabled, language = 'en' }: { onSend: (message: string) => void; disabled?: boolean; language?: AppLanguage }) {
  const [input,setInput]=useState('');
  const id=useId();
  const textareaRef=useRef<HTMLTextAreaElement>(null);
  const copy=getQoraCopy(language);
  const submit=()=>{const value=input.trim();if(!value||disabled)return;onSend(value);setInput('');if(textareaRef.current)textareaRef.current.style.height='auto';};
  return <div className="s3-qora-composer s3-qora-text-only-composer">
    <div className="s3-qora-text-composer">
      <label htmlFor={id} className="sr-only">Message QORA</label>
      <textarea ref={textareaRef} id={id} value={input} rows={1} placeholder={copy.placeholder} onChange={(event)=>{setInput(event.target.value);event.currentTarget.style.height='auto';event.currentTarget.style.height=`${Math.min(event.currentTarget.scrollHeight,120)}px`;}} onKeyDown={(event)=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submit();}}}/>
      <button type="button" onClick={submit} disabled={!input.trim()||disabled} className="s3-qora-send-control" aria-label="Send message"><Send size={19}/></button>
    </div>
  </div>;
}
