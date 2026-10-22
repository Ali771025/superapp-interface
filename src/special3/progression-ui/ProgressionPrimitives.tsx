import { Check, LockKeyhole, Medal, Sparkles, Trophy } from '@icons';
import type { ReactNode } from 'react';
import type { Special3Level } from '../tokens/generated';
import { Badge, Inline, Stack, StatusIndicator, Text } from '../primitives';
import './progression.css';

export function LevelBadge({ level, name, state = 'current', compact = false }: {
  level: Special3Level; name: string; state?: 'locked' | 'unlocked' | 'current'; compact?: boolean;
}) {
  const stateLabel = state === 'current' ? 'Current level' : state === 'locked' ? 'Locked level' : 'Unlocked level';
  return <span className={`s3-level-badge s3-level-${level} s3-level-badge--${state} ${compact ? 's3-level-badge--compact' : ''}`} aria-label={`Level ${level}, ${name}, ${stateLabel}`}>
    <span className="s3-level-badge__mark" aria-hidden="true">{state === 'locked' ? <LockKeyhole /> : <Medal />}</span>
    <span><strong>Level {level}</strong>{!compact && <small>{name} · {stateLabel}</small>}</span>
  </span>;
}

export function LevelProgress({ level, levelName, value, currentLabel, nextLabel, locked = false }: {
  level: Special3Level; levelName: string; value: number; currentLabel: string; nextLabel: string; locked?: boolean;
}) {
  return <Stack gap={3} className={`s3-level-progress s3-level-${level}`}>
    <Inline gap={3} align="center" className="s3-level-progress__header">
      <LevelBadge level={level} name={levelName} state={locked ? 'locked' : 'current'} compact />
      <Stack gap={0}><Text variant="label">{currentLabel}</Text><Text variant="caption" tone="muted">Next: {nextLabel}</Text></Stack>
    </Inline>
    <progress value={value} max={100} aria-label={`Level ${level} progress: ${value}%`}>{value}%</progress>
    <Text variant="caption" tone="secondary">{value}% complete</Text>
  </Stack>;
}

export function AchievementBadge({ achievementId, label, product, state = 'locked' }: {
  achievementId: string; label: string; product: string; state?: 'locked' | 'in-progress' | 'earned';
}) {
  return <span className={`s3-achievement-badge s3-achievement-badge--${state}`} data-achievement-id={achievementId}>
    <span className="s3-achievement-badge__icon" aria-hidden="true">{state === 'earned' ? <Trophy /> : state === 'locked' ? <LockKeyhole /> : <Sparkles />}</span>
    <span><strong>{label}</strong><small>{product} · {state === 'in-progress' ? 'In progress' : state}</small></span>
  </span>;
}

export function AchievementProgress({ achievementId, label, value, max, unit, state = 'in-progress' }: {
  achievementId: string; label: string; value: number; max: number; unit: string; state?: 'locked' | 'in-progress' | 'earned';
}) {
  return <Stack gap={2} className="s3-achievement-progress" data-achievement-id={achievementId}>
    <Inline gap={2} className="s3-achievement-progress__header"><Text variant="label">{label}</Text><Badge tone={state === 'earned' ? 'success' : 'neutral'}>{state}</Badge></Inline>
    <progress value={value} max={max} aria-label={`${label}: ${value} of ${max} ${unit}`}>{value} / {max}</progress>
    <Text variant="caption" tone="muted">{value.toLocaleString()} / {max.toLocaleString()} {unit}</Text>
  </Stack>;
}

export function EQDelta({ value, kind = value > 0 ? 'positive' : 'neutral', sourceLabel }: {
  value: number; kind?: 'positive' | 'neutral'; sourceLabel?: string;
}) {
  const formatted = value > 0 ? `+${value.toLocaleString()} EQ` : `${value.toLocaleString()} EQ`;
  return <span className={`s3-eq-delta s3-eq-delta--${kind}`} aria-label={`${formatted}${sourceLabel ? ` from ${sourceLabel}` : ''}`}>
    <Sparkles aria-hidden="true" /><strong>{formatted}</strong>{sourceLabel && <small>{sourceLabel}</small>}
  </span>;
}

export function RewardChip({ children, status = 'available' }: { children: ReactNode; status?: 'locked' | 'available' | 'earned' | 'unresolved' }) {
  return <span className={`s3-reward-chip s3-reward-chip--${status}`}><Trophy aria-hidden="true"/><span>{children}</span><small>{status === 'unresolved' ? 'Source required' : status}</small></span>;
}

export function ProgressIndicator({ label, steps, currentStep }: { label: string; steps: string[]; currentStep: number }) {
  return <div className="s3-progress-indicator" aria-label={label}>
    <ol>
      {steps.map((step, index) => {
        const state = index < currentStep ? 'success' : index === currentStep ? 'info' : 'neutral';
        return <li key={step} aria-current={index === currentStep ? 'step' : undefined}>
          {index < currentStep ? <span className="s3-progress-indicator__check" aria-hidden="true"><Check /></span> : <StatusIndicator status={state} label={state === 'info' ? 'Current step' : 'Not started'} compact />}
          <Text variant="label">{step}</Text>
        </li>;
      })}
    </ol>
  </div>;
}
