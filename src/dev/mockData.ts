// src/dev/mockData.ts
// Realistic fake data for all hooks — used only in dev mode
import type { User } from '@supabase/supabase-js'
import type {
  Profile,
  GeneratedWorkout,
  Workout,
  MuscleFatigue,
  ProgressiveOverload,
  WeightEntry,
  Streak,
} from '../types'
import type { MealWithItems } from '../hooks/useMeals'

// ── Auth ─────────────────────────────────────────────────────────────────────

export const mockUser: User = {
  id: 'dev-user-0000-0000-0000-000000000001',
  email: 'alex@fittrack.dev',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'Alex Dev' },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  role: 'authenticated',
  updated_at: '2024-01-01T00:00:00.000Z',
  identities: [],
  factors: [],
}

// ── Profile ───────────────────────────────────────────────────────────────────

export const mockProfile: Profile = {
  id: mockUser.id,
  display_name: 'Alex',
  age: 28,
  gender: 'male',
  weight_kg: 80,
  height_cm: 178,
  unit_preference: 'kg',
  experience_level: 'intermediate',
  workout_frequency: 4,
  goals: { primary: 'build_muscle', secondary: ['improve_strength', 'lose_fat'] },
  workout_environment: 'commercial_gym',
  equipment: ['barbell', 'dumbbells', 'bench', 'squat rack'],
  workout_preferences: [],
  sports: [],
  injuries: [],
  dietary_restrictions: [],
  foods_to_avoid: [],
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

// ── Generated Workout ─────────────────────────────────────────────────────────

export const mockGeneratedWorkout: GeneratedWorkout = {
  name: 'Upper Power Session',
  targetMuscleGroups: ['chest', 'back', 'shoulders', 'triceps'],
  estimatedDuration: 55,
  estimatedCaloriesBurned: 380,
  exercises: [
    {
      name: 'Bench Press',
      primaryMuscle: 'chest',
      secondaryMuscles: ['triceps', 'shoulders'],
      sets: 4,
      reps: 8,
      suggestedWeight: 80,
      weightUnit: 'kg',
      restSeconds: 120,
      metValue: 6.0,
      youtubeSearchQuery: 'barbell bench press form tutorial',
      alternatives: [
        { name: 'Dumbbell Bench Press', reason: 'Free weight variation' },
        { name: 'Incline Dumbbell Press', reason: 'Upper chest focus' },
        { name: 'Cable Fly', reason: 'Constant tension throughout' },
        { name: 'Pec Deck Machine', reason: 'Isolation on chest' },
        { name: 'Smith Machine Bench Press', reason: 'Fixed bar path' },
        { name: 'Push-ups', reason: 'Bodyweight alternative' },
        { name: 'Dips', reason: 'Lower chest emphasis' },
        { name: 'Dumbbell Fly', reason: 'Chest stretch and squeeze' },
      ],
    },
    {
      name: 'Pull-ups',
      primaryMuscle: 'back',
      secondaryMuscles: ['biceps', 'forearms'],
      sets: 3,
      reps: 10,
      suggestedWeight: 0,
      weightUnit: 'kg',
      restSeconds: 90,
      metValue: 8.0,
      youtubeSearchQuery: 'pull-ups proper form',
      alternatives: [
        { name: 'Lat Pulldown', reason: 'Assisted machine option' },
        { name: 'Resistance Band Pull-ups', reason: 'Easier regression' },
        { name: 'Cable Pullover', reason: 'Lat isolation' },
        { name: 'Assisted Pull-up Machine', reason: 'Controlled assistance' },
        { name: 'Neutral Grip Pull-ups', reason: 'Easier on wrists' },
        { name: 'Single Arm Lat Pulldown', reason: 'Unilateral focus' },
        { name: 'Straight Arm Pulldown', reason: 'Lat stretch and activation' },
        { name: 'TRX Row', reason: 'Bodyweight horizontal option' },
      ],
    },
    {
      name: 'Squat',
      primaryMuscle: 'quads',
      secondaryMuscles: ['glutes', 'hamstrings', 'core'],
      sets: 4,
      reps: 6,
      suggestedWeight: 100,
      weightUnit: 'kg',
      restSeconds: 150,
      metValue: 7.0,
      youtubeSearchQuery: 'barbell back squat tutorial form',
      alternatives: [
        { name: 'Goblet Squat', reason: 'Lighter load, great form cue' },
        { name: 'Leg Press', reason: 'Machine alternative' },
        { name: 'Bulgarian Split Squat', reason: 'Unilateral strength' },
        { name: 'Hack Squat', reason: 'Machine quad focus' },
        { name: 'Dumbbell Squat', reason: 'Free weight alternative' },
        { name: 'Front Squat', reason: 'Quad dominant variation' },
        { name: 'Box Squat', reason: 'Posterior chain emphasis' },
        { name: 'Wall Sit', reason: 'Isometric bodyweight option' },
      ],
    },
    {
      name: 'Overhead Press',
      primaryMuscle: 'shoulders',
      secondaryMuscles: ['triceps', 'core'],
      sets: 3,
      reps: 8,
      suggestedWeight: 55,
      weightUnit: 'kg',
      restSeconds: 120,
      metValue: 5.5,
      youtubeSearchQuery: 'overhead press barbell form',
      alternatives: [
        { name: 'Dumbbell Shoulder Press', reason: 'Unilateral option' },
        { name: 'Arnold Press', reason: 'Greater range of motion' },
        { name: 'Seated Dumbbell Press', reason: 'Reduces lower back load' },
        { name: 'Machine Shoulder Press', reason: 'Guided path, good for beginners' },
        { name: 'Push Press', reason: 'Power variation with leg drive' },
        { name: 'Landmine Press', reason: 'Shoulder-friendly angle' },
        { name: 'Cable Lateral Raise', reason: 'Side delt isolation' },
        { name: 'Pike Push-up', reason: 'Bodyweight shoulder press' },
      ],
    },
  ],
}

// ── Saved (Completed) Workout ─────────────────────────────────────────────────

const todayIso = new Date().toISOString()

export const mockSavedWorkout: Workout = {
  id: 'dev-workout-0001',
  user_id: mockUser.id,
  workout_name: 'Upper Power Session',
  target_muscle_groups: ['chest', 'back', 'shoulders', 'triceps'],
  started_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  completed_at: todayIso,
  total_duration_minutes: 62,
  estimated_calories_burned: 390,
  total_volume: 12400,
  notes: null,
  created_at: todayIso,
}

// ── Muscle Fatigue ────────────────────────────────────────────────────────────

export const mockFatigueData: MuscleFatigue[] = [
  {
    id: 'fatigue-001',
    user_id: mockUser.id,
    muscle_group: 'chest',
    last_trained_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    intensity: 'moderate',
    recovery_hours: 48,
  },
  {
    id: 'fatigue-002',
    user_id: mockUser.id,
    muscle_group: 'quads',
    last_trained_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    intensity: 'heavy',
    recovery_hours: 72,
  },
  {
    id: 'fatigue-003',
    user_id: mockUser.id,
    muscle_group: 'back',
    last_trained_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    intensity: 'light',
    recovery_hours: 24,
  },
]

// ── Meals ─────────────────────────────────────────────────────────────────────

const todayDate = new Date().toLocaleDateString('sv')

export const mockMeals: MealWithItems[] = [
  {
    id: 'meal-001',
    user_id: mockUser.id,
    meal_type: 'breakfast',
    logged_at: `${todayDate}T08:00:00.000Z`,
    photo_url: null,
    notes: null,
    is_ai_estimate: false,
    total_calories: 520,
    total_protein: 32,
    total_carbs: 62,
    total_fat: 14,
    total_sugar: 8,
    created_at: `${todayDate}T08:00:00.000Z`,
    meal_items: [
      {
        id: 'item-001',
        meal_id: 'meal-001',
        food_name: 'Oats',
        serving_grams: 80,
        calories: 300,
        protein: 10,
        carbs: 54,
        fat: 6,
        sugar: 2,
        source: 'open_food_facts',
        open_food_facts_id: 'oats-001',
        created_at: `${todayDate}T08:00:00.000Z`,
      },
      {
        id: 'item-002',
        meal_id: 'meal-001',
        food_name: 'Scrambled Eggs',
        serving_grams: 150,
        calories: 220,
        protein: 22,
        carbs: 8,
        fat: 8,
        sugar: 6,
        source: 'manual',
        open_food_facts_id: null,
        created_at: `${todayDate}T08:00:00.000Z`,
      },
    ],
  },
  {
    id: 'meal-002',
    user_id: mockUser.id,
    meal_type: 'lunch',
    logged_at: `${todayDate}T13:00:00.000Z`,
    photo_url: null,
    notes: null,
    is_ai_estimate: false,
    total_calories: 680,
    total_protein: 48,
    total_carbs: 72,
    total_fat: 12,
    total_sugar: 4,
    created_at: `${todayDate}T13:00:00.000Z`,
    meal_items: [
      {
        id: 'item-003',
        meal_id: 'meal-002',
        food_name: 'Chicken Breast',
        serving_grams: 200,
        calories: 330,
        protein: 38,
        carbs: 0,
        fat: 7,
        sugar: 0,
        source: 'manual',
        open_food_facts_id: null,
        created_at: `${todayDate}T13:00:00.000Z`,
      },
      {
        id: 'item-004',
        meal_id: 'meal-002',
        food_name: 'White Rice',
        serving_grams: 200,
        calories: 350,
        protein: 10,
        carbs: 72,
        fat: 5,
        sugar: 4,
        source: 'open_food_facts',
        open_food_facts_id: 'rice-001',
        created_at: `${todayDate}T13:00:00.000Z`,
      },
    ],
  },
]

// ── Progressive Overload ──────────────────────────────────────────────────────

export const mockProgressiveOverload: ProgressiveOverload[] = [
  {
    id: 'overload-001',
    user_id: mockUser.id,
    exercise_name: 'Bench Press',
    current_weight: 80,
    current_reps: 8,
    consecutive_successes: 3,
    last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'overload-002',
    user_id: mockUser.id,
    exercise_name: 'Squat',
    current_weight: 100,
    current_reps: 6,
    consecutive_successes: 2,
    last_updated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'overload-003',
    user_id: mockUser.id,
    exercise_name: 'Pull-up',
    current_weight: 0,
    current_reps: 10,
    consecutive_successes: 4,
    last_updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ── Weight Entries (30 days) ──────────────────────────────────────────────────

export const mockWeightEntries: WeightEntry[] = Array.from({ length: 30 }, (_, i) => {
  const daysAgo = 29 - i
  const weight = parseFloat((79 + (i / 29) * 2 + (Math.random() * 0.4 - 0.2)).toFixed(1))
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
  return {
    id: `weight-${String(i).padStart(3, '0')}`,
    user_id: mockUser.id,
    weight,
    unit: 'kg' as const,
    logged_at: date.toISOString(),
  }
})

// ── Streaks ───────────────────────────────────────────────────────────────────

export const mockStreaks: Streak[] = [
  {
    id: 'streak-001',
    user_id: mockUser.id,
    streak_type: 'workout',
    current_count: 5,
    longest_count: 12,
    last_incremented_at: new Date().toLocaleDateString('sv'),
  },
  {
    id: 'streak-002',
    user_id: mockUser.id,
    streak_type: 'logging',
    current_count: 3,
    longest_count: 7,
    last_incremented_at: new Date().toLocaleDateString('sv'),
  },
]
