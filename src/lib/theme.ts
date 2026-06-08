/** Available colour themes. */
export type Theme = 'rose' | 'forst' | 'lila' | 'ozean' | 'koralle' | 'meer'

/** Theme metadata for the selector UI. */
export interface ThemeMeta {
  id: Theme
  name: string
  /** Four preview swatches: primary, bubble-own, bubble-gfk, bg-page */
  swatches: [string, string, string, string]
}

/** All themes in display order. */
export const THEMES: ThemeMeta[] = [
  { id: 'rose',    name: 'Rose',    swatches: ['#D0747F', '#F3E4D6', '#D8E5D4', '#FBF7F4'] },
  { id: 'forst',   name: 'Forst',   swatches: ['#4A7C59', '#DFF0D8', '#C8E3C0', '#F6F8F4'] },
  { id: 'lila',    name: 'Lila',    swatches: ['#7B6EA8', '#EBE6F6', '#D4E8D4', '#F8F7FB'] },
  { id: 'ozean',   name: 'Ozean',   swatches: ['#6A66A3', '#DDE8F5', '#B3CBB9', '#F4F6FB'] },
  { id: 'koralle', name: 'Koralle', swatches: ['#028090', '#F0F3BD', '#C8EDD8', '#F8FCFC'] },
  { id: 'meer',    name: 'Himmel',  swatches: ['#004A54', '#CFF2F8', '#C8E8CC', '#FDF7EC'] },
]

/** Colour-mode options. 'system' follows the OS `prefers-color-scheme`. */
export type ColorMode = 'light' | 'dark' | 'system'

/** localStorage key for the active preset. */
const THEME_KEY = 'rosenraum_theme'
/** localStorage key for the active colour mode. */
const MODE_KEY = 'rosenraum_mode'

/**
 * Returns the stored theme from localStorage, or 'rose' as default.
 * Safe to call during SSR — returns 'rose' when window is unavailable.
 *
 * @returns The currently stored theme identifier
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'rose'
  return (localStorage.getItem(THEME_KEY) as Theme) ?? 'rose'
}

/**
 * Applies a theme by setting `data-theme` on <html> and persisting to localStorage.
 * 'rose' removes the attribute so `:root` defaults apply.
 *
 * @param theme - The theme identifier to activate
 */
export function applyTheme(theme: Theme): void {
  if (theme === 'rose') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
  localStorage.setItem(THEME_KEY, theme)
}

/**
 * Returns the stored colour mode, or 'system' as default.
 * Safe to call during SSR — returns 'system' when window is unavailable.
 *
 * @returns The currently stored colour-mode identifier
 */
export function getStoredMode(): ColorMode {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(MODE_KEY) as ColorMode) ?? 'system'
}

/**
 * Resolves a colour mode to a concrete 'light' or 'dark', consulting the OS
 * preference when the mode is 'system'.
 *
 * @param mode - The colour mode to resolve.
 * @returns The effective mode, either 'light' or 'dark'.
 */
export function resolveMode(mode: ColorMode): 'light' | 'dark' {
  if (mode !== 'system') return mode
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Applies a colour mode by toggling the `dark` class on <html> and persisting
 * the preference. The `dark` class drives the dark token scope and is
 * shadcn/ui-compatible.
 *
 * @param mode - The colour mode to activate.
 */
export function applyMode(mode: ColorMode): void {
  const effective = resolveMode(mode)
  document.documentElement.classList.toggle('dark', effective === 'dark')
  localStorage.setItem(MODE_KEY, mode)
}
