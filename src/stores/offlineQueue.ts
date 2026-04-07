// src/stores/offlineQueue.ts
import { openDB, type IDBPDatabase } from 'idb'
import type { OfflineQueueItem } from '../types'

let db: IDBPDatabase | null = null

async function getDB() {
  if (db) return db
  db = await openDB('fittrack-offline', 1, {
    upgrade(db) {
      db.createObjectStore('queue', { keyPath: 'id' })
      db.createObjectStore('workouts', { keyPath: 'id' })
      db.createObjectStore('profile', { keyPath: 'id' })
    },
  })
  return db
}

export async function enqueueItem(item: Omit<OfflineQueueItem, 'id'>): Promise<void> {
  const db = await getDB()
  await db.put('queue', { ...item, id: `${Date.now()}-${Math.random()}` })
}

export async function getQueuedItems(): Promise<OfflineQueueItem[]> {
  const db = await getDB()
  return db.getAll('queue')
}

export async function removeQueuedItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('queue', id)
}

export async function cacheWorkout(id: string, workout: unknown): Promise<void> {
  const db = await getDB()
  await db.put('workouts', { id, workout, cached_at: Date.now() })
}

export async function getCachedWorkout(id: string): Promise<unknown | null> {
  const db = await getDB()
  const entry = await db.get('workouts', id)
  return entry?.workout ?? null
}

export async function cacheProfile(profile: unknown): Promise<void> {
  const db = await getDB()
  await db.put('profile', { id: 'current', data: profile })
}

export async function getCachedProfile(): Promise<unknown | null> {
  const db = await getDB()
  const entry = await db.get('profile', 'current')
  return entry?.data ?? null
}
