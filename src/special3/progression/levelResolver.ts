export interface LevelState {
  level: number;
  currentThreshold: number;
  nextThreshold?: number;
  progressPercent: number;
  eqToNextLevel: number;
}

export function resolveLevel(personalEq: number, thresholds: readonly number[]): LevelState {
  const normalizedEq = Math.max(0, personalEq);
  const reachedIndex = thresholds.reduce((last, threshold, index) => normalizedEq >= threshold ? index : last, -1);
  const level = reachedIndex + 1;
  const currentThreshold = reachedIndex >= 0 ? thresholds[reachedIndex] : 0;
  const nextThreshold = thresholds[reachedIndex + 1];
  if (nextThreshold === undefined) return { level:thresholds.length, currentThreshold, progressPercent:100, eqToNextLevel:0 };
  const range = Math.max(1, nextThreshold - currentThreshold);
  const progressPercent = Math.min(100, Math.max(0, ((normalizedEq - currentThreshold) / range) * 100));
  return { level, currentThreshold, nextThreshold, progressPercent, eqToNextLevel:Math.max(0, nextThreshold - normalizedEq) };
}
