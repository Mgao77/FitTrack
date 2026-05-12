import { supabase } from './supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

/**
 * Calls a Supabase Edge Function and returns the parsed JSON response.
 * Uses supabase.functions.invoke() so the SDK handles the new sb_publishable_
 * key format and automatic token refresh correctly.
 */
export async function invokeFunction<T>(
  name: string,
  body: unknown,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, {
    body: body as Record<string, unknown>,
  })

  if (error) {
    // FunctionsHttpError carries the raw Response in .context — extract the JSON
    // message the edge function actually returned instead of the generic SDK text.
    if (error instanceof FunctionsHttpError && error.context instanceof Response) {
      try {
        const json = await error.context.clone().json()
        throw new Error(json?.error ?? json?.message ?? error.message)
      } catch (inner) {
        // If json() itself throws (body already consumed, non-JSON body), fall through
        if (inner instanceof SyntaxError) throw new Error(error.message)
        throw inner
      }
    }
    throw new Error(error.message ?? String(error))
  }

  return data as T
}
