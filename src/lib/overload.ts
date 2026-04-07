// src/lib/overload.ts
import type { MuscleGroup } from '../types'

const UPPER_BODY_MUSCLES: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms']

export function isUpperBody(muscle: MuscleGroup): boolean {
  return UPPER_BODY_MUSCLES.includes(muscle)
}

export function getWeightIncrement(muscle: MuscleGroup, unitPref: 'kg' | 'lbs'): number {
  const isUpper = isUpperBody(muscle)
  if (unitPref === 'lbs') return isUpper ? 5 : 10
  return isUpper ? 2.5 : 5
}

export function calculateNextWeight(
  currentWeight: number,
  consecutiveSuccesses: number,
  primaryMuscle: MuscleGroup,
  unitPref: 'kg' | 'lbs',
  allRepsCompleted: boolean
): number {
  if (allRepsCompleted && consecutiveSuccesses >= 1) {
    return currentWeight + getWeightIncrement(primaryMuscle, unitPref)
  }
  if (!allRepsCompleted && consecutiveSuccesses <= -1) {
    return Math.round(currentWeight * 0.9 * 2) / 2
  }
  return currentWeight
}

export function updateConsecutiveSuccesses(
  current: number,
  allRepsCompleted: boolean
): number {
  if (allRepsCompleted) return current >= 0 ? current + 1 : 1
  return current <= 0 ? current - 1 : -1
}
