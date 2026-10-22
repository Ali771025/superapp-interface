import type { PaymentToken } from '../../lib/types';
import { cn } from '../../lib/utils';

export function TokenMark({ token, size = 32, className }: { token: PaymentToken; size?: number; className?: string }) {
  const sources: Record<PaymentToken, string> = { USDT: '/assets/ui/token-usdt.png', Q: '/assets/ui/token-q.png', ET: '/assets/ui/token-et.png', ETER: '/assets/ui/token-eter.png' };
  return (
    <span className={cn('inline-grid shrink-0 place-items-center overflow-hidden', className)} style={{ width: size, height: size }} aria-label={`${token} token logo`}>
      <img src={sources[token]} alt="" className="h-full w-full object-contain" />
      <span className="sr-only">{token}</span>
    </span>
  );
}
