// src/hooks/useStreaks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type StreakType = 'workout' | 'logging' | 'protein_target' | 'calorie_target'

const ACHIEVEMENT_THRESHOLDS: Record<string, number[]> = {
  workout: [1, 7, 30, 100],
  logging: [7],
  protein_target: [7],
  calorie_target: [7],
}

export function useStreaks() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const incrementStreak = useMutation({
    mutationFn: async (streakType: StreakType): Promise<string | null> => {
      // Use local date so non-UTC users get the correct "today"
      const today = new Date().toLocaleDateString('sv')

      const { data: existing, error: fetchError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('streak_type', streakType)
        .maybeSingle()
      if (fetchError) throw fetchError

      const alreadyIncrementedToday = existing?.last_incremented_at === today
      if (alreadyIncrementedToday) return null

      // Compute yesterday in local time to avoid month-boundary issues
      const nowLocal = new Date()
      const yesterdayLocal = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate() - 1)
      const yesterdayStr = yesterdayLocal.toLocaleDateString('sv')

      const continuedStreak = existing?.last_incremented_at === yesterdayStr
      const newCount = continuedStreak ? (existing.current_count + 1) : 1
      const newLongest = Math.max(existing?.longest_count ?? 0, newCount)

      const { error: upsertError } = await supabase.from('streaks').upsert({
        user_id: user!.id,
        streak_type: streakType,
        current_count: newCount,
        longest_count: newLongest,
        last_incremented_at: today,
      }, { onConflict: 'user_id,streak_type' })
      if (upsertError) throw upsertError

      // Check achievement thresholds
      const thresholds = ACHIEVEMENT_THRESHOLDS[streakType] ?? []
      const crossed = thresholds.find((t) => t === newCount)
      if (crossed) {
        const achievementType = `${streakType}_${crossed}day_streak`
        const { error: achievementError } = await supabase.from('achievements').upsert({
          user_id: user!.id,
          achievement_type: achievementType,
        }, { onConflict: 'user_id,achievement_type' })
        if (achievementError) throw achievementError
        return achievementType
      }

      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streaks', user?.id] })
    },
  })

  const checkAndUnlockAchievement = useMutation({
    mutationFn: async (achievementType: string) => {
      const { error } = await supabase.from('achievements').upsert({
        user_id: user!.id,
        achievement_type: achievementType,
      }, { onConflict: 'user_id,achievement_type' })
      if (error) return null
      return achievementType
    },
  })

  return { incrementStreak, checkAndUnlockAchievement }
}
