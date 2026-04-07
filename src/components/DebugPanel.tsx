// src/components/DebugPanel.tsx
import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useMuscleFatigue } from '../hooks/useMuscleFatigue'
import { useProgressiveOverload } from '../hooks/useProgressiveOverload'

export default function DebugPanel() {
  const [open, setOpen] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const { profile } = useProfile()
  const { fatigueData, updateFatigue } = useMuscleFatigue()
  const { overloadData } = useProgressiveOverload()

  function handlePressStart() {
    const timer = setTimeout(() => setOpen(true), 1500)
    setLongPressTimer(timer)
  }

  function handlePressEnd() {
    if (longPressTimer) clearTimeout(longPressTimer)
  }

  if (!open) {
    return (
      <button
        onMouseDown={handlePressStart} onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart} onTouchEnd={handlePressEnd}
        className="text-text-tertiary text-xs py-1"
      >
        v1.0.0
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-bg-primary z-[100] overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-text-primary font-bold text-lg">Debug Panel</h1>
        <button onClick={() => setOpen(false)} className="text-text-secondary text-sm">Close</button>
      </div>

      <section className="mb-6">
        <h2 className="text-accent-red font-semibold mb-2 text-sm uppercase">Profile</h2>
        <pre className="bg-bg-elevated p-3 rounded-xl text-text-secondary text-xs overflow-x-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </section>

      <section className="mb-6">
        <h2 className="text-accent-red font-semibold mb-2 text-sm uppercase">Muscle Fatigue</h2>
        <pre className="bg-bg-elevated p-3 rounded-xl text-text-secondary text-xs overflow-x-auto">
          {JSON.stringify(fatigueData, null, 2)}
        </pre>
        <button
          onClick={() => updateFatigue.mutate([])}
          className="mt-2 border border-border text-text-secondary text-xs py-2 px-4 rounded-lg"
        >
          Reset all fatigue
        </button>
      </section>

      <section className="mb-6">
        <h2 className="text-accent-red font-semibold mb-2 text-sm uppercase">Progressive Overload</h2>
        <pre className="bg-bg-elevated p-3 rounded-xl text-text-secondary text-xs overflow-x-auto">
          {JSON.stringify(overloadData, null, 2)}
        </pre>
      </section>
    </div>
  )
}
