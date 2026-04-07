interface ProgressBarProps {
  value: number
  color?: string
  height?: string
  label?: string
}

export default function ProgressBar({
  value, color = 'bg-accent-red', height = 'h-2', label
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-bg-elevated rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
