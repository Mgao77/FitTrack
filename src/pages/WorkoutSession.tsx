import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useWorkout } from '../hooks/useWorkout'
import { useMuscleFatigue } from '../hooks/useMuscleFatigue'
import { useProgressiveOverload } from '../hooks/useProgressiveOverload'
import { useStreaks } from '../hooks/useStreaks'
import SwapModal from '../components/workout/SwapModal'
import SetLogger from '../components/workout/SetLogger'
import RestTimer from '../components/workout/RestTimer'
import PostWorkoutSummary from '../components/workout/PostWorkoutSummary'
import { getExerciseGifUrl, getMuscleEmoji } from '../lib/exerciseMedia'
import { findExerciseGif } from '../lib/exerciseDB'
import { searchExerciseVideo, getYouTubeSearchUrl, type YouTubeResult } from '../lib/youtubeSearch'
import type { GeneratedWorkout, LoggedSetData, MuscleGroup, ExerciseAlternative, Exercise } from '../types'

// ── Phase types ───────────────────────────────────────────────────────────────
type Phase = 'list' | 'logging' | 'rest' | 'summary'

type ExerciseStatus = 'upcoming' | 'current' | 'completed'

// ── Elapsed timer ─────────────────────────────────────────────────────────────
function useElapsedTime(startedAt: React.RefObject<Date>) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])
  return elapsed
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ── Exercise thumbnail ────────────────────────────────────────────────────────
interface ExerciseThumbProps {
  exercise: Exercise
  status: ExerciseStatus
}

function ExerciseThumb({ exercise, status }: ExerciseThumbProps) {
  const staticUrl = getExerciseGifUrl(exercise.name)
  const [imgError, setImgError] = useState(false)
  const [exdbUrl, setExdbUrl] = useState<string | null>(null)

  // If static map has no entry or its image 404s, try ExerciseDB
  useEffect(() => {
    if (staticUrl && !imgError) return
    findExerciseGif(exercise.name, exercise.primaryMuscle as MuscleGroup)
      .then((url) => { if (url) setExdbUrl(url) })
      .catch(() => {})
  }, [exercise.name, exercise.primaryMuscle, staticUrl, imgError])

  const src = (staticUrl && !imgError) ? staticUrl : exdbUrl
  const overlay = status === 'completed' ? (
    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
      <span className="text-white text-xl">✓</span>
    </div>
  ) : null

  if (src) {
    return (
      <div className="relative w-16 h-16 flex-shrink-0">
        <img
          src={src}
          alt={exercise.name}
          onError={() => setImgError(true)}
          className="w-16 h-16 rounded-xl object-cover bg-bg-elevated"
        />
        {overlay}
      </div>
    )
  }

  return (
    <div className="relative w-16 h-16 flex-shrink-0 rounded-xl bg-bg-elevated flex items-center justify-center text-3xl">
      {getMuscleEmoji(exercise.primaryMuscle)}
      {overlay}
    </div>
  )
}

// ── Exercise detail sheet ─────────────────────────────────────────────────────
interface ExerciseDetailSheetProps {
  exercise: Exercise
  exerciseIndex: number         // position in plan (0-based)
  currentIndex: number          // which exercise is active
  currentSetIndex: number       // which set we're on (1-based)
  loggedSets: LoggedSetData[]
  workoutStarted: boolean
  onLogSet: () => void
  onClose: () => void
}

function ExerciseDetailSheet({
  exercise,
  exerciseIndex,
  currentIndex,
  currentSetIndex,
  loggedSets,
  workoutStarted,
  onLogSet,
  onClose,
}: ExerciseDetailSheetProps) {
  // Demo media: try static free-exercise-db map first, then ExerciseDB animated GIF
  const frame0Url = getExerciseGifUrl(exercise.name)
  const folderUrl = frame0Url ? frame0Url.replace('/0.jpg', '') : null

  // ExerciseDB GIF fallback (animated, single URL — no two-frame toggle needed)
  const [exdbGifUrl, setExdbGifUrl] = useState<string | null>(null)
  const [ytVideo, setYtVideo] = useState<YouTubeResult | null>(null)
  const [ytLoading, setYtLoading] = useState(false)

  useEffect(() => {
    if (folderUrl) return // static map has it — done
    setExdbGifUrl(null)
    setYtVideo(null)
    setYtLoading(false)

    findExerciseGif(exercise.name, exercise.primaryMuscle as MuscleGroup)
      .then((url) => {
        if (url) {
          setExdbGifUrl(url)
        } else {
          // No GIF found — fall back to YouTube
          setYtLoading(true)
          return searchExerciseVideo(exercise.name)
            .then((vid) => { setYtVideo(vid) })
            .catch(() => {})
            .finally(() => setYtLoading(false))
        }
      })
      .catch(() => {
        // ExerciseDB failed entirely — try YouTube
        setYtLoading(true)
        searchExerciseVideo(exercise.name)
          .then((vid) => { setYtVideo(vid) })
          .catch(() => {})
          .finally(() => setYtLoading(false))
      })
  }, [exercise.name, exercise.primaryMuscle, folderUrl])

  // Two-frame animation for static JPG pair (free-exercise-db)
  const [frame, setFrame] = useState(0)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!folderUrl || imgError) return
    const id = setInterval(() => setFrame((f) => 1 - f), 1500)
    return () => clearInterval(id)
  }, [folderUrl, imgError])

  // Sets logged for this exercise
  const exerciseLogs = loggedSets.filter((s) => s.exerciseName === exercise.name)
  const isCurrent = workoutStarted && exerciseIndex === currentIndex
  const isCompleted = workoutStarted && exerciseIndex < currentIndex

  // Derive per-set state
  const sets = Array.from({ length: exercise.sets }, (_, i) => {
    const setNum = i + 1
    const logged = exerciseLogs.find((s) => s.setNumber === setNum)
    const isSetCurrent = isCurrent && setNum === currentSetIndex
    const isSetDone = !!logged || (isCurrent && setNum < currentSetIndex) || isCompleted
    return { setNum, logged, isSetCurrent, isSetDone }
  })

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 bg-bg-card border-t border-border rounded-t-3xl z-40 flex flex-col"
      style={{ maxHeight: '90vh' }}
    >
      {/* Drag handle */}
      <div className="flex-shrink-0 pt-3 pb-2 flex justify-center">
        <div className="w-10 h-1 bg-border rounded-full" />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary"
        aria-label="Close"
      >
        ✕
      </button>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* ── Animated demo ── */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-bg-elevated mb-4 relative">
          {folderUrl && !imgError ? (
            /* Tier 1a: Static free-exercise-db two-frame JPG */
            <>
              <img src={`${folderUrl}/0.jpg`} alt={exercise.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: frame === 0 ? 1 : 0 }}
                onError={() => setImgError(true)} />
              <img src={`${folderUrl}/1.jpg`} alt={`${exercise.name} frame 2`}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: frame === 1 ? 1 : 0 }}
                onError={() => { /* frame 1 optional */ }} />
            </>
          ) : exdbGifUrl ? (
            /* Tier 1b: ExerciseDB animated GIF */
            <img src={exdbGifUrl} alt={exercise.name}
              className="absolute inset-0 w-full h-full object-cover" />
          ) : ytLoading ? (
            /* YouTube loading state */
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-text-tertiary border-t-transparent animate-spin" />
              <span className="text-text-tertiary text-xs">Finding demo...</span>
            </div>
          ) : ytVideo ? (
            /* Tier 2: YouTube embed */
            <iframe
              src={`https://www.youtube.com/embed/${ytVideo.videoId}?rel=0&modestbranding=1`}
              title={ytVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            /* Tier 3: Search on YouTube button */
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
              <span className="text-4xl">{getMuscleEmoji(exercise.primaryMuscle as MuscleGroup)}</span>
              <a
                href={getYouTubeSearchUrl(exercise.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl active:opacity-80"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                </svg>
                Search on YouTube
              </a>
              <span className="text-text-tertiary text-xs text-center">{exercise.name} proper form tutorial</span>
            </div>
          )}

          {/* Muscle badge — show on all tiers except YouTube embed */}
          {!ytVideo && (
            <div className="absolute bottom-2 left-2 bg-black/60 rounded-full px-2 py-0.5 text-white text-xs font-medium capitalize">
              {exercise.primaryMuscle}
            </div>
          )}
        </div>

        {/* ── Exercise name + meta ── */}
        <h2 className="text-text-primary font-bold text-xl mb-0.5">{exercise.name}</h2>
        <p className="text-text-secondary text-sm mb-4">
          {exercise.sets} sets · {exercise.reps} reps
          {exercise.suggestedWeight > 0 && ` · ${exercise.suggestedWeight} ${exercise.weightUnit}`}
          {exercise.restSeconds > 0 && ` · ${exercise.restSeconds}s rest`}
        </p>

        {/* ── Set breakdown ── */}
        <div className="space-y-2 mb-2">
          {sets.map(({ setNum, logged, isSetCurrent, isSetDone }) => (
            <div
              key={setNum}
              className={[
                'rounded-xl px-4 py-3 flex items-center justify-between',
                isSetCurrent ? 'bg-accent-red/10 border border-accent-red/40' : 'bg-bg-elevated',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  isSetDone
                    ? 'bg-green-500/20 text-green-400'
                    : isSetCurrent
                    ? 'bg-accent-red text-white'
                    : 'bg-bg-card text-text-secondary',
                ].join(' ')}>
                  {isSetDone ? '✓' : setNum}
                </div>
                <span className={[
                  'text-sm font-semibold',
                  isSetCurrent ? 'text-accent-red' : 'text-text-primary',
                ].join(' ')}>
                  Set {setNum}
                </span>
              </div>

              <div className="text-right">
                {logged ? (
                  <span className="text-green-400 text-sm font-medium">
                    {logged.actualReps} reps @ {logged.actualWeight} {logged.weightUnit}
                  </span>
                ) : (
                  <span className="text-text-tertiary text-sm">
                    {exercise.reps} reps
                    {exercise.suggestedWeight > 0 && ` @ ${exercise.suggestedWeight} ${exercise.weightUnit}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Sticky CTA footer — always visible, never scrolled away ── */}
      <div className="flex-shrink-0 px-5 pb-8 pt-3 border-t border-border bg-bg-card">
        {isCurrent ? (
          <button
            onClick={() => { onClose(); onLogSet() }}
            className="w-full bg-accent-red text-white font-bold py-4 rounded-xl text-base active:opacity-80"
          >
            Log Set {currentSetIndex} of {exercise.sets}
          </button>
        ) : isCompleted ? (
          <div className="w-full py-4 rounded-xl bg-green-500/10 text-center">
            <span className="text-green-400 font-semibold text-sm">Exercise completed ✓</span>
          </div>
        ) : !workoutStarted ? (
          <div className="w-full py-4 rounded-xl bg-bg-elevated text-center">
            <span className="text-text-secondary text-sm">Start workout to log sets</span>
          </div>
        ) : (
          <div className="w-full py-4 rounded-xl bg-bg-elevated text-center">
            <span className="text-text-secondary text-sm">Finish current exercise first</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Regen storage ─────────────────────────────────────────────────────────────
const REGEN_STORAGE_KEY = 'fittrack_regen'
const MAX_REGENS_PER_DAY = 3

function getRegenCount(): number {
  try {
    const raw = localStorage.getItem(REGEN_STORAGE_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    if (date !== new Date().toLocaleDateString('sv')) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

function incrementRegenCount(): void {
  const today = new Date().toLocaleDateString('sv')
  const current = getRegenCount()
  localStorage.setItem(REGEN_STORAGE_KEY, JSON.stringify({ date: today, count: current + 1 }))
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WorkoutSession() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfile()
  const { recoveryMap, updateFatigue } = useMuscleFatigue()
  const { overloadData, recordSet } = useProgressiveOverload()
  const { generateWorkout, recentExercises, saveWorkout } = useWorkout()
  const { incrementStreak } = useStreaks()

  const initialWorkout = (location.state as { workout?: GeneratedWorkout } | null)?.workout ?? null
  const [currentWorkout, setCurrentWorkout] = useState<GeneratedWorkout | null>(initialWorkout)

  const [phase, setPhase] = useState<Phase>('list')
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [setIndex, setSetIndex] = useState(1)
  const [loggedSets, setLoggedSets] = useState<LoggedSetData[]>([])
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null)
  const [detailIndex, setDetailIndex] = useState<number | null>(null)
  const [regenCount, setRegenCount] = useState(getRegenCount())
  const [showOptions, setShowOptions] = useState(false)

  const startedAt = useRef<Date>(new Date())
  const saving = useRef(false)
  const elapsed = useElapsedTime(startedAt)

  useEffect(() => {
    if (!currentWorkout) navigate('/', { replace: true })
  }, [currentWorkout, navigate])

  if (!currentWorkout) return null

  const exercises = currentWorkout.exercises
  const currentExercise = exercises[exerciseIndex]
  const isLastSet = setIndex >= currentExercise?.sets
  const isLastExercise = exerciseIndex >= exercises.length - 1

  function getExerciseStatus(index: number): ExerciseStatus {
    if (!workoutStarted) return 'upcoming'
    if (index < exerciseIndex) return 'completed'
    if (index === exerciseIndex) return 'current'
    return 'upcoming'
  }

  // ── Regenerate ────────────────────────────────────────────────────────────
  async function handleRegenerate() {
    if (regenCount >= MAX_REGENS_PER_DAY) return
    const excludeExercises = currentWorkout!.exercises.map((e) => e.name)
    try {
      const newWorkout = await generateWorkout.mutateAsync({
        profile,
        muscleRecovery: recoveryMap,
        progressiveOverload: overloadData,
        recentExercises,
        excludeExercises,
      })
      setCurrentWorkout(newWorkout)
      incrementRegenCount()
      setRegenCount((c) => c + 1)
    } catch {
      // error surfaced via generateWorkout.error
    }
  }

  // ── Swap exercise ─────────────────────────────────────────────────────────
  const handleSwap = useCallback((alt: ExerciseAlternative) => {
    if (swappingIndex === null) return
    const original = exercises[swappingIndex]
    setCurrentWorkout((prev) => {
      if (!prev) return prev
      const updated = [...prev.exercises]
      updated[swappingIndex] = {
        ...original,
        name: alt.name,
        alternatives: (original.alternatives ?? []).filter((a) => a.name !== alt.name),
        youtubeSearchQuery: `${alt.name} exercise form technique`,
      }
      return { ...prev, exercises: updated }
    })
    setSwappingIndex(null)
  }, [swappingIndex, exercises])

  // ── Start workout ─────────────────────────────────────────────────────────
  function handleStart() {
    startedAt.current = new Date()
    setWorkoutStarted(true)
    setPhase('list')
  }

  // ── Tap exercise row → open detail sheet ────────────────────────────────
  function handleExerciseTap(index: number) {
    setDetailIndex(index)
  }

  // ── Set saved ─────────────────────────────────────────────────────────────
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
    recordSet.mutate({ exerciseName: currentExercise.name, weight, reps, allRepsCompleted })

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

  // ── Save completed workout ────────────────────────────────────────────────
  async function handleSave() {
    if (saving.current) return
    saving.current = true
    try {
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
      incrementStreak.mutate('workout')
      navigate('/', { replace: true })
    } finally {
      saving.current = false
    }
  }

  const totalVolume = loggedSets.reduce((s, l) => s + l.actualReps * l.actualWeight, 0)

  // ── SUMMARY PHASE ─────────────────────────────────────────────────────────
  if (phase === 'summary') {
    return (
      <PostWorkoutSummary
        workoutName={currentWorkout.name}
        totalVolume={Math.round(totalVolume)}
        volumeUnit={profile?.unit_preference ?? 'kg'}
        caloriesBurned={currentWorkout.estimatedCaloriesBurned}
        durationMinutes={Math.round((Date.now() - startedAt.current.getTime()) / 60000)}
        exercisesCompleted={exerciseIndex + 1}
        exercisesTotal={exercises.length}
        onSave={handleSave}
        saving={saveWorkout.isPending || updateFatigue.isPending}
      />
    )
  }

  // ── LIST PHASE (unified view) ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-bg-primary sticky top-0 z-10 border-b border-border">
        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-xs uppercase tracking-widest">Time</span>
          <span className="text-text-primary font-bold tabular-nums text-base">
            {workoutStarted ? formatElapsed(elapsed) : '00:00'}
          </span>
        </div>

        {/* Workout name (center) */}
        <p className="text-text-primary font-semibold text-sm truncate max-w-[140px] text-center">
          {currentWorkout.name}
        </p>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowOptions((v) => !v)}
              className="text-text-secondary text-lg w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-elevated active:opacity-60 transition-colors"
              aria-label="Options"
            >
              ···
            </button>
            {showOptions && (
              <div className="absolute right-0 top-10 bg-bg-elevated border border-border rounded-2xl shadow-lg overflow-hidden z-20 w-48">
                <button
                  onClick={() => { setShowOptions(false); handleRegenerate() }}
                  disabled={regenCount >= MAX_REGENS_PER_DAY || generateWorkout.isPending}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary disabled:opacity-40 active:bg-bg-card"
                >
                  {generateWorkout.isPending
                    ? 'Generating...'
                    : `Regenerate (${regenCount}/${MAX_REGENS_PER_DAY})`}
                </button>
                <div className="h-px bg-border" />
                <button
                  onClick={() => { setShowOptions(false); navigate('/', { replace: true }) }}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 active:bg-bg-card"
                >
                  Abandon workout
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="text-text-secondary text-lg w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-elevated active:opacity-60 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Workout meta ── */}
      <div className="px-5 pt-3 pb-1">
        <p className="text-text-secondary text-xs">
          {exercises.length} exercises · ~{currentWorkout.estimatedDuration} min · ~{currentWorkout.estimatedCaloriesBurned} cal
        </p>
        {generateWorkout.error && (
          <p className="text-red-400 text-xs mt-1">{(generateWorkout.error as Error).message}</p>
        )}
      </div>

      {/* ── Exercise list ── */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-32 space-y-2">
        {exercises.map((ex, i) => {
          const status = getExerciseStatus(i)
          const isCurrent = status === 'current'
          const isCompleted = status === 'completed'

          return (
            <button
              key={i}
              onClick={() => handleExerciseTap(i)}
              className={[
                'w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-all active:opacity-70',
                isCurrent
                  ? 'bg-bg-elevated border-l-4 border-accent-red shadow-sm'
                  : 'bg-bg-elevated border-l-4 border-transparent',
                isCompleted ? 'opacity-50' : '',
              ].join(' ')}
            >
              {/* Thumbnail */}
              <ExerciseThumb exercise={ex} status={status} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={[
                  'text-sm font-bold leading-snug',
                  isCompleted ? 'line-through text-text-tertiary' : 'text-text-primary',
                ].join(' ')}>
                  {ex.name}
                </p>
                <p className="text-text-secondary text-xs mt-0.5">
                  {ex.sets} sets · {ex.reps} reps
                  {ex.suggestedWeight > 0 && ` · ${ex.suggestedWeight} ${ex.weightUnit}`}
                </p>
                {isCurrent && workoutStarted && (
                  <p className="text-accent-red text-xs font-semibold mt-0.5">
                    Set {setIndex} / {ex.sets} · tap to log
                  </p>
                )}
                {!workoutStarted && (
                  <p className="text-text-tertiary text-xs mt-0.5">Tap to preview</p>
                )}
              </div>

              {/* Row action */}
              <button
                onClick={(e) => { e.stopPropagation(); setSwappingIndex(i) }}
                className="text-text-tertiary text-lg flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:bg-bg-card"
                aria-label={`Options for ${ex.name}`}
              >
                ···
              </button>
            </button>
          )
        })}
      </div>

      {/* ── Floating action button ── */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-10 pointer-events-none">
        {!workoutStarted ? (
          <button
            onClick={handleStart}
            className="pointer-events-auto bg-accent-red text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg active:opacity-80"
          >
            Start Workout
          </button>
        ) : (
          <button
            onClick={() => setPhase('summary')}
            className="pointer-events-auto w-16 h-16 bg-accent-red rounded-full flex items-center justify-center shadow-lg active:opacity-80"
            aria-label="Finish workout"
          >
            <span className="text-white text-xl">■</span>
          </button>
        )}
      </div>

      {/* ── SetLogger overlay ── */}
      {phase === 'logging' && (
        <SetLogger
          prescribedReps={currentExercise.reps}
          prescribedWeight={currentExercise.suggestedWeight}
          weightUnit={currentExercise.weightUnit}
          onSave={handleSetSaved}
        />
      )}

      {/* ── RestTimer overlay ── */}
      {phase === 'rest' && (
        <RestTimer
          seconds={currentExercise.restSeconds}
          onComplete={() => setPhase('list')}
          onSkip={() => setPhase('list')}
        />
      )}

      {/* ── Swap modal ── */}
      <AnimatePresence>
        {swappingIndex !== null && (
          <SwapModal
            exercise={exercises[swappingIndex]}
            onSwap={handleSwap}
            onClose={() => setSwappingIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Exercise detail sheet ── */}
      <AnimatePresence>
        {detailIndex !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              key="detail-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setDetailIndex(null)}
            />
            <ExerciseDetailSheet
              key="detail-sheet"
              exercise={exercises[detailIndex]}
              exerciseIndex={detailIndex}
              currentIndex={exerciseIndex}
              currentSetIndex={setIndex}
              loggedSets={loggedSets}
              workoutStarted={workoutStarted}
              onLogSet={() => setPhase('logging')}
              onClose={() => setDetailIndex(null)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Options menu backdrop ── */}
      {/* z-[9] keeps it below the sticky header (z-10) so dropdown items stay clickable */}
      {showOptions && (
        <div
          className="fixed inset-0 z-[9]"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}
