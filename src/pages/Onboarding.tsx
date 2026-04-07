import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StepCard from '../components/onboarding/StepCard'
import OptionCard from '../components/onboarding/OptionCard'
import EquipmentPicker from '../components/onboarding/EquipmentPicker'
import PlanCreationAnimation from '../components/onboarding/PlanCreationAnimation'
import { useProfile } from '../hooks/useProfile'

const TOTAL = 10

export default function Onboarding() {
  const navigate = useNavigate()
  const { updateProfile } = useProfile()

  const [step, setStep] = useState(1)
  const [creating, setCreating] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [unitPref, setUnitPref] = useState<'kg' | 'lbs'>('kg')
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('')
  const [frequency, setFrequency] = useState<number | null>(null)
  const [environment, setEnvironment] = useState('')
  const [equipment, setEquipment] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [preferences, setPreferences] = useState<string[]>([])
  const [injuries, setInjuries] = useState<string[]>([])
  const [dietary, setDietary] = useState<string[]>([])

  const next = () => setStep((s) => s + 1)
  const back = () => setStep((s) => s - 1)

  async function handleFinish() {
    setCreating(true)
    try {
      await updateProfile.mutateAsync({
        display_name: name.trim() || 'Friend',
        age: age ? parseInt(age) : null,
        gender: gender || null,
        height_cm: height ? parseFloat(height) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        unit_preference: unitPref,
        experience_level: experience || null,
        workout_frequency: frequency,
        workout_environment: (environment as 'commercial_gym' | 'home' | 'outdoor' | 'bodyweight') || null,
        equipment,
        goals: goals.length ? { primary: goals[0], secondary: goals.slice(1) } : null,
        injuries,
        dietary_restrictions: dietary,
        sports: [],
        foods_to_avoid: [],
      })
    } catch (e) {
      console.error('Failed to save profile:', e)
    }
  }

  if (creating) {
    return <PlanCreationAnimation onComplete={() => navigate('/')} />
  }

  // Step 1: Welcome
  if (step === 1) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-5">
        <div className="text-7xl mb-6 text-center">⚡</div>
        <h1 className="text-3xl font-bold text-text-primary text-center mb-2">Welcome to FitTrack</h1>
        <p className="text-text-secondary text-center mb-12">Let's build your personalized plan</p>
        <button
          onClick={next}
          className="w-full bg-accent-red text-white font-semibold py-4 rounded-xl text-lg"
        >
          Get Started
        </button>
      </div>
    )
  }

  // Step 2: Name
  if (step === 2) {
    return (
      <StepCard step={2} total={TOTAL} title="What should we call you?" onNext={next} onBack={back} nextDisabled={!name.trim()}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && next()}
          placeholder="Your name"
          autoFocus
          className="w-full bg-bg-elevated text-text-primary px-4 py-4 rounded-xl text-xl
            border border-transparent focus:border-accent-red focus:outline-none placeholder:text-text-tertiary"
        />
      </StepCard>
    )
  }

  // Step 3: Basics
  if (step === 3) {
    return (
      <StepCard step={3} total={TOTAL} title="Tell us about yourself" onNext={next} onBack={back}
        nextDisabled={!age || !gender || !height || !weight}>
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-sm mb-2 block">Gender</label>
            <div className="flex gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)}
                  className={`flex-1 py-3 rounded-xl border capitalize font-medium text-sm transition-colors
                    ${gender === g ? 'border-accent-red bg-accent-red/10 text-accent-red' : 'border-border text-text-primary bg-bg-card'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-text-secondary text-sm mb-2 block">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" min="10" max="100"
              className="w-full bg-bg-elevated text-text-primary px-4 py-3 rounded-xl border border-transparent focus:border-accent-red focus:outline-none placeholder:text-text-tertiary" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-text-secondary text-sm mb-2 block">Height ({unitPref === 'kg' ? 'cm' : 'in'})</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={unitPref === 'kg' ? '175' : '69'}
                className="w-full bg-bg-elevated text-text-primary px-4 py-3 rounded-xl border border-transparent focus:border-accent-red focus:outline-none placeholder:text-text-tertiary" />
            </div>
            <div className="flex-1">
              <label className="text-text-secondary text-sm mb-2 block">Weight ({unitPref})</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={unitPref === 'kg' ? '75' : '165'}
                className="w-full bg-bg-elevated text-text-primary px-4 py-3 rounded-xl border border-transparent focus:border-accent-red focus:outline-none placeholder:text-text-tertiary" />
            </div>
          </div>
          <div className="flex gap-2">
            {(['kg', 'lbs'] as const).map((u) => (
              <button key={u} onClick={() => setUnitPref(u)}
                className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors
                  ${unitPref === u ? 'border-accent-red bg-accent-red/10 text-accent-red' : 'border-border text-text-primary bg-bg-card'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </StepCard>
    )
  }

  // Step 4: Experience
  if (step === 4) {
    const opts = [
      { id: 'beginner', label: 'Beginner', description: 'Less than 1 year training', emoji: '🌱' },
      { id: 'intermediate', label: 'Intermediate', description: '1–3 years training', emoji: '💪' },
      { id: 'advanced', label: 'Advanced', description: '3+ years training', emoji: '🏆' },
    ]
    return (
      <StepCard step={4} total={TOTAL} title="Your fitness level" onNext={next} onBack={back} nextDisabled={!experience}>
        <div className="space-y-3">
          {opts.map((o) => (
            <OptionCard key={o.id} label={o.label} description={o.description} emoji={o.emoji}
              selected={experience === o.id} onToggle={() => setExperience(o.id as 'beginner' | 'intermediate' | 'advanced')} />
          ))}
        </div>
      </StepCard>
    )
  }

  // Step 5: Frequency
  if (step === 5) {
    return (
      <StepCard step={5} total={TOTAL} title="How many days per week?" onNext={next} onBack={back} nextDisabled={!frequency}>
        <div className="flex gap-3 flex-wrap">
          {[2, 3, 4, 5, 6].map((d) => (
            <button key={d} onClick={() => setFrequency(d)}
              className={`w-16 h-16 rounded-2xl border text-2xl font-bold transition-colors
                ${frequency === d ? 'border-accent-red bg-accent-red/10 text-accent-red' : 'border-border bg-bg-card text-text-primary'}`}>
              {d}
            </button>
          ))}
        </div>
      </StepCard>
    )
  }

  // Step 6: Environment + Equipment
  if (step === 6) {
    const envOpts = [
      { id: 'commercial_gym', label: 'Commercial Gym', emoji: '🏋️' },
      { id: 'home', label: 'Home Gym', emoji: '🏠' },
      { id: 'outdoor', label: 'Outdoors', emoji: '🌳' },
      { id: 'bodyweight', label: 'Bodyweight Only', emoji: '🤸' },
    ]
    return (
      <StepCard step={6} total={TOTAL} title="Where do you work out?" subtitle="Then select your equipment"
        onNext={next} onBack={back} nextDisabled={!environment}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {envOpts.map((o) => (
              <button key={o.id} onClick={() => setEnvironment(o.id)}
                className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition-colors
                  ${environment === o.id ? 'border-accent-red bg-accent-red/10' : 'border-border bg-bg-card'}`}>
                <span className="text-2xl">{o.emoji}</span>
                <span className={`text-sm font-medium ${environment === o.id ? 'text-accent-red' : 'text-text-primary'}`}>{o.label}</span>
              </button>
            ))}
          </div>
          {environment && environment !== 'bodyweight' && (
            <>
              <p className="text-text-secondary text-sm font-medium">Select available equipment:</p>
              <EquipmentPicker selected={equipment} onChange={setEquipment} />
            </>
          )}
        </div>
      </StepCard>
    )
  }

  // Step 7: Goals
  if (step === 7) {
    const goalOpts = [
      { id: 'lose_weight', label: 'Lose Weight', emoji: '🔥' },
      { id: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
      { id: 'get_lean', label: 'Get Lean', emoji: '⚡' },
      { id: 'general_fitness', label: 'General Fitness', emoji: '🏃' },
      { id: 'bodybuilding', label: 'Bodybuilding', emoji: '🏆' },
    ]
    return (
      <StepCard step={7} total={TOTAL} title="What's your main goal?" subtitle="First selected = primary goal"
        onNext={next} onBack={back} nextDisabled={goals.length === 0}>
        <div className="space-y-3">
          {goalOpts.map((o) => (
            <OptionCard key={o.id} label={o.label} emoji={o.emoji}
              selected={goals.includes(o.id)}
              onToggle={() => setGoals((prev) =>
                prev.includes(o.id) ? prev.filter((g) => g !== o.id) : [...prev, o.id]
              )} />
          ))}
        </div>
      </StepCard>
    )
  }

  // Step 8: Training preferences
  if (step === 8) {
    const prefOpts = [
      { id: 'strength', label: 'Strength Training', emoji: '🏋️' },
      { id: 'hiit', label: 'HIIT', emoji: '⚡' },
      { id: 'cardio', label: 'Cardio', emoji: '🏃' },
      { id: 'sports', label: 'Sports', emoji: '⚽' },
      { id: 'yoga_flexibility', label: 'Yoga & Flexibility', emoji: '🧘' },
    ]
    return (
      <StepCard step={8} total={TOTAL} title="What types of training?" subtitle="Select all that apply"
        onNext={next} onBack={back} nextDisabled={preferences.length === 0}>
        <div className="space-y-3">
          {prefOpts.map((o) => (
            <OptionCard key={o.id} label={o.label} emoji={o.emoji}
              selected={preferences.includes(o.id)}
              onToggle={() => setPreferences((prev) =>
                prev.includes(o.id) ? prev.filter((p) => p !== o.id) : [...prev, o.id]
              )} />
          ))}
        </div>
      </StepCard>
    )
  }

  // Step 9: Injuries
  if (step === 9) {
    const injuryOpts = [
      { id: 'none', label: 'No injuries' },
      { id: 'shoulder', label: 'Shoulder' },
      { id: 'knee', label: 'Knee' },
      { id: 'lower_back', label: 'Lower Back' },
      { id: 'wrist', label: 'Wrist' },
      { id: 'ankle', label: 'Ankle' },
      { id: 'neck', label: 'Neck' },
      { id: 'hip', label: 'Hip' },
    ]
    return (
      <StepCard step={9} total={TOTAL} title="Any injuries to avoid?" onNext={next} onBack={back}>
        <div className="grid grid-cols-2 gap-3">
          {injuryOpts.map((o) => (
            <button key={o.id} onClick={() => {
              if (o.id === 'none') { setInjuries([]); return }
              setInjuries((prev) => prev.includes(o.id) ? prev.filter((i) => i !== o.id) : [...prev, o.id])
            }}
              className={`py-3 px-4 rounded-xl border text-sm font-medium text-left transition-colors
                ${injuries.includes(o.id) || (o.id === 'none' && injuries.length === 0)
                  ? 'border-accent-red bg-accent-red/10 text-accent-red'
                  : 'border-border bg-bg-card text-text-primary'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </StepCard>
    )
  }

  // Step 10: Dietary restrictions
  if (step === 10) {
    const dietOpts = [
      { id: 'none', label: 'No restrictions' },
      { id: 'halal', label: 'Halal' },
      { id: 'no_pork', label: 'No Pork' },
      { id: 'no_dairy', label: 'No Dairy' },
      { id: 'no_gluten', label: 'No Gluten' },
      { id: 'vegan', label: 'Vegan' },
      { id: 'vegetarian', label: 'Vegetarian' },
    ]
    return (
      <StepCard step={10} total={TOTAL} title="Dietary restrictions?" onNext={handleFinish} onBack={back}
        nextLabel="Create My Plan">
        <div className="grid grid-cols-2 gap-3">
          {dietOpts.map((o) => (
            <button key={o.id} onClick={() => {
              if (o.id === 'none') { setDietary([]); return }
              setDietary((prev) => prev.includes(o.id) ? prev.filter((d) => d !== o.id) : [...prev, o.id])
            }}
              className={`py-3 px-4 rounded-xl border text-sm font-medium text-left transition-colors
                ${dietary.includes(o.id) || (o.id === 'none' && dietary.length === 0)
                  ? 'border-accent-red bg-accent-red/10 text-accent-red'
                  : 'border-border bg-bg-card text-text-primary'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </StepCard>
    )
  }

  return null
}
