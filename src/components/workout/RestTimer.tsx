import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface RestTimerProps {
  seconds: number
  onComplete: () => void
  onSkip: () => void
}

export default function RestTimer({ seconds, onComplete, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
          setTimeout(() => onCompleteRef.current(), 50)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const pct = ((seconds - remaining) / seconds) * 100
  const circumference = 2 * Math.PI * 45

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-50">
      <p className="text-text-secondary text-sm uppercase tracking-widest mb-8">Rest</p>

      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="4" />
          <motion.circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="#E53935"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={remaining}
            initial={{ scale: 1.1, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-bold tabular-nums text-text-primary"
          >
            {remaining}
          </motion.span>
        </div>
      </div>

      <button
        onClick={onSkip}
        className="text-text-secondary text-sm py-3 px-8 rounded-xl border border-border"
      >
        Skip rest
      </button>
    </div>
  )
}
