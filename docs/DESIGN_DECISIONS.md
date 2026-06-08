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

### `suppressHydrationWarning` on `<html>`
- **Decision:** The FOUC script mutates `<html>` (data-theme + `dark`) before hydration; `<html>` carries `suppressHydrationWarning`.
- **Alternatives:** Render theme server-side (impossible — preference is client-only in localStorage); accept the console error (noisy, masks real issues).
- **Reason:** Canonical Next.js / next-themes pattern; the mismatch is intentional and one level deep.
- **Affected:** `src/app/layout.tsx`.
- **Date:** 2026-06-08 · **Rollback:** remove the attribute (re-introduces the warning).
