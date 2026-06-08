# Product System

Product principles that override aesthetic preference. When a design choice and a principle conflict, the principle wins. Anchored to Google PAIR, Material 3, Apple HIG.

## Principles

1. **Clarity over cleverness.** Every screen has one obvious primary action. If a user has to think about what to do next, the screen failed.
2. **Speed is a feature.** Perceived performance matters as much as real performance: optimistic UI, skeletons over spinners, never block on the network for a state the client already knows.
3. **Calm UI.** No attention-grabbing for its own sake. No autoplay, no badges that pulse forever, no notifications that aren't earned. The interface recedes; the content leads.
4. **Task orientation.** Organise around what the user is trying to do, not around the data model or the org chart. Names match the user's vocabulary, not the database's.
5. **Reversible workflows.** Prefer undo over confirm. Destructive, irreversible actions get a confirmation; everything else gets an undo affordance. Mistakes should be cheap.
6. **Strong information hierarchy.** Size, weight, colour and spacing encode importance consistently. A user should be able to squint and still see the structure.
7. **Minimal cognitive load.** Show what's needed now; defer the rest. Progressive disclosure beats a wall of options. One decision per step.
8. **No unnecessary visual noise.** Every line, border, shadow and icon must earn its place. When in doubt, remove it.

## How to apply

- Before adding UI, ask: *which principle does this serve?* If none, it's noise.
- When two layouts are equally pretty, pick the one with the stronger hierarchy and fewer decisions.
- Empty, loading and error states are first-class product surfaces — design them, don't default them. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- For any AI-assisted surface, layer [AI_UX_RULES.md](AI_UX_RULES.md) on top of these.

## Project note — Rosenraum

Rosenraum adds hard UX rules in [../CLAUDE.md](../CLAUDE.md): no score/badge/percentage, GFK invisible to the recipient, the message belongs to the sender, warm (not technical) empty states, nothing is evaluated except on the user's own tap. These are non-negotiable and sit above this document for this project.
