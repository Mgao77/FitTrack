import type { MuscleRecoveryState } from '../../types'

interface Props {
  recoveryMap: MuscleRecoveryState[]
  onSelectMuscle?: (muscle: string) => void
}

const STATUS_CLASSES = {
  recovered: 'bg-accent-success text-white',
  partial: 'bg-accent-warning text-white',
  fatigued: 'bg-bg-elevated text-text-secondary border border-border',
}

export default function MuscleRecoveryMap({ recoveryMap, onSelectMuscle }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {recoveryMap.map((m) => (
        <button
          key={m.muscle_group}
          onClick={() => onSelectMuscle?.(m.muscle_group)}
          className={`p-3 rounded-xl text-center transition-opacity active:opacity-70
            ${STATUS_CLASSES[m.status]}`}
        >
          <p className="text-xs font-semibold capitalize">{m.muscle_group}</p>
          <p className="text-xs mt-0.5 opacity-80">{m.recovery_pct}%</p>
        </button>
      ))}
    </div>
  )
}
