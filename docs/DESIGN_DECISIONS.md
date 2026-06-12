# Design Decisions

Append-only log of significant design/architecture decisions. One entry per decision. **CI requires a new entry here when `design/tokens.json` changes** (`npm run check:tokens` / the token-doc gate).

Format: Decision · Alternatives considered · Reason · Affected · Date · Rollback.

---

### Token pipeline: JSON source of truth → generated CSS

- **Decision:** All design tokens live in `design/tokens.json`; `scripts/build-tokens.mjs` generates `src/app/tokens.generated.css` (Tailwind `@theme` + shadcn bridge + `:root`/`[data-theme]`/`.dark` scopes).
- **Alternatives:** Style Dictionary (too heavy); hand-maintained CSS (drifts, no single source).
- **Reason:** One editable source, machine-readable, lightweight (~120-line script, no new deps), CI-verifiable.
- **Affected:** `globals.css`, all components reading `--color-*`.
- **Date:** 2026-06-08 · **Rollback:** generated CSS is committed; revert the import in `globals.css`.

### shadcn bridge via var() indirection

- **Decision:** Emit shadcn names (`--background`, `--primary`, …) as `var(--color-*)` once in `:root`; `@theme inline` maps `--color-{name}` → `var(--{name})`.
- **Alternatives:** Rename Rosenraum vars to shadcn names (large invasive churn); duplicate values per theme (drift).
- **Reason:** Drop-in `ui/` primitives inherit the active theme automatically; theme switching works through one indirection. Name collisions (`primary`/`border`/`destructive`) resolve correctly because the explicit `:root` literal wins the cascade (verified).
- **Affected:** future `src/components/ui/*`.
- **Date:** 2026-06-08 · **Rollback:** drop the bridge block from the generator.

### Dark mode keeps brand primary, darkens neutrals

- **Decision:** Dark presets reuse each theme's light primary trio (except `meer`, brightened from near-black for visibility) and only darken backgrounds / lighten text. `.dark` class on `<html>` drives it; mode = light/dark/system.
- **Alternatives:** Pastel-shifted dark primaries (would break the app's existing `text-white` buttons' contrast); full per-component dark rewrite (out of scope, invasive).
- **Reason:** Keeps button contrast consistent with the shipped light design, avoids touching every `text-white` button, ships real dark mode now.
- **Affected:** `tokens.json` (6 dark blocks), `theme.ts`, `ThemeSheet.tsx`, `layout.tsx`.
- **Date:** 2026-06-08 · **Rollback:** remove `dark` blocks from `tokens.json` + the mode control.

### Rosenraum keeps 6 presets under the Expressive family

- **Decision:** The cross-project standard is 3 families (Default/Expressive/Minimal); Rosenraum is grandfathered with its 6 Expressive presets and no family switcher.
- **Alternatives:** Migrate Rosenraum to 3 families (would retire shipped palettes); expose 6 presets under a family selector (UI complexity for a single family).
- **Reason:** User decision — least disruption to the shipped app while the standard governs future projects.
- **Affected:** [THEME_OPTIONS.md](THEME_OPTIONS.md), `ThemeSheet.tsx`.
- **Date:** 2026-06-08 · **Rollback:** n/a (documentation-level).

### Palette tightened to WCAG 2.2 AA

- **Decision:** Darkened `text-muted` per theme/mode (≥4.6:1 on elevated surfaces); set rose `on-primary` to dark text; added per-mode `on-status` (white in light, dark in dark) for status fills; darkened light `success`/`warning`; added a mode-aware `--color-primary-text` (= `primary-dark` light, `primary-light` dark) for primary-coloured links. Replaced hardcoded `text-white` button text with `text-primary-foreground`.
- **Alternatives:** Keep the vibrant palette and treat contrast as advisory (rejected by user); subtle tinted badges instead of solid fills (larger redesign).
- **Reason:** User chose "tighten to AA". Axe now reports **0 serious/critical violations** across 4 screens × light/dark (was 54). Brand hues stay recognizable; only grays/foregrounds shifted.
- **Affected:** `design/tokens.json`, `build-tokens.mjs`, `ui/button.tsx`, `ui/badge.tsx`, `page.tsx`, `create/page.tsx`, `join/*`, `SendBottomSheet.tsx`.
- **Date:** 2026-06-08 · **Rollback:** revert the token values + the `text-primary-foreground` swap.

### GFK dimension colors (static tokens)

- **Decision:** Four static GFK dimension colors — Beobachtung (blue `#3B82F6`), Gefühl (orange `#F97316`), Bedürfnis (green `#22C55E`), Bitte (purple `#A855F7`) — plus four light background variants — added as `primitive.gfk` in tokens.json and emitted as `--color-gfk-*` in `:root`. Not theme-dependent; same across all 6 presets.
- **Alternatives:** Hardcoding in globals.css (bypasses the pipeline and check gates); adding as per-preset semantic tokens (unnecessary complexity — colors don't change with theme).
- **Reason:** GFK Live-Scoring panel in SendBottomSheet needs consistent, accessible dimension colors (≥4.5:1 contrast on white/light backgrounds). Static primitives are the right layer.
- **Affected:** `design/tokens.json`, `scripts/build-tokens.mjs`, `src/app/tokens.generated.css`, `GfkScorePanel.tsx`.
- **Date:** 2026-06-09 · **Rollback:** remove `primitive.gfk` from tokens.json + the `decls(p.gfk, 'color-gfk')` line from build-tokens.mjs.

### `suppressHydrationWarning` on `<html>`

- **Decision:** The FOUC script mutates `<html>` (data-theme + `dark`) before hydration; `<html>` carries `suppressHydrationWarning`.
- **Alternatives:** Render theme server-side (impossible — preference is client-only in localStorage); accept the console error (noisy, masks real issues).
- **Reason:** Canonical Next.js / next-themes pattern; the mismatch is intentional and one level deep.
- **Affected:** `src/app/layout.tsx`.
- **Date:** 2026-06-08 · **Rollback:** remove the attribute (re-introduces the warning).

### Vibrancy-Pass: alle 6 Farbwelten gesättigter

- **Decision:** Primärfarben aller 6 Presets um ~12–18 HSL-Sättigungspunkte erhöht (primary, primary-light, primary-dark, bubble-own light); Hue und Charakter unverändert. Dark-Mode `bubble-own` bleibt ruhig. Alle Paare AA-verifiziert (primary vs. on-primary ≥ 4.5:1; koralle exakt 4.50 — nicht weiter aufhellen).
- **Alternatives:** Door-Opener-Farben übernehmen (vom User explizit ausgeschlossen); nur Glow ohne Farbänderung (zu wenig sichtbar).
- **Reason:** User-Wunsch „alle Farbwelten nur ein wenig mehr vibrant" — inspiriert vom Door-Projekt, aber mit Rosenraum-eigenen Hues.
- **Affected:** `design/tokens.json` (6 Presets, light+dark), `src/lib/theme.ts` (Picker-Swatches), `src/app/tokens.generated.css`.
- **Date:** 2026-06-12 · **Rollback:** Hex-Werte auf Stand vor diesem Eintrag zurücksetzen + `npm run tokens`.

### Theme-aware Glow-Schatten via color-mix

- **Decision:** Drei neue Shadow-Primitives — `glow` (22 %), `glow-strong` (32 %), `glow-focus` (14 %+12 % Ring) — definiert als `color-mix(in srgb, var(--color-primary) N%, transparent)`. Die `var()`-Indirektion löst zur Laufzeit auf, der Glow folgt also automatisch der aktiven Farbwelt und dem Mode. Regel: Glow nie als raw rgba hardcoden.
- **Alternatives:** Pro Preset eigene Glow-Hexes (6×2 Werte zu pflegen); rgba-Hardcodes (CI-Lücke, bricht Themes — genau der ChatInput-Bug der hiermit gefixt wird).
- **Reason:** Door-Projekt-Glow-Ästhetik, aber theme-fähig und CI-konform (color-mix-Präzedenz: admin/page.tsx).
- **Affected:** `design/tokens.json` (`primitive.shadow`), `src/app/globals.css` (send-pulse, glow-primary, icon-spin-hover), `ChatInput.tsx` (Focus-Glow-Fix).
- **Date:** 2026-06-12 · **Rollback:** drei Shadow-Keys entfernen + Klassen aus globals.css.

### Glow-Stärke erhöht + Title-Breathe Animation

- **Decision:** Shadow-tokens `glow` (22%→38%, 12px→18px), `glow-strong` (32%→54%, 20px→28px), `glow-focus` (14%→20%) — damit die Glow-Effekte auf hellem Hintergrund sichtbar sind. Dazu `title-breathe` CSS-Animation auf dem Hero-"Rosenraum"-Titel: 4s sanftes Opacity-Pulsieren mit leichtem text-shadow in Primärfarbe.
- **Alternatives:** Glow auf alten Werten belassen (war unsichtbar); neon-starke Werte (Door-Ästhetik — vom User ausgeschlossen).
- **Reason:** User-Feedback: Glow war auf der Homepage nicht wahrnehmbar. Titel-Puls inspiriert von Door-Opener „welcome"-Animation.
- **Affected:** `design/tokens.json` (`primitive.shadow`), `src/app/globals.css` (title-breathe + reduced-motion), `src/app/page.tsx` (title-breathe Klasse auf h1).
- **Date:** 2026-06-12 · **Rollback:** Shadow-Werte und Klassen zurücksetzen.
