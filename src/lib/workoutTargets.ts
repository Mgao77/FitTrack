// src/lib/workoutTargets.ts
// Chip → muscle group mapping for the pre-workout target selector.
// Adjust these arrays to change what each chip targets — do not hardcode
// them inside the generator or UI components.

import type { MuscleGroup } from '../types'

export type MovementPattern = 'Push' | 'Pull' | 'Legs' | 'Upper Body' | 'Lower Body' | 'Full Body'
export type BodyPart = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Glutes'

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Full Body',
]

export const BODY_PARTS: BodyPart[] = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes',
]

export const MOVEMENT_PATTERN_MUSCLES: Record<MovementPattern, MuscleGroup[]> = {
  'Push':        ['chest', 'shoulders', 'triceps'],
  'Pull':        ['back', 'biceps'],
  'Legs':        ['quads', 'hamstrings', 'glutes', 'calves'],
  'Upper Body':  ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
  'Lower Body':  ['quads', 'hamstrings', 'glutes', 'calves'],
  'Full Body':   ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core'],
}

export const BODY_PART_MUSCLES: Record<BodyPart, MuscleGroup[]> = {
  'Chest':     ['chest'],
  'Back':      ['back'],
  'Shoulders': ['shoulders'],
  'Arms':      ['biceps', 'triceps'],
  'Legs':      ['quads', 'hamstrings', 'calves'],
  'Core':      ['core'],
  'Glutes':    ['glutes'],
}

// Human-readable session label used as workout name in history
export const MOVEMENT_SESSION_LABEL: Record<MovementPattern, string> = {
  'Push':       'Push Day',
  'Pull':       'Pull Day',
  'Legs':       'Legs Day',
  'Upper Body': 'Upper Body Day',
  'Lower Body': 'Lower Body Day',
  'Full Body':  'Full Body',
}

/** Derive the muscle group array from the user's chip selection. */
export function resolveTargets(
  patternPick: MovementPattern | null,
  bodyPartPicks: BodyPart[]
): MuscleGroup[] {
  if (patternPick) return MOVEMENT_PATTERN_MUSCLES[patternPick]
  if (bodyPartPicks.length > 0) {
    const muscles = new Set<MuscleGroup>()
    for (const part of bodyPartPicks) {
      for (const m of BODY_PART_MUSCLES[part]) muscles.add(m)
    }
    return Array.from(muscles)
  }
  return []
}

/** Derive a display label for workout history from the user's chip selection. */
export function resolveSessionLabel(
  patternPick: MovementPattern | null,
  bodyPartPicks: BodyPart[]
): string {
  if (patternPick) return MOVEMENT_SESSION_LABEL[patternPick]
  if (bodyPartPicks.length > 0) return bodyPartPicks.join(' + ')
  return 'Custom'
}
