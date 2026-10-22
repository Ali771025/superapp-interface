import { useEffect, useLayoutEffect, useRef, type ComponentType } from 'react';
import { ModuleLocalNav, QoraContextStage } from '../../EternitySharedUI';
import { getModuleNavigation } from '../../moduleNavigation';
import type { PatternFrameProps, RunBPattern } from '../patternTypes';

const activeLabelOverrides: Readonly<Record<string, string>> = {
  '/achievements/:id': 'Achievements',
  '/eid': 'Mint',
  '/eid/:eidName': 'My EIDs',
  '/profile/achievements': 'Activity',
  '/profile/certificates': 'Activity',
  '/profile/badges': 'Activity',
  '/profile/trust-score': 'Identity',
  '/profile/access': 'Identity',
  '/swap': 'Assets',
  '/fan/join': 'Status',
  '/fan/upgrade': 'Status',
  '/fan/renewal': 'Status',
  '/fan/referrals': 'Community',
  '/fan/legion': 'Community',
  '/fan/indie': 'Community',
  '/fan/income': 'Status',
  '/fan/prize-pools': 'Prize',
  '/forecast/current': 'Prediction',
  '/forecast/history': 'My Predictions',
  '/forecast/my-forecasts': 'My Predictions',
  '/forecast/claim': 'Prize',
  '/forecast/savior': 'Prize',
  '/forecast/contributor': 'Prize',
  '/forecast/pools': 'Prize',
  '/shield/distribution': 'My SHIELDs',
  '/shield/:priceGroup/:tokenId': 'My SHIELDs',
  '/shield/:id': 'My SHIELDs',
  '/shield/buyback': 'My SHIELDs',
  '/shield/status': 'Overview',
  '/stock/transfer': 'My Stocks',
  '/stock/history': 'My Stocks',
  '/stock/referrals': 'My Stocks',
  '/stock/activity': 'My Stocks',
  '/stock/metadata': 'My Stocks',
  '/era/proposals/:id': 'Proposals',
  '/trust-score': 'Readiness',
};

type RegionPlan = ReadonlyArray<readonly [name: string, selectors: ReadonlyArray<string>]>;

const regionPlans: Readonly<Record<RunBPattern, RegionPlan>> = {
  COLLECTION: [
    ['summary_or_metrics', [':scope > .cd-metrics', ':scope > .cd-surface > header', ':scope > .eu-state', ':scope > *']],
    ['collection', [':scope > .cd-surface > .cd-grid', ':scope > .cd-surface > .cd-stack', ':scope > .cd-surface > .cd-journey', ':scope > .cd-surface > .cd-records', ':scope > .cd-surface > :not(header)', ':scope > .cd-surface', ':scope > *:nth-child(2)']],
  ],
  HISTORY: [
    ['summary_or_filters', [':scope > .cd-surface > header', ':scope > .cd-metrics', ':scope > .eu-state', ':scope > *']],
    ['records', [':scope > .cd-surface > .cd-records', ':scope > .cd-records', ':scope > .cd-surface > :not(header)', ':scope > .cd-surface', ':scope > *:nth-child(2)']],
  ],
  DETAIL: [
    ['identity_or_object', [':scope > .cd-surface > header', ':scope > .cd-surface .eu-nft-object', ':scope > .cd-surface .eu-asset-object', ':scope > .cd-surface .eu-proposal-object', ':scope > .eu-state', ':scope > *']],
    ['details', [':scope > .cd-surface > :not(header)', ':scope > .cd-surface .cd-records', ':scope > .cd-surface', ':scope > *:nth-child(2)']],
  ],
  STATUS_ACCESS: [
    ['status_summary', [':scope > .cd-metrics', ':scope > .cd-surface > header', ':scope > .eu-state', ':scope > *']],
    ['rules_or_access', [':scope > .cd-surface > .cd-stack', ':scope > .cd-surface > .cd-records', ':scope > .cd-surface > :not(header)', ':scope > .cd-metrics > *', ':scope > .eu-state > *', ':scope > .cd-surface', ':scope > *:nth-child(2)']],
  ],
  PRIZE: [
    ['prize_identity', [':scope > .cd-surface > header', ':scope > .cd-surface .eu-prize-object', ':scope > .eu-state', ':scope > *']],
    ['eligibility_or_rules', [':scope > .cd-surface > .cd-grid', ':scope > .cd-surface > .eu-inline-status', ':scope > .cd-surface > :not(header)', ':scope > .eu-state > p', ':scope > .cd-surface', ':scope > *:nth-child(2)']],
  ],
  ACTION: [
    ['action_identity', [':scope > .cd-surface > header', ':scope > .cd-action-workspace', ':scope > .cd-surface', ':scope > *']],
    ['form', [':scope .cd-action-workspace form', ':scope > .cd-surface form', ':scope form', ':scope .cd-action-workspace']],
    ['primary_action', [':scope .cd-action-workspace form button[type="submit"]', ':scope form button[type="submit"]', ':scope .cd-action-workspace button', ':scope button']],
  ],
  SETTINGS_FORM: [
    ['form_sections', [':scope > .cd-surface form', ':scope > .cd-surface .eu-toggle', ':scope form', ':scope > .cd-surface', ':scope > *']],
    ['actions_or_status', [':scope form button', ':scope > .cd-surface .eu-inline-status', ':scope .eu-inline-status', ':scope > .cd-surface > :not(header)', ':scope > *:nth-child(2)']],
  ],
  CHAT_COMMUNITY: [
    ['conversation_or_network', [':scope .cd-chat', ':scope > .cd-surface > .cd-chat', ':scope > .cd-surface', ':scope > *']],
    ['composer', [':scope .cd-chat-composer', ':scope form', ':scope > .cd-surface > :not(header)', ':scope > *:nth-child(2)']],
  ],
  LEARNING: [
    ['progress_or_readiness', [':scope .eu-progress-track', ':scope > .cd-metrics', ':scope > .cd-surface > header', ':scope > .eu-state', ':scope > *']],
    ['learning_or_assessment', [':scope > .cd-surface > .cd-journey', ':scope > .cd-surface form', ':scope > .cd-surface > :not(header)', ':scope > .cd-surface', ':scope > .eu-state > *', ':scope > *:nth-child(2)']],
  ],
};

function hasProductContent(node: HTMLElement) {
  return (node.textContent ?? '').trim().length > 0 || Boolean(node.querySelector('button,input,select,textarea,a,img,svg'));
}

function bindProductRegions(layout: HTMLElement, plan: RegionPlan) {
  layout.querySelectorAll<HTMLElement>('[data-pattern-region]').forEach((node) => node.removeAttribute('data-pattern-region'));
  const used = new Set<HTMLElement>();
  const fallback = [...layout.querySelectorAll<HTMLElement>('*')].filter(hasProductContent);
  for (const [name, selectors] of plan) {
    let target: HTMLElement | undefined;
    for (const selector of selectors) {
      target = [...layout.querySelectorAll<HTMLElement>(selector)].find((node) => !used.has(node) && hasProductContent(node));
      if (target) break;
    }
    target ??= fallback.find((node) => !used.has(node));
    if (!target) continue;
    target.setAttribute('data-pattern-region', name);
    used.add(target);
  }
}

function Frame({ props, signature, plan }: { props: PatternFrameProps; signature: string; plan: RegionPlan }) {
  const { contract, family, title, description, statePanel, children } = props;
  const pattern = contract?.pattern ?? 'STATUS_ACCESS';
  const navigation = getModuleNavigation(family);
  const exactNavigation = contract && navigation.find((item) => item.to.split(/[?#]/)[0] === contract.route);
  const activeLabel = contract ? activeLabelOverrides[contract.route] ?? exactNavigation?.label : undefined;
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('.cd-page .eu-local-nav .is-active')?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' }));
    return () => cancelAnimationFrame(frame);
  }, [activeLabel, contract?.route]);

  useLayoutEffect(() => {
    if (layoutRef.current) bindProductRegions(layoutRef.current, plan);
  }, [children, contract?.route, plan]);

  return <>
    <QoraContextStage title={title} insight={description}/>
    <ModuleLocalNav items={navigation} family={family} activeLabel={activeLabel}/>
    <section
      className={`ip-workspace ip-workspace--${pattern.toLowerCase().replace(/_/g, '-')}`}
      data-run-b-pattern={contract?.pattern ?? 'UNSCOPED'}
      data-run-b-surface={contract?.route ?? 'UNSCOPED'}
      data-run-b-batch={contract?.batch ?? 'UNSCOPED'}
      data-pattern-signature={signature}
    >
      {statePanel}
      <div ref={layoutRef} className="ip-pattern-layout" data-product-specific-content="true">{children}</div>
    </section>
  </>;
}

function CollectionPattern(props: PatternFrameProps) {
  return <Frame props={props} signature="summary_or_metrics>collection" plan={regionPlans.COLLECTION}/>;
}

function HistoryPattern(props: PatternFrameProps) {
  return <Frame props={props} signature="summary_or_filters>records" plan={regionPlans.HISTORY}/>;
}

function DetailPattern(props: PatternFrameProps) {
  return <Frame props={props} signature="identity_or_object>details" plan={regionPlans.DETAIL}/>;
}

function StatusAccessPattern(props: PatternFrameProps) {
  return <Frame props={props} signature="status_summary>rules_or_access" plan={regionPlans.STATUS_ACCESS}/>;
}

function PrizePattern(props: PatternFrameProps) {
  return <Frame props={props} signature="prize_identity>eligibility_or_rules" plan={regionPlans.PRIZE}/>;
}

function ActionPattern(props: PatternFrameProps) {
  return <Frame props={props} signature="action_identity>form>primary_action" plan={regionPlans.ACTION}/>;
}

function SettingsFormPattern(props: PatternFrameProps) {
  return <Frame props={props} signature="form_sections>actions_or_status" plan={regionPlans.SETTINGS_FORM}/>;
}

function ChatCommunityPattern(props: PatternFrameProps) {
  return <Frame props={props} signature="conversation_or_network>composer" plan={regionPlans.CHAT_COMMUNITY}/>;
}

function LearningPattern(props: PatternFrameProps) {
  return <Frame props={props} signature="progress_or_readiness>learning_or_assessment" plan={regionPlans.LEARNING}/>;
}

const patterns: Record<RunBPattern, ComponentType<PatternFrameProps>> = {
  COLLECTION: CollectionPattern,
  HISTORY: HistoryPattern,
  DETAIL: DetailPattern,
  STATUS_ACCESS: StatusAccessPattern,
  PRIZE: PrizePattern,
  ACTION: ActionPattern,
  SETTINGS_FORM: SettingsFormPattern,
  CHAT_COMMUNITY: ChatCommunityPattern,
  LEARNING: LearningPattern,
};

export function InternalPatternRenderer(props: PatternFrameProps) {
  const Pattern = props.contract ? patterns[props.contract.pattern] : StatusAccessPattern;
  return <Pattern {...props}/>;
}
