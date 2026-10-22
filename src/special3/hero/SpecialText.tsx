import type { CSSProperties } from 'react';

type IndexedStyle = CSSProperties & { '--word-index': number };

export function SpecialText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.trim().split(/\s+/);
  return <p className={`s3-special-text ${className}`.trim()} aria-label={text}>
    {words.map((word,index)=><span key={`${word}-${index}`} aria-hidden="true" style={{'--word-index':index} as IndexedStyle}>{word}{index < words.length - 1 ? '\u00a0' : ''}</span>)}
  </p>;
}
