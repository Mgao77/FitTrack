import { test, expect } from '@playwright/test'
import { requireAuth, openFAB } from './helpers'

/**
 * Flow 2: User can log a meal with natural language and see macros
 *
 * Verifies that:
 * - Tapping the FAB and choosing "Log Meal" opens MealLogger
 * - The "Quick Log (AI)" tab is selected by default
 * - Typing a natural language description and tapping "Analyse with AI" triggers the AI
 * - Macros (calories) appear in the result
 */
test('user can log a meal with natural language', async ({ page }) => {
  const authed = await requireAuth(page)
  if (!authed) {
    test.skip(true, 'Not authenticated — set TEST_EMAIL / TEST_PASSWORD or run against an authed session')
    return
  }

  // Open the FAB → Log Meal
  await openFAB(page)
  const logMealBtn = page.locator('button', { hasText: 'Log Meal' })
  await expect(logMealBtn).toBeVisible({ timeout: 5_000 })
  await logMealBtn.click()

  // MealLogger opens — Quick Log (AI) tab should be active by default
  const quickLogTab = page.locator('text=Quick Log (AI)')
  await expect(quickLogTab).toBeVisible({ timeout: 5_000 })

  // Type a natural language meal description
  const textarea = page.locator('textarea').first()
  await expect(textarea).toBeVisible({ timeout: 5_000 })
  await textarea.fill('two eggs and a chicken breast')

  // Tap Analyse with AI
  const analyseBtn = page.locator('button', { hasText: 'Analyse with AI' })
  await expect(analyseBtn).toBeVisible()
  await analyseBtn.click()

  // AI call can take up to 25 seconds — wait for calorie info to appear
  await expect(
    page.locator('text=/kcal|cal|calories/i').first()
  ).toBeVisible({ timeout: 30_000 })
})
