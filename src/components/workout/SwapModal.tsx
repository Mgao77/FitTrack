import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Exercise, ExerciseAlternative } from '../../types'
import { getAlternatives, type ExerciseDBItem } from '../../lib/exerciseDB'
import { getExerciseGifUrl } from '../../lib/exerciseMedia'
import { getYouTubeSearchUrl } from '../../lib/youtubeSearch'

interface SwapModalProps {
  exercise: Exercise
  onSwap: (alt: ExerciseAlternative) => void
  onClose: () => void
}

// ── Thumbnail — static JPG → YouTube search button ───────────────────────────
interface ThumbProps {
  name: string
}

function Thumb({ name }: ThumbProps) {
  const staticUrl = getExerciseGifUrl(name)
  const [err, setErr] = useState(false)

  if (staticUrl && !err) {
    return (
      <img
        src={staticUrl}
        alt={name}
        onError={() => setErr(true)}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-bg-elevated"
      />
    )
  }

  // No static image — show YouTube search button as the demo
  return (
    <a
      href={getYouTubeSearchUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="w-14 h-14 rounded-xl flex-shrink-0 bg-red-600/10 border border-red-600/20 flex flex-col items-center justify-center gap-0.5 active:opacity-70"
      aria-label={`Watch ${name} on YouTube`}
    >
      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
      </svg>
      <span className="text-red-500 text-[9px] font-semibold leading-none">DEMO</span>
    </a>
  )
}

// ── Equipment badge ───────────────────────────────────────────────────────────
function EquipmentBadge({ equipment }: { equipment?: string }) {
  if (!equipment || equipment === 'body weight') return null
  return (
    <span className="inline-block bg-bg-elevated text-text-tertiary text-xs px-2 py-0.5 rounded-full capitalize mt-0.5">
      {equipment}
    </span>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function AlternativeSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-bg-card border border-border animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-bg-elevated flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-bg-elevated rounded w-3/4" />
        <div className="h-2 bg-bg-elevated rounded w-1/2" />
      </div>
    </div>
  )
}

export default function SwapModal({ exercise, onSwap, onClose }: SwapModalProps) {
  const [dbAlts, setDbAlts] = useState<ExerciseDBItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAlternatives(exercise.primaryMuscle, exercise.name, 12)
      .then((results) => { if (!cancelled) setDbAlts(results) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [exercise.name, exercise.primaryMuscle])

  // Prefer ExerciseDB results; fall back to the AI-generated alternatives
  // embedded in the workout when ExerciseDB is unavailable or returns nothing.
  const allAlternatives: ExerciseAlternative[] =
    dbAlts.length > 0
      ? dbAlts.map((e) => ({
          name: e.name,
          reason: `${e.target} · ${e.equipment}`,
          gifUrl: e.gifUrl,
          equipment: e.equipment,
        }))
      : (exercise.alternatives ?? [])

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
        className="relative w-full bg-bg-elevated rounded-t-3xl pb-10 safe-area-bottom flex flex-col"
        style={{ maxHeight: '80vh' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />

        <div className="px-5 flex-shrink-0">
          <p className="text-text-tertiary text-xs uppercase tracking-widest mb-1">Swapping</p>
          <h3 className="text-text-primary text-xl font-bold">{exercise.name}</h3>
          <p className="text-text-secondary text-sm capitalize">
            {exercise.primaryMuscle} · {exercise.sets} sets × {exercise.reps} reps
          </p>
        </div>

        <div className="px-5 mt-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-secondary text-xs uppercase tracking-widest">Alternatives</p>
            {!loading && (
              <p className="text-text-tertiary text-xs">{allAlternatives.length} options</p>
            )}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-2">
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => <AlternativeSkeleton key={i} />)}
            </>
          ) : allAlternatives.length > 0 ? (
            allAlternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => onSwap(alt)}
                className="w-full bg-bg-card border border-border rounded-2xl p-3 text-left active:opacity-70 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <Thumb name={alt.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-semibold text-sm leading-snug">
                      {alt.name}
                    </p>
                    <p className="text-text-secondary text-xs mt-0.5 capitalize leading-snug">
                      {alt.reason}
                    </p>
                    <EquipmentBadge equipment={alt.equipment} />
                  </div>
                  <span className="text-text-tertiary text-lg flex-shrink-0">→</span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-text-tertiary text-sm text-center py-8">
              No alternatives found for this exercise.
            </p>
          )}
        </div>

        <div className="px-5 pt-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 text-text-secondary text-sm font-medium"
          >
            Keep current exercise
          </button>
        </div>
      </motion.div>
    </div>
  )
}
