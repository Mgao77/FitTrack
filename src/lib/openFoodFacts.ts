import type { FoodSearchResult } from '../types'

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '10',
    fields: 'id,product_name,nutriments',
  })

  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`)
    if (!res.ok) return []
    const data = await res.json()

    return (data.products ?? [])
      .filter((p: any) => p.product_name && p.nutriments)
      .slice(0, 8)
      .map((p: any) => ({
        id: p._id ?? p.id ?? String(Math.random()),
        name: p.product_name,
        calories_per_100g: Number(p.nutriments['energy-kcal_100g'] ?? p.nutriments['energy-kcal'] ?? 0),
        protein_per_100g: Number(p.nutriments.proteins_100g ?? 0),
        carbs_per_100g: Number(p.nutriments.carbohydrates_100g ?? 0),
        fat_per_100g: Number(p.nutriments.fat_100g ?? 0),
        sugar_per_100g: Number(p.nutriments.sugars_100g ?? 0),
      }))
  } catch {
    return []
  }
}

export function calculateMacros(food: FoodSearchResult, grams: number) {
  const factor = grams / 100
  return {
    calories: Math.round(food.calories_per_100g * factor),
    protein: Math.round(food.protein_per_100g * factor * 10) / 10,
    carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
    fat: Math.round(food.fat_per_100g * factor * 10) / 10,
    sugar: Math.round(food.sugar_per_100g * factor * 10) / 10,
  }
}
