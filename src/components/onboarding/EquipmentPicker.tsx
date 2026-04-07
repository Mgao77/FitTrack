const EQUIPMENT_OPTIONS = [
  { id: 'barbell', label: 'Barbell', emoji: '🏋️' },
  { id: 'dumbbells', label: 'Dumbbells', emoji: '💪' },
  { id: 'cables', label: 'Cables', emoji: '🔗' },
  { id: 'pullup_bar', label: 'Pull-up Bar', emoji: '🔝' },
  { id: 'bench', label: 'Bench', emoji: '🛋️' },
  { id: 'squat_rack', label: 'Squat Rack', emoji: '🏗️' },
  { id: 'resistance_bands', label: 'Resistance Bands', emoji: '🪢' },
  { id: 'kettlebells', label: 'Kettlebells', emoji: '⚫' },
  { id: 'treadmill', label: 'Treadmill/Bike', emoji: '🚴' },
]

interface EquipmentPickerProps {
  selected: string[]
  onChange: (equipment: string[]) => void
}

export default function EquipmentPicker({ selected, onChange }: EquipmentPickerProps) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((e) => e !== id) : [...selected, id])
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {EQUIPMENT_OPTIONS.map(({ id, label, emoji }) => (
        <button
          key={id}
          onClick={() => toggle(id)}
          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors
            ${selected.includes(id) ? 'border-accent-red bg-accent-red/10' : 'border-border bg-bg-card'}`}
        >
          <span className="text-xl">{emoji}</span>
          <span className={`text-sm font-medium ${selected.includes(id) ? 'text-accent-red' : 'text-text-primary'}`}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
