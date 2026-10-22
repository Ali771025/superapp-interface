import { useState } from 'react';
import { Gift, Send } from '@icons';
import { CenteredModal } from './CenteredModal';
import { TransactionReviewModal } from './TransactionReviewModal';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';

const TOKENS = ['ETER', 'ET', 'Q', 'USDT'];

interface GiftModalProps {
  open: boolean;
  onClose: () => void;
  defaultToken?: string;
  defaultAmount?: string;
  tokenId?: string;
}

export function GiftModal({ open, onClose, defaultToken = 'ETER', defaultAmount = '', tokenId }: GiftModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [recipient, setRecipient] = useState('');
  const [token, setToken] = useState(defaultToken);
  const [amount, setAmount] = useState(defaultAmount);
  const [note, setNote] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  const isNFT = !!tokenId;
  const fee = '0.5 USDT';
  const canProceed = recipient.trim().length > 0 && (isNFT || amount.trim().length > 0);

  const handleConfirm = async () => {
    await Promise.resolve();
    setReviewOpen(false);
    onClose();
  };

  return (
    <>
      <CenteredModal open={open && !reviewOpen} onClose={onClose} title="Gift">
        <div className="px-4 pb-5 space-y-4">
          <div className={cn('flex items-center gap-3 p-3 rounded-xl', isDark ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-primary-500/5 border border-primary-500/20')}>
            <Gift size={18} className="text-primary-500 flex-shrink-0" />
            <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
              {isNFT ? `Send NFT ${tokenId} to another EID or wallet.` : 'Send tokens directly to any EID or wallet address.'}
            </p>
          </div>

          {/* Recipient */}
          <div>
            <label className={cn('block text-xs font-semibold mb-1.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
              Recipient EID or Wallet
            </label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="ALEX.ETER or 0x..."
              className={cn(
                'w-full rounded-xl px-3 py-2.5 text-sm font-mono outline-none border',
                isDark ? 'bg-dark-border border-dark-border text-dark-textPrimary placeholder-dark-textSecondary focus:border-primary-500/60' : 'bg-light-bg border-light-border text-light-textPrimary placeholder-light-textSecondary focus:border-primary-500/40'
              )}
            />
          </div>

          {/* Token + Amount (not for NFTs) */}
          {!isNFT && (
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-2">
                <label className={cn('block text-xs font-semibold mb-1.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Token</label>
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className={cn(
                    'w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none border',
                    isDark ? 'bg-dark-border border-dark-border text-dark-textPrimary' : 'bg-light-bg border-light-border text-light-textPrimary'
                  )}
                >
                  {TOKENS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <label className={cn('block text-xs font-semibold mb-1.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={cn(
                    'w-full rounded-xl px-3 py-2.5 text-sm font-semibold outline-none border',
                    isDark ? 'bg-dark-border border-dark-border text-dark-textPrimary placeholder-dark-textSecondary focus:border-primary-500/60' : 'bg-light-bg border-light-border text-light-textPrimary placeholder-light-textSecondary focus:border-primary-500/40'
                  )}
                />
              </div>
            </div>
          )}

          {isNFT && (
            <div className={cn('flex items-center gap-3 p-3 rounded-xl', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                <Gift size={16} className="text-accent-DEFAULT" />
              </div>
              <div>
                <p className={cn('text-xs font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{tokenId}</p>
                <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>NFT transfer</p>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className={cn('block text-xs font-semibold mb-1.5', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
              Gift Note <span className="font-normal opacity-60">(optional)</span>
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A short message..."
              maxLength={80}
              className={cn(
                'w-full rounded-xl px-3 py-2.5 text-sm outline-none border',
                isDark ? 'bg-dark-border border-dark-border text-dark-textPrimary placeholder-dark-textSecondary' : 'bg-light-bg border-light-border text-light-textPrimary placeholder-light-textSecondary'
              )}
            />
          </div>

          {/* Fee */}
          <div className={cn('flex items-center justify-between p-3 rounded-xl text-xs', isDark ? 'bg-dark-surface' : 'bg-light-bg')}>
            <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Estimated fee</span>
            <span className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{fee}</span>
          </div>

          <button
            onClick={() => canProceed && setReviewOpen(true)}
            disabled={!canProceed}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all',
              canProceed ? 'gradient-primary text-white' : 'opacity-40 cursor-not-allowed',
              isDark ? 'text-white' : 'text-white'
            )}
          >
            <Send size={16} />
            Confirm Gift
          </button>
        </div>
      </CenteredModal>

      <TransactionReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={handleConfirm}
        action={isNFT ? `Gift ${tokenId}` : `Gift ${token}`}
        amount={isNFT ? undefined : Number(amount)}
        token={isNFT ? undefined : token}
        to={recipient}
        network="Polygon PoS"
        riskWarning={note ? `Gift note: ${note}` : undefined}
      />
    </>
  );
}
