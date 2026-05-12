import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RAPIDAPI_KEY = Deno.env.get('EXERCISEDB_KEY') ?? ''
const BASE_URL = 'https://exercisedb.p.rapidapi.com'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { bodyPart, limit = 200 } = await req.json()
    if (!bodyPart) {
      return new Response(JSON.stringify({ error: 'bodyPart required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: 'EXERCISEDB_KEY not configured' }),
        { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const res = await fetch(
      `${BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=0`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
        signal: AbortSignal.timeout(10000),
      }
    )

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return new Response(JSON.stringify({ error: `ExerciseDB error: ${text}` }),
        { status: res.status, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const data = await res.json()
    return new Response(JSON.stringify(data),
      { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
