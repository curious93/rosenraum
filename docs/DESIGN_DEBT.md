# Design Debt

Known inconsistencies and shortcuts, tracked so they're deliberate, not forgotten. Add a row when you knowingly defer something. Severity: low / med / high.

| Issue | Location | Severity | Proposed fix | Owner / status |
|---|---|---|---|---|
| Primary buttons use hardcoded `text-white` instead of `var(--color-on-primary)` | `page.tsx`, `create`, `join`, `room`, `join/[code]` | low | Replace with `--color-on-primary` so button text adapts per mode/theme | open — acceptable; on-primary is white in both modes today |
| Light-mode primary buttons sit ~3.4:1 white-on-primary (below AA 4.5:1 for normal text) | all primary CTAs | med | Either darken primaries or enlarge/bolden button text to qualify as large text (3:1) | open — pre-existing shipped design; revisit with a11y pass |
| Status colours (success/warning/destructive) are shared defaults, not per-theme tuned | `tokens.json` `statusDefaults` | low | Tune per preset if a theme needs it; currently unused in UI | open — fine until a status surface ships |
| Some exotic preset×dark bubble combos not contrast-verified beyond primary surfaces | dark bubble-gfk / bubble-own | low | axe contrast sweep in Phase 4 across all 6 presets in dark | open — Phase 4 |
| Icon family not yet centralised to semantic map | components import Lucide icons directly | low | Route through `src/lib/icons.ts` semantic map | open — Phase 3 |

> Empty severity columns are a smell — if it's here, it has a severity and a proposed fix.
