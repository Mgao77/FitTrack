import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface PostWorkoutSummaryProps {
  workoutName: string
  totalVolume: number
  caloriesBurned: number
  durationMinutes: number
  exercisesCompleted: number
  exercisesTotal: number
  onSave: () => void
  saving: boolean
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const steps = 40
    const increment = target / steps
    const interval = duration / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setValue(Math.round(target))
        clearInterval(timer)
      } else {
        setValue(Math.round(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

export default function PostWorkoutSummary({
  workoutName, totalVolume, caloriesBurned, durationMinutes,
  exercisesCompleted, exercisesTotal, onSave, saving
}: PostWorkoutSummaryProps) {
  const confettiFired = useRef(false)
  const volume = useCountUp(totalVolume)
  const calories = useCountUp(caloriesBurned, 1400)
  const duration = useCountUp(durationMinutes, 1000)

  useEffect(() => {
    if (confettiFired.current) return
    confettiFired.current = true
    const timer = setTimeout(() => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#E53935', '#FF9800', '#66BB6A'] })
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { label: 'Total Volume', value: `${volume} kg`, icon: '🏋️' },
    { label: 'Calories', value: `~${calories}`, icon: '🔥' },
    { label: 'Duration', value: `${duration} min`, icon: '⏱️' },
    { label: 'Exercises', value: `${exercisesCompleted}/${exercisesTotal}`, icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-bg-primary px-5 py-12 flex flex-col">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-text-tertiary text-sm uppercase tracking-widest mb-1">Workout Complete</p>
        <h1 className="text-text-primary text-3xl font-bold mb-8">{workoutName} 🎉</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map(({ label, value, icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-bg-card border border-border rounded-2xl p-4"
            >
              <p className="text-2xl mb-2">{icon}</p>
              <p className="text-text-primary text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-text-secondary text-xs mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onSave}
          disabled={saving}
          className="w-full bg-accent-red text-white font-semibold py-4 rounded-xl text-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Workout'}
        </motion.button>
      </motion.div>
    </div>
  )
}
