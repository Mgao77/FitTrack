// src/hooks/useOfflineQueue.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getQueuedItems, removeQueuedItem } from '../stores/offlineQueue'
import { useAuth } from './useAuth'

export function useOfflineQueue() {
  const { user } = useAuth()
  const syncing = useRef(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const flushQueue = useCallback(async () => {
    if (syncing.current || !user) return
    syncing.current = true

    const items = await getQueuedItems()
    for (const item of items) {
      try {
        if (item.type === 'workout') {
          await supabase.from('workouts').insert(item.data)
        } else if (item.type === 'exercise_log') {
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
        // Keep this item in queue but continue trying remaining items
        continue
      }
    }
    syncing.current = false
  }, [user])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      flushQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (navigator.onLine) flushQueue()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [flushQueue])

  return { flushQueue, isOnline }
}
