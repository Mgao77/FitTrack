import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { foodName } = await req.json()
    if (!foodName) {
      return new Response(JSON.stringify({ error: 'foodName required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: `You are a nutrition database. Given a food name, estimate macros per 100g based on typical preparation.
Return ONLY valid JSON in this exact format, no explanation:
{"calories":number,"protein":number,"carbs":number,"fat":number,"sugar":number}
All values are per 100g. Use realistic estimates based on typical recipes.`,
        messages: [{ role: 'user', content: `Estimate macros per 100g for: ${foodName}` }],
      }),
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI estimation failed' }),
        { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'No JSON in response' }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const macros = JSON.parse(jsonMatch[0])
    return new Response(JSON.stringify({ ...macros, isAiEstimate: true }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
