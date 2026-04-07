import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { updateConsecutiveSuccesses } from '../lib/overload'
import type { ProgressiveOverload } from '../types'

export function useProgressiveOverload() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: overloadData = [] } = useQuery({
    queryKey: ['progressive_overload', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progressive_overload')
        .select('*')
        .eq('user_id', user!.id)
      if (error) throw error
      return data as ProgressiveOverload[]
    },
    enabled: !!user,
  })

  const recordSet = useMutation({
    mutationFn: async ({
      exerciseName, weight, reps, allRepsCompleted,
    }: { exerciseName: string; weight: number; reps: number; allRepsCompleted: boolean }) => {
      const existing = overloadData.find((o) => o.exercise_name === exerciseName)
      const newSuccesses = updateConsecutiveSuccesses(
        existing?.consecutive_successes ?? 0, allRepsCompleted
      )
      const { error } = await supabase.from('progressive_overload').upsert({
        user_id: user!.id,
        exercise_name: exerciseName,
        current_weight: weight,
        current_reps: reps,
        consecutive_successes: newSuccesses,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'user_id,exercise_name' })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progressive_overload', user?.id] }),
  })

  function getOverloadForExercise(exerciseName: string): ProgressiveOverload | undefined {
    return overloadData.find((o) => o.exercise_name === exerciseName)
  }

  return { overloadData, recordSet, getOverloadForExercise }
}
