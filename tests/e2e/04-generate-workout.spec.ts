import { test, expect } from '@playwright/test'
import { requireAuth, openFAB } from './helpers'

/**
 * Flow 4: User can generate a workout
 *
 * Verifies that:
 * - Tapping FAB → "Start Workout" opens the PreWorkoutSheet (always available)
 * - Selecting a movement pattern enables the Generate Workout button
 * - Tapping it navigates to /workout/session with exercises visible
 *
 * Note: "Start Workout" via FAB is always available, unlike the "Choose & Generate"
 * button on Today page which only shows when no workout exists for today.
 */
test('user can generate a workout', async ({ page }) => {
  const authed = await requireAuth(page)
  if (!authed) {
    test.skip(true, 'Not authenticated — set TEST_EMAIL / TEST_PASSWORD or run against an authed session')
    return
  }

  // Open FAB → Start Workout
  await openFAB(page)
  const startWorkoutBtn = page.locator('button', { hasText: /Start Workout|Generating/ })
  await expect(startWorkoutBtn).toBeVisible({ timeout: 5_000 })
  await startWorkoutBtn.click()

  // PreWorkoutSheet slides up
  await expect(page.locator('text=Today\'s Workout')).toBeVisible({ timeout: 5_000 })

  // Pick a movement pattern chip — "Push"
  const pushChip = page.locator('button', { hasText: 'Push' }).first()
  await expect(pushChip).toBeVisible({ timeout: 5_000 })
  await pushChip.click()

  // Generate button is now enabled
  const generateBtn = page.locator('button', { hasText: 'Generate Workout' })
  await expect(generateBtn).toBeEnabled({ timeout: 5_000 })
  await generateBtn.click()

  // AI generation takes up to 30-40s; wait for the session page
  await expect(page).toHaveURL(/\/workout\/session/, { timeout: 45_000 })

  // At least one exercise should be listed (shows "sets" or "reps" in the UI)
  await expect(page.locator('text=/sets|reps/i').first()).toBeVisible({ timeout: 10_000 })
})
