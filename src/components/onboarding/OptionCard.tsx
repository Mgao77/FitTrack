import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface OptionCardProps {
  label: string
  description?: string
  selected: boolean
  onToggle: () => void
  emoji?: string
}

export default function OptionCard({ label, description, selected, onToggle, emoji }: OptionCardProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors
        ${selected ? 'border-accent-red bg-accent-red/10' : 'border-border bg-bg-card'}`}
    >
      {emoji && <span className="text-2xl flex-shrink-0">{emoji}</span>}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${selected ? 'text-accent-red' : 'text-text-primary'}`}>{label}</p>
        {description && <p className="text-text-secondary text-sm mt-0.5">{description}</p>}
      </div>
      {selected && <Check size={20} className="text-accent-red flex-shrink-0" />}
    </motion.button>
  )
}
