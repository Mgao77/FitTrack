// src/pages/Plan.tsx
import Card from '../components/ui/Card'
import MuscleRecoveryMap from '../components/workout/MuscleRecoveryMap'
import { useMuscleFatigue } from '../hooks/useMuscleFatigue'

export default function Plan() {
  const { recoveryMap, isLoading } = useMuscleFatigue()

  return (
    <div className="min-h-screen bg-bg-primary pb-28">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-text-primary text-3xl font-bold">Plan</h1>
      </div>
      <div className="px-5 space-y-4">
        <Card>
          <h2 className="text-text-primary font-bold mb-3">Muscle Recovery Status</h2>
          <div className="flex gap-3 mb-4 text-xs">
            {[
              { color: 'bg-accent-success', label: 'Recovered (>80%)' },
              { color: 'bg-accent-warning', label: 'Partial (50-80%)' },
              { color: 'bg-bg-elevated', label: 'Fatigued (<50%)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-text-secondary">{label}</span>
              </div>
            ))}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="h-14 bg-bg-elevated rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <MuscleRecoveryMap recoveryMap={recoveryMap} />
          )}
        </Card>
      </div>
    </div>
  )
}
