import type { ReactNode } from 'react';
import type { ModuleNavigationFamily } from '../moduleNavigation';

export type RunBPattern =
  | 'COLLECTION'
  | 'HISTORY'
  | 'DETAIL'
  | 'STATUS_ACCESS'
  | 'PRIZE'
  | 'ACTION'
  | 'SETTINGS_FORM'
  | 'CHAT_COMMUNITY'
  | 'LEARNING';

export type RunBBatch =
  | 'B1_COLLECTION_HISTORY'
  | 'B2_DETAIL_STATUS_PRIZE'
  | 'B3_ACTION_SETTINGS_CHAT_LEARNING';

export type RunBModule = Exclude<ModuleNavigationFamily, 'system'>;

export interface RunBSurfaceContract {
  route: string;
  module: RunBModule;
  pattern: RunBPattern;
  batch: RunBBatch;
}

export interface PatternFrameProps {
  contract: RunBSurfaceContract | null;
  family: ModuleNavigationFamily;
  title: string;
  description: string;
  statePanel?: ReactNode;
  children: ReactNode;
}
