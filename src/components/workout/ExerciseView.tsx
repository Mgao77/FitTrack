import { useState, useEffect } from 'react'
import { invokeFunction } from '../../lib/invokeFunction'
import type { Exercise } from '../../types'

interface ExerciseViewProps {
  exercise: Exercise
  currentSet: number
  onSwap?: () => void
}

export default function ExerciseView({ exercise, currentSet, onSwap }: ExerciseViewProps) {
  const [videoId, setVideoId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchVideo() {
      try {
        const { videoId: vid } = await invokeFunction<{ videoId: string }>('youtube-search', {
          query: exercise.youtubeSearchQuery,
        })
        if (vid && !cancelled) setVideoId(vid)
      } catch {
        // Non-critical — no video just means no demo shown
      }
    }
    fetchVideo()
    return () => { cancelled = true }
  }, [exercise.youtubeSearchQuery])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-text-primary text-2xl font-bold">{exercise.name}</h2>
          <p className="text-text-secondary capitalize text-sm">{exercise.primaryMuscle}</p>
        </div>
        <div className="text-right">
          <p className="text-text-tertiary text-xs">Set</p>
          <p className="text-text-primary text-2xl font-bold tabular-nums">
            {currentSet}
            <span className="text-text-secondary text-base font-normal">/{exercise.sets}</span>
          </p>
        </div>
      </div>

      <div className="flex gap-4 bg-bg-elevated p-4 rounded-2xl">
        <div className="text-center flex-1">
          <p className="text-text-tertiary text-xs mb-1">Target Reps</p>
          <p className="text-text-primary text-3xl font-bold tabular-nums">{exercise.reps}</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center flex-1">
          <p className="text-text-tertiary text-xs mb-1">Weight ({exercise.weightUnit})</p>
          <p className="text-text-primary text-3xl font-bold tabular-nums">{exercise.suggestedWeight}</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center flex-1">
          <p className="text-text-tertiary text-xs mb-1">Rest</p>
          <p className="text-text-primary text-3xl font-bold tabular-nums">{exercise.restSeconds}s</p>
        </div>
      </div>

      {videoId && (
        <div className="rounded-2xl overflow-hidden bg-bg-elevated aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`}
            className="w-full h-full"
            allow="autoplay"
            title={`${exercise.name} form demo`}
          />
        </div>
      )}

      {onSwap && (exercise.alternatives?.length ?? 0) > 0 && (
        <button onClick={onSwap} className="text-accent-blue text-sm w-full text-center py-2">
          Swap exercise →
        </button>
      )}
    </div>
  )
}
