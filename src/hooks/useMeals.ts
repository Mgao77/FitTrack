import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { enqueueItem } from '../stores/offlineQueue'
import { useAuth } from './useAuth'
import type { Meal, MealItem } from '../types'

export type MealWithItems = Meal & { meal_items: MealItem[] }

export function useMeals(date?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  // Use local date for day boundary so non-UTC users see their own day's meals
  const localDate = date ?? new Date().toLocaleDateString('sv') // 'sv' locale gives YYYY-MM-DD
  const startOfDay = new Date(`${localDate}T00:00:00`).toISOString()
  const endOfDay = new Date(`${localDate}T23:59:59`).toISOString()

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['meals', user?.id, localDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*, meal_items(*)')
        .eq('user_id', user!.id)
        .gte('logged_at', startOfDay)
        .lte('logged_at', endOfDay)
        .order('logged_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as MealWithItems[]
    },
    enabled: !!user,
  })

  const logMeal = useMutation({
    mutationFn: async ({
      mealType,
      items,
      photoUrl,
      notes,
      isAiEstimate,
    }: {
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
      items: {
        food_name: string
        serving_grams: number
        calories: number
        protein: number
        carbs: number
        fat: number
        sugar: number
        source: 'manual' | 'open_food_facts' | 'claude_vision' | 'ai_estimate'
      }[]
      photoUrl?: string
      notes?: string
      isAiEstimate?: boolean
    }) => {
      const totals = items.reduce(
        (acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fat: acc.fat + item.fat,
          sugar: acc.sugar + item.sugar,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
      )

      // Pre-generate meal ID so we can queue items with a stable FK if offline
      const mealId = crypto.randomUUID()
      const mealRow = {
        id: mealId,
        user_id: user!.id,
        meal_type: mealType,
        photo_url: photoUrl ?? null,
        notes: notes ?? null,
        is_ai_estimate: isAiEstimate ?? false,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat,
        total_sugar: totals.sugar,
      }

      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .insert(mealRow)
        .select()
        .single()

      if (mealError) {
        // Offline fallback — queue for sync when back online
        await enqueueItem({ type: 'meal', data: mealRow, created_at: Date.now() })
        const itemRows = items.map((item) => ({ ...item, meal_id: mealId }))
        for (const row of itemRows) {
          await enqueueItem({ type: 'meal_item', data: row, created_at: Date.now() })
        }
        return null
      }

      const mealItems = items.map((item) => ({ ...item, meal_id: meal.id }))
      const { error: itemsError } = await supabase.from('meal_items').insert(mealItems)
      if (itemsError) throw itemsError

      return meal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', user?.id] })
    },
  })

  const dailyTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.total_calories ?? 0),
      protein: acc.protein + (meal.total_protein ?? 0),
      carbs: acc.carbs + (meal.total_carbs ?? 0),
      fat: acc.fat + (meal.total_fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return { meals, isLoading, logMeal, dailyTotals }
}
