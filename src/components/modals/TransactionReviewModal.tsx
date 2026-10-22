import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Sparkles } from '@icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { CenteredModal } from './CenteredModal';
import { IS_PREVIEW_MODE } from '../../lib/contracts/contractConfig';
import { Button } from '../ui/Button';
import { classifyWeb3Error, WEB3_STATE_REGISTRY, type Web3State } from '../../lib/web3States';
import { useAppLanguage } from '../../lib/useAppLanguage';
import { TransactionStepper, type TransactionStage } from '../journey/TransactionStepper';
import { productByRoute } from '../../data/productRegistry';
import { useEternityUserState } from '../../lib/userState';
import { buildProductJourneyContext } from '../../lib/journey/missionRegistry';
import { useJourney } from '../../lib/journey/journey-context';
import { trackJourneyEvent } from '../../lib/journey/analytics';
import type { JourneyImpact, NextBestAction } from '../../lib/journey/types';
import { useWallet } from '../../lib/wallet-context';
import { observeConfirmedProductAction } from '../../special3/progression/confirmedObservation';
import { getConfiguredProgressionReadiness } from '../../special3/progression/mode';
import { isSpecial3ShellEnabled } from '../../special3/shell/featureFlag';
import {
  specialReviewImpactPresentation,
  type GroundedReviewEqPresentation,
} from '../../special3/progression/eqPresentation';
import {
  resolveActionContext,
  Special3TransactionReview,
  type ProgressionPresentation,
  type ReviewField,
  type SourceFreshness,
} from '../../special3/interaction';
import { CHAIN_CONFIG } from '../../lib/contracts/contractConfig';

interface TransactionReviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void | { hash?: string; txHash?: string; logIndex?: number; blockNumber?: number; requestId?: string }>;
  action: string;
  amount?: number;
  token?: string;
  estimatedReceive?: string;
  to?: string;
  fee?: number;
  gasEstimateUnavailable?: boolean;
  network?: string;
  contract?: string;
  riskWarning?: string;
  approvalRequired?: boolean;
  expectedResult?: string;
  journeyImpact?: JourneyImpact[];
  groundedProgressionImpact?: GroundedReviewEqPresentation;
  nextAction?: NextBestAction;
  actionContextFormState?: Readonly<Record<string, unknown>>;
  additionalReviewFields?: ReviewField[];
  onCompleted?: (value: { transactionHash?: string; requestId?: string; indexerDelayed: boolean }) => void | Promise<void>;
}

export function TransactionReviewModal({
  open,
  onClose,
  onConfirm,
  action,
  amount,
  token,
  estimatedReceive,
  to,
  fee,
  gasEstimateUnavailable = false,
  network = CHAIN_CONFIG.name,
  contract,
  riskWarning,
  approvalRequired,
  expectedResult,
  journeyImpact,
  groundedProgressionImpact,
  nextAction,
  actionContextFormState,
  additionalReviewFields = [],
  onCompleted,
}: TransactionReviewModalProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const product = useMemo(() => productByRoute(location.pathname), [location.pathname]);
  const user = useEternityUserState();
  const wallet = useWallet();
  const journey = useJourney();
  const productContext = useMemo(
    () => product ? buildProductJourneyContext(product, user, journey.handoff?.missionId) : null,
    [journey.handoff?.missionId, product, user],
  );
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<TransactionStage>('preparing');
  const [error, setError] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<Web3State | null>(null);
  const { language } = useAppLanguage();
  const fa = language === 'fa';
  const special3ShellEnabled = isSpecial3ShellEnabled();
  const rawReviewImpact = journeyImpact ?? productContext?.impact ?? [];
  const specialReviewImpact = specialReviewImpactPresentation(rawReviewImpact, groundedProgressionImpact);
  const visibleReviewImpact = special3ShellEnabled ? specialReviewImpact.items : rawReviewImpact;
  const actionContext = useMemo(() => resolveActionContext({
    pathname:location.pathname,
    search:location.search,
    product:product?.id ?? 'unknown-product',
    action,
    formState:actionContextFormState,
    source:IS_PREVIEW_MODE ? 'preview' : 'live',
    mode:getConfiguredProgressionReadiness().effectiveMode,
  }), [action, actionContextFormState, location.pathname, location.search, product?.id]);
  const specialReviewFields = useMemo<ReviewField[]>(() => {
    const fields: ReviewField[] = [];
    if (product) fields.push({ id:'product', label:'Product', value:product.label });
    fields.push({ id:'action', label:fa ? 'اقدام' : 'Action', value:action });
    if (amount !== undefined && token) fields.push({ id:'amount', label:fa ? 'مبلغ' : 'Amount', value:`${amount} ${token}`, tone:'success' });
    fields.push(...additionalReviewFields.map((field) => ({ ...field, detail:true })));
    if (estimatedReceive) fields.push({ id:'receive', label:fa ? 'دریافت تخمینی' : 'Est. receive', value:estimatedReceive, tone:'success' });
    if (to) fields.push({ id:'destination', label:fa ? 'مقصد' : 'Destination', value:to, fullValue:to, copyable:true, mono:true, showFullValue:true });
    fields.push({ id:'expected-result', label:fa ? 'نتیجه مورد انتظار' : 'Expected Product result', value:expectedResult ?? estimatedReceive ?? (fa ? 'منبع محصول لازم است' : 'Product source required') });
    fields.push({ id:'network', label:fa ? 'شبکه' : 'Network', value:network, detail:true });
    fields.push({ id:'gas-token', label:fa ? 'توکن گس' : 'Gas token', value:CHAIN_CONFIG.nativeCurrency.symbol, detail:true });
    fields.push({ id:'fee', label:fa ? 'گس تخمینی' : 'Est. gas', value:gasEstimateUnavailable || fee === undefined ? (fa ? 'در پیش‌نمایش در دسترس نیست' : 'Unavailable from Product source') : `~${fee} ${CHAIN_CONFIG.nativeCurrency.symbol}`, detail:true });
    fields.push({ id:'approval', label:fa ? 'نیاز به تأیید اولیه' : 'Approval required', value:approvalRequired === undefined ? (fa ? 'منبع محصول لازم است' : 'Product source required') : approvalRequired ? (fa ? 'بله' : 'Yes') : (fa ? 'خیر' : 'No'), detail:true });
    if (contract) fields.push({ id:'contract', label:fa ? 'قرارداد' : 'Contract', value:contract, fullValue:contract, copyable:true, mono:true, detail:true });
    return fields;
  }, [action, additionalReviewFields, amount, approvalRequired, contract, estimatedReceive, expectedResult, fa, fee, gasEstimateUnavailable, network, product, to, token]);
  const specialProgressionPresentation = useMemo<ProgressionPresentation>(() => {
    const groundedEq = specialReviewImpact.items.find((impact) => impact.kind === 'eq');
    if (specialReviewImpact.state === 'grounded' && groundedEq) return {
      state:'grounded',
      label:'Conditional grounded Achievement rule',
      achievementId:groundedProgressionImpact?.achievementId,
      personalEq:groundedEq.label,
      evidence:groundedProgressionImpact?.source,
      journeyImpact:'Applied only after verified progression handoff',
    };
    if (specialReviewImpact.state === 'pending-verification') return {
      state:'pending',
      label:'Pending verified Achievement evaluation',
      journeyImpact:'Transaction confirmation alone cannot update Journey',
    };
    return { state:'unavailable', label:'EQ after verified Achievement', journeyImpact:'No grounded progression value is available in Review' };
  }, [groundedProgressionImpact?.achievementId, groundedProgressionImpact?.source, specialReviewImpact.items, specialReviewImpact.state]);
  const reviewSource: SourceFreshness = IS_PREVIEW_MODE
    ? { source:'preview', freshness:'fresh', detail:'No signature or real transaction.' }
    : { source:'live', freshness:'live', detail:'Wallet authorization required.' };

  useEffect(() => {
    if (!open) {
      setError(null);
      setErrorState(null);
      setStage('preparing');
    }
  }, [open]);

  const handleConfirm = async () => {
    setLoading(true);
    setStage('preparing');
    setError(null);
    setErrorState(null);
    trackJourneyEvent('action_prepared', {
      productId:product?.id,
      missionId:productContext?.mission?.id,
      taskId:productContext?.mission?.taskId,
      route:location.pathname,
    });
    try {
      await new Promise((resolve) => window.setTimeout(resolve, IS_PREVIEW_MODE ? 90 : 140));
      setStage('wallet');
      trackJourneyEvent('wallet_signature_requested', {
        productId:product?.id,
        missionId:productContext?.mission?.id,
        taskId:productContext?.mission?.taskId,
      });
      if (IS_PREVIEW_MODE && new URLSearchParams(location.search).get('simulate') === 'reject') {
        throw new Error('The transaction was rejected in your wallet.');
      }
      const result = await onConfirm();
      const transactionHash = result ? (result.hash ?? result.txHash) : undefined;
      setStage('submitted');
      trackJourneyEvent('transaction_submitted', { productId:product?.id, missionId:productContext?.mission?.id, taskId:productContext?.mission?.taskId });
      await new Promise((resolve) => window.setTimeout(resolve, IS_PREVIEW_MODE ? 140 : 220));
      setStage('confirming');
      await new Promise((resolve) => window.setTimeout(resolve, IS_PREVIEW_MODE ? 140 : 220));
      setStage('indexing');
      const indexerDelayed = IS_PREVIEW_MODE && new URLSearchParams(location.search).get('simulate') === 'indexer-delay';
      if (indexerDelayed) await new Promise((resolve) => window.setTimeout(resolve, 420));
      const progressionReadiness = getConfiguredProgressionReadiness();
      observeConfirmedProductAction({
        sourceProductId:product?.id ?? 'unknown-product',
        action,
        accountKey:wallet.address ?? undefined,
        chainId:wallet.chainId ?? undefined,
        txHash:transactionHash,
        logIndex:result?.logIndex,
        blockNumber:result?.blockNumber,
        requestId:result?.requestId,
        preview:IS_PREVIEW_MODE,
        mode:progressionReadiness.effectiveMode,
      });
      if (progressionReadiness.effectiveMode !== 'active') {
        const expectedImpact = journeyImpact ?? productContext?.impact ?? [];
        const shellSafeImpact = isSpecial3ShellEnabled() ? expectedImpact.filter((item) => item.kind !== 'eq') : expectedImpact;
        journey.completeAction({
          sourceProduct:product?.id ?? 'unknown-product',
          sourceAction:action,
          missionId:productContext?.mission?.id,
          taskId:productContext?.mission?.taskId,
          transactionHash,
          impact:indexerDelayed
            ? [...shellSafeImpact, { kind:'task', label:'On-chain confirmed · ETERNITY data is still syncing', faLabel:'آنچین تأیید شد · داده اترنیتی در حال همگام‌سازی است' }]
            : shellSafeImpact,
          nextAction:nextAction ?? productContext?.nextAction,
        });
      }
      trackJourneyEvent('transaction_confirmed', { productId:product?.id, missionId:productContext?.mission?.id, taskId:productContext?.mission?.taskId });
      await onCompleted?.({ transactionHash, requestId:result?.requestId, indexerDelayed });
      onClose();
    } catch (reason) {
      const state = classifyWeb3Error(reason);
      const message = reason instanceof Error ? reason.message : 'The transaction could not be completed.';
      setErrorState(state);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredModal open={open} onClose={!loading ? onClose : () => {}} title={fa ? 'بررسی و تأیید اقدام' : 'Review and confirm action'} maxWidth="max-w-md">
      <div className="flex min-h-0 flex-col overflow-hidden" style={{ maxHeight:'min(calc(88dvh - 64px), 696px)' }} data-transaction-review-layout="persistent-footer">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3 pt-4" data-transaction-review-body>
        <>
            {!special3ShellEnabled && <p className={cn('text-xs mb-4 leading-relaxed', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
              {IS_PREVIEW_MODE
                ? (fa ? 'حالت پیش‌نمایش فعال است. نتیجه مورد انتظار را بررسی کنید؛ هیچ امضا یا تراکنش آنچین ایجاد نمی‌شود.' : 'Preview mode is active. Review the expected outcome; nothing will be signed or submitted.')
                : (fa ? 'این اقدام امضای کیف پول می‌خواهد. اگر جزئیات درست نیست، هرگز امضا نکنید.' : 'This action will request a wallet signature. Never sign if the details look wrong.')}
            </p>}

            {special3ShellEnabled ? <div
              data-special3-review-impact={specialReviewImpact.state}
              data-special3-eq-source={specialReviewImpact.source}
              data-s3-action-context={actionContext.contextKey}
              className="mb-4"
            >
              <Special3TransactionReview
                fields={specialReviewFields}
                source={reviewSource}
                progression={specialProgressionPresentation}
                risk={riskWarning}
                preview={IS_PREVIEW_MODE}
              >
                {visibleReviewImpact.filter((impact) => impact.kind !== 'eq' && impact.label !== 'Pending verified Achievement evaluation').length ? <div className="journey-action-impact">
                  <span><Sparkles size={15}/>{fa ? 'اثر وظیفه و ناحیه' : 'Task and area impact'}</span>
                  <ul>{visibleReviewImpact.filter((impact) => impact.kind !== 'eq' && impact.label !== 'Pending verified Achievement evaluation').map((impact) => <li key={`${impact.kind}-${impact.label}`}>{fa ? impact.faLabel : impact.label}</li>)}</ul>
                </div> : null}
              </Special3TransactionReview>
            </div> : <>
            <div className={cn('data-surface divide-y mb-4', isDark ? 'divide-dark-border' : 'divide-light-border')}>
              <ReviewRow label={fa ? 'اقدام' : 'Action'} value={action} isDark={isDark} />
              {product && <ReviewRow label="Feature" value={product.label} isDark={isDark} />}
              {amount !== undefined && token && (
                <ReviewRow label={fa ? 'مبلغ' : 'Amount'} value={`${amount} ${token}`} isDark={isDark} accent />
              )}
              {estimatedReceive && (
                <ReviewRow label={fa ? 'دریافت تخمینی' : 'Est. receive'} value={estimatedReceive} isDark={isDark} accent />
              )}
              {to && <ReviewRow label={fa ? 'مقصد' : 'Destination'} value={to} isDark={isDark} mono />}
              <ReviewRow label={fa ? 'شبکه' : 'Network'} value={network} isDark={isDark} />
              <ReviewRow label={fa ? 'توکن گس' : 'Gas token'} value={CHAIN_CONFIG.nativeCurrency.symbol} isDark={isDark} />
              <ReviewRow label={fa ? 'گس تخمینی' : 'Est. gas'} value={fee === undefined ? 'Unavailable' : `~${fee} ${CHAIN_CONFIG.nativeCurrency.symbol}`} isDark={isDark} />
              <ReviewRow label={fa ? 'نیاز به تأیید اولیه' : 'Approval required'} value={approvalRequired === undefined ? 'Product source required' : approvalRequired ? (fa ? 'بله' : 'Yes') : (fa ? 'خیر' : 'No')} isDark={isDark} />
              {contract && <ReviewRow label={fa ? 'قرارداد' : 'Contract'} value={contract.slice(0, 14) + '…'} isDark={isDark} mono />}
              <ReviewRow label={fa ? 'نتیجه مورد انتظار' : 'Expected result'} value={expectedResult ?? estimatedReceive ?? (fa ? 'منبع محصول لازم است' : 'Product source required')} isDark={isDark} />
            </div>

            {visibleReviewImpact.length ? <div className="journey-action-impact">
              <span><Sparkles size={15}/>{fa ? 'اثر مورد انتظار روی مسیر' : 'Expected Journey impact'}</span>
              <ul>{visibleReviewImpact.map((impact) => <li key={`${impact.kind}-${impact.label}`}>{fa ? impact.faLabel : impact.label}</li>)}</ul>
            </div> : null}
            </>}

            {!special3ShellEnabled && riskWarning && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-warning-DEFAULT/10 border border-warning-DEFAULT/30 mb-4">
                <AlertTriangle size={15} className="text-warning-DEFAULT mt-0.5 flex-shrink-0" />
                <p className="text-xs text-warning-DEFAULT leading-relaxed">{riskWarning}</p>
              </div>
            )}

            {!special3ShellEnabled && IS_PREVIEW_MODE && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/25 mb-4">
                <AlertTriangle size={15} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-primary-500 leading-relaxed">Feature preview: values are sample data and this confirmation does not call a smart contract.</p>
              </div>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-danger-DEFAULT/10 border border-danger-DEFAULT/30 mb-4">
                <AlertTriangle size={15} className="text-danger-DEFAULT mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-danger-DEFAULT">{errorState ? (language === 'fa' ? WEB3_STATE_REGISTRY[errorState].faTitle : WEB3_STATE_REGISTRY[errorState].title) : 'Transaction not completed'}</p>
                  <p className="text-xs text-danger-DEFAULT mt-1 leading-relaxed">{errorState ? (language === 'fa' ? WEB3_STATE_REGISTRY[errorState].faRecovery : WEB3_STATE_REGISTRY[errorState].recovery) : error}</p>
                  <p className="text-xs text-danger-DEFAULT mt-1 leading-relaxed">{errorState === 'rejected' ? (fa ? 'هیچ تراکنشی ارسال نشد و هیچ دارایی جابه‌جا نشد.' : 'No transaction was submitted and no funds were moved.') : (fa ? 'پیش از تلاش دوباره، وضعیت کیف پول و شبکه را بررسی کنید.' : 'Review wallet and network status before retrying.')}</p>
                  <button type="button" className="min-h-11 mt-2 font-bold underline underline-offset-4" onClick={() => {
                    trackJourneyEvent('qora_help_requested', { productId:product?.id, route:location.pathname });
                    navigate(`/qora?prompt=${encodeURIComponent(`Explain why my ${action} transaction failed and the safest recovery step.`)}`);
                  }}>{fa ? 'برای بازیابی امن از کورا بپرس' : 'Ask QORA for safe recovery'}</button>
                </div>
              </div>
            )}

            {loading && <TransactionStepper active={stage} fa={fa}/>}
          </>
        </div>
            <div className={cn('flex flex-none gap-3 border-t px-5 py-3', isDark ? 'border-dark-border bg-dark-surface' : 'border-light-border bg-light-surface')} data-transaction-review-footer>
              <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">{fa ? 'بازگشت و بررسی' : 'Review action'}</Button>
              <Button variant="primary" onClick={handleConfirm} loading={loading} loadingLabel={fa ? 'در حال پردازش…' : 'Processing…'} className="flex-1">{IS_PREVIEW_MODE ? (fa ? 'اجرای پیش‌نمایش' : 'Run preview') : (fa ? 'تأیید در کیف پول' : 'Confirm in wallet')}</Button>
            </div>
      </div>
    </CenteredModal>
  );
}

function ReviewRow({ label, value, isDark, accent, mono }: {
  label: string; value: string; isDark: boolean; accent?: boolean; mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{label}</span>
      <span className={cn(
        'text-xs font-semibold max-w-[60%] text-right truncate',
        mono && 'font-mono',
        accent ? 'text-success-DEFAULT' : (isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')
      )}>
        {value}
      </span>
    </div>
  );
}
