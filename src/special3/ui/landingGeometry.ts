export const LANDING_GEOMETRY = Object.freeze({
  heroHeight:164,
  metricMinHeight:72,
  operationalHeight:82,
} as const);

export const LANDING_HERO_HEIGHT = `${LANDING_GEOMETRY.heroHeight}px`;
export const LANDING_METRIC_MIN_HEIGHT = `${LANDING_GEOMETRY.metricMinHeight}px`;
export const LANDING_OPERATIONAL_HEIGHT = `${LANDING_GEOMETRY.operationalHeight}px`;
