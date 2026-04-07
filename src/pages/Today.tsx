import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useWorkout } from '../hooks/useWorkout'
import { useMuscleFatigue } from '../hooks/useMuscleFatigue'
import { useProgressiveOverload } from '../hooks/useProgressiveOverload'
import { useMeals } from '../hooks/useMeals'
import MacroDisplay from '../components/nutrition/MacroDisplay'
import SkeletonCard from '../components/ui/SkeletonCard'
import Card from '../components/ui/Card'
import { calculateCaloriesFromProfile } from '../lib/calories'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Today() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { recoveryMap, isLoading: fatigueLoading } = useMuscleFatigue()
  const { overloadData } = useProgressiveOverload()
  const { generateWorkout, todayWorkout } = useWorkout()
  const { meals, dailyTotals } = useMeals()

  const targets = profile ? calculateCaloriesFromProfile(profile) : null

  async function handleGenerate() {
    try {
      const workout = await generateWorkout.mutateAsync({
        profile,
        muscleRecovery: recoveryMap,
        progressiveOverload: overloadData,
      })
      navigate('/workout/session', { state: { workout } })
    } catch (e) {
      // error shown via generateWorkout.error
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-28">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <p className="text-text-secondary text-sm">{getGreeting()}</p>
        <h1 className="text-text-primary text-3xl font-bold">
          {profile?.display_name ?? 'There'} 👋
        </h1>
        <p className="text-text-tertiary text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="px-5 space-y-4">
        {/* Today's Workout */}
        {fatigueLoading ? (
          <SkeletonCard lines={4} />
        ) : (
          <Card>
            <h2 className="text-text-primary text-lg font-bold mb-2">Today's Workout</h2>

            {todayWorkout ? (
              <div className="flex items-center gap-3 py-2">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-text-primary font-semibold">{todayWorkout.workout_name}</p>
                  <p className="text-text-secondary text-sm">Completed today</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-text-secondary text-sm mb-4">
                  {recoveryMap.filter((m) => m.status === 'recovered').length} muscle groups fully recovered
                </p>
                {generateWorkout.error && (
                  <p className="text-red-400 text-sm mb-3 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                    {(generateWorkout.error as Error).message}
                  </p>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={generateWorkout.isPending}
                  className="w-full bg-accent-red text-white font-semibold py-3 rounded-xl disabled:opacity-50"
                >
                  {generateWorkout.isPending ? 'Generating...' : 'Generate Workout'}
                </button>
              </>
            )}
          </Card>
        )}

        {/* Nutrition Summary */}
        {targets && (
          <Card>
            <h2 className="text-text-primary font-bold mb-4">Nutrition Today</h2>
            <MacroDisplay
              calories={dailyTotals.calories}
              protein={dailyTotals.protein}
              carbs={dailyTotals.carbs}
              fat={dailyTotals.fat}
              targets={{
                calories: targets.calorieTarget,
                protein: targets.proteinTarget,
                carbs: targets.carbTarget,
                fat: targets.fatTarget,
              }}
            />
          </Card>
        )}

        {/* Meals logged today */}
        {meals.length > 0 && (
          <Card>
            <h2 className="text-text-primary font-bold mb-3">Meals Today</h2>
            <div className="space-y-2">
              {meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-text-primary text-sm font-medium capitalize">{meal.meal_type}</p>
                    <p className="text-text-tertiary text-xs">
                      {new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-text-secondary text-sm font-medium tabular-nums">
                    {Math.round(meal.total_calories ?? 0)} cal
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
