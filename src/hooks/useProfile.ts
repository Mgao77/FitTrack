import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Profile } from '../types'

export function useProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!user,
  })

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: (data) => {
      // Set data directly so isOnboardingComplete is truthy immediately — no refetch lag
      queryClient.setQueryData(['profile', user?.id], data)
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })

  const isOnboardingComplete = profile
    ? !!(
        profile.display_name &&
        profile.age &&
        profile.gender &&
        profile.experience_level &&
        profile.workout_frequency &&
        profile.goals
      )
    : false

  return { profile, isLoading, updateProfile, isOnboardingComplete }
}
