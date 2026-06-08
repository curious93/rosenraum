import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config — visual regression + accessibility.
 *
 * - Visual snapshots are platform-specific (the app uses `system-ui` fonts), so
 *   Playwright suffixes them per-OS. CI runs inside the official Playwright Linux
 *   container so its baselines (`*-linux.png`) are stable; local runs produce
 *   `*-darwin.png`. Reduced motion + disabled animations keep frames stable.
 * - a11y specs (axe) are deterministic across platforms and gate CI hard.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  // Include {platform}: snapshots are OS-specific (system-ui fonts differ), so
  // darwin (local) and linux (CI) baselines are stored as separate files.
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{-projectName}{-platform}{ext}',

  use: {
    baseURL: 'http://localhost:3000',
    contextOptions: { reducedMotion: 'reduce' },
    viewport: { width: 1280, height: 800 },
  },

  expect: {
    toHaveScreenshot: {
      // Strict: baselines and checks run on the same platform, so anti-aliasing
      // is consistent. Catches colour/layout drift; tolerates sub-0.1% noise.
      maxDiffPixelRatio: 0.001,
      threshold: 0.2,
      animations: 'disabled',
      caret: 'hide',
    },
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
