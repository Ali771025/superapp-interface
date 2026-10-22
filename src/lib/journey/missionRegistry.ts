import { productById, type ProductDefinition } from '../../data/productRegistry';
import type { MissionDefinition, NextBestAction, ProductJourneyContext, Requirement } from './types';
import type { UserProgressSnapshot } from '../userState';

const readinessRequirements = (user: UserProgressSnapshot): Requirement[] => [
  { id:'wallet', label:'Wallet connected', faLabel:'کیف پول متصل', met:user.walletConnected },
  { id:'polygon', label:'Polygon network', faLabel:'شبکه Polygon', met:user.correctNetwork },
  { id:'eid', label:'EID active', faLabel:'EID فعال', met:user.hasEid },
  { id:'safety', label:'Safety readiness', faLabel:'آمادگی امنیتی', met:user.safetyReady },
];

export function buildMissionRegistry(user: UserProgressSnapshot): MissionDefinition[] {
  const base = readinessRequirements(user);
  return [
    {
      id:'mission-shield-foundation',
      title:'Build your SHIELD Foundation',
      faTitle:'پایه حفاظت خود را بسازید',
      goal:'Start safely',
      faGoal:'شروع امن',
      productId:'shield',
      area:'ownership',
      taskId:'task-create-first-shield',
      taskTitle:'Create your first protection plan',
      faTaskTitle:'اولین برنامه حفاظتی خود را بسازید',
      reason:'Your safety readiness is complete, so SHIELD is the most useful next step before expanding ownership.',
      faReason:'آمادگی امنیتی شما کامل است؛ بنابراین حفاظت، مفیدترین گام پیش از توسعه مالکیت است.',
      route:'/shield/mint',
      expectedAction:'Create SHIELD',
      progress:35,
      completedTasks:2,
      totalTasks:6,
      requirements:base,
      legacyExpectedImpact:[
        { kind:'eq', label:'+40 EQ', faLabel:'۴۰+ EQ', value:'+40' },
        { kind:'area', label:'Ownership progress 35% → 48%', faLabel:'پیشرفت مالکیت ۳۵٪ ← ۴۸٪', before:35, after:48 },
        { kind:'requirement', label:'Safety Foundation completed', faLabel:'پایه امنیت کامل می‌شود' },
      ],
      nextAction:{
        id:'review-shield-coverage',
        title:'Review recovery settings',
        faTitle:'تنظیمات بازیابی را مرور کنید',
        reason:'A SHIELD plan is only complete when its recovery rules match your intent.',
        faReason:'برنامه حفاظت زمانی کامل است که قواعد بازیابی آن با هدف شما هماهنگ باشد.',
        destination:'/shield/inheritance',
        expectedImpact:[{ kind:'task', label:'Recovery task prepared', faLabel:'تسک بازیابی آماده می‌شود' }],
        priority:1,
        requirements:base,
        riskLevel:'low',
      },
    },
    {
      id:'mission-generator-foundation',
      title:'Activate your ETER foundation',
      faTitle:'پایه ETER خود را فعال کنید',
      goal:'Build economic readiness',
      faGoal:'ساخت آمادگی اقتصادی',
      productId:'generator',
      area:'economy',
      taskId:'task-generate-first-eter',
      taskTitle:'Generate ETER with a reviewed amount',
      faTaskTitle:'ETER را با مبلغ بررسی‌شده تولید کنید',
      reason:'A small reviewed Generator action makes the economic model tangible without hiding the transaction details.',
      faReason:'یک اقدام کوچک و بررسی‌شده در Generator مدل اقتصادی را بدون پنهان‌کردن جزئیات تراکنش ملموس می‌کند.',
      route:'/generator/generate',
      expectedAction:'Generate ETER',
      progress:20,
      completedTasks:1,
      totalTasks:5,
      requirements:base.slice(0,2),
      legacyExpectedImpact:[
        { kind:'eq', label:'+25 EQ', faLabel:'۲۵+ EQ', value:'+25' },
        { kind:'area', label:'Economy progress 20% → 32%', faLabel:'پیشرفت اقتصاد ۲۰٪ ← ۳۲٪', before:20, after:32 },
      ],
      nextAction:{
        id:'review-generator-output',
        title:'Review Generator output',
        faTitle:'خروجی Generator را مرور کنید',
        reason:'Reviewing the confirmed allocation helps you understand the result before another action.',
        faReason:'مرور تخصیص تأییدشده کمک می‌کند پیش از اقدام بعدی، نتیجه را درک کنید.',
        destination:'/generator',
        expectedImpact:[{ kind:'task', label:'Allocation reviewed', faLabel:'تخصیص مرور می‌شود' }],
        priority:2,
        requirements:base.slice(0,2),
        riskLevel:'low',
      },
    },
    {
      id:'mission-forecast-participation',
      title:'Make informed participation visible',
      faTitle:'مشارکت آگاهانه خود را ثبت کنید',
      goal:'Participate with context',
      faGoal:'مشارکت همراه با شناخت',
      productId:'forecast',
      area:'participation',
      taskId:'task-enter-forecast',
      taskTitle:'Review the cycle and enter one forecast',
      faTaskTitle:'چرخه را مرور و یک پیش‌بینی ثبت کنید',
      reason:'This cycle is open and gives you a bounded way to learn participation outcomes.',
      faReason:'این چرخه باز است و راهی محدود و روشن برای شناخت نتیجه مشارکت فراهم می‌کند.',
      route:'/forecast/enter',
      expectedAction:'Enter Forecast',
      progress:40,
      completedTasks:2,
      totalTasks:5,
      requirements:base.slice(0,2),
      legacyExpectedImpact:[
        { kind:'eq', label:'+20 EQ', faLabel:'۲۰+ EQ', value:'+20' },
        { kind:'area', label:'Participation progress 40% → 52%', faLabel:'پیشرفت مشارکت ۴۰٪ ← ۵۲٪', before:40, after:52 },
      ],
      nextAction:{
        id:'review-forecast-status',
        title:'Track the active cycle',
        faTitle:'چرخه فعال را دنبال کنید',
        reason:'The next useful action is understanding status, not submitting another entry.',
        faReason:'گام مفید بعدی، درک وضعیت است؛ نه ثبت ورودی دوباره.',
        destination:'/forecast/tickets',
        expectedImpact:[{ kind:'task', label:'Cycle status reviewed', faLabel:'وضعیت چرخه مرور می‌شود' }],
        priority:3,
        requirements:base.slice(0,2),
        riskLevel:'medium',
      },
    },
    {
      id:'mission-ownership-readiness',
      title:'Verify ownership readiness',
      faTitle:'آمادگی مالکیت را بررسی کنید',
      goal:'Prepare for ownership',
      faGoal:'آمادگی برای مالکیت',
      productId:'ees',
      area:'ownership',
      taskId:'task-review-ees-requirements',
      taskTitle:'Complete the EES readiness review',
      faTaskTitle:'مرور آمادگی EES را کامل کنید',
      reason:'Your level supports ownership exploration, but every requirement should remain visible before minting.',
      faReason:'سطح شما امکان بررسی مالکیت را فراهم می‌کند، اما پیش از ساخت باید همه پیش‌نیازها دیده شوند.',
      route:'/stock/buy',
      expectedAction:'Review EES',
      progress:50,
      completedTasks:2,
      totalTasks:4,
      requirements:base,
      legacyExpectedImpact:[
        { kind:'eq', label:'+30 EQ', faLabel:'۳۰+ EQ', value:'+30' },
        { kind:'requirement', label:'Ownership readiness 2 of 4 → 3 of 4', faLabel:'آمادگی مالکیت ۲ از ۴ ← ۳ از ۴' },
      ],
      nextAction:{
        id:'review-voting-power',
        title:'Understand voting power',
        faTitle:'قدرت رأی را درک کنید',
        reason:'Ownership is meaningful only when its governance effect is understood.',
        faReason:'مالکیت زمانی معنادار است که اثر حکمرانی آن درک شود.',
        destination:'/era',
        expectedImpact:[{ kind:'task', label:'Governance impact reviewed', faLabel:'اثر حکمرانی مرور می‌شود' }],
        priority:4,
        requirements:base,
        riskLevel:'medium',
      },
    },
  ];
}

export function missionForProduct(productId: string, user: UserProgressSnapshot) {
  return buildMissionRegistry(user).find((mission) => mission.productId === productId);
}

function genericNextAction(product: ProductDefinition): NextBestAction {
  return {
    id:`explore-${product.id}`,
    title:`Review ${product.label}`,
    faTitle:`مرور ${product.faLabel}`,
    reason:`Understanding ${product.label}'s purpose and requirements is the safest next step before acting.`,
    faReason:`درک هدف و پیش‌نیازهای ${product.faLabel} امن‌ترین گام پیش از اقدام است.`,
    destination:product.route,
    expectedImpact:[{ kind:'task', label:'Feature readiness reviewed', faLabel:'آمادگی قابلیت مرور می‌شود' }],
    priority:10,
    requirements:[],
    riskLevel:'low',
  };
}

export function buildProductJourneyContext(
  product: ProductDefinition,
  user: UserProgressSnapshot,
  activeMissionId?: string,
): ProductJourneyContext {
  const mission = missionForProduct(product.id, user);
  const isMissionEntry = Boolean(mission && activeMissionId === mission.id);
  const unmetPolicy = Boolean(
    (product.requiresWallet && !user.walletConnected)
    || (product.requiresEid && !user.hasEid)
    || (product.accessPolicy?.minimumLevel && user.level < product.accessPolicy.minimumLevel)
    || (product.accessPolicy?.safetyReady && !user.safetyReady),
  );

  if (mission) {
    return {
      mode:isMissionEntry ? 'mission' : (unmetPolicy ? 'not-recommended' : 'related-mission'),
      productId:product.id,
      area:product.area,
      eyebrow:isMissionEntry ? `${mission.goal} · Mission entry` : `Related to your ${product.area} Journey`,
      faEyebrow:isMissionEntry ? `${mission.faGoal} · ورود مأموریت` : `مرتبط با مسیر ${product.faLabel}`,
      purpose:product.shortDescription,
      faPurpose:product.faShortDescription,
      status:unmetPolicy ? 'Requirements need attention' : (isMissionEntry ? 'Active task' : 'Mission available'),
      faStatus:unmetPolicy ? 'پیش‌نیازها نیازمند توجه‌اند' : (isMissionEntry ? 'تسک فعال' : 'مأموریت در دسترس'),
      reason:unmetPolicy ? 'QORA recommends completing the visible requirements before this action.' : mission.reason,
      faReason:unmetPolicy ? 'کورا پیشنهاد می‌کند پیش از این اقدام، پیش‌نیازهای قابل مشاهده را کامل کنید.' : mission.faReason,
      currentTask:mission.taskTitle,
      faCurrentTask:mission.faTaskTitle,
      progressLabel:`Mission progress · ${mission.completedTasks} of ${mission.totalTasks} tasks completed`,
      faProgressLabel:`پیشرفت مأموریت · ${mission.completedTasks} از ${mission.totalTasks} تسک کامل شده`,
      progress:mission.progress,
      impact:mission.legacyExpectedImpact,
      nextAction:mission.nextAction,
      mission,
    };
  }

  return {
    mode:'direct',
    productId:product.id,
    area:product.area,
    eyebrow:`Explore ${product.label}`,
    faEyebrow:`کاوش ${product.faLabel}`,
    purpose:product.shortDescription,
    faPurpose:product.faShortDescription,
    status:user.isGuest ? 'Explore without personal data' : 'No active mission',
    faStatus:user.isGuest ? 'کاوش بدون داده شخصی' : 'مأموریت فعالی وجود ندارد',
    reason:`This product can support your ${product.area} Journey. Review the outcome and requirements before acting.`,
    faReason:`این محصول می‌تواند از مسیر ${product.faLabel} پشتیبانی کند. پیش از اقدام، نتیجه و پیش‌نیازها را مرور کنید.`,
    impact:[],
    nextAction:genericNextAction(product),
  };
}

export function defaultMission(user: UserProgressSnapshot) {
  if (user.isGuest) return undefined;
  if (user.safetyReady) return buildMissionRegistry(user)[0];
  return buildMissionRegistry(user)[1];
}

export function productForMission(mission: MissionDefinition) {
  return productById(mission.productId);
}
