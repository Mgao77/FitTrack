import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { GeneratedWorkout, Workout, LoggedSetData } from '../types'

export function useWorkout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: todayWorkout } = useQuery({
    queryKey: ['today_workout', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user!.id)
        .gte('started_at', `${today}T00:00:00Z`)
        .not('completed_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data as Workout | null
    },
    enabled: !!user,
  })

  const generateWorkout = useMutation({
    mutationFn: async (payload: {
      profile: unknown
      muscleRecovery: unknown
      progressiveOverload: unknown
    }): Promise<GeneratedWorkout> => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-workout`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )
      if (!response.ok) {
        const err = await response.text().catch(() => 'unknown error')
        throw new Error(`Workout generation failed: ${err}`)
      }
      return response.json()
    },
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

      const { data: workoutRecord, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user!.id,
          workout_name: workout.name,
          target_muscle_groups: workout.targetMuscleGroups,
          started_at: startedAt.toISOString(),
          completed_at: completedAt.toISOString(),
          total_duration_minutes: durationMinutes,
          estimated_calories_burned: workout.estimatedCaloriesBurned,
          total_volume: Math.round(totalVolume),
        })
        .select()
        .single()
      if (workoutError) throw workoutError

      const logs = sets.map((s) => ({
        workout_id: workoutRecord.id,
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

      const { error: logsError } = await supabase.from('exercise_logs').insert(logs)
      if (logsError) throw logsError

      return workoutRecord as Workout
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today_workout', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id] })
    },
  })

  return { todayWorkout, generateWorkout, saveWorkout }
}
