// src/dev/DevNavigator.tsx
// Floating screen navigator — visible only in dev mode.
// A pill button at the bottom of the screen expands into a screen picker.
import React, { useState } from 'react'
import DevProviders from './DevProviders'
import { mockGeneratedWorkout } from './mockData'

// Lazy page imports so production bundle never includes dev code
import Today from '../pages/Today'
import Plan from '../pages/Plan'
import Progress from '../pages/Progress'
import Profile from '../pages/Profile'
import WorkoutSession from '../pages/WorkoutSession'
import Auth from '../pages/Auth'
import Onboarding from '../pages/Onboarding'
import MealLogger from '../components/nutrition/MealLogger'
import PostWorkoutSummary from '../components/workout/PostWorkoutSummary'

interface ScreenDef {
  label: string
  render: () => React.ReactElement
}

const SCREENS: ScreenDef[] = [
  {
    label: 'Today',
    render: () => (
      <DevProviders>
        <Today />
      </DevProviders>
    ),
  },
  {
    label: 'Today (no workout)',
    render: () => (
      <DevProviders noTodayWorkout>
        <Today />
      </DevProviders>
    ),
  },
  {
    label: 'Plan',
    render: () => (
      <DevProviders>
        <Plan />
      </DevProviders>
    ),
  },
  {
    label: 'Progress',
    render: () => (
      <DevProviders>
        <Progress />
      </DevProviders>
    ),
  },
  {
    label: 'Profile',
    render: () => (
      <DevProviders>
        <Profile />
      </DevProviders>
    ),
  },
  {
    label: 'Workout Preview',
    render: () => (
      <DevProviders
        initialPath="/workout/session"
        routerState={{ workout: mockGeneratedWorkout }}
      >
        <WorkoutSession />
      </DevProviders>
    ),
  },
  {
    label: 'Workout Active',
    render: () => (
      <DevProviders
        initialPath="/workout/session"
        routerState={{ workout: mockGeneratedWorkout, startPhase: 'exercise' }}
      >
        <WorkoutSession />
      </DevProviders>
    ),
  },
  {
    label: 'Post Workout',
    render: () => (
      <DevProviders>
        <PostWorkoutSummary
          workoutName="Upper Power Session"
          totalVolume={12400}
          volumeUnit="kg"
          caloriesBurned={390}
          durationMinutes={62}
          exercisesCompleted={4}
          exercisesTotal={4}
          onSave={() => {}}
          saving={false}
        />
      </DevProviders>
    ),
  },
  {
    label: 'Meal Logger',
    render: () => (
      <DevProviders>
        <MealLogger onClose={() => {}} />
      </DevProviders>
    ),
  },
  {
    label: 'Onboarding',
    render: () => (
      <DevProviders>
        <Onboarding />
      </DevProviders>
    ),
  },
  {
    label: 'Auth',
    render: () => (
      <DevProviders>
        <Auth />
      </DevProviders>
    ),
  },
]

export default function DevNavigator() {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const ActiveScreen = SCREENS[activeIndex].render

  function selectScreen(index: number) {
    setActiveIndex(index)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh' }}>
      {/* Rendered screen */}
      <ActiveScreen />

      {/* Overlay when picker is open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9998,
          }}
        />
      )}

      {/* Screen picker panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(320px, 90vw)',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 16,
            padding: '8px 0',
            zIndex: 9999,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          <p
            style={{
              color: '#888',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '6px 16px 10px',
            }}
          >
            Jump to screen
          </p>
          {SCREENS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => selectScreen(i)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: i === activeIndex ? '#2a2a2a' : 'transparent',
                border: 'none',
                color: i === activeIndex ? '#fff' : '#ccc',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: i === activeIndex ? 600 : 400,
              }}
            >
              {i === activeIndex ? '▶ ' : ''}{s.label}
            </button>
          ))}
        </div>
      )}

      {/* Floating pill button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#111',
          border: '1px solid #333',
          borderRadius: 999,
          padding: '8px 16px',
          cursor: 'pointer',
          zIndex: 10000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            background: '#e53935',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 4,
            padding: '1px 5px',
            letterSpacing: '0.05em',
          }}
        >
          DEV
        </span>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
          {SCREENS[activeIndex].label}
        </span>
        <span style={{ color: '#888', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>
    </div>
  )
}
