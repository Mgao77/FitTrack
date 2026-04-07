// src/pages/Profile.tsx
import Card from '../components/ui/Card'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import DebugPanel from '../components/DebugPanel'

export default function Profile() {
  const { profile } = useProfile()
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-bg-primary pb-28">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-text-primary text-3xl font-bold">Profile</h1>
      </div>
      <div className="px-5 space-y-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent-red rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
              {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-text-primary font-bold text-lg">{profile?.display_name}</p>
              <p className="text-text-secondary text-sm capitalize">{profile?.experience_level} · {profile?.goals?.primary?.replace('_', ' ')}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-text-primary font-bold mb-3">Stats</h2>
          <div className="space-y-2">
            {[
              { label: 'Weight', value: profile?.weight_kg ? `${profile.weight_kg} kg` : '—' },
              { label: 'Height', value: profile?.height_cm ? `${profile.height_cm} cm` : '—' },
              { label: 'Training Days/Week', value: profile?.workout_frequency ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-text-secondary text-sm">{label}</span>
                <span className="text-text-primary text-sm font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </Card>

        <button
          onClick={signOut}
          className="w-full border border-border text-text-secondary py-3 rounded-xl font-medium"
        >
          Sign Out
        </button>

        <div className="flex justify-center pt-2">
          <DebugPanel />
        </div>
      </div>
    </div>
  )
}
