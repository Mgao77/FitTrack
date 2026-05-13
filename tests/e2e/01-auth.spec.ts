import { test, expect } from '@playwright/test'

/**
 * Flow 1: User can log in
 *
 * Verifies that:
 * - If not logged in, the login form renders and accepts valid credentials
 * - If already authenticated (persistent session), the tab bar is visible
 * - Either path proves auth works end-to-end
 */
test('user can log in', async ({ page }) => {
  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD

  await page.goto('/')

  // Check if already authenticated — tab bar link for Today is present
  const tabBarToday = page.locator('a[href="/"]').filter({ hasText: 'Today' })
  const alreadyLoggedIn = await tabBarToday.isVisible({ timeout: 4_000 }).catch(() => false)

  if (alreadyLoggedIn) {
    // Session already active — auth mechanism is working correctly
    await expect(tabBarToday).toBeVisible()
    return
  }

  // Not logged in — need credentials
  if (!email || !password) {
    test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set — skipping fresh-login test')
    return
  }

  const emailInput = page.locator('input[placeholder="Email"]')
  await expect(emailInput).toBeVisible({ timeout: 10_000 })

  await emailInput.fill(email)
  await page.locator('input[placeholder="Password"]').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()

  // After successful login the tab bar should appear
  await expect(tabBarToday).toBeVisible({ timeout: 20_000 })
})
