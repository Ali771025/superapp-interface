import type { JourneyAnalyticsEvent } from './types';

const ANALYTICS_KEY = 'eternity-journey-analytics-v1';
const MAX_EVENTS = 200;

export interface JourneyAnalyticsAdapter {
  track(event: JourneyAnalyticsEvent): void;
}

class LocalJourneyAnalyticsAdapter implements JourneyAnalyticsAdapter {
  track(event: JourneyAnalyticsEvent) {
    try {
      const current = JSON.parse(localStorage.getItem(ANALYTICS_KEY) ?? '[]') as JourneyAnalyticsEvent[];
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify([...current, event].slice(-MAX_EVENTS)));
    } catch {
      // Analytics must never block a product action.
    }
  }
}

export const journeyAnalytics: JourneyAnalyticsAdapter = new LocalJourneyAnalyticsAdapter();

export function trackJourneyEvent(
  name: JourneyAnalyticsEvent['name'],
  details: Omit<JourneyAnalyticsEvent, 'name' | 'timestamp'> = {},
) {
  journeyAnalytics.track({ name, timestamp: Date.now(), ...details });
}
