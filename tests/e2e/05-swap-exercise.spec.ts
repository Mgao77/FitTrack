import { test, expect } from '@playwright/test'
import { requireAuth, openFAB } from './helpers'

/**
 * Flow 5: User can swap an exercise and see multiple alternatives
 *
 * Verifies that:
 * - A workout can be generated via FAB → Start Workout → Generate
 * - On the WorkoutSession page the ··· button is tappable on an exercise
 * - "Swap exercise" option appears in the dropdown
 * - SwapModal opens and shows at least 2 alternatives
 */
test('user can swap an exercise and see alternatives', async ({ page }) => {
  const authed = await requireAuth(page)
  if (!authed) {
    test.skip(true, 'Not authenticated — set TEST_EMAIL / TEST_PASSWORD or run against an authed session')
    return
  }

  // ── Step 1: Generate a workout via FAB ────────────────────────────────────
  await openFAB(page)
  const startWorkoutBtn = page.locator('button', { hasText: /Start Workout|Generating/ })
  await expect(startWorkoutBtn).toBeVisible({ timeout: 5_000 })
  await startWorkoutBtn.click()

  await expect(page.locator('text=Today\'s Workout')).toBeVisible({ timeout: 5_000 })

  const pushChip = page.locator('button', { hasText: 'Push' }).first()
  await expect(pushChip).toBeVisible()
  await pushChip.click()

  const generateBtn = page.locator('button', { hasText: 'Generate Workout' })
  await expect(generateBtn).toBeEnabled()
  await generateBtn.click()

  await expect(page).toHaveURL(/\/workout\/session/, { timeout: 45_000 })
  await expect(page.locator('text=/sets|reps/i').first()).toBeVisible({ timeout: 10_000 })

  // ── Step 2: Tap ··· on the first exercise ────────────────────────────────
  const optionsBtn = page.locator('button', { hasText: '···' }).first()
  await expect(optionsBtn).toBeVisible({ timeout: 5_000 })
  await optionsBtn.click()

  // Dropdown shows "Swap exercise" option
  const swapOption = page.locator('button', { hasText: 'Swap exercise' })
  await expect(swapOption).toBeVisible({ timeout: 5_000 })
  await swapOption.click()

  // ── Step 3: SwapModal shows at least 2 alternatives ──────────────────────
  // Modal should contain alternative exercise names
  await expect(
    page.locator('text=/alternative|swap|replace/i').first()
  ).toBeVisible({ timeout: 5_000 })

  // Alternatives are button rows — count those visible in the modal
  // They contain exercise names. Look for any of the typical alternatives.
  const altRows = page.locator('button').filter({
    hasText: /Press|Pull|Row|Fly|Curl|Extension|Squat|Lunge|Dip|Raise|Push|Bench|Cable|Dumbbell|Machine/i
  })
  await expect(altRows.first()).toBeVisible({ timeout: 5_000 })
  const count = await altRows.count()
  expect(count).toBeGreaterThanOrEqual(2)
})
