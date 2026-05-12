// YouTube Data API v3 — search for exercise demo videos
// Requires VITE_YOUTUBE_API_KEY in .env.local
// Free quota: 10,000 units/day. Each search costs 100 units → 100 searches/day free.
// Results cached in sessionStorage for 30 min to avoid repeat quota spend.

const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ?? ''
const CACHE_PREFIX = 'fittrack_yt_'
const CACHE_TTL_MS = 30 * 60 * 1000  // 30 min

export interface YouTubeResult {
  videoId: string
  title: string
  channelTitle: string
}

function ytCacheGet(key: string): YouTubeResult | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) { sessionStorage.removeItem(CACHE_PREFIX + key); return null }
    return data as YouTubeResult
  } catch { return null }
}

function ytCacheSet(key: string, data: YouTubeResult): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* quota exceeded */ }
}

/**
 * Returns the top YouTube video for an exercise demo query.
 * Returns null if API key is missing or request fails.
 */
export async function searchExerciseVideo(exerciseName: string): Promise<YouTubeResult | null> {
  if (!YT_API_KEY) return null

  const cacheKey = exerciseName.toLowerCase().replace(/\s+/g, '_')
  const cached = ytCacheGet(cacheKey)
  if (cached) return cached

  const query = `${exerciseName} proper form tutorial`
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '1',
    videoCategoryId: '17',  // Sports category — improves relevance
    key: YT_API_KEY,
  })

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const item = data.items?.[0]
    if (!item?.id?.videoId) return null
    const result: YouTubeResult = {
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
    }
    ytCacheSet(cacheKey, result)
    return result
  } catch {
    return null
  }
}

export function getYouTubeSearchUrl(exerciseName: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' proper form tutorial')}`
}
