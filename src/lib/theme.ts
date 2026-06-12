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
  { id: 'rose', name: 'Rose', swatches: ['#DC6A79', '#F7E2CF', '#D8E5D4', '#FBF7F4'] },
  { id: 'forst', name: 'Forst', swatches: ['#35824F', '#D8F0D0', '#C8E3C0', '#F6F8F4'] },
  { id: 'lila', name: 'Lila', swatches: ['#6F5BB9', '#E6DEF7', '#D4E8D4', '#F8F7FB'] },
  { id: 'ozean', name: 'Ozean', swatches: ['#5953B2', '#D4E4F7', '#B3CBB9', '#F4F6FB'] },
  { id: 'koralle', name: 'Koralle', swatches: ['#00829B', '#F0F3B4', '#C8EDD8', '#F8FCFC'] },
  { id: 'meer', name: 'Himmel', swatches: ['#005A66', '#C5EFF7', '#C8E8CC', '#FDF7EC'] },
]

/** Colour-mode options. 'system' follows the OS `prefers-color-scheme`. */
export type ColorMode = 'light' | 'dark' | 'system'

/** localStorage key for the active preset. */
const THEME_KEY = 'rosenraum_theme'
/** localStorage key for the active colour mode. */
const MODE_KEY = 'rosenraum_mode'

let transitionTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Adds the `.theme-transition` class to <html> for the duration of a theme or
 * mode switch, so colours and glows crossfade instead of snapping
 * (see globals.css). Repeated calls extend the window.
 */
function withThemeTransition(): void {
  const root = document.documentElement
  root.classList.add('theme-transition')
  clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => root.classList.remove('theme-transition'), 400)
}

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
  withThemeTransition()
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
  withThemeTransition()
  const effective = resolveMode(mode)
  document.documentElement.classList.toggle('dark', effective === 'dark')
  localStorage.setItem(MODE_KEY, mode)
}
