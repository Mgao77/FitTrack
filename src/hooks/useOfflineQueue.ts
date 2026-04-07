// src/hooks/useOfflineQueue.ts
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getQueuedItems, removeQueuedItem } from '../stores/offlineQueue'
import { useAuth } from './useAuth'

export function useOfflineQueue() {
  const { user } = useAuth()
  const syncing = useRef(false)

  async function flushQueue() {
    if (syncing.current || !user) return
    syncing.current = true

    const items = await getQueuedItems()
    for (const item of items) {
      try {
        if (item.type === 'exercise_log') {
          await supabase.from('exercise_logs').insert(item.data)
        } else if (item.type === 'meal') {
          await supabase.from('meals').insert(item.data)
        } else if (item.type === 'meal_item') {
          await supabase.from('meal_items').insert(item.data)
        } else if (item.type === 'weight_entry') {
          await supabase.from('weight_log').upsert(item.data)
        }
        await removeQueuedItem(item.id)
      } catch {
        // Keep in queue, try again next time
        break
      }
    }
    syncing.current = false
  }

  useEffect(() => {
    window.addEventListener('online', flushQueue)
    if (navigator.onLine) flushQueue()
    return () => window.removeEventListener('online', flushQueue)
  }, [user])

  return { flushQueue, isOnline: navigator.onLine }
}
