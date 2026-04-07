// src/lib/calories.ts
import type { Profile } from '../types'

export function calculateBMR(profile: Profile): number {
  if (!profile.weight_kg || !profile.height_cm || !profile.age || !profile.gender) return 0
  const base = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age)
  return profile.gender === 'male' ? base + 5 : base - 161
}

export function calculateTDEE(bmr: number, workoutFrequency: number): number {
  const multipliers: Record<number, number> = {
    0: 1.2, 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.55, 5: 1.725, 6: 1.725, 7: 1.725,
  }
  return bmr * (multipliers[workoutFrequency] ?? 1.55)
}

export function calculateCalorieTarget(tdee: number, primaryGoal: string): number {
  switch (primaryGoal) {
    case 'lose_weight': return tdee - 500
    case 'build_muscle': return tdee + 300
    case 'get_lean': return tdee - 300
    default: return tdee
  }
}

export function calculateMacroTargets(
  calorieTarget: number,
  weightKg: number,
  primaryGoal: string
) {
  const proteinMultiplier =
    primaryGoal === 'lose_weight' || primaryGoal === 'get_lean' ? 2.1 : 1.8
  const proteinG = Math.round(weightKg * proteinMultiplier)
  const fatG = Math.round((calorieTarget * 0.25) / 9)
  const carbsG = Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4)
  return { proteinG, fatG, carbsG }
}

export function calculateCaloriesFromProfile(profile: Profile) {
  const bmr = calculateBMR(profile)
  if (!bmr) return { calorieTarget: 2000, proteinTarget: 150, carbTarget: 250, fatTarget: 56 }
  const tdee = calculateTDEE(bmr, profile.workout_frequency ?? 3)
  const primaryGoal = profile.goals?.primary ?? 'general_fitness'
  const calorieTarget = Math.round(calculateCalorieTarget(tdee, primaryGoal))
  const { proteinG, carbsG, fatG } = calculateMacroTargets(
    calorieTarget, profile.weight_kg ?? 70, primaryGoal
  )
  return { calorieTarget, proteinTarget: proteinG, carbTarget: carbsG, fatTarget: fatG }
}

export function calculateExerciseCalories(
  metValue: number,
  weightKg: number,
  durationMinutes: number
): number {
  return Math.round(metValue * weightKg * (durationMinutes / 60))
}
