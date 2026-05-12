import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWorkout } from '../../hooks/useWorkout'
import { useMuscleFatigue } from '../../hooks/useMuscleFatigue'
import { useProgressiveOverload } from '../../hooks/useProgressiveOverload'
import { useProfile } from '../../hooks/useProfile'
import { useWorkoutSuggestion } from '../../hooks/useWorkoutSuggestion'
import {
  MOVEMENT_PATTERNS,
  BODY_PARTS,
  resolveTargets,
  resolveSessionLabel,
  type MovementPattern,
  type BodyPart,
} from '../../lib/workoutTargets'

interface ActiveProgram {
  suggestion: MovementPattern
  label: string
}

interface PreWorkoutSheetProps {
  onClose: () => void
}

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors active:opacity-70 ${
        selected
          ? 'bg-accent-red border-accent-red text-white'
          : 'border-border text-text-secondary bg-transparent'
      }`}
    >
      {label}
    </button>
  )
}

// ── Conflict dialog ───────────────────────────────────────────────────────────
function ConflictDialog({
  program,
  userLabel,
  onStickToProgram,
  onSwitchForToday,
}: {
  program: ActiveProgram
  userLabel: string
  onStickToProgram: () => void
  onSwitchForToday: () => void
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center px-6 bg-black/50 rounded-t-3xl">
      <div className="bg-bg-elevated border border-border rounded-2xl p-5 w-full space-y-4">
        <p className="text-text-primary font-semibold text-base leading-snug">
          Your last session suggests{' '}
          <span className="text-accent-red">{program.suggestion}</span> is next,
          but you picked{' '}
          <span className="text-accent-red">{userLabel}</span>. Go with your pick?
        </p>
        <p className="text-text-tertiary text-xs">
          "Stick to rotation" uses the suggested session instead.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onStickToProgram}
            className="flex-1 py-2.5 rounded-xl border border-border text-text-primary text-sm font-medium active:opacity-70"
          >
            Stick to rotation
          </button>
          <button
            onClick={onSwitchForToday}
            className="flex-1 py-2.5 rounded-xl bg-accent-red text-white text-sm font-semibold active:opacity-80"
          >
            Switch for today
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main sheet ────────────────────────────────────────────────────────────────
export default function PreWorkoutSheet({ onClose }: PreWorkoutSheetProps) {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { recoveryMap } = useMuscleFatigue()
  const { overloadData } = useProgressiveOverload()
  const { generateWorkout, recentExercises } = useWorkout()
  const suggestion = useWorkoutSuggestion()

  // Treat the derived suggestion as the active "program" for conflict detection
  const program: ActiveProgram | null = suggestion
    ? { suggestion: suggestion.suggestion, label: suggestion.label }
    : null

  const [patternPick, setPatternPick] = useState<MovementPattern | null>(null)
  const [bodyPartPicks, setBodyPartPicks] = useState<BodyPart[]>([])
  const [dailyNotes, setDailyNotes] = useState('')
  const [showConflict, setShowConflict] = useState(false)

  const hasSelection = patternPick !== null || bodyPartPicks.length > 0
  const userLabel = resolveSessionLabel(patternPick, bodyPartPicks)
  const targets = resolveTargets(patternPick, bodyPartPicks)

  function selectPattern(p: MovementPattern) {
    setPatternPick((prev) => (prev === p ? null : p))
    setBodyPartPicks([])
  }

  function toggleBodyPart(b: BodyPart) {
    setPatternPick(null)
    setBodyPartPicks((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    )
  }

  function useProgramSuggestion() {
    if (!program) return
    setPatternPick(program.suggestion)
    setBodyPartPicks([])
  }

  function handleGenerateTap() {
    if (!hasSelection) return
    // Show conflict dialog only when a pattern is picked and it differs from the suggestion
    if (program && patternPick !== null && patternPick !== program.suggestion) {
      setShowConflict(true)
      return
    }
    doGenerate()
  }

  function handleStickToProgram() {
    if (!program) return
    setShowConflict(false)
    setPatternPick(program.suggestion)
    setBodyPartPicks([])
  }

  function handleSwitchForToday() {
    setShowConflict(false)
    doGenerate()
  }

  async function doGenerate() {
    try {
      const sessionLabel = resolveSessionLabel(patternPick, bodyPartPicks)
      const workout = await generateWorkout.mutateAsync({
        profile,
        muscleRecovery: recoveryMap,
        progressiveOverload: overloadData,
        recentExercises,
        selectedTargets: targets,
        dailyNotes: dailyNotes.trim() || undefined,
        sessionLabel,
      })
      onClose()
      navigate('/workout/session', { state: { workout } })
    } catch {
      // error rendered via generateWorkout.error below
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="relative w-full bg-bg-elevated rounded-t-3xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Conflict dialog overlay */}
        <AnimatePresence>
          {showConflict && program && (
            <ConflictDialog
              program={program}
              userLabel={userLabel}
              onStickToProgram={handleStickToProgram}
              onSwitchForToday={handleSwitchForToday}
            />
          )}
        </AnimatePresence>

        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
          <h3 className="text-text-primary text-lg font-bold">Today's Workout</h3>
          <button onClick={onClose} className="p-1 -mr-1">
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-5">
          {/* Suggestion row — shown when history reveals a natural next session */}
          {program && (
            <div className="flex items-center justify-between bg-bg-card border border-border rounded-2xl px-4 py-3">
              <p className="text-text-secondary text-sm">
                Based on your last session,{' '}
                <span className="text-text-primary font-semibold">{program.suggestion}</span> is up next.
              </p>
              <button
                onClick={useProgramSuggestion}
                className="ml-3 flex-shrink-0 text-accent-red text-sm font-semibold active:opacity-70"
              >
                Use This
              </button>
            </div>
          )}

          {/* Movement pattern chips — single select */}
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-widest mb-2">
              Movement pattern
            </p>
            <div className="flex flex-wrap gap-2">
              {MOVEMENT_PATTERNS.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  selected={patternPick === p}
                  onClick={() => selectPattern(p)}
                />
              ))}
            </div>
          </div>

          {/* Body part chips — multi select */}
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-widest mb-2">
              Or pick body parts
            </p>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map((b) => (
                <Chip
                  key={b}
                  label={b}
                  selected={bodyPartPicks.includes(b)}
                  onClick={() => toggleBodyPart(b)}
                />
              ))}
            </div>
          </div>

          {/* Daily notes */}
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-widest mb-2">
              Anything specific?
            </p>
            <textarea
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              placeholder='e.g. "shoulder a bit sore" / "30 min only" / "want to focus on chest"'
              rows={2}
              className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-text-primary text-sm placeholder-text-tertiary resize-none focus:outline-none focus:border-accent-red/60"
            />
          </div>

          {/* Error */}
          {generateWorkout.error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {(generateWorkout.error as Error).message}
            </p>
          )}
        </div>

        {/* Generate button */}
        <div className="px-5 pt-3 pb-8 flex-shrink-0 border-t border-border">
          <button
            onClick={handleGenerateTap}
            disabled={!hasSelection || generateWorkout.isPending}
            className="w-full bg-accent-red text-white font-semibold py-4 rounded-xl disabled:opacity-40 active:opacity-80"
          >
            {generateWorkout.isPending ? 'Generating...' : 'Generate Workout'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
