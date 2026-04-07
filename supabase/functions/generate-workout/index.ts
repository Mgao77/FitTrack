import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { profile, muscleRecovery, progressiveOverload } = await req.json()

    const systemPrompt = `You are a certified personal trainer generating workout plans.
Given the user's profile, generate a single workout session as valid JSON.

Rules:
- ONLY use exercises possible with the user's available equipment: ${JSON.stringify(profile?.equipment ?? [])}
- NEVER include exercises that load injured body parts: ${JSON.stringify(profile?.injuries ?? [])}
- Prioritize muscle groups with recovery_pct > 80
- Weight suggestions: beginners start at 40-50% of bodyweight-relative benchmarks, advanced can go heavier
- Include MET values for each exercise for calorie calculations
- Always include 2-3 alternative exercises per movement
- Return ONLY valid JSON. No explanation, no markdown, no code blocks.

Required JSON schema:
{
  "name": "string",
  "targetMuscleGroups": ["string"],
  "estimatedDuration": number,
  "estimatedCaloriesBurned": number,
  "exercises": [{
    "name": "string",
    "primaryMuscle": "string",
    "secondaryMuscles": ["string"],
    "sets": number,
    "reps": number,
    "suggestedWeight": number,
    "weightUnit": "kg",
    "restSeconds": number,
    "youtubeSearchQuery": "string",
    "alternatives": [{"name": "string", "reason": "string"}],
    "metValue": number
  }]
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Profile: ${JSON.stringify(profile)}\n\nMuscle Recovery: ${JSON.stringify(muscleRecovery)}\n\nProgressive Overload History: ${JSON.stringify(progressiveOverload ?? [])}`,
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: `Anthropic API error: ${err}` }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''

    // Extract JSON — Claude sometimes adds markdown fences
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'No JSON in response', raw: text }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const workout = JSON.parse(jsonMatch[0])
    return new Response(JSON.stringify(workout),
      { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
