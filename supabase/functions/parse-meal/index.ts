import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a precise nutrition calculator. Parse a natural-language meal description into structured macros.

Rules:
- Estimate realistic serving sizes when quantities are vague (e.g. "a chicken breast" = 150g, "an egg" = 60g, "a glass of milk" = 240ml)
- Use standard cooked weights unless stated otherwise
- Return ONLY valid JSON — no explanation, no markdown
- Round all numbers to 1 decimal place
- List any assumptions you made about serving sizes or preparation

Return this exact JSON structure:
{
  "items": [
    {
      "name": "string (food name, title-cased)",
      "grams": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "sugar": number
    }
  ],
  "total": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "sugar": number
  },
  "assumptions": ["string"]
}`

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { sentence } = await req.json()
    if (!sentence || typeof sentence !== 'string') {
      return new Response(JSON.stringify({ error: 'sentence required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    if (!ANTHROPIC_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } })
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
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Parse this meal: ${sentence}` }],
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText)
      return new Response(JSON.stringify({ error: `Claude API error: ${text}` }),
        { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'No JSON in response', raw: text }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate structure
    if (!Array.isArray(parsed.items) || !parsed.total) {
      return new Response(JSON.stringify({ error: 'Unexpected JSON shape', raw: parsed }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify(parsed),
      { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
