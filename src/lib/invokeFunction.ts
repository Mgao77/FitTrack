import { supabase } from './supabase'

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function invokeFunction<T>(
  name: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ANON_KEY

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: signal ?? AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    // Parse JSON error bodies and extract the message field
    try {
      const json = JSON.parse(text)
      throw new Error(json.error ?? json.message ?? text)
    } catch (parseErr) {
      if (parseErr instanceof SyntaxError) throw new Error(text)
      throw parseErr
    }
  }

  return res.json()
}
