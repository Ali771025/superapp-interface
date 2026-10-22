export type Web3State =
  | 'wallet-disconnected'
  | 'wrong-network'
  | 'connecting'
  | 'awaiting-signature'
  | 'transaction-submitted'
  | 'confirmed'
  | 'failed'
  | 'rejected'
  | 'replaced'
  | 'reorg-detected'
  | 'indexer-delayed'
  | 'stale-data'
  | 'no-data'
  | 'partial-data'
  | 'rpc-unavailable';

type StateMessage = {
  title: string;
  faTitle: string;
  recovery: string;
  faRecovery: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
};

export const WEB3_STATE_REGISTRY: Record<Web3State, StateMessage> = {
  'wallet-disconnected': { title:'Wallet disconnected', faTitle:'کیف پول متصل نیست', recovery:'Explore first or connect when ready.', faRecovery:'ابتدا کاوش کنید یا هر زمان آماده بودید متصل شوید.', tone:'neutral' },
  'wrong-network': { title:'Wrong network', faTitle:'شبکه نادرست', recovery:'Switch to Polygon and retry.', faRecovery:'به Polygon تغییر دهید و دوباره تلاش کنید.', tone:'warning' },
  connecting: { title:'Connecting', faTitle:'در حال اتصال', recovery:'Approve the connection in your wallet.', faRecovery:'اتصال را در کیف پول تأیید کنید.', tone:'info' },
  'awaiting-signature': { title:'Awaiting signature', faTitle:'در انتظار امضا', recovery:'Review every field before signing.', faRecovery:'پیش از امضا همه جزئیات را بررسی کنید.', tone:'info' },
  'transaction-submitted': { title:'Transaction submitted', faTitle:'تراکنش ارسال شد', recovery:'Wait for network confirmation.', faRecovery:'منتظر تأیید شبکه بمانید.', tone:'info' },
  confirmed: { title:'Confirmed', faTitle:'تأیید شد', recovery:'The confirmed result can now be indexed.', faRecovery:'نتیجه تأییدشده اکنون می‌تواند ایندکس شود.', tone:'success' },
  failed: { title:'Transaction failed', faTitle:'تراکنش ناموفق بود', recovery:'Review the reason, correct it and retry.', faRecovery:'علت را بررسی، اصلاح و دوباره تلاش کنید.', tone:'danger' },
  rejected: { title:'Request rejected', faTitle:'درخواست رد شد', recovery:'Nothing was submitted. Retry only when ready.', faRecovery:'چیزی ارسال نشد؛ فقط در صورت آمادگی دوباره تلاش کنید.', tone:'neutral' },
  replaced: { title:'Transaction replaced', faTitle:'تراکنش جایگزین شد', recovery:'Open the replacement transaction in the explorer.', faRecovery:'تراکنش جایگزین را در Explorer بررسی کنید.', tone:'warning' },
  'reorg-detected': { title:'Chain reorganization detected', faTitle:'بازآرایی زنجیره شناسایی شد', recovery:'Wait for additional confirmations before acting again.', faRecovery:'پیش از اقدام دوباره منتظر تأییدهای بیشتر بمانید.', tone:'warning' },
  'indexer-delayed': { title:'Indexer delayed', faTitle:'ایندکسر با تأخیر مواجه است', recovery:'On-chain state may be newer than this view. Refresh later.', faRecovery:'ممکن است وضعیت آنچین جدیدتر باشد؛ بعداً تازه‌سازی کنید.', tone:'warning' },
  'stale-data': { title:'Data may be stale', faTitle:'ممکن است داده قدیمی باشد', recovery:'Verify critical values on-chain before acting.', faRecovery:'پیش از اقدام، مقادیر حساس را آنچین بررسی کنید.', tone:'warning' },
  'no-data': { title:'No data yet', faTitle:'هنوز داده‌ای وجود ندارد', recovery:'Complete the first relevant action or check another account.', faRecovery:'اولین اقدام مرتبط را کامل یا حساب دیگری را بررسی کنید.', tone:'neutral' },
  'partial-data': { title:'Partial data', faTitle:'داده ناقص', recovery:'Some sources are unavailable. Do not infer missing values.', faRecovery:'برخی منابع در دسترس نیستند؛ مقادیر غایب را فرض نکنید.', tone:'warning' },
  'rpc-unavailable': { title:'RPC unavailable', faTitle:'RPC در دسترس نیست', recovery:'No transaction was sent. Retry with a healthy connection.', faRecovery:'تراکنشی ارسال نشد؛ با اتصال سالم دوباره تلاش کنید.', tone:'danger' },
};

export function classifyWeb3Error(reason: unknown): Web3State {
  const message = reason instanceof Error ? reason.message.toLowerCase() : String(reason).toLowerCase();
  if (/reject|denied|cancel/.test(message)) return 'rejected';
  if (/replac/.test(message)) return 'replaced';
  if (/reorg/.test(message)) return 'reorg-detected';
  if (/rpc|network|timeout|fetch/.test(message)) return 'rpc-unavailable';
  return 'failed';
}
