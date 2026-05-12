import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { invokeFunction } from '../lib/invokeFunction'
import { enqueueItem } from '../stores/offlineQueue'
import { useAuth } from './useAuth'
import type { GeneratedWorkout, Workout, LoggedSetData } from '../types'

export function useWorkout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: todayWorkout } = useQuery({
    queryKey: ['today_workout', user?.id],
    queryFn: async () => {
      // Use local date for day boundary so non-UTC users see their own day's workout
      const localToday = new Date().toLocaleDateString('sv') // 'sv' locale gives YYYY-MM-DD
      const startOfToday = new Date(`${localToday}T00:00:00`).toISOString()
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user!.id)
        .gte('started_at', startOfToday)
        .not('completed_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data as Workout | null
    },
    enabled: !!user,
  })

  // Last 7 days of exercise names — passed to Claude to avoid repetition
  const { data: recentExercises = [] } = useQuery({
    queryKey: ['recent_exercises', user?.id],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('exercise_logs')
        .select('exercise_name, created_at')
        .eq('user_id', user!.id)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
      if (!data) return []
      // Unique exercise names, most recent first
      const seen = new Set<string>()
      return data.reduce<string[]>((acc, row) => {
        if (!seen.has(row.exercise_name)) {
          seen.add(row.exercise_name)
          acc.push(row.exercise_name)
        }
        return acc
      }, [])
    },
    enabled: !!user,
  })

  const generateWorkout = useMutation({
    mutationFn: (payload: {
      profile: unknown
      muscleRecovery: unknown
      progressiveOverload: unknown
      recentExercises?: string[]
      excludeExercises?: string[]
      selectedTargets?: string[]
      dailyNotes?: string
      sessionLabel?: string
    }) => invokeFunction<GeneratedWorkout>('generate-workout', payload),
  })

  const saveWorkout = useMutation({
    mutationFn: async ({
      workout,
      sets,
      startedAt,
      completedAt,
    }: {
      workout: GeneratedWorkout
      sets: LoggedSetData[]
      startedAt: Date
      completedAt: Date
    }) => {
      const durationMinutes = Math.round(
        (completedAt.getTime() - startedAt.getTime()) / 60000
      )
      const totalVolume = sets.reduce(
        (sum, s) => sum + s.actualReps * s.actualWeight, 0
      )

      // Pre-generate workout ID so exercise_logs have a stable FK if we need to queue
      const workoutId = crypto.randomUUID()
      const workoutRow = {
        id: workoutId,
        user_id: user!.id,
        workout_name: workout.name,
        target_muscle_groups: workout.targetMuscleGroups,
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        total_duration_minutes: durationMinutes,
        estimated_calories_burned: workout.estimatedCaloriesBurned,
        total_volume: Math.round(totalVolume),
      }

      const { data: workoutRecord, error: workoutError } = await supabase
        .from('workouts')
        .insert(workoutRow)
        .select()
        .single()

      const logs = sets.map((s) => ({
        workout_id: workoutId,
        user_id: user!.id,
        exercise_name: s.exerciseName,
        primary_muscle: s.primaryMuscle,
        secondary_muscles: s.secondaryMuscles,
        set_number: s.setNumber,
        prescribed_reps: s.prescribedReps,
        prescribed_weight: s.prescribedWeight,
        actual_reps: s.actualReps,
        actual_weight: s.actualWeight,
        weight_unit: s.weightUnit,
        rest_seconds: s.restSeconds,
        notes: s.notes ?? null,
        met_value: s.metValue,
      }))

      if (workoutError) {
        // Offline fallback — queue workout + all logs for sync when back online
        await enqueueItem({ type: 'workout', data: workoutRow, created_at: Date.now() })
        for (const log of logs) {
          await enqueueItem({ type: 'exercise_log', data: log, created_at: Date.now() })
        }
        return workoutRow as unknown as Workout
      }

      const { error: logsError } = await supabase.from('exercise_logs').insert(logs)
      if (logsError) throw logsError

      return workoutRecord as Workout
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today_workout', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id] })
    },
  })

  return { todayWorkout, generateWorkout, saveWorkout, recentExercises }
}
