import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, UtensilsCrossed, Dumbbell } from 'lucide-react'

interface FABProps {
  onLogMeal: () => void
  onStartWorkout: () => void
}

export default function FAB({ onLogMeal, onStartWorkout }: FABProps) {
  const [open, setOpen] = useState(false)

  const options = [
    { label: 'Log Meal', icon: UtensilsCrossed, action: onLogMeal },
    { label: 'Start Workout', icon: Dumbbell, action: onStartWorkout },
  ]

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && options.map(({ label, icon: Icon, action }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.8 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { action(); setOpen(false) }}
            className="flex items-center gap-3 bg-bg-elevated border border-border
              px-4 py-3 rounded-2xl"
          >
            <span className="text-text-primary text-sm font-medium">{label}</span>
            <div className="w-10 h-10 bg-accent-red rounded-xl flex items-center justify-center">
              <Icon size={18} className="text-white" />
            </div>
          </motion.button>
        ))}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-accent-red rounded-full flex items-center justify-center"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }}>
          <Plus size={24} className="text-white" />
        </motion.div>
      </motion.button>
    </div>
  )
}
