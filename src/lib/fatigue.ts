// src/lib/fatigue.ts
import type { MuscleFatigue, MuscleRecoveryState, MuscleGroup } from '../types'

const RECOVERY_HOURS_BY_INTENSITY: Record<string, number> = {
  light: 24,
  moderate: 48,
  heavy: 72,
}

const HEAVY_COMPOUND_MUSCLES: MuscleGroup[] = ['quads', 'hamstrings', 'glutes', 'back']

export function getRecoveryHours(muscle: MuscleGroup, intensity: string): number {
  if (intensity === 'heavy' && HEAVY_COMPOUND_MUSCLES.includes(muscle)) return 72
  return RECOVERY_HOURS_BY_INTENSITY[intensity] ?? 48
}

export function calculateRecoveryPct(fatigueEntry: MuscleFatigue): number {
  const hoursSince =
    (Date.now() - new Date(fatigueEntry.last_trained_at).getTime()) / (1000 * 60 * 60)
  return Math.min(100, (hoursSince / fatigueEntry.recovery_hours) * 100)
}

export function getRecoveryStatus(pct: number): 'recovered' | 'partial' | 'fatigued' {
  if (pct >= 80) return 'recovered'
  if (pct >= 50) return 'partial'
  return 'fatigued'
}

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'core', 'forearms',
]

export function buildRecoveryMap(
  fatigueData: MuscleFatigue[]
): MuscleRecoveryState[] {
  return ALL_MUSCLE_GROUPS.map((muscle) => {
    const entry = fatigueData.find((f) => f.muscle_group === muscle)
    if (!entry) {
      return {
        muscle_group: muscle,
        recovery_pct: 100,
        status: 'recovered' as const,
        hours_since_trained: null,
        last_trained_at: null,
      }
    }
    const pct = calculateRecoveryPct(entry)
    const hoursSince =
      (Date.now() - new Date(entry.last_trained_at).getTime()) / (1000 * 60 * 60)
    return {
      muscle_group: muscle,
      recovery_pct: Math.round(pct),
      status: getRecoveryStatus(pct),
      hours_since_trained: Math.round(hoursSince),
      last_trained_at: entry.last_trained_at,
    }
  })
}

export function getMostRecoveredGroups(recoveryMap: MuscleRecoveryState[]): MuscleGroup[] {
  return recoveryMap
    .filter((m) => m.status === 'recovered')
    .sort((a, b) => b.recovery_pct - a.recovery_pct)
    .map((m) => m.muscle_group)
}
