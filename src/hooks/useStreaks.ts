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
      const today = new Date().toISOString().split('T')[0]

      const { data: existing } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('streak_type', streakType)
        .single()

      const alreadyIncrementedToday = existing?.last_incremented_at === today
      if (alreadyIncrementedToday) return null

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const continuedStreak = existing?.last_incremented_at === yesterdayStr
      const newCount = continuedStreak ? (existing.current_count + 1) : 1
      const newLongest = Math.max(existing?.longest_count ?? 0, newCount)

      await supabase.from('streaks').upsert({
        user_id: user!.id,
        streak_type: streakType,
        current_count: newCount,
        longest_count: newLongest,
        last_incremented_at: today,
      }, { onConflict: 'user_id,streak_type' })

      // Check achievement thresholds
      const thresholds = ACHIEVEMENT_THRESHOLDS[streakType] ?? []
      const crossed = thresholds.find((t) => t === newCount)
      if (crossed) {
        const achievementType = `${streakType}_${crossed}day_streak`
        await supabase.from('achievements').upsert({
          user_id: user!.id,
          achievement_type: achievementType,
        }, { onConflict: 'user_id,achievement_type' })
        return achievementType
      }

      queryClient.invalidateQueries({ queryKey: ['streaks', user?.id] })
      return null
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
