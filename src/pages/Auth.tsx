import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-accent-red rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">FitTrack</h1>
          <p className="text-text-secondary mt-1">Your AI-powered fitness companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-bg-elevated text-text-primary px-4 py-3 rounded-xl
              border border-transparent focus:border-accent-red focus:outline-none
              placeholder:text-text-tertiary"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-bg-elevated text-text-primary px-4 py-3 rounded-xl
              border border-transparent focus:border-accent-red focus:outline-none
              placeholder:text-text-tertiary"
          />
          {error && <p className="text-accent-warning text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-red text-white font-semibold py-3 rounded-xl
              active:opacity-80 disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-tertiary text-sm">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-bg-elevated text-text-primary font-semibold py-3 rounded-xl
            border border-border active:opacity-80"
        >
          Continue with Google
        </button>

        <p className="text-center text-text-secondary mt-6 text-sm">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-accent-red font-semibold"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
