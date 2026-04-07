import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '🏠' },
  { to: '/plan', label: 'Plan', icon: '📅' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export default function TabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border z-40
        flex items-center justify-around"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-2 px-4 min-h-[56px] min-w-[72px]
            ${isActive ? 'text-accent-red' : 'text-text-tertiary'}`
          }
        >
          <span className="text-xl">{icon}</span>
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
