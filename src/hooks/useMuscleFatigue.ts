import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { buildRecoveryMap } from '../lib/fatigue'
import type { MuscleFatigue, MuscleGroup, MuscleRecoveryState } from '../types'

export function useMuscleFatigue() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: fatigueData = [], isLoading } = useQuery({
    queryKey: ['muscle_fatigue', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscle_fatigue')
        .select('*')
        .eq('user_id', user!.id)
      if (error) throw error
      return data as MuscleFatigue[]
    },
    enabled: !!user,
  })

  const recoveryMap: MuscleRecoveryState[] = buildRecoveryMap(fatigueData)

  const updateFatigue = useMutation({
    mutationFn: async (
      updates: { muscle_group: MuscleGroup; intensity: 'light' | 'moderate' | 'heavy' }[]
    ) => {
      if (!updates.length) return
      const now = new Date().toISOString()
      const upserts = updates.map(({ muscle_group, intensity }) => ({
        user_id: user!.id,
        muscle_group,
        last_trained_at: now,
        intensity,
        recovery_hours: intensity === 'heavy' ? 72 : intensity === 'moderate' ? 48 : 24,
      }))
      const { error } = await supabase
        .from('muscle_fatigue')
        .upsert(upserts, { onConflict: 'user_id,muscle_group' })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['muscle_fatigue', user?.id] }),
  })

  return { fatigueData, recoveryMap, isLoading, updateFatigue }
}
