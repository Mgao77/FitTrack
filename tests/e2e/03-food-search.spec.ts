import { test, expect } from '@playwright/test'
import { requireAuth, openFAB } from './helpers'

/**
 * Flow 3: User can search the food database and add a result
 *
 * Verifies that:
 * - Opening MealLogger via FAB and switching to the Search tab works
 * - Typing "protein powder" returns results containing "protein"
 */
test('user can search food database for protein powder', async ({ page }) => {
  const authed = await requireAuth(page)
  if (!authed) {
    test.skip(true, 'Not authenticated — set TEST_EMAIL / TEST_PASSWORD or run against an authed session')
    return
  }

  // Open MealLogger via FAB
  await openFAB(page)
  const logMealBtn = page.locator('button', { hasText: 'Log Meal' })
  await expect(logMealBtn).toBeVisible({ timeout: 5_000 })
  await logMealBtn.click()

  // Switch to the Search tab inside MealLogger
  // The tab buttons are "Quick Log (AI)" and "Search"
  const searchTab = page.locator('button', { hasText: /^Search$/ })
  await expect(searchTab).toBeVisible({ timeout: 5_000 })
  await searchTab.click()

  // Food search input appears
  const searchInput = page.locator('input[placeholder="Search food..."]')
  await expect(searchInput).toBeVisible({ timeout: 5_000 })
  await searchInput.fill('protein powder')

  // Submit by pressing Enter
  await searchInput.press('Enter')

  // Results should contain at least one item with "protein"
  await expect(
    page.locator('text=/protein/i').first()
  ).toBeVisible({ timeout: 15_000 })
})
