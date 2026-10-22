export const PATH_PREFERENCE_STORAGE_KEY = 'eternity-special3-path-preference-v1';
export const PATH_PREFERENCE_EVENT = 'eternity:path-preference-change';
export const PATH_PREFERENCE_VERSION = 1;

export const pathIds = ['investment', 'stockholder', 'earn', 'learn', 'development'] as const;
export type PathPreference = typeof pathIds[number];

interface StoredPathPreference {
  version: typeof PATH_PREFERENCE_VERSION;
  path: PathPreference;
}

const isPathPreference = (value: unknown): value is PathPreference => typeof value === 'string' && pathIds.includes(value as PathPreference);

export function readPathPreference(storage?: Pick<Storage, 'getItem'>): PathPreference | null {
  try {
    const target = storage ?? (typeof window === 'undefined' ? null : window.localStorage);
    const stored = JSON.parse(target?.getItem(PATH_PREFERENCE_STORAGE_KEY) ?? 'null') as Partial<StoredPathPreference> | null;
    return stored?.version === PATH_PREFERENCE_VERSION && isPathPreference(stored.path) ? stored.path : null;
  } catch {
    return null;
  }
}

export function writePathPreference(path: PathPreference, storage?: Pick<Storage, 'setItem'>) {
  const value: StoredPathPreference = { version:PATH_PREFERENCE_VERSION, path };
  const target = storage ?? (typeof window === 'undefined' ? null : window.localStorage);
  if (!target) return;
  target.setItem(PATH_PREFERENCE_STORAGE_KEY, JSON.stringify(value));
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<PathPreference>(PATH_PREFERENCE_EVENT, { detail:path }));
}
