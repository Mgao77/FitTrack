// src/types/index.ts

export interface Profile {
  id: string
  display_name: string
  age: number | null
  gender: 'male' | 'female' | 'other' | null
  height_cm: number | null
  weight_kg: number | null
  experience_level: 'beginner' | 'intermediate' | 'advanced' | null
  workout_frequency: number | null
  workout_environment: 'home' | 'commercial_gym' | 'outdoor' | 'bodyweight' | null
  equipment: string[]
  goals: { primary: string; secondary: string[] } | null
  workout_preferences: string[]
  sports: string[]
  injuries: string[]
  dietary_restrictions: string[]
  foods_to_avoid: string[]
  unit_preference: 'kg' | 'lbs'
  created_at: string
  updated_at: string
}

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core' | 'forearms'

export interface MuscleFatigue {
  id: string
  user_id: string
  muscle_group: MuscleGroup
  last_trained_at: string
  intensity: 'light' | 'moderate' | 'heavy'
  recovery_hours: number
}

export interface MuscleRecoveryState {
  muscle_group: MuscleGroup
  recovery_pct: number
  status: 'recovered' | 'partial' | 'fatigued'
  hours_since_trained: number | null
  last_trained_at: string | null
}

export interface ExerciseAlternative {
  name: string
  reason: string
}

export interface Exercise {
  name: string
  primaryMuscle: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  sets: number
  reps: number
  suggestedWeight: number
  weightUnit: 'kg' | 'lbs'
  restSeconds: number
  youtubeSearchQuery: string
  alternatives: ExerciseAlternative[]
  metValue: number
}

export interface GeneratedWorkout {
  name: string
  targetMuscleGroups: MuscleGroup[]
  estimatedDuration: number
  estimatedCaloriesBurned: number
  exercises: Exercise[]
}

export interface Workout {
  id: string
  user_id: string
  workout_name: string
  target_muscle_groups: MuscleGroup[]
  started_at: string
  completed_at: string | null
  total_duration_minutes: number | null
  estimated_calories_burned: number | null
  total_volume: number | null
  notes: string | null
  created_at: string
}

export interface ExerciseLog {
  id: string
  workout_id: string
  user_id: string
  exercise_name: string
  primary_muscle: MuscleGroup
  secondary_muscles: MuscleGroup[]
  set_number: number
  prescribed_reps: number | null
  prescribed_weight: number | null
  actual_reps: number
  actual_weight: number
  weight_unit: 'kg' | 'lbs'
  rest_seconds: number | null
  notes: string | null
  met_value: number | null
  created_at: string
}

export interface ProgressiveOverload {
  id: string
  user_id: string
  exercise_name: string
  current_weight: number
  current_reps: number
  consecutive_successes: number
  last_updated: string
}

export interface Meal {
  id: string
  user_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  logged_at: string
  photo_url: string | null
  total_calories: number | null
  total_protein: number | null
  total_carbs: number | null
  total_fat: number | null
  total_sugar: number | null
  created_at: string
}

export interface MealItem {
  id: string
  meal_id: string
  food_name: string
  serving_grams: number | null
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  sugar: number | null
  source: 'manual' | 'open_food_facts' | 'claude_vision'
  open_food_facts_id: string | null
  created_at: string
}

export interface FrequentMeal {
  id: string
  user_id: string
  meal_name: string | null
  items: Omit<MealItem, 'id' | 'meal_id' | 'created_at'>[]
  times_logged: number
  last_logged_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  weight: number
  unit: 'kg' | 'lbs'
  logged_at: string
}

export interface DailyTargets {
  id: string
  user_id: string
  calorie_target: number
  protein_target: number
  carb_target: number
  fat_target: number
  calculated_at: string
}

export interface Streak {
  id: string
  user_id: string
  streak_type: 'workout' | 'logging' | 'protein_target' | 'calorie_target'
  current_count: number
  longest_count: number
  last_incremented_at: string | null
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  unlocked_at: string
}

export interface FoodSearchResult {
  id: string
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  sugar_per_100g: number
}

export interface ClaudeVisionFoodItem {
  name: string
  estimatedGrams: number
  confidence: 'high' | 'medium' | 'low'
}

export interface LoggedSetData {
  exerciseName: string
  primaryMuscle: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  setNumber: number
  prescribedReps: number
  prescribedWeight: number
  actualReps: number
  actualWeight: number
  weightUnit: 'kg' | 'lbs'
  restSeconds: number
  metValue: number
  notes?: string
}

export interface OfflineQueueItem {
  id: string
  type: 'workout' | 'exercise_log' | 'meal' | 'meal_item' | 'weight_entry'
  data: Record<string, unknown>
  created_at: number
}
