// src/lib/exerciseMedia.ts
// Exercise thumbnail URLs using free-exercise-db raw GitHub images.
// Format: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{id}/0.jpg

import type { MuscleGroup } from '../types'

/**
 * Maps a normalised exercise name to a free-exercise-db folder id.
 * IDs correspond to the directory names in:
 *   https://github.com/yuhonas/free-exercise-db/tree/main/exercises/
 */
const EXERCISE_ID_MAP: Record<string, string> = {
  'bench press': 'Barbell_Bench_Press_-_Medium_Grip',
  'barbell bench press': 'Barbell_Bench_Press_-_Medium_Grip',
  'dumbbell bench press': 'Dumbbell_Bench_Press',
  'incline bench press': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'incline dumbbell press': 'Dumbbell_Incline_Bench_Press',
  'push-ups': 'Pushups',
  'push ups': 'Pushups',
  'pull-ups': 'Pullups',
  'pull ups': 'Pullups',
  'lat pulldown': 'Lat_Pulldown',
  'squat': 'Barbell_Full_Squat',
  'barbell squat': 'Barbell_Full_Squat',
  'back squat': 'Barbell_Full_Squat',
  'goblet squat': 'Dumbbell_Goblet_Squat',
  'leg press': 'Leg_Press',
  'overhead press': 'Barbell_Shoulder_Press_-_Medium_Grip',
  'barbell overhead press': 'Barbell_Shoulder_Press_-_Medium_Grip',
  'dumbbell shoulder press': 'Dumbbell_Shoulder_Press',
  'arnold press': 'Arnold_Dumbbell_Press',
  'deadlift': 'Barbell_Deadlift',
  'romanian deadlift': 'Romanian_Deadlift',
  'bent over row': 'Barbell_Bent_Over_Row',
  'dumbbell row': 'Bent_Over_Two-Dumbbell_Row',
  'cable row': 'Seated_Cable_Rows',
  'bicep curl': 'Dumbbell_Bicep_Curl',
  'barbell curl': 'Barbell_Curl',
  'hammer curl': 'Hammer_Curls',
  'tricep pushdown': 'Triceps_Pushdown',
  'tricep dips': 'Tricep_Dips',
  'skull crushers': 'Barbell_Skull_Crusher',
  'lateral raise': 'Side_Lateral_Raise',
  'face pull': 'Face_Pull',
  'plank': 'Plank',
  'cable crunch': 'Cable_Crunch',
  'leg curl': 'Lying_Leg_Curls',
  'leg extension': 'Leg_Extensions',
  'calf raise': 'Standing_Calf_Raises',
  'hip thrust': 'Barbell_Hip_Thrust',
  'glute bridge': 'Glute_Bridge',
  'lunges': 'Barbell_Lunge',
  'dumbbell lunges': 'Dumbbell_Lunges',
  'resistance band pull-ups': 'Pullups',
}

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

/**
 * Returns a thumbnail URL for the given exercise name using free-exercise-db.
 * Returns null if the exercise isn't in the known mapping.
 */
export function getExerciseGifUrl(exerciseName: string): string | null {
  const key = exerciseName.trim().toLowerCase()
  const id = EXERCISE_ID_MAP[key]
  if (!id) return null
  return `${BASE_URL}/${id}/0.jpg`
}

/**
 * Muscle group emoji fallback when no image is found.
 */
const MUSCLE_EMOJI: Record<MuscleGroup, string> = {
  chest: '💪',
  back: '🔙',
  shoulders: '🏋️',
  biceps: '💪',
  triceps: '💪',
  quads: '🦵',
  hamstrings: '🦵',
  glutes: '🍑',
  calves: '🦵',
  core: '⚡',
  forearms: '💪',
}

export function getMuscleEmoji(muscle: MuscleGroup): string {
  return MUSCLE_EMOJI[muscle] ?? '🏋️'
}
