import type { ProductDefinition } from '../../data/productRegistry';
import type { UserProgressSnapshot } from '../../lib/userState';
import type { WalletContextValue } from '../../lib/wallet-context';
import type { JourneyContextValue } from '../../lib/journey/journey-context';
import { IS_PREVIEW_MODE } from '../../lib/contracts/contractConfig';
import { missionAchievementMappingFor, missionProgressionPresentation } from '../progression/missionAchievementMappings';

export type QoraOutputMode = 'explain' | 'recommend' | 'prepare' | 'simulate';
export type ContextValue<T> = { status: 'available'; value: T } | { status: 'unavailable'; reason: string };

export interface QoraContextContract {
  intent: ContextValue<string>;
  system: string;
  domain: ContextValue<string>;
  product: ContextValue<string>;
  feature: ContextValue<string>;
  view: ContextValue<string>;
  pathname: string;
  query: Record<string, string>;
  selectedAction: ContextValue<string>;
  walletStatus: 'guest' | 'connected' | 'wrong-network';
  networkStatus: 'polygon' | 'wrong-network' | 'unavailable';
  formStatus: ContextValue<string>;
  transactionState: ContextValue<string>;
  riskLevel: 'low' | 'medium' | 'high' | 'unavailable';
  eligibility: ContextValue<'eligible' | 'blocked' | 'unknown'>;
  level: ContextValue<number>;
  rank: ContextValue<string>;
  achievementState: ContextValue<string>;
  eqState: ContextValue<number>;
  journeyState: ContextValue<string>;
  dataSource: string;
  freshness: ContextValue<string>;
  lastSuccessfulAction: ContextValue<string>;
  outputMode: QoraOutputMode;
  reversible: ContextValue<boolean>;
  walletConfirmation: ContextValue<boolean>;
  relatedAchievement: ContextValue<string>;
  estimatedEqEffect: ContextValue<number>;
  recommendation: string;
  rationale: string;
}

const unavailable = <T>(reason: string): ContextValue<T> => ({ status:'unavailable', reason });
const available = <T>(value: T): ContextValue<T> => ({ status:'available', value });

const domainByArea: Record<ProductDefinition['area'], string> = {
  identity:'Identity', intelligence:'Intelligence', learning:'Learning', participation:'Community', economy:'Economy', ownership:'Protection', governance:'Governance',
};

const actionSegments = new Set(['generate','sell','burn','donate','transfer','mint','join','upgrade','enter','create','vote','claim','buyback']);

export function resolveQoraContext(input: {
  pathname: string;
  search: string;
  product?: ProductDefinition;
  user: UserProgressSnapshot;
  wallet: WalletContextValue;
  journey: JourneyContextValue;
}): QoraContextContract {
  const { pathname, search, product, user, wallet, journey } = input;
  const params = new URLSearchParams(search);
  const query = Object.fromEntries(params.entries());
  const segments = pathname.split('/').filter(Boolean);
  const action = segments.find((segment) => actionSegments.has(segment));
  const isSimulation = pathname.includes('simulator') || params.get('mode') === 'simulate';
  const outputMode: QoraOutputMode = isSimulation ? 'simulate' : action ? 'prepare' : pathname === '/journey' ? 'recommend' : 'explain';
  const walletStatus = !wallet.isConnected ? 'guest' : wallet.isCorrectNetwork ? 'connected' : 'wrong-network';
  const eligibility: ContextValue<'eligible' | 'blocked' | 'unknown'> = !product?.accessPolicy ? available('unknown')
    : product.accessPolicy.minimumLevel && user.level < product.accessPolicy.minimumLevel ? available('blocked')
      : product.accessPolicy.safetyReady && !user.safetyReady ? available('blocked')
        : product.accessPolicy.membership && !user.isMember ? available('blocked') : available('eligible');
  const writeAction = Boolean(action && ['generate','sell','burn','donate','transfer','mint','join','upgrade','enter','create','vote','claim','buyback'].includes(action));
  const system = pathname.startsWith('/qora') ? 'QORA' : pathname.startsWith('/home') ? 'Home' : pathname.startsWith('/journey') ? 'Journey' : pathname.startsWith('/economy') ? 'Economy' : pathname.startsWith('/profile') || pathname.startsWith('/passport') ? 'Profile' : product ? product.label : pathname.startsWith('/eid') ? 'EID' : pathname.startsWith('/notifications') ? 'Notifications' : pathname.startsWith('/settings') ? 'Settings' : 'Workspace';
  const journeyLabel = journey.handoff ? `Mission handoff available: ${journey.handoff.missionId}` : journey.plan ? 'Journey plan available' : 'Journey state unavailable';
  const activeMissionId = journey.handoff?.missionId ?? journey.plan?.activeMissionId;
  const progressionPresentation = missionProgressionPresentation(activeMissionId);
  const missionMapping = missionAchievementMappingFor(activeMissionId);

  return {
    intent: unavailable('No explicit user intent has been supplied to this workspace.'),
    system,
    domain: product ? available(domainByArea[product.area]) : unavailable('No Product domain is selected.'),
    product: product ? available(product.label) : unavailable('No Product is selected.'),
    feature: action ? available(action) : product ? available(product.id) : unavailable('No Feature is selected.'),
    view: params.get('view') ? available(params.get('view')!) : available(segments[segments.length - 1] ?? 'root'),
    pathname,
    query,
    selectedAction: action ? available(action) : unavailable('No Product action is selected.'),
    walletStatus,
    networkStatus: !wallet.isConnected ? 'unavailable' : wallet.isCorrectNetwork ? 'polygon' : 'wrong-network',
    formStatus: unavailable('The current Product form does not expose a shared status contract.'),
    transactionState: unavailable('No shared transaction state is active in the Shell.'),
    riskLevel: writeAction ? 'high' : product ? 'medium' : 'low',
    eligibility,
    level: user.isGuest ? unavailable('Connect a verified identity to load Level.') : available(user.level),
    rank: user.isGuest ? unavailable('Connect a verified identity to load Rank.') : available(`${user.starLevel} Star`),
    achievementState: unavailable('No evaluated Achievement state was supplied.'),
    eqState: user.isGuest ? unavailable('Connect a verified identity to load EQ.') : available(user.eq),
    journeyState: journey.plan || journey.handoff ? available(journeyLabel) : unavailable(journeyLabel),
    dataSource: IS_PREVIEW_MODE ? 'Preview · fixture adapters' : 'Live · configured adapters',
    freshness: unavailable('No shared freshness timestamp was supplied.'),
    lastSuccessfulAction: journey.recentImpact ? available(journey.recentImpact.sourceAction) : unavailable('No successful action is available in this session.'),
    outputMode,
    reversible: writeAction ? available(false) : unavailable('Reversibility depends on the selected Product action.'),
    walletConfirmation: writeAction ? available(true) : unavailable('No protected action is selected.'),
    relatedAchievement: missionMapping?.status === 'family-known-exact-rule-runtime-dependent'
      ? available(progressionPresentation.achievementLabel)
      : unavailable(progressionPresentation.achievementLabel),
    estimatedEqEffect: unavailable(`No verified EQ estimate is available. ${progressionPresentation.potentialEqLabel}`),
    recommendation: action ? `Review the ${action} requirements before opening the Product confirmation step.` : product ? `Review ${product.label} status and choose one explicit action.` : 'Continue the current workspace or ask QORA for an explanation.',
    rationale: product ? `${product.label} is the active route context. QORA can explain and prepare, but cannot execute its protected actions.` : 'The current route has no Product action context.',
  };
}

export function describeContextValue<T>(field: ContextValue<T>) {
  return field.status === 'available' ? String(field.value) : `Unavailable — ${field.reason}`;
}
