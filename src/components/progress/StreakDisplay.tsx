// src/components/progress/StreakDisplay.tsx
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import type { Streak } from '../../types'

export default function StreakDisplay() {
  const { user } = useAuth()

  const { data: streaks = [] } = useQuery({
    queryKey: ['streaks', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('streaks').select('*').eq('user_id', user!.id)
      return (data ?? []) as Streak[]
    },
    enabled: !!user,
  })

  const streakMap = Object.fromEntries(streaks.map((s) => [s.streak_type, s]))

  const displayStreaks = [
    { type: 'workout', label: 'Workout Streak', icon: '🏋️' },
    { type: 'logging', label: 'Logging Streak', icon: '📝' },
    { type: 'protein_target', label: 'Protein Target', icon: '🥩' },
    { type: 'calorie_target', label: 'Calorie Target', icon: '🎯' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {displayStreaks.map(({ type, label, icon }) => {
        const streak = streakMap[type]
        return (
          <div key={type} className="bg-bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{icon}</span>
              <span className="text-text-secondary text-xs">{label}</span>
            </div>
            <p className="text-text-primary text-3xl font-bold tabular-nums">
              {streak?.current_count ?? 0}
            </p>
            <p className="text-text-tertiary text-xs">days 🔥</p>
            {streak && streak.longest_count > 0 && (
              <p className="text-text-tertiary text-xs mt-1">Best: {streak.longest_count}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
