import { mockCurrentForecast, mockFanProfile, mockPortfolioValue, mockRewards, mockShields, mockUser } from '../data/mockAssets';
import { formatCurrency } from '../lib/utils';
import type { QoraActionSchema, QoraResponse, QoraUserContext } from './types';
import { assetProductRows, eidProductRows, eraProductRows, fanProductRows, forecastProductRows, generatorProductRows, learningProductRows, rewardsProductRows, shieldProductRows, stockProductRows, swapProductRows } from './groundedProductContext';

const promptSet = ['Show my next mission', 'Help me understand ETERNITY', 'Review my assets', 'Find an opportunity for me'];

const action = (value: QoraActionSchema): QoraActionSchema => value;

export async function askMockQora(prompt: string, context: QoraUserContext): Promise<QoraResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  const text = prompt.toLowerCase();
  if (/next verified mission|verified next (mission|step)/.test(text)) return {
    text: `The grounded next mission for “${context.currentGoal}” is wallet-safety readiness. I prepared the review route without executing any Product or wallet action.`,
    detectedGoal: context.currentGoal,
    recommendationReason: 'The readiness provider identifies a reversible safety prerequisite before a feature action.',
    action: action({
      id: crypto.randomUUID(), kind: 'mission', moduleId: 'edge', title: 'Complete wallet safety',
      reason: 'This provider-grounded mission closes the nearest verified readiness gap.',
      summary: 'Review approvals, signatures and transaction requests in one short lesson.',
      expectedOutcome: 'A safer next Product action, with EQ resolved only from a verified Achievement source.',
      status: 'ready', primaryLabel: 'Start mission', advancedRoute: '/readiness', requiresWallet: false,
    }),
    suggestedPrompts: promptSet,
  };
  if (/why is|relevant to my journey|چرا.*مسیر/.test(text) && context.currentProductId) {
    return {
      text:`You are here because ${context.currentProductId} is connected to mission “${context.currentMissionId}”. The current operation is ${context.currentOperation ?? 'reviewing the feature'}. I recommend checking requirements, expected impact and risk before continuing.`,
      recommendationReason:'This explanation uses the active Mission Handoff instead of guessing from the page alone.',
      action:action({
        id:crypto.randomUUID(),
        kind:'progress',
        moduleId:context.currentProductId,
        title:context.currentOperation ?? `Review ${context.currentProductId}`,
        reason:`This action continues ${context.currentMissionId} and keeps the return path visible.`,
        summary:`Network: ${context.correctNetwork ? 'Polygon ready' : 'needs attention'} · Form: ${context.formState ?? 'idle'} · Entry: ${context.journeyEntrySource ?? 'direct'}`,
        expectedOutcome:'A reviewed action with visible Journey impact and a reasoned next step.',
        status:'ready',
        primaryLabel:'Continue mission',
        requiresWallet:true,
        requiresConfirmation:true,
      }),
      suggestedPrompts:['What changes after this?', 'Explain the risk', 'Show my next step'],
    };
  }
  if (/wallet|connect|کیف/.test(text)) return { text: 'I can prepare the wallet connection. You will still approve the connection in your wallet, and no financial transaction is submitted.', action: action({ id: crypto.randomUUID(), kind: 'wallet', moduleId: 'wallet', title: 'Connect your wallet', reason: 'A wallet is required to verify ownership and personalize the next step.', summary: 'Connect to Polygon without signing a financial transaction.', expectedOutcome: 'Your public wallet state becomes available to ETERNITY.', status: 'ready', primaryLabel: 'Connect wallet', requiresWallet: false }), suggestedPrompts: promptSet };
  if (!context.walletConnected || context.userState === 'guest') {
    const asksAboutAccount = /asset|portfolio|balance|reward|claim|earn|shield|insurance|fan|community|invite|referral|identity|eid|profile|stock|ees|vote|proposal|دارایی|پاداش|بیمه|دعوت|هویت|سهام|رای/.test(text);
    if (asksAboutAccount) return {
      text: 'I cannot see a verified account, balance, reward or membership for this session. I can explain the relevant area without assuming that you own anything.',
      action: action({
        id: crypto.randomUUID(),
        kind: 'learning',
        moduleId: 'world',
        title: 'Explore ETERNITY safely',
        reason: 'You are exploring as a guest, so explanation comes before account-specific or financial actions.',
        summary: 'See how identity, participation, economy, ownership and governance connect.',
        expectedOutcome: 'Choose a meaningful first path without connecting a wallet.',
        status: 'ready',
        primaryLabel: 'Explore ETERNITY',
        advancedRoute: '/world',
        requiresWallet: false,
      }),
      suggestedPrompts: ['Explain identity', 'Teach me wallet safety', 'Why would I connect a wallet?'],
    };
    if (!/learn|edge|course|آموزش|یاد/.test(text)) return {
      text: 'Welcome to ETERNITY. You can understand the world, choose a goal and complete a learning step before connecting a wallet.',
      detectedGoal: context.currentGoal,
      recommendationReason: 'Exploration is reversible and does not require identity, funds or a wallet signature.',
      action: action({
        id: crypto.randomUUID(),
        kind: 'mission',
        moduleId: 'world',
        title: 'Choose your first area',
        reason: 'A clear intention is the safest starting point for a new participant.',
        summary: 'Explore the ecosystem areas and decide whether identity, learning, participation or economy matters most to you.',
        expectedOutcome: 'One selected goal and a relevant first mission.',
        status: 'ready',
        primaryLabel: 'Explore ETERNITY',
        advancedRoute: '/world',
        requiresWallet: false,
      }),
      suggestedPrompts: ['Explain ETERNITY', 'Teach me wallet safety', 'Show ecosystem areas'],
    };
  }
  if (/asset|portfolio|balance|دارایی/.test(text)) return { text: `Your latest indexed portfolio is ${formatCurrency(mockPortfolioValue.total)}. I’ve kept the first view intentionally short.`, action: action({ id: crypto.randomUUID(), kind: 'asset', moduleId: 'assets', title: 'Your asset snapshot', reason: 'You asked to understand what you currently own.', summary: 'Balances are indexed for speed and can be verified against your wallet.', expectedOutcome: 'See the value and choose whether to inspect or act.', status: 'ready', rows: assetProductRows(), primaryLabel: 'View asset summary', advancedRoute: '/assets', requiresWallet: true }), suggestedPrompts: ['Which asset changed most?', 'Prepare a swap', 'Show ownership NFTs'] };
  if (/reward|claim|earn|پاداش/.test(text)) { const rewards=mockRewards.filter((item)=>item.status==='claimable'); return { text: `Preview contains ${rewards.length} Product reward fixtures for explanation only. QORA cannot claim, withdraw, sign or fabricate eligibility.`, action: action({ id: crypto.randomUUID(), kind: 'transaction', moduleId: 'rewards', title: 'Review Economy Reward sources', reason: 'Economy separates Prize, Reward, Income and Progression before any Product action.', summary: 'Preview source labels are explanatory. Exact availability and execution remain with the owning Product.', expectedOutcome: 'Open Economy Reward for source-classified review; no protected action is executed by QORA.', risk: 'Product operations may require a separate wallet Review and authorization.', status: 'ready', rows: rewardsProductRows(), primaryLabel: 'Open Economy Reward', advancedRoute: '/earn', requiresWallet: true }), suggestedPrompts: ['Explain Prize versus Reward', 'Show reward sources', 'Why is EQ not claimable?'] }; }
  if (/shield|protect|insurance|بیمه/.test(text)) { const shield=mockShields[0]; const identity=`SHIELD ${shield.tokenId}`; return { text: `${identity} is the most relevant protection position in your account. I can show the essential state before opening advanced controls.`, action: action({ id: crypto.randomUUID(), kind: 'product', moduleId: 'shield', title: identity, reason: 'Your current goal favors long-term protection and this position needs attention.', summary: `${Math.round(shield.paidAmount/shield.totalAmount*100)}% funded · next payment ${shield.nextPayment}`, expectedOutcome: 'Review the position and decide whether to continue.', risk: 'NFT ownership and payment operations are on-chain and irreversible.', eqReward: 10, status: 'ready', rows: shieldProductRows(shield), primaryLabel: 'Open SHIELD mini app', advancedRoute: '/shield/my-shields', requiresWallet: true }), suggestedPrompts: ['Explain SHIELD simply', 'Show inheritance state', 'What is the risk?'] }; }
  if (/forecast|predict|پیش/.test(text)) return { text: `Forecast Week ${mockCurrentForecast.weekNumber} is open. The prediction must remain entirely your decision.`, action: action({ id: crypto.randomUUID(), kind: 'product', moduleId: 'forecast', title: `Forecast · Week ${mockCurrentForecast.weekNumber}`, reason: 'You asked for an active participation opportunity.', summary: mockCurrentForecast.question, expectedOutcome: 'Understand the entry and prepare—but do not submit—a prediction.', risk: 'Prediction outcomes are uncertain and rewards are never guaranteed.', eqReward: 15, status: 'ready', rows: forecastProductRows(mockCurrentForecast), primaryLabel: 'Review forecast', advancedRoute: '/forecast/enter', requiresWallet: true, requiresConfirmation: true }), suggestedPrompts: ['Teach me before I enter', 'Show previous results', 'Why is this risky?'] };
  if (/generate|generator|eter|mint eter|جنریت|اتر/.test(text)) return { text: 'I can explain the ETER Generator and pass the grounded network and payment context to the Product. Generator owns the amount, quote, fee and final wallet review.', action: action({ id: crypto.randomUUID(), kind: 'transaction', moduleId: 'generator', title: 'Generate ETER', reason: 'You asked for a direct asset operation.', summary: 'Open the existing Generator contract flow with grounded preparation context.', expectedOutcome: 'Continue to Generator for its authoritative action form and review.', risk: 'The on-chain transaction is irreversible after confirmation.', eqReward: 10, status: 'ready', rows: generatorProductRows(), primaryLabel: 'Prepare Generator', advancedRoute: '/generator/buy', requiresWallet: true, requiresConfirmation: true }), suggestedPrompts: ['Explain the price model', 'Show fees first', 'Open advanced Generator'] };
  if (/swap|exchange|تبدیل|سواپ/.test(text)) return { text: 'Tell me the token you have and the token you want. I can prepare grounded context, while Swap remains responsible for the current quote, slippage, fees, final amount and authorization.', action: action({ id: crypto.randomUUID(), kind: 'transaction', moduleId: 'swap', title: 'Prepare token swap', reason: 'You requested a direct exchange operation.', summary: 'Continue to Swap to choose assets and obtain its authoritative current quote.', expectedOutcome: 'Open a reviewable Swap request—never execute an automatic trade.', risk: 'Quotes can change before confirmation and swaps cannot be reversed.', status: 'ready', rows: swapProductRows(), primaryLabel: 'Open swap mini app', advancedRoute: '/swap', requiresWallet: true, requiresConfirmation: true }), suggestedPrompts: ['Compare ETER and Q', 'What is slippage?', 'Open advanced swap'] };
  if (/fan|community|invite|referral|دعوت/.test(text)) return { text: 'Your community path is active. I am prioritizing quality and progression over raw referral count.', action: action({ id: crypto.randomUUID(), kind: 'referral', moduleId: 'fan', title: 'Community growth path', reason: 'Your current persona is closest to a community builder.', summary: `${mockFanProfile.directReferrals} direct referrals · quality ${mockFanProfile.referralQualityScore}/100`, expectedOutcome: 'Choose one responsible community action.', eqReward: 25, status: 'ready', rows: fanProductRows(mockFanProfile), primaryLabel: 'View community path', advancedRoute: '/fan' }), suggestedPrompts: ['Show my invite identity', 'What improves quality?', 'Explain the next FAN level'] };
  if (/stock|ees|electoral|استاک|سهام/.test(text)) return { text: 'STOCK combines ownership, dividends and governance rights. I will separate those three ideas before showing any mint action.', action: action({ id: crypto.randomUUID(), kind: 'product', moduleId: 'ees', title: 'STOCK', reason: 'You asked about a long-term ownership and governance feature.', summary: 'Review stock availability, multiplier and voting implications.', expectedOutcome: 'Understand the position before preparing MINT STOCK.', risk: 'STOCK NFTs are on-chain ownership positions with feature-specific conditions.', eqReward: 15, status: 'ready', rows: stockProductRows(), primaryLabel: 'Review STOCK mini app', advancedRoute: '/stock/buy', requiresWallet: true, requiresConfirmation: true }), suggestedPrompts: ['Explain multipliers', 'Show dividend logic', 'Am I eligible to vote?'] };
  if (/vote|govern|proposal|era|dao|رای/.test(text)) return { text: 'I can summarize a proposal and show its on-chain effect, but the vote must remain your informed choice.', action: action({ id: crypto.randomUUID(), kind: 'vote', moduleId: 'era', title: 'Review active ERA proposals', reason: 'You asked to inspect current governance choices; eligibility remains Product-owned.', summary: 'Compare proposal purpose, impact and contract change before voting.', expectedOutcome: 'Choose whether to open a proposal; no vote is cast automatically.', risk: 'Governance decisions may change on-chain ecosystem behavior.', eqReward: 20, status: 'ready', rows: eraProductRows(), primaryLabel: 'Open proposal review', advancedRoute: '/era/proposals', requiresWallet: true, requiresConfirmation: true }), suggestedPrompts: ['Explain the top proposal', 'What changes on-chain?', 'Teach me how voting works'] };
  if (/learn|edge|course|آموزش|یاد/.test(text)) return { text: 'I found a short lesson connected to your current mission. Learning stays optional unless a safety-critical step requires understanding first.', action: action({ id: crypto.randomUUID(), kind: 'learning', moduleId: 'edge', title: 'Wallet approvals in 3 minutes', reason: 'This concept reduces risk in the reward transaction you are about to review.', summary: 'Simple explanation, example and one short check.', expectedOutcome: 'Recognize approvals, signatures and transaction requests. EQ is unavailable unless resolved by a verified Achievement rule.', status: 'ready', rows: learningProductRows(), primaryLabel: 'Start micro lesson', advancedRoute: '/readiness' }), suggestedPrompts: ['Why does approval matter?', 'Start the lesson', 'Show another learning path'] };
  if (/identity|eid|profile|هویت/.test(text)) return { text: `Your primary identity is ${mockUser.primaryEid}. It connects your profile, reputation and invite path.`, action: action({ id: crypto.randomUUID(), kind: 'identity', moduleId: 'eid', title: mockUser.primaryEid, reason: 'A unified identity makes later actions easier to understand and attribute.', summary: `Level ${mockUser.achievementProgress?.level} · Trust ${mockUser.trustScore}/100`, expectedOutcome: 'Review your Profile or manage EID.', eqReward: 30, status: 'ready', rows: eidProductRows(context.persona, mockUser), primaryLabel: 'Open Profile', advancedRoute: '/profile' }), suggestedPrompts: ['Show my profile', 'What does my level unlock?', 'Manage my EID'] };
  return { text: `I understand your current goal as “${context.currentGoal}”. Your best next move is a short wallet-safety lesson before a feature action.`, detectedGoal: context.currentGoal, recommendationReason: 'It is reversible, reduces risk and closes a verified readiness gap.', action: action({ id: crypto.randomUUID(), kind: 'mission', moduleId: 'edge', title: 'Complete wallet safety', reason: 'This is the closest safe prerequisite for the next feature action.', summary: 'Review approvals, signatures and transaction requests in one short lesson.', expectedOutcome: 'A clearer, safer next action. EQ is resolved only from the verified Achievement source.', status: 'ready', primaryLabel: 'Start mission', advancedRoute: '/readiness', requiresWallet: false }), suggestedPrompts: promptSet };
}

export const defaultQoraContext: QoraUserContext = { userState: 'guest', persona: 'explorer', currentGoal: 'Understand ETERNITY and choose a safe first step', currentMissionId:'onboarding', level: 0, eq: 0, walletConnected: false };
