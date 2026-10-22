import type { ProductArea } from '../../data/productRegistry';

export type JourneyEventType =
  | 'task_started'
  | 'task_completed'
  | 'mission_completed'
  | 'achievement_unlocked'
  | 'eq_changed'
  | 'level_changed'
  | 'area_progress_changed'
  | 'access_unlocked';

export type JourneyImpactKind =
  | 'eq'
  | 'area'
  | 'task'
  | 'mission'
  | 'achievement'
  | 'requirement'
  | 'access';

export interface JourneyImpact {
  kind: JourneyImpactKind;
  label: string;
  faLabel: string;
  value?: string;
  before?: number;
  after?: number;
}

export interface JourneyEvent {
  id: string;
  userId?: string;
  type: JourneyEventType;
  sourceProduct: string;
  sourceAction: string;
  missionId?: string;
  taskId?: string;
  timestamp: number;
  transactionHash?: string;
  impact: JourneyImpact[];
}

export interface MissionHandoff {
  missionId: string;
  taskId: string;
  source: 'journey' | 'qora' | 'notification';
  destinationProduct: string;
  expectedAction: string;
  returnPath: string;
  createdAt: number;
}

export interface JourneyPlan {
  goalTitle: string;
  activeMissionId?: string;
  generatedBy: 'qora';
  updatedAt: number;
}

export interface Requirement {
  id: string;
  label: string;
  faLabel: string;
  met: boolean;
}

export interface NextBestAction {
  id: string;
  title: string;
  faTitle: string;
  reason: string;
  faReason: string;
  destination: string;
  expectedImpact: JourneyImpact[];
  priority: number;
  requirements: Requirement[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MissionDefinition {
  id: string;
  title: string;
  faTitle: string;
  goal: string;
  faGoal: string;
  productId: string;
  area: ProductArea;
  taskId: string;
  taskTitle: string;
  faTaskTitle: string;
  reason: string;
  faReason: string;
  route: string;
  expectedAction: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  /** Legacy Journey UX projection only. Never interpret as protocol EQ truth. */
  legacyExpectedImpact: JourneyImpact[];
  requirements: Requirement[];
  nextAction: NextBestAction;
}

export type JourneyEntryMode = 'mission' | 'related-mission' | 'direct' | 'not-recommended';

export interface ProductJourneyContext {
  mode: JourneyEntryMode;
  productId: string;
  area: ProductArea;
  eyebrow: string;
  faEyebrow: string;
  purpose: string;
  faPurpose: string;
  status: string;
  faStatus: string;
  reason: string;
  faReason: string;
  currentTask?: string;
  faCurrentTask?: string;
  progressLabel?: string;
  faProgressLabel?: string;
  progress?: number;
  impact: JourneyImpact[];
  nextAction: NextBestAction;
  mission?: MissionDefinition;
}

export interface JourneyAnalyticsEvent {
  name:
    | 'journey_viewed'
    | 'mission_started'
    | 'product_opened_from_mission'
    | 'journey_context_expanded'
    | 'action_prepared'
    | 'wallet_signature_requested'
    | 'transaction_submitted'
    | 'transaction_confirmed'
    | 'task_completed'
    | 'impact_sheet_viewed'
    | 'next_action_clicked'
    | 'mission_completed'
    | 'achievement_unlocked'
    | 'journey_abandoned'
    | 'qora_help_requested';
  timestamp: number;
  productId?: string;
  missionId?: string;
  taskId?: string;
  route?: string;
  metadata?: Record<string, string | number | boolean>;
}
