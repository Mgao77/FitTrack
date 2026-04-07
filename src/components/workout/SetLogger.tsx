import { useState } from 'react'
import { motion } from 'framer-motion'

interface SetLoggerProps {
  prescribedReps: number
  prescribedWeight: number
  weightUnit: 'kg' | 'lbs'
  onSave: (reps: number, weight: number, notes: string) => void
}

export default function SetLogger({ prescribedReps, prescribedWeight, weightUnit, onSave }: SetLoggerProps) {
  const [reps, setReps] = useState(prescribedReps)
  const [weight, setWeight] = useState(prescribedWeight)
  const [notes, setNotes] = useState('')

  const weightStep = weightUnit === 'kg' ? 2.5 : 5

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 bg-bg-card border-t border-border rounded-t-3xl p-6 z-50"
    >
      <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
      <h3 className="text-text-primary font-bold text-lg mb-5">Log this set</h3>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="text-text-secondary text-xs mb-2 block">Reps</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReps((r) => Math.max(1, r - 1))}
              className="w-10 h-10 bg-bg-elevated rounded-xl text-text-primary font-bold text-lg"
            >-</button>
            <span className="flex-1 text-center text-text-primary text-2xl font-bold tabular-nums">{reps}</span>
            <button
              onClick={() => setReps((r) => r + 1)}
              className="w-10 h-10 bg-bg-elevated rounded-xl text-text-primary font-bold text-lg"
            >+</button>
          </div>
        </div>
        <div className="flex-1">
          <label className="text-text-secondary text-xs mb-2 block">Weight ({weightUnit})</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeight((w) => Math.max(0, Math.round((w - weightStep) * 10) / 10))}
              className="w-10 h-10 bg-bg-elevated rounded-xl text-text-primary font-bold text-lg"
            >-</button>
            <span className="flex-1 text-center text-text-primary text-2xl font-bold tabular-nums">{weight}</span>
            <button
              onClick={() => setWeight((w) => Math.round((w + weightStep) * 10) / 10)}
              className="w-10 h-10 bg-bg-elevated rounded-xl text-text-primary font-bold text-lg"
            >+</button>
          </div>
        </div>
      </div>

      <input
        placeholder="Notes (optional — e.g. 'felt easy')"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full bg-bg-elevated text-text-primary px-4 py-3 rounded-xl mb-4
          border border-transparent focus:border-accent-red focus:outline-none
          placeholder:text-text-tertiary text-sm"
      />

      <button
        onClick={() => onSave(reps, weight, notes)}
        className="w-full bg-accent-red text-white font-semibold py-4 rounded-xl text-lg"
      >
        Done ✓
      </button>
    </motion.div>
  )
}
