import { normalizeAccountKey } from './persistence.ts';

/** Prototype serialization boundary. Production persistence must enforce the
 * same uniqueness transactionally; this queue only protects this runtime. */
export class ProgressionAccountQueue {
  private readonly tails = new Map<string, Promise<void>>();

  async run<T>(accountKeys: readonly string[], operation: () => Promise<T>): Promise<T> {
    const keys = [...new Set(accountKeys.filter(Boolean).map(normalizeAccountKey))].sort();
    const predecessors = keys.map((key) => this.tails.get(key) ?? Promise.resolve());
    let release!: () => void;
    const current = new Promise<void>((resolve) => { release = resolve; });
    keys.forEach((key) => this.tails.set(key, current));
    await Promise.all(predecessors);
    try {
      return await operation();
    } finally {
      release();
      keys.forEach((key) => { if (this.tails.get(key) === current) this.tails.delete(key); });
    }
  }
}
