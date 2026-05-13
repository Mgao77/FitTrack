import { Page, expect } from '@playwright/test'

export const TEST_EMAIL = process.env.TEST_EMAIL || ''
export const TEST_PASSWORD = process.env.TEST_PASSWORD || ''

/**
 * Ensure the user is authenticated.
 * - Navigates to /
 * - If already on the app (tab bar visible) → returns true
 * - If on the login page → fills credentials and logs in
 * - If no credentials available → returns false (caller should skip)
 */
export async function requireAuth(page: Page): Promise<boolean> {
  await page.goto('/')

  // Already on the app shell (tab bar with links is present)
  const tabBarToday = page.locator('a[href="/"]').filter({ hasText: 'Today' })
  const alreadyIn = await tabBarToday.isVisible({ timeout: 4_000 }).catch(() => false)
  if (alreadyIn) return true

  // On the login page — try credentials
  if (!TEST_EMAIL || !TEST_PASSWORD) return false

  const emailInput = page.locator('input[placeholder="Email"]')
  await expect(emailInput).toBeVisible({ timeout: 10_000 })
  await emailInput.fill(TEST_EMAIL)
  await page.locator('input[placeholder="Password"]').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Sign In' }).click()

  await expect(page.locator('a[href="/"]').filter({ hasText: 'Today' })).toBeVisible({ timeout: 20_000 })
  return true
}

/**
 * Open the FAB (+ button at bottom-right) to reveal the action menu.
 * The FAB is only present on shell routes (/,/plan,/progress,/profile).
 */
export async function openFAB(page: Page) {
  // The FAB is a round + button. Using aria role + class as selector.
  const fab = page.locator('button.w-14.h-14').first()
  await expect(fab).toBeVisible({ timeout: 5_000 })
  await fab.click()
}
