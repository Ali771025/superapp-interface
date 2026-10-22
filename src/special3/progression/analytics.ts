import type { ProgressionAnalyticsEvent, ProgressionAnalyticsName, ProductEventEnvelope } from './types.ts';

export type ProgressionAnalyticsSink = (event: ProgressionAnalyticsEvent) => void;

export function progressionAnalyticsEvent(name: ProgressionAnalyticsName, event: ProductEventEnvelope, timestamp: string, achievementId?: string, reason?: string): ProgressionAnalyticsEvent {
  return { name, timestamp, eventId:event.eventId, product:event.product, achievementId, reason };
}

export function emitProgressionAnalytics(events: readonly ProgressionAnalyticsEvent[], sink?: ProgressionAnalyticsSink) {
  if (!sink) return;
  events.forEach((event) => sink(event));
}
