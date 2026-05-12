// src/lib/exerciseDB.ts
// ExerciseDB via Supabase edge function proxy (avoids RapidAPI CORS restriction).
// Cached in localStorage by bodyPart for 24 h (stays within 50 req/day free tier).

import type { MuscleGroup } from '../types'
import { invokeFunction } from './invokeFunction'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const CACHE_PREFIX = 'fittrack_exdb_'
const MIN_ALTERNATIVES = 4

export interface ExerciseDBItem {
  id: string
  name: string
  bodyPart: string
  equipment: string
  gifUrl?: string   // removed from ExerciseDB API — no longer returned
  target: string
  secondaryMuscles: string[]
  instructions: string[]
}

// ── Muscle group → ExerciseDB bodyPart ───────────────────────────────────────
const MUSCLE_TO_BODY_PART: Record<MuscleGroup, string> = {
  chest:      'chest',
  back:       'back',
  shoulders:  'shoulders',
  biceps:     'upper arms',
  triceps:    'upper arms',
  quads:      'upper legs',
  hamstrings: 'upper legs',
  glutes:     'upper legs',
  calves:     'lower legs',
  core:       'waist',
  forearms:   'lower arms',
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function cacheGet(key: string): ExerciseDBItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data as ExerciseDBItem[]
  } catch { return null }
}

function cacheSet(key: string, data: ExerciseDBItem[]): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* quota exceeded — skip */ }
}

// ── Fetch all exercises for a bodyPart (via edge function proxy) ─────────────
async function fetchByBodyPart(bodyPart: string): Promise<ExerciseDBItem[]> {
  const cached = cacheGet(bodyPart)
  if (cached) return cached

  try {
    const data = await invokeFunction<ExerciseDBItem[]>('get-exercises', { bodyPart, limit: 200 })
    if (!Array.isArray(data)) return []
    cacheSet(bodyPart, data)
    return data
  } catch {
    return []
  }
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Public: get alternatives for a muscle group ───────────────────────────────
/**
 * Returns alternatives for the given muscle group.
 * Note: ExerciseDB no longer returns gifUrl — demos are served via YouTube fallback.
 * If the primary bodyPart yields < MIN_ALTERNATIVES, supplements from a related bodyPart.
 */
export async function getAlternatives(
  primaryMuscle: MuscleGroup,
  excludeName: string,
  limit = 12
): Promise<ExerciseDBItem[]> {
  // Normalize to lowercase — AI may return "Chest" instead of "chest"
  const normalized = primaryMuscle?.toLowerCase().trim() as MuscleGroup
  const bodyPart = MUSCLE_TO_BODY_PART[normalized] ?? MUSCLE_TO_BODY_PART[primaryMuscle]
  if (!bodyPart) return []

  const all = await fetchByBodyPart(bodyPart)
  const excludeLower = excludeName.toLowerCase()
  const seen = new Set<string>()

  let results = all
    .filter((e) => {
      const n = e.name.toLowerCase()
      if (n === excludeLower || seen.has(n)) return false
      seen.add(n)
      return true
    })
    .slice(0, limit)
    .map((e) => ({ ...e, name: titleCase(e.name) }))

  // If we don't have enough, supplement from a related bodyPart
  if (results.length < MIN_ALTERNATIVES) {
    const FALLBACK_BODY_PART: Partial<Record<string, string>> = {
      'lower arms': 'upper arms',
      'lower legs': 'upper legs',
      waist: 'upper legs',
    }
    const extra = FALLBACK_BODY_PART[bodyPart]
    if (extra) {
      const more = await fetchByBodyPart(extra)
      for (const e of more) {
        const n = e.name.toLowerCase()
        if (n === excludeLower || seen.has(n)) continue
        seen.add(n)
        results.push({ ...e, name: titleCase(e.name) })
        if (results.length >= MIN_ALTERNATIVES) break
      }
    }
  }

  return results
}

// ── Public: look up GIF URL for a named exercise ──────────────────────────────
/**
 * Finds an exercise by name in the cached bodyPart pool.
 * Used to get animated GIF demos for exercises in the workout plan
 * that aren't in the static free-exercise-db mapping.
 * Returns null if not found (caller falls back to static JPG or emoji).
 */
export async function findExerciseGif(
  exerciseName: string,
  primaryMuscle: MuscleGroup
): Promise<string | null> {
  const normalized = primaryMuscle?.toLowerCase().trim() as MuscleGroup
  const bodyPart = MUSCLE_TO_BODY_PART[normalized] ?? MUSCLE_TO_BODY_PART[primaryMuscle]
  if (!bodyPart) return null

  const all = await fetchByBodyPart(bodyPart)
  const lower = exerciseName.toLowerCase()

  // Exact match first, then partial
  const exact = all.find((e) => e.name.toLowerCase() === lower)
  if (exact?.gifUrl) return exact.gifUrl

  const partial = all.find((e) => e.name.toLowerCase().includes(lower) || lower.includes(e.name.toLowerCase()))
  return partial?.gifUrl ?? null
}
