// src/dev/DevProviders.tsx
// Wraps any page with mock auth + pre-seeded React Query cache.
// No real Supabase calls are made — all data comes from mockData.ts.
import { type ReactNode, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from '../contexts/AuthContext'
import {
  mockUser,
  mockProfile,
  mockSavedWorkout,
  mockFatigueData,
  mockProgressiveOverload,
  mockMeals,
  mockWeightEntries,
  mockStreaks,
} from './mockData'

interface DevProvidersProps {
  children: ReactNode
  /** Pass true to simulate "no workout today" state */
  noTodayWorkout?: boolean
  /** Initial route for MemoryRouter, e.g. '/workout/session' */
  initialPath?: string
  /** Optional router state (e.g. { workout: mockGeneratedWorkout }) */
  routerState?: Record<string, unknown>
}

function buildQueryClient(noTodayWorkout: boolean): QueryClient {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
    },
  })

  const uid = mockUser.id
  const today = new Date().toLocaleDateString('sv')

  qc.setQueryData(['profile', uid], mockProfile)
  qc.setQueryData(['today_workout', uid], noTodayWorkout ? null : mockSavedWorkout)
  qc.setQueryData(['recent_exercises', uid], ['Bench Press', 'Squat', 'Pull-up'])
  qc.setQueryData(['muscle_fatigue', uid], mockFatigueData)
  qc.setQueryData(['progressive_overload', uid], mockProgressiveOverload)
  qc.setQueryData(['meals', uid, today], mockMeals)
  qc.setQueryData(['weight_log', uid, 30], mockWeightEntries)
  qc.setQueryData(['streaks', uid], mockStreaks)

  return qc
}

// Minimal no-op implementations that match the AuthContextValue shape.
// We cast the return types to satisfy TypeScript without importing internals.
const noop = () => Promise.resolve({ data: {}, error: null }) as never

const mockAuthValue = {
  user: mockUser,
  session: { user: mockUser, access_token: 'dev-token', token_type: 'bearer' } as Session,
  loading: false,
  signUp: noop,
  signIn: noop,
  signInWithGoogle: noop,
  signOut: noop,
}

export default function DevProviders({
  children,
  noTodayWorkout = false,
  initialPath = '/',
  routerState,
}: DevProvidersProps) {
  // Stable QueryClient per noTodayWorkout value
  const queryClient = useMemo(
    () => buildQueryClient(noTodayWorkout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [noTodayWorkout]
  )

  const initialEntries = routerState
    ? [{ pathname: initialPath, state: routerState }]
    : [initialPath]

  return (
    <AuthContext.Provider value={mockAuthValue}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </AuthContext.Provider>
  )
}
