import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ExerciseView from '../components/workout/ExerciseView'
import SetLogger from '../components/workout/SetLogger'
import RestTimer from '../components/workout/RestTimer'
import PostWorkoutSummary from '../components/workout/PostWorkoutSummary'
import { useWorkout } from '../hooks/useWorkout'
import { useMuscleFatigue } from '../hooks/useMuscleFatigue'
import { useProgressiveOverload } from '../hooks/useProgressiveOverload'
import type { LoggedSetData, MuscleGroup } from '../types'

type Phase = 'exercise' | 'logging' | 'rest' | 'summary'

export default function WorkoutSession() {
  const navigate = useNavigate()
  const { currentWorkout, saveWorkout } = useWorkout()
  const { updateFatigue } = useMuscleFatigue()
  const { recordSet } = useProgressiveOverload()

  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [setIndex, setSetIndex] = useState(1)
  const [phase, setPhase] = useState<Phase>('exercise')
  const [loggedSets, setLoggedSets] = useState<LoggedSetData[]>([])
  const startedAt = useRef(new Date())

  if (!currentWorkout) {
    navigate('/', { replace: true })
    return null
  }

  const exercises = currentWorkout.exercises
  const currentExercise = exercises[exerciseIndex]
  const isLastSet = setIndex >= currentExercise.sets
  const isLastExercise = exerciseIndex >= exercises.length - 1

  function handleSetSaved(reps: number, weight: number, notes: string) {
    const allRepsCompleted = reps >= currentExercise.reps

    const setData: LoggedSetData = {
      exerciseName: currentExercise.name,
      primaryMuscle: currentExercise.primaryMuscle as MuscleGroup,
      secondaryMuscles: currentExercise.secondaryMuscles as MuscleGroup[],
      setNumber: setIndex,
      prescribedReps: currentExercise.reps,
      prescribedWeight: currentExercise.suggestedWeight,
      actualReps: reps,
      actualWeight: weight,
      weightUnit: currentExercise.weightUnit,
      restSeconds: currentExercise.restSeconds,
      metValue: currentExercise.metValue,
      notes: notes || undefined,
    }

    setLoggedSets((prev) => [...prev, setData])

    recordSet.mutate({
      exerciseName: currentExercise.name,
      weight,
      reps,
      allRepsCompleted,
    })

    if (isLastSet && isLastExercise) {
      setPhase('summary')
    } else if (isLastSet) {
      setExerciseIndex((i) => i + 1)
      setSetIndex(1)
      setPhase('rest')
    } else {
      setSetIndex((i) => i + 1)
      setPhase('rest')
    }
  }

  async function handleSave() {
    // Update fatigue for all trained muscles
    const uniqueMuscles = [
      ...new Set(exercises.flatMap((e) => [
        e.primaryMuscle as MuscleGroup,
        ...(e.secondaryMuscles as MuscleGroup[]),
      ]))
    ]

    await updateFatigue.mutateAsync(
      uniqueMuscles.map((muscle_group) => ({ muscle_group, intensity: 'moderate' as const }))
    )

    await saveWorkout.mutateAsync({
      workout: currentWorkout!,
      sets: loggedSets,
      startedAt: startedAt.current,
      completedAt: new Date(),
    })

    navigate('/', { replace: true })
  }

  const totalVolume = loggedSets.reduce((s, l) => s + l.actualReps * l.actualWeight, 0)

  if (phase === 'summary') {
    return (
      <PostWorkoutSummary
        workoutName={currentWorkout.name}
        totalVolume={Math.round(totalVolume)}
        caloriesBurned={currentWorkout.estimatedCaloriesBurned}
        durationMinutes={Math.round((Date.now() - startedAt.current.getTime()) / 60000)}
        exercisesCompleted={exerciseIndex + 1}
        exercisesTotal={exercises.length}
        onSave={handleSave}
        saving={saveWorkout.isPending || updateFatigue.isPending}
      />
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary px-5 pt-12 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-text-secondary p-2 -ml-2 text-lg"
        >
          ✕
        </button>
        <p className="text-text-secondary text-sm">
          {exerciseIndex + 1} / {exercises.length} exercises
        </p>
        <div className="w-8" />
      </div>

      <ExerciseView
        exercise={currentExercise}
        currentSet={setIndex}
      />

      {/* Done button */}
      {phase === 'exercise' && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-bg-primary border-t border-border">
          <button
            onClick={() => setPhase('logging')}
            className="w-full bg-accent-red text-white font-semibold py-5 rounded-2xl text-xl"
          >
            Done ✓
          </button>
        </div>
      )}

      {phase === 'logging' && (
        <SetLogger
          prescribedReps={currentExercise.reps}
          prescribedWeight={currentExercise.suggestedWeight}
          weightUnit={currentExercise.weightUnit}
          onSave={handleSetSaved}
        />
      )}

      {phase === 'rest' && (
        <RestTimer
          seconds={currentExercise.restSeconds}
          onComplete={() => setPhase('exercise')}
          onSkip={() => setPhase('exercise')}
        />
      )}
    </div>
  )
}
