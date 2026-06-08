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
  { id: 'meer',    name: 'Meer',    swatches: ['#004A54', '#CFF2F8', '#C8E8CC', '#FDF7EC'] },
]

/**
 * Returns the stored theme from localStorage, or 'rose' as default.
 * Safe to call during SSR — returns 'rose' when window is unavailable.
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'rose'
  return (localStorage.getItem('rosenraum_theme') as Theme) ?? 'rose'
}

/**
 * Applies a theme by setting `data-theme` on <html> and persisting to localStorage.
 * 'rose' removes the attribute so `:root` defaults apply.
 */
export function applyTheme(theme: Theme): void {
  if (theme === 'rose') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
  localStorage.setItem('rosenraum_theme', theme)
}
