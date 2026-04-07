import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import ProtectedRoute from './components/layout/ProtectedRoute'
import TabBar from './components/layout/TabBar'
import FAB from './components/layout/FAB'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import WorkoutSession from './pages/WorkoutSession'
import MealLogger from './components/nutrition/MealLogger'

// Stub pages — will be replaced in later tasks
function Today() {
  return <div className="min-h-screen bg-bg-primary p-4 pb-28 pt-14"><h1 className="text-text-primary text-2xl font-bold">Today</h1></div>
}
function Plan() {
  return <div className="min-h-screen bg-bg-primary p-4 pb-28 pt-14"><h1 className="text-text-primary text-2xl font-bold">Plan</h1></div>
}
function Progress() {
  return <div className="min-h-screen bg-bg-primary p-4 pb-28 pt-14"><h1 className="text-text-primary text-2xl font-bold">Progress</h1></div>
}
function ProfilePage() {
  return <div className="min-h-screen bg-bg-primary p-4 pb-28 pt-14"><h1 className="text-text-primary text-2xl font-bold">Profile</h1></div>
}

const queryClient = new QueryClient()

function AppRoutes() {
  const { user } = useAuth()
  const { isOnboardingComplete } = useProfile()
  const [showMealLogger, setShowMealLogger] = useState(false)
  const [_showWorkoutPicker, setShowWorkoutPicker] = useState(false)

  const showLayout = user && isOnboardingComplete

  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={
          <ProtectedRoute><Onboarding /></ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            {!isOnboardingComplete ? <Navigate to="/onboarding" replace /> : <Today />}
          </ProtectedRoute>
        } />
        <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/workout/session" element={<ProtectedRoute><WorkoutSession /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showLayout && (
        <>
          <TabBar />
          <FAB
            onLogMeal={() => setShowMealLogger(true)}
            onStartWorkout={() => setShowWorkoutPicker(true)}
          />
          {showMealLogger && (
            <MealLogger onClose={() => setShowMealLogger(false)} />
          )}
        </>
      )}
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
