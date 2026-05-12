import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Search } from 'lucide-react'
import FoodSearch from './FoodSearch'
import PhotoCapture from './PhotoCapture'
import QuickLogTab from './QuickLogTab'
import { calculateMacros, searchFoods } from '../../lib/openFoodFacts'
import { useMeals } from '../../hooks/useMeals'
import { useStreaks } from '../../hooks/useStreaks'
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
  source: 'manual' | 'open_food_facts' | 'claude_vision' | 'ai_estimate'
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
type LogMode = 'quick' | 'search'

export default function MealLogger({ onClose }: MealLoggerProps) {
  const { logMeal } = useMeals()
  const { incrementStreak } = useStreaks()
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('lunch')
  const [mode, setMode] = useState<LogMode>('quick')
  const [items, setItems] = useState<PendingItem[]>([])
  const [aiSentence, setAiSentence] = useState<string>('')
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
        source: food.isAiEstimate ? 'ai_estimate' : 'open_food_facts',
      },
    ])
  }

  async function handleVisionIdentified(visionItems: ClaudeVisionFoodItem[]) {
    setVisionLoading(true)
    for (const vi of visionItems) {
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
    }
    setVisionLoading(false)
  }

  function handleQuickParsed(
    parsedItems: { name: string; grams: number; calories: number; protein: number; carbs: number; fat: number; sugar: number }[],
    sentence: string
  ) {
    const newItems: PendingItem[] = parsedItems.map((item) => ({
      food_name: item.name,
      serving_grams: item.grams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      sugar: item.sugar,
      source: 'ai_estimate',
    }))
    setItems((prev) => [...prev, ...newItems])
    setAiSentence(sentence)
  }

  const totalCalories = items.reduce((s, i) => s + i.calories, 0)
  const hasAiItems = items.some((i) => i.source === 'ai_estimate')

  async function handleSave() {
    if (items.length === 0) return
    setSaving(true)
    try {
      await logMeal.mutateAsync({
        mealType,
        items,
        notes: hasAiItems ? aiSentence || undefined : undefined,
        isAiEstimate: hasAiItems,
      })
      incrementStreak.mutate('logging')
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

        {/* Mode toggle */}
        <div className="flex bg-bg-elevated rounded-2xl p-1 gap-1">
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === 'quick'
                ? 'bg-bg-primary text-text-primary shadow-sm'
                : 'text-text-tertiary'
            }`}
          >
            <Sparkles size={14} />
            Quick Log (AI)
          </button>
          <button
            onClick={() => setMode('search')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === 'search'
                ? 'bg-bg-primary text-text-primary shadow-sm'
                : 'text-text-tertiary'
            }`}
          >
            <Search size={14} />
            Search Database
          </button>
        </div>

        {/* Mode content */}
        {mode === 'quick' ? (
          <QuickLogTab onParsed={handleQuickParsed} />
        ) : (
          <>
            <PhotoCapture onIdentified={handleVisionIdentified} />
            {visionLoading && (
              <p className="text-text-secondary text-sm text-center">Looking up nutrition info...</p>
            )}
            <FoodSearch onAdd={handleAddFood} />
          </>
        )}

        {/* Logged items */}
        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-text-secondary text-sm font-medium">
              Added items ({Math.round(totalCalories)} cal total)
            </p>
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-bg-card border border-border rounded-xl p-3">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-text-primary text-sm font-medium line-clamp-1">{item.food_name}</p>
                    {item.source === 'ai_estimate' && (
                      <span className="inline-flex items-center gap-0.5 bg-accent-red/10 text-accent-red text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">
                        <Sparkles size={9} />AI
                      </span>
                    )}
                  </div>
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
