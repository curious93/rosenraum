# Theme Options

The mandatory theme standard for every project. Read this for any theme, colour, icon, dark-mode, settings or branding task.

## The 3 canonical families

Every project provides **exactly three** selectable visual theme families in settings:

| Family | Character | Best for |
|---|---|---|
| **Default** | Balanced, neutral, professional | Business apps — the safe baseline |
| **Expressive** | Colourful, modern, brand-driven | Consumer / creative apps |
| **Minimal** | Reduced contrast, quiet, low visual noise | Productivity, admin, dashboards |

Each family defines, for **both light and dark**:
- primary / secondary / accent colour families
- neutral scale (backgrounds, surfaces, borders, text)
- success / warning / destructive (error)
- background / surface / border / text colours
- chart colours
- focus-ring colour
- hover / active / disabled states

All of this lives in [`design/tokens.json`](../design/tokens.json) and is generated to CSS — never hand-authored in components.

## Settings requirement

- The app **exposes theme selection in settings**: the user picks a family and a colour mode (**light / dark / system**).
- The preference is **persisted** (localStorage) and restored before first paint (no flash).
- **Dark mode is not an afterthought** — it ships with dedicated tokens, contrast checks (AA in both modes) and screenshots.

## Icon system

- **One icon family per project.** Default: **Lucide** (Tailwind/shadcn projects). Use Material Symbols only for an intentional Material/Google look; Heroicons only if already established. Don't mix families without a documented reason in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).
- Consistent stroke width, size and alignment everywhere.
- Icons map to **semantic usage**, not picked at random — see `src/lib/icons.ts` (action / status / nav / alert / empty-state patterns).
- **Every icon-only button has an accessible label** (`aria-label`).
- Navigation, actions, status, alerts and empty states use the predefined icon patterns, not ad-hoc choices.

## Project note — Rosenraum

Rosenraum is grandfathered: it ships **6 Expressive presets** (rose · forst · lila · ozean · koralle · meer), each with full light + dark tokens, plus a light/dark/system control — all in [`../src/components/ThemeSheet.tsx`](../src/components/ThemeSheet.tsx). The 6 presets all belong to the **Expressive** family (tagged `family: "expressive"` in `tokens.json`). Rosenraum does not surface a family switcher because it only ships Expressive; future projects following this standard provide Default/Expressive/Minimal. Rationale recorded in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md). Icon family: Lucide (`lucide-react`).
