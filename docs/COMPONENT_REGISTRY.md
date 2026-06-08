# Component Registry

Every reusable component, documented. **Before building UI, check here.** Never create a one-off if an existing component can be reused or extended. New components require an entry (enforced softly by `scripts/check-registry.mjs`).

Per component: purpose · use cases · variants · props · states · a11y · anti-patterns · file path. Preview pages live under `src/app/(preview)/preview/*`.

---

## Primitives (`src/components/ui/*`)

shadcn/ui-based, theme-aware via the token bridge. Added in Phase 3 — see preview pages. Use these before composing anything custom: **Button, Card, Dialog, DropdownMenu, Input, Sonner (toast), Table, Badge**, plus the state patterns **EmptyState, LoadingState, ErrorState**.

---

## Domain components (`src/components/**`)

### ThemeSheet — `src/components/ThemeSheet.tsx`
- **Purpose:** Bottom sheet to pick a colour preset (6) and colour mode (light/dark/system). Applies instantly via `data-theme` + `.dark`.
- **Use cases:** Settings / "Stil ändern" entry points.
- **Props:** `onClose: () => void`.
- **States:** active preset highlighted (border + check); active mode pill.
- **A11y:** mode control is a `radiogroup`; check icon is `aria-hidden`. *To improve:* trap focus + `Esc` like a dialog.
- **Anti-patterns:** don't add a family switcher (Rosenraum is Expressive-only — see [THEME_OPTIONS.md](THEME_OPTIONS.md)).

### ChatBubble — `src/components/chat/ChatBubble.tsx`
- **Purpose:** One message bubble; own (right, `--color-bubble-own`) vs other (left, `--color-bubble-other`); sender-only toggle reveals the GFK version (`--color-bubble-gfk`).
- **States:** own / other; with / without learning dot; original ↔ GFK toggle.
- **A11y:** toggle must be a real button with a label.
- **Anti-patterns:** never expose GFK metadata to the recipient.

### ChatInput — `src/components/chat/ChatInput.tsx`
- **Purpose:** Pill input with auto-growing textarea and animated send.
- **States:** empty / typing / sending; focus ring (`--color-primary`).
- **A11y:** labelled input; Enter-to-send with Shift+Enter newline.

### SendBottomSheet — `src/components/chat/SendBottomSheet.tsx`
- **Purpose:** Pre-send comparison of Original vs GFK version; skeleton while analysing; user picks which to send.
- **Variants:** has-GFK / no-GFK (warm fallback copy).
- **States:** loading (skeleton), GFK present, GFK absent.
- **A11y:** version cards are selectable controls; loading announced.

### InviteSheet — `src/components/invite/InviteSheet.tsx`
- **Purpose:** Invite options — copy link, show 6-char code, QR code.
- **States:** default / copied (Check + "Link kopiert").
- **A11y:** icon buttons labelled; copy feedback announced (`role="status"`).

---

## Conventions
- Compose from primitives; reach for a domain component only for app-specific behaviour.
- All colours via semantic tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)). Verify light + dark.
- Match the relevant pattern in [COMPONENT_STANDARDS.md](COMPONENT_STANDARDS.md).
