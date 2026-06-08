import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility gate (WCAG 2.2 AA). Deterministic across platforms — hard CI
 * gate. Fails on any serious/critical violation on the tested screens, in light
 * and dark. See docs/ACCESSIBILITY_CHECKLIST.md.
 */
const PATHS = ['/', '/create', '/join', '/preview']
const MODES = ['light', 'dark'] as const
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

for (const mode of MODES) {
  for (const path of PATHS) {
    test(`a11y ${path} (${mode})`, async ({ page }) => {
      await page.addInitScript((m) => {
        localStorage.setItem('rosenraum_mode', m)
        localStorage.removeItem('rosenraum_theme')
      }, mode)
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      // Let scroll-triggered entrance animations settle before scanning contrast.
      await page.waitForTimeout(1200)

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      const blocking = violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
      const summary = blocking.map(v => `${v.id} (${v.nodes.length})`).join(', ')
      expect(blocking, `serious/critical: ${summary}`).toEqual([])
    })
  }
}
