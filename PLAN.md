# GFK-Lernfeedback — Verhaltensstudie, Befunde & Maßnahmenplan (2026-06-10)

**Test-Room (einzige Seite):** lokal `http://localhost:3000/room/h4YRjs6JQdvtDe2Jj7VM` · deployed `https://rosenraum-1--rosenraum-app.europe-west4.hosted.app/room/h4YRjs6JQdvtDe2Jj7VM`

## 1. Verhaltensstudie (live am Interface)

Test-Mechanik **funktioniert zuverlässig**: Text im SendBottomSheet via CDP setzen → React `onChange` → 800ms Debounce → `/api/score` (~4–6s) → Panel aktualisiert. Screenshot je Schritt nach ~10s.
Harness: isoliertes Chrome Port 9223 · `/tmp/journey.js '<text>' <out.jpg> 10000` · `/tmp/cdp_send.js` (Sheet öffnen) · `/tmp/cdp_shot.js` (Screenshot).

Lernreise von schlecht → GFK-nah:

| Stufe | Text (gekürzt)                                                    | Beobachtung | Gefühl          | Bedürfnis       | Bitte           | Panel-Kopf                   |
| ----- | ----------------------------------------------------------------- | ----------- | --------------- | --------------- | --------------- | ---------------------------- |
| 0     | „Du bist echt total unzuverlässig und kommst immer viel zu spät." | 2·kritisch  | nicht enthalten | nicht enthalten | nicht enthalten | „Kleine Anpassungen…"        |
| 1     | „Gestern bist du 30 Min nach der verabredeten Zeit … gekommen."   | gut (≥8)    | nicht enthalten | nicht enthalten | nicht enthalten | **„✓ klingt bereits offen"** |
| 2     | + „Ich war enttäuscht und traurig."                               | gut         | gut             | nicht enthalten | nicht enthalten | **„✓ klingt bereits offen"** |
| 3     | + „…weil mir Verlässlichkeit … wichtig sind."                     | gut         | gut             | gut             | nicht enthalten | **„✓ klingt bereits offen"** |

## 2. Befunde

**✅ Funktioniert:** Re-Score bei Textänderung robust; Highlights mehrfarbig korrekt (jede present-Dimension im Text markiert); „nicht enthalten" sauber grau; Bänder + Legende stimmen.

**🔴 Hauptproblem — verfrühtes „klingt bereits offen" + Panel-Kollaps:** `alreadyOpen` feuert, sobald alle _present_ Dimensionen ≥8 sind — unabhängig davon, wie wenige present sind (Stufe 1: 1 von 4 reicht). Das ganze Panel kollabiert zu einer grünen Zeile; Balken verschwinden. Folge: falsches „fertig"-Signal bei GFK-unvollständiger Nachricht, kein sichtbarer Fortschritt, Lernführung weg.

**🟡 Keine Führung zur Vollständigkeit:** Dimensionen werden isoliert behandelt; nichts lädt ein, fehlende Komponenten zu ergänzen.

## 3. User-Entscheidungen

1. **„Rund/offen" = alle 4 Komponenten present UND ≥8** (echte GFK-Vollständigkeit, nicht 1 von 4).
2. **Balken bleiben immer sichtbar** (kein Kollaps). „nicht enthalten" wird sanfte Einladung **„+ ergänzen?"**. „Rund" nur als zusätzliches Banner über den Balken.

## 4. Maßnahmen (alle in `src/components/chat/GfkScorePanel.tsx`)

1. `alreadyOpen` → `isComplete`: alle 4 Dimensionen `present !== false && score >= 8`; kollabierter Branch entfällt komplett.
2. „Rund"-Banner: `✓ Rund — alle vier GFK-Komponenten sind da.` (grün, über der Legende), Balken bleiben sichtbar.
3. Nicht-enthalten-Zeile: `nicht enthalten · + ergänzen?` (reiner Text-Hinweis, einladend, keine neuen Buttons).
4. `gfkMotivation`: Frühabbruch-Logik auf `isComplete` umstellen (Banner übernimmt die Botschaft → Motivation liefert dann null).

Kein API-/Prompt-Change nötig. Verifikation: gleiche Lernreise erneut, Stufe 4 ergänzt Bitte („Wärst du bereit, mir kurz zu schreiben, wenn du später kommst?") → Banner über sichtbaren Balken.

## 5. Test-Infrastruktur

- **`chrome-devtools-mcp` eingerichtet** (offizieller Chrome-Team MCP-Server): `claude mcp add chrome-devtools -s local -- npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9223`. Ab nächster Session Standard für UI-Tests (navigate/click/fill/screenshot/console). `/tmp`-Skripte bleiben Fallback.
- **Antigravity Browser Extension: geprüft, nicht nutzen.** Sie ist die Brücke Antigravity-IDE-Agent → Extension-HTTP-Server (Port 3025) → CDP auf **Haupt-Chrome 9222** (bei uns tabu). Von außen nur über undokumentierte API ansteuerbar, laut Foren fragil. Nützlich nur, wenn der User selbst in der Antigravity IDE arbeitet — installiert lassen, für unsere Tests irrelevant.

## 5b. Test-Protokoll Lernreise „Küche" (2026-06-10, nach Panel-Fix)

Szenario: „Nie räumst du die Küche auf, du bist so faul! Das nervt mich tierisch." → schrittweise zu GFK. Screenshot je ~5s nach Änderung + settled.

| Schritt | Änderung                             | Settled-Ergebnis                                                                                     |
| ------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| V0      | Rohfassung                           | Beobachtung 2·kritisch, Gefühl 7·verbessern („Übertreibung"), 2× „+ ergänzen?", 3 Highlights korrekt |
| V1      | Bewertung → konkrete Beobachtung     | Beobachtung 9·gut, Gefühl 8·gut, Highlights korrekt                                                  |
| V2      | + Bedürfnis („Verantwortung teilen") | Bedürfnis 9·gut, grünes Highlight korrekt                                                            |
| V3      | + Bitte („Wärst du bereit…?")        | Alle 4 gut, „Rund"-Banner über sichtbaren Balken, 4 Farben im Text                                   |

**Analyse — Befunde nach Schwere:**

1. **🔴 Stale-Zustand bei jedem Re-Score (systematisch):** ~5–7s lang bleiben alte Balken/Diagnosen stehen, Highlights kleben an alten Zeichenpositionen und zerschneiden Wörter mitten durch („Ges|chirr", „A|bend", „mi|r"), kein Lade-Hinweis, Motivations-Header verschwindet. Der Nutzer sieht kaputt aussehendes UI genau in dem Moment, in dem er seiner Änderung folgen will. → Vorschlag: während `scoreLoading` Highlights ausblenden/abdimmen + dezenter „Analysiere…"-Puls am Panel.
2. **🟠 Widersprüchliche Signale bei Unvollständigkeit:** Header „Gut formuliert ✓" + grüner Senden-Button bei 2 von 4 Komponenten, direkt über zwei „+ ergänzen?"-Einladungen (total-basiert vs. Vollständigkeit). → Vorschlag: Header/Button-Grün an `isComplete` koppeln oder Text ändern („Schon gut sendbar — magst du es rund machen?").
3. **🟠 Bewertung nicht stabil:** Identischer Satz „Das nervt mich tierisch": V0 = 7·verbessern, V1 = 8·gut. Gleiche Formulierung, anderes Urteil — untergräbt Vertrauen ins Lernfeedback. → Vorschlag: Anker-Beispiele im Prompt kalibrieren.
4. **🟡 Verwaister Pfeil „→" in Details:** Bei Lob-Matches (suggestion leer) rendert eine leere Pfeilzeile (User-Screenshot „Präzise Beobachtung / →"). Fix lokal vorbereitet (Zeile nur bei vorhandener suggestion), **wartet auf Freigabe**.
5. **🟡 Legende „1–5 kritisch …" liest niemand** (User-Feedback): Bedeutung muss auf den ersten Blick visuell klar sein, Interface insgesamt „wenig inspirierend". → Design-Pass nötig (Vorschläge ausarbeiten, vor Umsetzung freigeben lassen).

Regel ab jetzt: **Keine Interface-Änderung ohne explizite Freigabe** — erst Vorschlag, dann Umsetzung.

## 7. Einzeltickets Panel-Redesign + Vorschlag-Highlights (GitHub Issues)

**Ziel:** Score-Bedeutung auf den ersten Blick (Befund 5b/5). Dimensionsfarbe wandert in den Namen, Qualität in einen festen Rot→Grün-Verlauf mit Schwellen-Markern; das Rosenraum-Beispiel erklärt sich durch dieselben Highlights wie das Eingabefeld.

| Issue                                                 | Ticket | Inhalt                                                                                | Status |
| ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- | ------ |
| [#1](https://github.com/curious93/rosenraum/issues/1) | T-A    | Dimensionsname in Dimensionsfarbe, fett (alle Zeilen)                                 | ⏳     |
| [#2](https://github.com/curious93/rosenraum/issues/2) | T-B    | Balken = Rot→Grün-Verlauf, Füllung via clipPath, ab 8 „noch grüner"                   | ⏳     |
| [#3](https://github.com/curious93/rosenraum/issues/3) | T-C    | Schwellen-Marker bei 50% + 70% (Band-Grenzen)                                         | ⏳     |
| [#4](https://github.com/curious93/rosenraum/issues/4) | T-D    | Mini-Legende entfernen                                                                | ⏳     |
| [#5](https://github.com/curious93/rosenraum/issues/5) | T-E    | Band-Farb-Tokens in tokens.json (`--color-gfk-band-*`)                                | ⏳     |
| [#6](https://github.com/curious93/rosenraum/issues/6) | T-F    | Rosenraum-Beispiel: Dimensions-Highlights (Vorschlag scoren, nicht klickbar, Fade-in) | ⏳     |
| [#7](https://github.com/curious93/rosenraum/issues/7) | T-G    | Verwaister Pfeil „→" bei leerer suggestion                                            | ⏳     |

**Backlog (warten auf Freigabe):** [#8](https://github.com/curious93/rosenraum/issues/8) Stale-Zustand bei Re-Score · [#9](https://github.com/curious93/rosenraum/issues/9) Widerspruch „Gut formuliert"/Vollständigkeit · [#10](https://github.com/curious93/rosenraum/issues/10) Scoring-Stabilität (Prompt-Anker)

**Design-Entscheidungen:** Verlauf nutzt gedämpft-warme Töne (kein Alarmrot) — bewusste Ausnahme von styles.md „kein Rot/Orange", weil Rot hier die gewollte Semantik _kritisch_ ist. Alle Balken sehen gleich aus (gleicher Verlauf) — gewollt: die Information ist der Füllstand auf der Zonen-Skala. Verlaufs-Stops treffen die Marker: kritisch bis ~38%, Übergang, verbessern 52–64%, Übergang, gut ab 76%, gut-deep bei 100%.

## 8. Ausführlicher Testplan (wird befolgt, Ergebnisse hier eingetragen)

Harness: `/tmp/cdp_send.js` (Sheet öffnen) · `/tmp/journey.js '<text>' <out> 5000` · settled via `/tmp/cdp_shot.js` · `sips` auf 1400px · jeden Screenshot lesen, Soll/Ist notieren.

| #   | Test                       | Vorgehen                                       | Erwartung                                                                                       | Ergebnis |
| --- | -------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| T1  | Gradient + Marker statisch | Küchen-V0 senden                               | Beobachtung-Füllung endet in Rotzone (~20%); Marker bei 50%/70%; Namen farbig+fett; Legende weg | ⏳       |
| T2  | Zonen bei Verbesserung     | V1 (konkrete Beobachtung)                      | Füllungen in Grünzone; 8 vs 9 unterscheidbar (Ende dunkler grün)                                | ⏳       |
| T3  | Schwellen-Ausrichtung      | Score 6–7 im Verlauf (V0-Gefühl)               | Füllende zwischen Markern, Ende = Amber                                                         | ⏳       |
| T4  | „nicht enthalten"          | V0/V1                                          | Zeile wie gehabt (Ring, Einladung), Name farbig                                                 | ⏳       |
| T5  | Rund-Banner                | Küchen-V3 (alle 4)                             | Banner über 4 Gradient-Balken, Füllungen tief grün                                              | ⏳       |
| T6  | Vorschlag-Highlights       | „Inspiriere mich →" klicken, ~12s              | Vorschlag erscheint, Highlights faden ein; Klick darauf: keine Aktion, nichts bricht            | ⏳       |
| T7  | Pfeil-Fix                  | Gut-Highlight im Eingabefeld klicken → Details | Lob-Match OHNE leere „→"-Zeile                                                                  | ⏳       |
| T8  | Regression Eingabefeld     | während T1–T5                                  | Eingabefeld-Highlights korrekt; Details ↓/↑ funktionieren                                       | ⏳       |
| T9  | Checks + Build             | Terminal                                       | lint · tsc · check:colors · check:tokens · build grün                                           | ⏳       |

## 6. Erledigt heute (deployed)

- GFK „enthalten vs. nicht enthalten" + Bewertungsbänder (`present`, `scoreBand`, Legende, „{score} · {band}")
- Balken ⟺ Highlight: jede present-Dimension markiert ihre Textstelle — auch „gut" (positiver Match, isProblematic=false)
- Prompt-Zwei-Schritt-Logik + JSON-Quote-Regel (Parse-Fehler behoben)
- Kurzdiagnose/Details volle Breite (Mobile); doppeltes „Gut formuliert" im Eingabefeld entfernt
- Composer: `rounded-3xl` statt Pill (mehrzeilig sauber), Statistik-Icon neben statt über dem Feld
- Highlight-Positions-Korrektur serverseitig (`indexOf`-Fallback), `spans` immer aus `matches`

---

# Design-System Infrastructure — Plan & Status

Durable, reusable UI/UX governance system, piloted in Rosenraum. **Status: implemented (2026-06-08).** Living docs are in [`docs/`](docs/); this file is the high-level map.

## Repo assessment (at start)

Next.js 16 + React 19 + **Tailwind v4** (zero-config) + TypeScript. shadcn/ui _configured but unpopulated_ (`components.json` + `cn()`, no `ui/`). Custom 6-theme engine via `[data-theme]`, **no dark mode**, no tests, no `docs/`. Convention: design docs at root, auto-read via `@file.md`; no hardcoded hex; JSDoc on exports.

## Decisions (user)

1. **Reuse = update `project-template` only** (no package, no live sync). → [docs/REUSE.md](docs/REUSE.md)
2. **3 families standard, keep Rosenraum's 6** (Expressive, grandfathered) + dark mode. → [docs/THEME_OPTIONS.md](docs/THEME_OPTIONS.md)
3. **Full pilot** incl. Playwright visual + axe a11y + CI gates.

## Architecture

`design/tokens.json` → `scripts/build-tokens.mjs` → `src/app/tokens.generated.css` (Tailwind `@theme` + shadcn bridge + `:root`/`[data-theme]`/`.dark`). Components read **semantic vars only**. → [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)

## What shipped (by phase)

- **0 — Tokens** ✅ `tokens.json`, generator, generated CSS, shadcn bridge; app pixel-identical after rewire.
- **1 — Themes** ✅ 6 presets × light/dark, `light/dark/system` mode (`theme.ts`, `ThemeSheet.tsx`), FOUC guard, `suppressHydrationWarning`.
- **2 — Docs** ✅ 11 `docs/*`, CLAUDE.md router, `styles.md` cross-link, `check:tokens` / `check:colors`.
- **3 — Primitives** ✅ `ui/` Button, Card, Badge, Input, Dialog, DropdownMenu, Table, Sonner, Empty/Loading/Error; `lib/icons.ts`; dev-only `/preview` gallery; registry seeded.
- **4 — Tests + CI** ✅ Playwright visual regression (proven to catch diffs) + axe a11y (**0 violations**, palette tightened to AA from 54); `check:token-doc` / `check:registry`; CI quality + test (Playwright container) jobs.
- **5 — Reuse** ✅ [docs/REUSE.md](docs/REUSE.md) + [CHANGELOG.md](CHANGELOG.md).

## Validation gates (all green locally)

`npm run lint` · `npx tsc --noEmit` · `check:tokens` · `check:colors` · `check:token-doc` · `check:registry` · `test:a11y` (8 pass) · `test:visual` (6 baselines) · `npm run build`.

## Theme & settings integration

3 families (Default/Expressive/Minimal) × light/dark is the cross-project standard. Rosenraum exposes the 6 presets + light/dark/system in `ThemeSheet`, persisted to `localStorage`, restored pre-paint. Icon system: Lucide via `src/lib/icons.ts` (one family, semantic mapping, labelled icon-only buttons). → [docs/THEME_OPTIONS.md](docs/THEME_OPTIONS.md)

## Risks & rollback

Token rewire could regress visuals → mitigated by pixel-parity check + visual baselines. Dark palette breadth → AA-verified by axe. Cross-platform snapshots → platform-suffixed baselines, linux seeded in CI. Everything is additive and phase-revertable; `tokens.generated.css` is committed so the app never depends on the build script at runtime. → [docs/DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md), [docs/DESIGN_DEBT.md](docs/DESIGN_DEBT.md)

## Future UI task checklist

→ [docs/UI_REVIEW_CHECKLIST.md](docs/UI_REVIEW_CHECKLIST.md) (tokens · registered components · standards · a11y · all states · responsive · light+dark · visual regression).
