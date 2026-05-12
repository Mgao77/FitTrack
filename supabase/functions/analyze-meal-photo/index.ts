import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { imageBase64, mediaType } = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `Analyze this meal photo. Your job is to identify WHAT THE PERSON IS EATING as a complete meal.

Return structured output as strict JSON (no markdown, no commentary):
{
  "primary_items": [{"name": "string", "estimatedGrams": number, "confidence": "high"|"medium"|"low"}],
  "accompaniments": [{"name": "string", "estimatedGrams": number, "confidence": "high"|"medium"|"low"}]
}

Rules:
1. ALWAYS identify the primary dish first. A plate of pancakes with butter on top has primary_items=[{name:"Pancakes", ...}], accompaniments=[{name:"Butter", ...}] — NOT the reverse.
2. Be specific: "Grilled Chicken Breast" not "Chicken". "Brown Rice" not "Rice". "Whole Wheat Pasta" not "Pasta".
3. Estimate portion size in grams for each item based on what is visible.
4. Never return only toppings/sauces/garnishes as primary_items — the main food is always primary.
5. If you see a plate of food with a condiment, sauce, or topping — the plate contents are primary, the condiment is accompaniment.
6. Output strict JSON only.`,
        messages: [{
          role: 'user',
          content: [{
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: imageBase64,
            },
          }],
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: `Anthropic API error: ${err}` }),
        { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? '{}'

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify([]),
        { headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Flatten primary_items + accompaniments into ClaudeVisionFoodItem[]
    // Primary items first, then accompaniments
    const primaryItems = (parsed.primary_items ?? []) as Array<{ name: string; estimatedGrams: number; confidence: string }>
    const accompaniments = (parsed.accompaniments ?? []) as Array<{ name: string; estimatedGrams: number; confidence: string }>

    const items = [
      ...primaryItems.map((item) => ({
        name: item.name,
        estimatedGrams: item.estimatedGrams ?? 100,
        confidence: (item.confidence as 'high' | 'medium' | 'low') ?? 'medium',
      })),
      ...accompaniments.map((item) => ({
        name: item.name,
        estimatedGrams: item.estimatedGrams ?? 20,
        confidence: (item.confidence as 'high' | 'medium' | 'low') ?? 'medium',
      })),
    ]

    return new Response(JSON.stringify(items),
      { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify([]),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
