import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  variant = 'primary', size = 'md', className = '', children, ...props
}: ButtonProps) {
  const base = 'font-semibold rounded-xl inline-flex items-center justify-center transition-opacity disabled:opacity-50'
  const variants = {
    primary: 'bg-accent-red text-white active:opacity-80',
    secondary: 'border border-accent-red text-accent-red active:opacity-80',
    ghost: 'text-text-secondary active:opacity-60',
  }
  const sizes = {
    sm: 'py-2 px-4 text-sm min-h-[36px]',
    md: 'py-3 px-6 text-base min-h-[44px]',
    lg: 'py-4 px-8 text-lg min-h-[52px]',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}
