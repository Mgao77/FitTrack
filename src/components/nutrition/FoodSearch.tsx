import { useState } from 'react'
import { Search } from 'lucide-react'
import { searchFoods, calculateMacros } from '../../lib/openFoodFacts'
import type { FoodSearchResult } from '../../types'

interface AddedItem {
  food: FoodSearchResult
  grams: number
}

interface FoodSearchProps {
  onAdd: (item: AddedItem) => void
}

export default function FoodSearch({ onAdd }: FoodSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<FoodSearchResult | null>(null)
  const [grams, setGrams] = useState(100)

  async function search() {
    if (!query.trim()) return
    setLoading(true)
    setResults([])
    const res = await searchFoods(query)
    setResults(res)
    setLoading(false)
  }

  const macros = selected ? calculateMacros(selected, grams) : null

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search food..."
          className="flex-1 bg-bg-elevated text-text-primary px-4 py-3 rounded-xl
            border border-transparent focus:border-accent-red focus:outline-none
            placeholder:text-text-tertiary"
        />
        <button
          onClick={search}
          disabled={loading}
          className="w-12 h-12 bg-accent-red rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-60"
        >
          <Search size={18} className="text-white" />
        </button>
      </div>

      {loading && (
        <p className="text-text-secondary text-sm text-center py-2">Searching...</p>
      )}

      {!selected && results.map((r) => (
        <button
          key={r.id}
          onClick={() => { setSelected(r); setGrams(100) }}
          className="w-full bg-bg-card border border-border rounded-xl p-3 text-left active:opacity-70"
        >
          <p className="text-text-primary text-sm font-medium line-clamp-1">{r.name}</p>
          <p className="text-text-secondary text-xs mt-0.5">
            {Math.round(r.calories_per_100g)} cal · {Math.round(r.protein_per_100g)}g protein / 100g
          </p>
        </button>
      ))}

      {results.length === 0 && !loading && query && (
        <p className="text-text-tertiary text-sm text-center py-2">No results found</p>
      )}

      {selected && macros && (
        <div className="bg-bg-card border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-start justify-between">
            <p className="text-text-primary font-semibold text-sm flex-1 pr-4 line-clamp-2">
              {selected.name}
            </p>
            <button
              onClick={() => { setSelected(null); setResults([]) }}
              className="text-text-tertiary text-lg leading-none flex-shrink-0"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-text-secondary text-sm flex-shrink-0">Serving (g)</label>
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setGrams((g) => Math.max(10, g - 10))}
                className="w-9 h-9 bg-bg-elevated rounded-lg text-text-primary font-bold"
              >-</button>
              <span className="flex-1 text-center text-text-primary font-bold tabular-nums">{grams}</span>
              <button
                onClick={() => setGrams((g) => g + 10)}
                className="w-9 h-9 bg-bg-elevated rounded-lg text-text-primary font-bold"
              >+</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Cal', value: macros.calories },
              { label: 'Prot', value: `${macros.protein}g` },
              { label: 'Carb', value: `${macros.carbs}g` },
              { label: 'Fat', value: `${macros.fat}g` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-bg-elevated rounded-xl p-2">
                <p className="text-text-primary text-sm font-bold tabular-nums">{value}</p>
                <p className="text-text-tertiary text-xs">{label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              onAdd({ food: selected, grams })
              setSelected(null)
              setQuery('')
              setResults([])
            }}
            className="w-full bg-accent-red text-white font-semibold py-3 rounded-xl"
          >
            Add to Meal
          </button>
        </div>
      )}
    </div>
  )
}
