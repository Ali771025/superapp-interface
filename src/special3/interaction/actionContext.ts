import type { ActionContextInput, ResolvedActionContext } from './types';

function queryRecord(search: string): Readonly<Record<string, string | string[]>> {
  const params = new URLSearchParams(search);
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of params) {
    const existing = result[key];
    result[key] = existing === undefined ? value : Array.isArray(existing) ? [...existing, value] : [existing, value];
  }
  return Object.freeze(result);
}

export function resolveActionContext(input: ActionContextInput): ResolvedActionContext {
  const query = queryRecord(input.search);
  const queryAction = typeof query.action === 'string' ? query.action : undefined;
  const action = input.action ?? queryAction ?? 'overview';
  const stableQuery = [...new URLSearchParams(input.search).entries()]
    .sort(([aKey, aValue], [bKey, bValue]) => aKey.localeCompare(bKey) || aValue.localeCompare(bValue))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return Object.freeze({
    ...input,
    action,
    query,
    contextKey: `${input.pathname}?${stableQuery}::${input.product}::${action}::${input.source}::${input.mode}`,
  });
}

export function createRequestVersionGuard() {
  let currentVersion = 0;
  return {
    begin: () => ++currentVersion,
    isCurrent: (version: number) => version === currentVersion,
    invalidate: () => { currentVersion += 1; },
    current: () => currentVersion,
  };
}
