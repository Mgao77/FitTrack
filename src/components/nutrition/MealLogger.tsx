import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import FoodSearch from './FoodSearch'
import PhotoCapture from './PhotoCapture'
import { calculateMacros, searchFoods } from '../../lib/openFoodFacts'
import { useMeals } from '../../hooks/useMeals'
import type { ClaudeVisionFoodItem, FoodSearchResult } from '../../types'

interface MealLoggerProps {
  onClose: () => void
}

interface PendingItem {
  food_name: string
  serving_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
  source: 'manual' | 'open_food_facts' | 'claude_vision'
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export default function MealLogger({ onClose }: MealLoggerProps) {
  const { logMeal } = useMeals()
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('lunch')
  const [items, setItems] = useState<PendingItem[]>([])
  const [saving, setSaving] = useState(false)
  const [visionLoading, setVisionLoading] = useState(false)

  function handleAddFood({ food, grams }: { food: FoodSearchResult; grams: number }) {
    const macros = calculateMacros(food, grams)
    setItems((prev) => [
      ...prev,
      {
        food_name: food.name,
        serving_grams: grams,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        sugar: macros.sugar,
        source: 'open_food_facts',
      },
    ])
  }

  async function handleVisionIdentified(visionItems: ClaudeVisionFoodItem[]) {
    setVisionLoading(true)
    for (const vi of visionItems) {
      // Try to look up in Open Food Facts
      const results = await searchFoods(vi.name)
      if (results[0]) {
        const macros = calculateMacros(results[0], vi.estimatedGrams)
        setItems((prev) => [
          ...prev,
          {
            food_name: vi.name,
            serving_grams: vi.estimatedGrams,
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            sugar: macros.sugar,
            source: 'claude_vision',
          },
        ])
      }
      // If no match found, skip (user can add manually)
    }
    setVisionLoading(false)
  }

  const totalCalories = items.reduce((s, i) => s + i.calories, 0)

  async function handleSave() {
    if (items.length === 0) return
    setSaving(true)
    try {
      await logMeal.mutateAsync({ mealType, items })
      onClose()
    } catch (e) {
      console.error('Failed to save meal:', e)
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-bg-primary z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-border flex-shrink-0">
        <h2 className="text-text-primary text-xl font-bold">Log Meal</h2>
        <button onClick={onClose} className="p-2 -mr-2">
          <X size={24} className="text-text-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Meal type */}
        <div className="flex gap-2">
          {MEAL_TYPES.map((t) => (
            <button key={t} onClick={() => setMealType(t)}
              className={`flex-1 py-2 rounded-xl border text-xs font-medium capitalize transition-colors
                ${mealType === t
                  ? 'border-accent-red bg-accent-red/10 text-accent-red'
                  : 'border-border text-text-secondary'
                }`}>
              {t}
            </button>
          ))}
        </div>

        <PhotoCapture onIdentified={handleVisionIdentified} />

        {visionLoading && (
          <p className="text-text-secondary text-sm text-center">Looking up nutrition info...</p>
        )}

        <FoodSearch onAdd={handleAddFood} />

        {/* Logged items */}
        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-text-secondary text-sm font-medium">
              Added items ({Math.round(totalCalories)} cal total)
            </p>
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-bg-card border border-border rounded-xl p-3">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-text-primary text-sm font-medium line-clamp-1">{item.food_name}</p>
                  <p className="text-text-tertiary text-xs">{item.serving_grams}g · {item.calories} cal · {item.protein}g protein</p>
                </div>
                <button
                  onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                  className="text-text-tertiary text-lg leading-none flex-shrink-0 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="px-5 pb-8 pt-4 border-t border-border flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={items.length === 0 || saving}
          className="w-full bg-accent-red text-white font-semibold py-4 rounded-xl disabled:opacity-40"
        >
          {saving ? 'Saving...' : `Save ${mealType} (${items.length} item${items.length !== 1 ? 's' : ''})`}
        </button>
      </div>
    </motion.div>
  )
}
