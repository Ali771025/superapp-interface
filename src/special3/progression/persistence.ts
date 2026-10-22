import { PROGRESSION_SCHEMA_VERSION, type MigrationOpeningSnapshot, type ProgressionState } from './types.ts';

export interface ProgressionPersistence {
  load(accountKey: string): Promise<ProgressionState | null>;
  save(accountKey: string, state: ProgressionState): Promise<void>;
  remove(accountKey: string): Promise<void>;
}

export function normalizeAccountKey(value: string) {
  return value.trim().toLowerCase();
}

export function createEmptyProgressionState(accountKey: string, now = new Date().toISOString()): ProgressionState {
  return {
    schemaVersion:PROGRESSION_SCHEMA_VERSION,
    accountKey:normalizeAccountKey(accountKey),
    processedEventIds:[],
    achievementAwardCounts:{},
    completedAchievementIds:[],
    eqLedger:[],
    referralEqLedger:[],
    rewardLedger:[],
    appliedJourneyCommitIds:[],
    updatedAt:now,
  };
}

export function createMigrationOpeningSnapshot(accountKey: string, personalEq: number, level: number, activationWatermark: string, rank?: string): MigrationOpeningSnapshot {
  const normalized = normalizeAccountKey(accountKey);
  return {
    snapshotId:`migration:${normalized}:${activationWatermark}`,
    accountKey:normalized,
    personalEq:Math.max(0, personalEq),
    level:Math.max(0, level),
    rank,
    capturedAt:activationWatermark,
    activationWatermark,
    referralEligible:false,
    journeyEligible:false,
  };
}

export function withOpeningSnapshot(state: ProgressionState, snapshot: MigrationOpeningSnapshot): ProgressionState {
  if (state.openingSnapshot) return state;
  if (state.accountKey !== snapshot.accountKey) throw new Error('Migration snapshot account does not match progression state.');
  return { ...state, activationWatermark:snapshot.activationWatermark, openingSnapshot:snapshot, updatedAt:snapshot.capturedAt };
}

export function parseProgressionState(value: unknown, accountKey: string): ProgressionState {
  if (!value || typeof value !== 'object') throw new Error('Progression persistence payload is malformed.');
  const candidate = value as Partial<ProgressionState>;
  if (candidate.schemaVersion !== PROGRESSION_SCHEMA_VERSION) throw new Error(`Unsupported progression schema: ${String(candidate.schemaVersion)}`);
  if (candidate.accountKey !== normalizeAccountKey(accountKey)) throw new Error('Progression persistence account mismatch.');
  if (!Array.isArray(candidate.processedEventIds) || !Array.isArray(candidate.eqLedger) || !Array.isArray(candidate.referralEqLedger)) throw new Error('Progression persistence collections are malformed.');
  return candidate as ProgressionState;
}

export class MemoryProgressionPersistence implements ProgressionPersistence {
  private readonly records = new Map<string, ProgressionState>();

  async load(accountKey: string) {
    const normalized = normalizeAccountKey(accountKey);
    const value = this.records.get(normalized);
    return value ? structuredClone(value) : null;
  }

  async save(accountKey: string, state: ProgressionState) {
    const normalized = normalizeAccountKey(accountKey);
    this.records.set(normalized, structuredClone(parseProgressionState(state, normalized)));
  }

  async remove(accountKey: string) {
    this.records.delete(normalizeAccountKey(accountKey));
  }
}

export class BrowserProgressionPersistence implements ProgressionPersistence {
  private readonly storage: Storage;
  private readonly prefix: string;

  constructor(storage: Storage, prefix = 'eternity-special3-progression') {
    this.storage = storage;
    this.prefix = prefix;
  }

  private key(accountKey: string) {
    return `${this.prefix}:${PROGRESSION_SCHEMA_VERSION}:${normalizeAccountKey(accountKey)}`;
  }

  async load(accountKey: string) {
    const raw = this.storage.getItem(this.key(accountKey));
    return raw ? parseProgressionState(JSON.parse(raw), accountKey) : null;
  }

  async save(accountKey: string, state: ProgressionState) {
    this.storage.setItem(this.key(accountKey), JSON.stringify(parseProgressionState(state, accountKey)));
  }

  async remove(accountKey: string) {
    this.storage.removeItem(this.key(accountKey));
  }
}
