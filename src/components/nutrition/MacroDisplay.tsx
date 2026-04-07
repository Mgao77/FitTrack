import ProgressBar from '../ui/ProgressBar'

interface MacroDisplayProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  targets?: { calories: number; protein: number; carbs: number; fat: number }
}

export default function MacroDisplay({ calories, protein, carbs, fat, targets }: MacroDisplayProps) {
  const calPct = targets ? (calories / targets.calories) * 100 : 0
  const overCalorie = targets && calories > targets.calories * 1.1

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-text-tertiary text-xs mb-0.5">Calories</p>
          <p className="text-text-primary text-4xl font-bold tabular-nums">
            {Math.round(calories)}
          </p>
        </div>
        {targets && (
          <p className="text-text-secondary text-sm pb-1">/ {targets.calories} target</p>
        )}
      </div>

      {targets && (
        <ProgressBar
          value={calPct}
          color={overCalorie ? 'bg-accent-warning' : 'bg-accent-red'}
        />
      )}

      <div className="grid grid-cols-3 gap-3 pt-1">
        {[
          { label: 'Protein', value: protein, unit: 'g', color: 'bg-accent-blue', target: targets?.protein },
          { label: 'Carbs', value: carbs, unit: 'g', color: 'bg-accent-warning', target: targets?.carbs },
          { label: 'Fat', value: fat, unit: 'g', color: 'bg-accent-success', target: targets?.fat },
        ].map(({ label, value, unit, color, target }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">{label}</span>
              <span className="text-text-primary font-medium">{Math.round(value)}{unit}</span>
            </div>
            {target && <ProgressBar value={(value / target) * 100} color={color} />}
          </div>
        ))}
      </div>
    </div>
  )
}
