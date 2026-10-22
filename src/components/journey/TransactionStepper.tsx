import { Check, CircleDashed, Loader2 } from '@icons';

export type TransactionStage = 'preparing' | 'wallet' | 'submitted' | 'confirming' | 'indexing';

const stages: Array<{ id:TransactionStage; label:string; faLabel:string }> = [
  { id:'preparing', label:'Preparing transaction', faLabel:'آماده‌سازی تراکنش' },
  { id:'wallet', label:'Waiting for wallet', faLabel:'انتظار برای کیف پول' },
  { id:'submitted', label:'Transaction submitted', faLabel:'تراکنش ارسال شد' },
  { id:'confirming', label:'Confirming on-chain', faLabel:'تأیید آنچین' },
  { id:'indexing', label:'Updating ETERNITY data', faLabel:'به‌روزرسانی داده اترنیتی' },
];

export function TransactionStepper({ active, fa = false }: { active:TransactionStage; fa?:boolean }) {
  const activeIndex = stages.findIndex((stage) => stage.id === active);
  return <ol className="transaction-stepper" aria-label={fa ? 'وضعیت تراکنش' : 'Transaction status'} aria-live="polite">
    {stages.map((stage, index) => <li key={stage.id} className={index < activeIndex ? 'is-complete' : index === activeIndex ? 'is-active' : ''}>
      <span>{index < activeIndex ? <Check size={14}/> : index === activeIndex ? <Loader2 size={14}/> : <CircleDashed size={14}/>}</span>
      <strong>{fa ? stage.faLabel : stage.label}</strong>
    </li>)}
  </ol>;
}
