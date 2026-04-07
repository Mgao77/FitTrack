import { motion } from 'framer-motion'

interface StepCardProps {
  step: number
  total: number
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
}

export default function StepCard({
  step, total, title, subtitle, children, onNext, onBack, nextLabel = 'Continue', nextDisabled = false
}: StepCardProps) {
  const pct = (step / total) * 100

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col px-5">
      <div className="pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <button onClick={onBack} className="text-text-secondary py-2 pr-2 text-sm">
              ← Back
            </button>
          )}
          <div className="flex-1 h-1 bg-bg-elevated rounded-full">
            <motion.div
              className="h-1 bg-accent-red rounded-full"
              initial={{ width: `${((step - 1) / total) * 100}%` }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-text-tertiary text-xs whitespace-nowrap">{step}/{total}</span>
        </div>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
          {subtitle && <p className="text-text-secondary mt-1 text-sm">{subtitle}</p>}
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <motion.div
          key={`content-${step}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>

      <div className="pb-8 pt-4">
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="w-full bg-accent-red text-white font-semibold py-4 rounded-xl disabled:opacity-40 active:opacity-80"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
