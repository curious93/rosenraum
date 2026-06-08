import { test, expect } from '@playwright/test'

/**
 * Visual regression for stable screens in light + dark.
 *
 * Targets the component gallery (all primitives) and the form pages — screens
 * without scroll-triggered framer-motion entrances, so frames are deterministic.
 * The landing page's whileInView animations are covered by a11y only; see
 * docs/DESIGN_DEBT.md.
 */
const MODES = ['light', 'dark'] as const

for (const mode of MODES) {
  test.describe(mode, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((m) => {
        localStorage.setItem('rosenraum_mode', m)
        localStorage.removeItem('rosenraum_theme')
      }, mode)
    })

    test('component gallery', async ({ page }) => {
      await page.goto('/preview')
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(`preview-${mode}.png`, { fullPage: true })
    })

    test('create room', async ({ page }) => {
      await page.goto('/create')
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(`create-${mode}.png`, { fullPage: true })
    })

    test('join by code', async ({ page }) => {
      await page.goto('/join')
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot(`join-${mode}.png`, { fullPage: true })
    })
  })
}
