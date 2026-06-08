# AI UX Rules

Rules for any surface where AI generates or acts. Anchored to Google PAIR and IBM Carbon for AI (transparency, explainability, trust). These layer on top of [PRODUCT_SYSTEM.md](PRODUCT_SYSTEM.md).

## Core rules

1. **Mark AI-generated output.** It must be visually distinguishable from human or deterministic content (label, icon, or surface treatment). Users always know what the machine wrote.
2. **Show uncertainty when it's relevant.** Don't present a best-guess as fact. Hedge visibly when confidence is low; offer alternatives rather than a single confident wrong answer.
3. **Allow correction.** The user can always edit, regenerate, or reject AI output before it counts. The AI proposes; the human disposes.
4. **Allow undo.** Any AI-applied change is reversible. Prefer undo over a pre-action confirmation.
5. **Explain what data was used.** Be transparent about the inputs an AI response was based on (the message, the context, the history) — no hidden context.
6. **Distinguish draft from confirmed.** AI output is a draft until the user commits it. Draft and confirmed states look different and behave differently.
7. **Don't pretend AI is deterministic.** Same input may yield different output; don't imply guarantees. Avoid language like "correct" / "the answer".
8. **Human review for critical actions.** Anything irreversible, external-facing, or high-stakes requires explicit human confirmation — never auto-executed by the model.
9. **Show tool/action status in agentic flows.** When the system acts on the user's behalf, surface what it's doing, what it did, and what failed — step by step, in real time.

## How to apply

- Provide a clear path to **regenerate** and to **dismiss** AI output, always.
- Failures degrade gracefully: if the model is unavailable, the human-authored path still works end to end. Never trap the user behind a broken AI call.
- Latency: stream or skeleton; never a dead spinner with no indication of progress.
- Don't over-explain — transparency is an affordance, not a wall of disclaimers. One clear marker beats five hedges.

## Project note — Rosenraum

The GFK reformulation is **assistive and invisible to the recipient**: the AI suggests an alternative phrasing to the *sender only*; the sender chooses which version to send; the recipient sees only the sent version. The AI never scores, judges, or blocks. When Claude returns no reformulation, say so warmly ("Diese Nachricht klingt bereits offen.") rather than showing an empty card. See the UX rules in [../CLAUDE.md](../CLAUDE.md).
