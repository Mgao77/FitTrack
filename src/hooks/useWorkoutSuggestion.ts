// src/hooks/useWorkoutSuggestion.ts
// Derives today's suggested session by looking at the last completed workout
// and returning the next logical session in the user's natural rotation.
// No DB schema changes required — uses the existing workouts.target_muscle_groups field.

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { MovementPattern } from '../lib/workoutTargets'

export interface WorkoutSuggestion {
  suggestion: MovementPattern
  label: string // shown in the suggestion row, e.g. "Pull Day"
}

// Map a completed workout's muscle groups back to the pattern that produced them
function inferLastPattern(muscles: string[]): MovementPattern | null {
  const m = new Set(muscles.map((s) => s.toLowerCase()))

  // Upper Body: hit both pushing and pulling muscles
  if (m.has('chest') && m.has('back')) return 'Upper Body'
  // Lower Body: quads/hamstrings/glutes without upper pushing muscles
  if ((m.has('quads') || m.has('hamstrings') || m.has('glutes')) && !m.has('chest') && !m.has('back')) return 'Lower Body'
  // Push: chest without back
  if (m.has('chest') && !m.has('back')) return 'Push'
  // Pull: back without chest
  if (m.has('back') && !m.has('chest')) return 'Pull'
  // Legs catch-all (calves-only day, etc.)
  if (m.has('quads') || m.has('hamstrings') || m.has('calves')) return 'Legs'

  return null
}

// What to suggest after each pattern
const ROTATION_NEXT: Partial<Record<MovementPattern, MovementPattern>> = {
  'Push':       'Pull',
  'Pull':       'Legs',
  'Legs':       'Push',
  'Upper Body': 'Lower Body',
  'Lower Body': 'Upper Body',
  'Full Body':  'Full Body',
}

const SESSION_LABEL: Record<MovementPattern, string> = {
  'Push':       'Push Day',
  'Pull':       'Pull Day',
  'Legs':       'Legs Day',
  'Upper Body': 'Upper Body Day',
  'Lower Body': 'Lower Body Day',
  'Full Body':  'Full Body',
}

export function useWorkoutSuggestion(): WorkoutSuggestion | null {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: ['workout_suggestion', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('workouts')
        .select('target_muscle_groups, completed_at')
        .eq('user_id', user!.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!data?.target_muscle_groups?.length) return null

      const last = inferLastPattern(data.target_muscle_groups)
      if (!last) return null

      const next = ROTATION_NEXT[last]
      if (!next) return null

      return { suggestion: next, label: SESSION_LABEL[next] } satisfies WorkoutSuggestion
    },
    enabled: !!user,
  })

  return data ?? null
}
