import { motion } from 'framer-motion'
import { Clock, Flame, ChevronRight } from 'lucide-react'
import Card from '../ui/Card'
import type { GeneratedWorkout } from '../../types'

interface WorkoutCardProps {
  workout: GeneratedWorkout
  onStart: () => void
  completed?: boolean
}

export default function WorkoutCard({ workout, onStart, completed }: WorkoutCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-text-tertiary text-xs uppercase tracking-wider mb-1">
            {completed ? 'Completed Today' : 'Recommended Workout'}
          </p>
          <h2 className="text-text-primary text-xl font-bold">{workout.name}</h2>
        </div>
        {completed && <span className="text-2xl">✅</span>}
      </div>

      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
          <Clock size={14} />
          <span>{workout.estimatedDuration} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
          <Flame size={14} className="text-accent-red" />
          <span>~{workout.estimatedCaloriesBurned} cal</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {workout.targetMuscleGroups.map((m) => (
          <span key={m}
            className="px-2 py-0.5 bg-bg-elevated rounded-lg text-xs text-text-secondary capitalize">
            {m}
          </span>
        ))}
      </div>

      <p className="text-text-tertiary text-sm mb-4">{workout.exercises.length} exercises</p>

      {!completed && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full bg-accent-red text-white font-semibold py-3 rounded-xl
            flex items-center justify-center gap-2"
        >
          Start Workout
          <ChevronRight size={18} />
        </motion.button>
      )}
    </Card>
  )
}
