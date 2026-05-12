// Nutritionix API v2 — best coverage for restaurant items and composed dishes
// Requires VITE_NUTRITIONIX_APP_ID and VITE_NUTRITIONIX_API_KEY in .env.local
// Free tier: 500 req/day
// Docs: https://docx.nutritionix.com/

import type { FoodSearchResult } from '../types'

const APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID ?? ''
const API_KEY = import.meta.env.VITE_NUTRITIONIX_API_KEY ?? ''
const BASE_URL = 'https://trackapi.nutritionix.com/v2'

export async function searchNutritionix(query: string): Promise<FoodSearchResult[]> {
  if (!APP_ID || !API_KEY) return []

  try {
    // Use /search/instant for broad search (returns both branded + common)
    const res = await fetch(`${BASE_URL}/search/instant?query=${encodeURIComponent(query)}&self=false&branded=false&common=true`, {
      headers: {
        'x-app-id': APP_ID,
        'x-app-key': API_KEY,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json()

    const common: any[] = data.common ?? []
    if (common.length === 0) return []

    // Get detailed nutrients for top 5 results via /nutrients endpoint
    const names = common.slice(0, 5).map((f: any) => f.food_name)
    const nutrientRes = await fetch(`${BASE_URL}/nutrients`, {
      method: 'POST',
      headers: {
        'x-app-id': APP_ID,
        'x-app-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queries: names.map((n) => ({ query: `100g ${n}` })) }),
      signal: AbortSignal.timeout(8000),
    })
    if (!nutrientRes.ok) {
      // Fall back to instant results with partial data
      return common.slice(0, 5).map((f: any, i: number) => ({
        id: `nix_${f.tag_id ?? i}`,
        name: f.food_name.replace(/\b\w/g, (c: string) => c.toUpperCase()),
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0,
        sugar_per_100g: 0,
        source: 'nutritionix' as const,
      })).filter((f) => f.calories_per_100g > 0)
    }

    const nutrientData = await nutrientRes.json()
    const foods: any[] = nutrientData.foods ?? []

    return foods
      .filter((f) => f.nf_calories > 0)
      .map((f) => ({
        id: `nix_${f.food_name.toLowerCase().replace(/\s+/g, '_')}`,
        name: f.food_name.replace(/\b\w/g, (c: string) => c.toUpperCase()),
        calories_per_100g: Math.round(f.nf_calories),
        protein_per_100g: Math.round((f.nf_protein ?? 0) * 10) / 10,
        carbs_per_100g: Math.round((f.nf_total_carbohydrate ?? 0) * 10) / 10,
        fat_per_100g: Math.round((f.nf_total_fat ?? 0) * 10) / 10,
        sugar_per_100g: Math.round((f.nf_sugars ?? 0) * 10) / 10,
        source: 'nutritionix' as const,
      }))
  } catch {
    return []
  }
}
