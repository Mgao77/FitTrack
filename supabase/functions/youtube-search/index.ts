import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const YOUTUBE_KEY = Deno.env.get('YOUTUBE_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { query } = await req.json()

    const params = new URLSearchParams({
      q: `${query} proper form`,
      type: 'video',
      videoDuration: 'short',
      maxResults: '1',
      order: 'relevance',
      key: YOUTUBE_KEY,
      part: 'id,snippet',
    })

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
    const data = await response.json()
    const videoId = data.items?.[0]?.id?.videoId ?? null

    return new Response(JSON.stringify({ videoId }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ videoId: null }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
