import { test, expect } from '@playwright/test'
import { requireAuth } from './helpers'

/**
 * Flow 6: User profile data persists across sessions
 *
 * Verifies that:
 * - The Profile tab in the tab bar navigates to /profile
 * - The user's display name is rendered
 * - A full page reload restores the session and the name is still there
 */
test('user profile data persists across sessions', async ({ page }) => {
  const authed = await requireAuth(page)
  if (!authed) {
    test.skip(true, 'Not authenticated — set TEST_EMAIL / TEST_PASSWORD or run against an authed session')
    return
  }

  // Click the Profile tab in the TabBar
  const profileTab = page.locator('a[href="/profile"]').filter({ hasText: 'Profile' })
  await expect(profileTab).toBeVisible({ timeout: 10_000 })
  await profileTab.click()
  await expect(page).toHaveURL(/\/profile/, { timeout: 10_000 })

  // Profile page shows the user's display name in a bold paragraph
  const displayNameEl = page.locator('p.font-bold').first()
  await expect(displayNameEl).toBeVisible({ timeout: 10_000 })
  const displayName = await displayNameEl.textContent()
  expect(displayName?.trim().length).toBeGreaterThan(0)

  // ── Simulate a new browser session: full page reload ──────────────────────
  await page.reload()
  await page.waitForLoadState('networkidle')

  // Supabase should restore the session from storage — tab bar should re-appear
  const profileTabAfterReload = page.locator('a[href="/profile"]').filter({ hasText: 'Profile' })
  await expect(profileTabAfterReload).toBeVisible({ timeout: 15_000 })
  await profileTabAfterReload.click()
  await expect(page).toHaveURL(/\/profile/, { timeout: 10_000 })

  // Same display name must still be shown
  const displayNameAfterReload = page.locator('p.font-bold').first()
  await expect(displayNameAfterReload).toBeVisible({ timeout: 10_000 })
  const nameAfter = await displayNameAfterReload.textContent()
  expect(nameAfter).toBe(displayName)
})
