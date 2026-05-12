import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  'Analyzing your profile...',
  'Calculating muscle recovery model...',
  'Selecting optimal exercises...',
  'Setting progressive targets...',
  'Building your first workout...',
]

export default function PlanCreationAnimation({
  onComplete,
  isWorkoutReady = false,
  hasError = false,
}: {
  onComplete: () => void
  isWorkoutReady?: boolean
  hasError?: boolean
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => {
        if (i >= STEPS.length - 1) {
          clearInterval(interval)
          setDone(true)
          return i
        }
        return i + 1
      })
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-6xl mb-8"
      >
        ⚡
      </motion.div>
      <h1 className="text-2xl font-bold text-text-primary mb-2 text-center">Building your plan</h1>
      <p className="text-text-secondary text-center mb-12 text-sm">Personalizing everything for you</p>

      <div className="flex gap-3 mb-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-accent-red rounded-full"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-text-secondary text-sm text-center h-5"
        >
          {STEPS[stepIndex]}
        </motion.p>
      </AnimatePresence>

      <div className="w-full max-w-xs mt-8 h-1 bg-bg-elevated rounded-full">
        <motion.div
          className="h-1 bg-accent-red rounded-full"
          animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {done && (isWorkoutReady || hasError) && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onComplete}
          className="mt-12 bg-accent-red text-white font-semibold py-4 px-10 rounded-xl"
        >
          {hasError ? 'Continue →' : 'See my first workout →'}
        </motion.button>
      )}
      {done && !isWorkoutReady && !hasError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-text-secondary text-sm"
        >
          Almost ready…
        </motion.p>
      )}
    </div>
  )
}
