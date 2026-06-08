# Component Standards

Exact rules for common UI patterns. These bind every implementation. When a component exists in [COMPONENT_REGISTRY.md](COMPONENT_REGISTRY.md), reuse it; only build new when no registered component fits.

## Modal / Dialog
- **When:** a focused task or decision that must interrupt. **Drawer/sheet** for contextual side content; **full page** for long forms or multi-step flows. If it fits inline, don't use a modal.
- Focus trap while open; return focus to the trigger on close.
- Close on `Esc` and on overlay click — *except* when the dialog holds unsaved destructive input (then confirm).
- Overlay dims the page; only one modal at a time (no stacking).
- Destructive confirmation: name the consequence ("Raum löschen — kann nicht rückgängig gemacht werden"), destructive action uses `--color-destructive`, cancel is the safe default and is focused.
- Footer actions right-aligned, primary last. Mobile: bottom sheet with drag-handle, swipe-to-dismiss.
- A11y: `role="dialog"` `aria-modal="true"`, labelled by its title.

## Notification / Toast / Snackbar
- **Toast** for transient, non-critical confirmations. **Inline alert** for context-specific validation. **Banner** for persistent, page-level state.
- **Never** show a critical error only as a toast — it can be missed. Critical → inline or banner that persists.
- Duration: 4–6s default; persist (no auto-dismiss) if it carries an action.
- Undo: destructive actions surface a toast with an Undo for ~5s instead of a pre-confirm, when reversible.
- Variants: success / error / warning / info — distinguished by icon **and** colour (never colour alone).
- A11y: `role="status"` (polite) for info/success, `role="alert"` (assertive) for errors.

## Dropdown / Menu
- Only for **actions** or compact option lists. Never put forms, multi-field input or complex layout inside a dropdown — use a popover or sheet.
- Full keyboard support: arrows to move, Enter/Space to select, Esc to close, typeahead where lists are long.
- Focus moves into the menu on open, returns to trigger on close.
- States: disabled items are skipped by keyboard and visibly muted; show an empty state ("Keine Optionen") rather than an empty box.

## Search field
- Pick the simplest that fits: **simple search** (filter on submit) · **autocomplete** (suggestions while typing) · **command palette** (global actions, ⌘K) · **global search** (cross-entity) · **filter search** (scoped to a list).
- Debounce input ~250–300ms before querying. Always provide a clear (✕) button.
- States: loading (inline, non-blocking), empty ("Nichts gefunden für …" + a next step), and result grouping by type when mixed.
- Keyboard: arrows through results, Enter to open, Esc to clear/close. Results are an ARIA listbox.

## Forms
- Every field has a visible `<label>` (placeholder is not a label). Helper text below the field; error text replaces helper on error and is announced.
- Mark **required** explicitly; prefer marking optional when most fields are required.
- Disabled state is visibly distinct and not focusable.
- Validation timing: validate on blur and on submit, not on every keystroke; show success only after a field was touched.
- Submit: disable during in-flight, show progress, keep entered data on failure, focus the first invalid field.

## Tables
- Sorting (clear active-column indicator), filtering, pagination (or virtualised infinite scroll for large sets).
- Bulk actions appear in a contextual bar when rows are selected; row actions live in a trailing menu.
- States: empty (inviting, with a create action), loading (skeleton rows), error (retry).
- Mobile: collapse to stacked cards or a horizontally scrollable region with a frozen key column — never a crushed grid.

## Cards
- One clear hierarchy per card: title → meta → body → actions. Consistent internal padding (`--space`/Tailwind scale).
- Hover/focus elevation is subtle (`--shadow-sm`). If the whole card is clickable, the click target is the card; nested buttons must `stopPropagation` and be reachable by keyboard.
- Don't nest interactive controls ambiguously — a card is either a link or a container of actions, not both without clear affordances.

## Navigation
- **Sidebar** for app-level sections (desktop); **top nav** for shallow sites; **bottom nav** for primary mobile destinations (≤5).
- **Breadcrumbs** for depth ≥3. **Tabs** for switching views of the *same* object, not for navigating away.
- Active state is unambiguous (colour + weight, not colour alone) and announced (`aria-current`).
- Mobile navigation is reachable with one thumb; primary destinations within reach of the bottom edge.
