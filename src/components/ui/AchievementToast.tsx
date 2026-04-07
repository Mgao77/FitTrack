// src/components/ui/AchievementToast.tsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AchievementToastProps {
  message: string | null
  onDismiss: () => void
}

const ACHIEVEMENT_LABELS: Record<string, string> = {
  first_workout: 'First Workout Complete! 🏋️',
  workout_7day_streak: '7-Day Workout Streak! 🔥',
  workout_30day_streak: '30-Day Streak Legend! 🏆',
  workout_100: '100 Workouts Complete! 💯',
  macro_day: 'Perfect Macro Day! 🎯',
}

export default function AchievementToast({ message, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, 3500)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-12 left-4 right-4 z-50 bg-bg-elevated border border-accent-success
            rounded-2xl px-5 py-4 text-center shadow-lg"
        >
          <p className="text-xs text-accent-success uppercase tracking-wider mb-1">Achievement Unlocked</p>
          <p className="text-text-primary font-bold">
            {ACHIEVEMENT_LABELS[message] ?? message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
