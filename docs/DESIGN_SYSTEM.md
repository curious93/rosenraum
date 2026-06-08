# Design System

The cross-project visual canon. **All values come from [`design/tokens.json`](../design/tokens.json)** → generated into `src/app/tokens.generated.css`. Never hardcode a colour, spacing, radius, font size or duration if a token exists. Project-specific voice/notes live in [`../styles.md`](../styles.md).

> **Rule:** edit tokens in `design/tokens.json`, then run `npm run tokens`. CI fails on hardcoded colours (`npm run check:colors`) and on a stale generated file (`npm run check:tokens`).

## Typography
- Family: `--font-body` (Inter → system-ui fallback).
- Scale: `--size-micro` 12px · `--size-small` 14px · `--size-body` 16px · `--size-heading` 20px · `--size-hero` clamp(1.75–2.5rem).
- Weight: `--weight-normal` 400 · `--weight-medium` 500 · `--weight-bold` 600.
- Leading: `--leading-tight` 1.25 · `--leading-body` 1.5 · `--leading-loose` 1.75.
- Body copy never below 14px. Line length target 60–75 chars (`--max-width-chat`).

## Spacing & layout
- 4px base scale via Tailwind spacing utilities (`p-4` = 16px). Don't invent off-scale values.
- Containers: `--max-width-chat` 680px, `--max-width-sheet` 480px.
- Generous whitespace between groups; tight within a group. Whitespace is the primary grouping tool, not borders.

## Radius
`--radius-sm` 8px · `--radius-md` 12px · `--radius-lg`/`--radius-bubble` 18px · `--radius-bubble-tail` 4px. Rounded, soft — never hard 90° corners on interactive surfaces.

## Shadows
`--shadow-sm` (cards) · `--shadow-md` (modals) · `--shadow-up` (bottom sheets). Soft and low-contrast — elevation is a whisper, not a shout. Never stack heavy shadows.

## Motion
- Easing: `--ease-spring` (entrances), `--ease-smooth` (default), `--ease-in-out` (sheets).
- Duration: `--duration-instant` 100ms · `--duration-fast` 200ms · `--duration-base` 300ms · `--duration-slow` 500ms.
- One thing animates at a time; never parallel flicker. Respect `prefers-reduced-motion` (see [ACCESSIBILITY_CHECKLIST.md](ACCESSIBILITY_CHECKLIST.md)).

## Colour & semantic tokens
Components reference **semantic** vars, never raw hex:
- Surfaces: `--color-bg-page`, `--color-bg-surface`, `--color-bg-elevated`
- Text: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- Brand: `--color-primary`, `--color-primary-light`, `--color-primary-dark`, `--color-on-primary`
- Lines: `--color-border`, `--color-border-subtle`
- Status: `--color-success`, `--color-warning`, `--color-destructive`
- shadcn/ui bridge: `--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, … (mapped from the above — drop-in `ui/` components inherit the theme automatically).

## Light / dark / families
- **3 canonical families** — Default (neutral/professional), Expressive (colourful/brand), Minimal (quiet/low-noise) — each with **light + dark**. This is the cross-project standard; see [THEME_OPTIONS.md](THEME_OPTIONS.md).
- Rosenraum ships 6 Expressive presets (rose/forst/lila/ozean/koralle/meer), each light+dark. Dark is driven by the `.dark` class on `<html>`; mode = light/dark/system, persisted.
- **Dark mode is not an afterthought**: it has dedicated tokens, contrast checks and screenshots. Every new surface must be verified in both modes.

## State patterns (design all four)
- **Empty** — inviting, never technical ("Warte auf deinen Gesprächspartner…" not "0 results"). Offer the next action.
- **Loading** — skeletons that match final layout (`--color-skeleton`), not spinners, for content areas.
- **Error** — plain language, a cause and a recovery action. No codes or stack traces in the UI.
- **Success** — confirm quietly (inline check, toast with undo), then get out of the way.

## Responsive
- Mobile-first. Touch targets ≥ 44×44px. Honour iOS safe areas (`env(safe-area-inset-*)`).
- Bottom sheets on mobile, centred modals ≥1024px (see [COMPONENT_STANDARDS.md](COMPONENT_STANDARDS.md)).

## Accessibility baseline
WCAG 2.2 AA is the floor: visible focus, semantic HTML, labels on every control, contrast on text/UI, announced errors, reduced-motion support. Full gate in [ACCESSIBILITY_CHECKLIST.md](ACCESSIBILITY_CHECKLIST.md).
