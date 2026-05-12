import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const {
      profile,
      muscleRecovery,
      progressiveOverload,
      recentExercises,
      excludeExercises,
      selectedTargets,
      dailyNotes,
      sessionLabel,
    } = await req.json()

    const recentList: string[] = recentExercises ?? []
    const excludeList: string[] = excludeExercises ?? []
    const avoidList = [...new Set([...recentList, ...excludeList])]

    const systemPrompt = `You are a certified personal trainer generating varied, intelligent workout plans.

EQUIPMENT AVAILABLE: ${JSON.stringify(profile?.equipment ?? [])}
INJURIES TO AVOID: ${JSON.stringify(profile?.injuries ?? [])}

VARIETY RULES (most important):
- Prioritize exercise variety. Do NOT repeat exercises performed in the last 7 days unless the user's available equipment makes alternatives impossible.
- Favor different movement patterns across sessions: horizontal press, incline press, vertical press, horizontal pull, vertical pull, hinge, squat, lunge, carry, isolation.
- Rotate between free weights, cables, machines, and bodyweight variations of the same movement pattern.
- If the user has done barbell work recently, favor dumbbell or cable variations today, and vice versa.

PROGRESSIVE OVERLOAD:
- Prioritize muscle groups with recovery_pct > 80
- Weight suggestions: beginners start at 40-50% of bodyweight-relative benchmarks, advanced can go heavier
- Use progressive overload history to suggest appropriate weight increases

EXERCISE SELECTION:
- Include MET values for each exercise for calorie calculations
- Always include 8 alternative exercises per movement targeting the SAME primary muscle group
- Vary alternatives across equipment: barbell, dumbbell, cable, machine, bodyweight, resistance band
- Example chest alternatives: barbell bench press, incline dumbbell press, cable flyes, pec deck, smith machine press, push-ups, dips, dumbbell flyes
- Alternatives must be compatible with available equipment
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
    "movementPattern": "horizontal_press"|"incline_press"|"vertical_press"|"horizontal_pull"|"vertical_pull"|"hinge"|"squat"|"lunge"|"isolation"|"carry",
    "sets": number,
    "reps": number,
    "suggestedWeight": number,
    "weightUnit": "kg",
    "restSeconds": number,
    "youtubeSearchQuery": "string",
    "alternatives": [{"name": "string", "reason": "string", "movementPattern": "string"}],
    "metValue": number
  }]
}`

    const targetsSection = selectedTargets?.length > 0
      ? `\nTARGET MUSCLE GROUPS FOR TODAY (user selected — you MUST build the workout around these): ${JSON.stringify(selectedTargets)}`
      : ''

    const notesSection = dailyNotes
      ? `\nUSER NOTES: "${dailyNotes}" — adjust exercise selection accordingly. Examples: if they mention a sore body part, avoid loading it directly; if they mention time constraints like "30 min", reduce total exercises to 4-5; if they want to focus on a specific area, add an extra set for it.`
      : ''

    const labelSection = sessionLabel
      ? `\nSESSION NAME: Use "${sessionLabel}" as the workout name.`
      : ''

    const userMessage = `Profile: ${JSON.stringify(profile)}

Muscle Recovery Status: ${JSON.stringify(muscleRecovery)}

Progressive Overload History: ${JSON.stringify(progressiveOverload ?? [])}

${avoidList.length > 0 ? `EXERCISES TO AVOID (performed recently — use alternatives): ${JSON.stringify(avoidList)}` : 'No recent exercise history — this is a fresh start, use your best judgment for variety.'}${targetsSection}${notesSection}${labelSection}`

    // Retry up to 3 times on overload (529) with exponential backoff
    let response: Response | null = null
    let lastErr = ''
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
      }
      response = await fetch('https://api.anthropic.com/v1/messages', {
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
          messages: [{ role: 'user', content: userMessage }],
        }),
      })
      if (response.ok) break
      lastErr = await response.text()
      // Only retry on overload (529) or rate limit (429)
      if (response.status !== 529 && response.status !== 429) break
    }

    if (!response || !response.ok) {
      // User-friendly message for overload
      const isOverload = lastErr.includes('overloaded') || lastErr.includes('529')
      const msg = isOverload
        ? 'The AI is busy right now. Please wait a moment and try again.'
        : `Generation failed: ${lastErr}`
      return new Response(JSON.stringify({ error: msg }),
        { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''

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
