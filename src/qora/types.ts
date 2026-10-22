export type Persona = 'explorer' | 'learner' | 'investor' | 'community-builder' | 'operator';
export type ActionStatus = 'ready' | 'loading' | 'pending' | 'success' | 'failure';
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'interrupted' | 'denied' | 'offline';
export type QoraCardKind = 'recommendation' | 'mission' | 'learning' | 'transaction' | 'asset' | 'product' | 'risk' | 'progress' | 'achievement' | 'certificate' | 'report' | 'vote' | 'referral' | 'identity' | 'wallet' | 'confirmation' | 'success' | 'recovery';

export interface QoraUserContext {
  userState: 'guest' | 'referred' | 'connected' | 'member' | 'returning';
  persona: Persona;
  currentGoal: string;
  currentMissionId: string;
  level: number;
  eq: number;
  referralCode?: string;
  walletConnected: boolean;
  lastActiveAt?: string;
  currentProductId?: string;
  currentOperation?: string;
  correctNetwork?: boolean;
  formState?: 'idle' | 'editing' | 'ready' | 'pending' | 'error';
  riskLevel?: 'low' | 'medium' | 'high';
  journeyEntrySource?: 'journey' | 'qora' | 'notification' | 'direct';
  recentImpact?: string;
}

export interface QoraActionSchema {
  id: string;
  kind: QoraCardKind;
  moduleId: string;
  title: string;
  reason: string;
  summary: string;
  expectedOutcome: string;
  risk?: string;
  eqReward?: number;
  status: ActionStatus;
  rows?: Array<{ label: string; value: string }>;
  primaryLabel: string;
  advancedRoute?: string;
  requiresWallet?: boolean;
  requiresConfirmation?: boolean;
}

export interface QoraResponse {
  text: string;
  detectedGoal?: string;
  recommendationReason?: string;
  action?: QoraActionSchema;
  suggestedPrompts?: string[];
}

export interface QoraMessage {
  id: string;
  role: 'user' | 'qora';
  content: string;
  createdAt: string;
  action?: QoraActionSchema;
  feedback?: 'up' | 'down';
}

export interface Mission {
  id: string;
  title: string;
  reason: string;
  progress: number;
  eqReward: number;
  status: 'active' | 'recommended' | 'optional' | 'complete';
  route: string;
  moduleId: string;
}
