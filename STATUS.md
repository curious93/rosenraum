# Rosenraum — Feature Status

> Dieses File wird nach jedem Test-Durchlauf aktualisiert.
> Legende: ✅ Funktioniert · ❌ Kaputt · ⏳ Noch nicht getestet · 🔄 Deploy läuft

---

## Deploy-Status

| Commit | Feature | CI | Live |
|--------|---------|----|----|
| `a984ad7` | fix: 8s fetch timeout — skeleton hängt nie mehr ewig | ✅ | 🔄 läuft |
| `43bdf91` | fix: minInstances=1 + freundlicher Fehlertext | ✅ | ✅ |
| `d5ecf96` | fix: immer 4 Bars, Cold-Start-Retry, Skeleton nur beim Fetch | ✅ | ✅ |
| `1be017c` | feat: GFK Scoring UI — alle 7 Fixes | ✅ | ✅ |

**Aktuell live:** `43bdf91`
**Produktions-URL:** https://rosenraum-1--rosenraum-app.europe-west4.hosted.app

---

## GFK Scoring — 7 Features

### F1 — Textarea sofort editierbar + Enter sendet
**Erwartung:** Sheet öffnet → Cursor direkt in der Textarea → Enter-Taste sendet ohne Button-Klick

| Schritt | Aktion | Erwartung | Status |
|---------|--------|-----------|--------|
| 1 | Nachricht tippen → Senden-Button drücken | Sheet öffnet sich | ⏳ |
| 2 | Ohne zu tippen: ist Cursor im Textfeld? | Cursor blinkt in Textarea | ⏳ |
| 3 | Text ändern → Enter drücken | Nachricht wird gesendet, Sheet schließt | ⏳ |
| 4 | Shift+Enter drücken | Zeilenumbruch, kein Senden | ⏳ |

**Letzter Test:** —
**Status:** ⏳

---

### F2 — 4 GFK-Balken immer sichtbar (nie "Nicht adressiert")
**Erwartung:** Beim Öffnen sofort 4 graue Shimmer-Balken → nach ~2s farbige Balken mit Scores

| Schritt | Aktion | Erwartung | Status |
|---------|--------|-----------|--------|
| 1 | Sheet öffnen | Sofort: 4 graue Shimmer-Balken, Score zeigt "–" | ⏳ |
| 2 | 3 Sekunden warten | Balken werden farbig: Beobachtung=blau, Gefühl=orange, Bedürfnis=grün, Bitte=lila | ⏳ |
| 3 | Balkenbreiten prüfen | Unterschiedliche Breiten — nicht alle gleich lang | ⏳ |
| 4 | Score-Zahlen prüfen | Zahlen 1–10 rechts neben jedem Balken, in Dimensionsfarbe | ⏳ |

**Letzter Test:** —
**Status:** ⏳

---

### F3 — Text-Highlights im GFK-Panel
**Erwartung:** Originaltext erscheint mit farbig hinterlegten Textstellen pro Dimension (nach Score-Laden)

| Schritt | Aktion | Erwartung | Status |
|---------|--------|-----------|--------|
| 1 | Nachricht "Du hörst mir nie zu!" eingeben → Sheet öffnen | — | ⏳ |
| 2 | Warten bis Score geladen | Text erscheint im Panel mit farbigen `<mark>`-Spans | ⏳ |
| 3 | Highlighting prüfen | Mindestens 1-2 Textstellen farbig markiert | ⏳ |
| 4 | Farben prüfen | Jede Farbe entspricht einer Dimension (blau/orange/grün/lila) | ⏳ |

**Letzter Test:** —
**Status:** ⏳

---

### F4 — Kein Text während Loading
**Erwartung:** Während der Score lädt: kein Text sichtbar, nur Shimmer-Balken

| Schritt | Aktion | Erwartung | Status |
|---------|--------|-----------|--------|
| 1 | Sheet öffnen, sofort Screenshot | Nur Balken-Skeletons, kein Originaltext | ⏳ |
| 2 | Nach Score-Laden | Text erscheint (mit Highlights) | ⏳ |

**Letzter Test:** —
**Status:** ⏳

---

### F5 — "Inspiriere mich →" (Rosenraum-Beispiel auf Anfrage)
**Erwartung:** Kein automatischer Vorschlag — erst nach Klick auf Button

| Schritt | Aktion | Erwartung | Status |
|---------|--------|-----------|--------|
| 1 | Sheet öffnen | Nur "Inspiriere mich →" Button sichtbar, kein Vorschlag | ⏳ |
| 2 | Button klicken | Loading-Skeleton erscheint in grüner Karte | ⏳ |
| 3 | ~3s warten | GFK-Vorschlag-Text erscheint | ⏳ |
| 4 | "Nur zur Inspiration" Label prüfen | Gut lesbar, ausreichend Kontrast | ⏳ |

**Letzter Test:** —
**Status:** ⏳

---

### F6 — Grüner Rand + Motivationstext
**Erwartung:** Wenn Score ≥ 7: Textarea-Rand grün, Send-Button grün, Motivationstext "Gut formuliert ✓"

| Schritt | Aktion | Erwartung | Status |
|---------|--------|-----------|--------|
| 1 | Positive Nachricht eingeben: "Ich liebe dich" | Sheet öffnen | ⏳ |
| 2 | Score laden lassen | Rand der Textarea: grün statt rosé | ⏳ |
| 3 | Send-Button prüfen | Grün statt rosé | ⏳ |
| 4 | Motivationstext prüfen | "Gut formuliert ✓" in grüner Farbe unter den Balken | ⏳ |
| 5 | Schwierige Nachricht: "Du bist immer Schuld" | Motivationstext: "Kleine Anpassungen können viel bewirken" | ⏳ |

**Letzter Test:** —
**Status:** ⏳

---

### F7 — Delta-Animation beim Editieren (+N / -N)
**Erwartung:** Wenn Nutzer Text ändert und Score neu lädt → kurze Animations-Badges zeigen Differenz

| Schritt | Aktion | Erwartung | Status |
|---------|--------|-----------|--------|
| 1 | Schwierige Nachricht: "Du bist immer Schuld" → Sheet | Score laden lassen | ⏳ |
| 2 | Text verbessern: "Ich fühle mich verletzt wenn du das sagst" | — | ⏳ |
| 3 | 1 Sekunde warten (Debounce) | Skeleton erscheint kurz | ⏳ |
| 4 | Nach Score-Reload | "+N" Badges in grün bei verbesserten Dims sichtbar, kurz dann ausgeblendet | ⏳ |
| 5 | Ghost-Linie prüfen | Dünne Linie zeigt kurz wo Score vorher war | ⏳ |

**Letzter Test:** —
**Status:** ⏳

---

## Infrastruktur

### I1 — Cold Start (minInstances=1)
**Erwartung:** API antwortet beim ersten Request sofort (< 3s), kein 10-30s Warten

| Schritt | Aktion | Erwartung | Status |
|---------|--------|-----------|--------|
| 1 | `curl -w "%{time_total}" .../api/score` | < 3 Sekunden | ✅ 1.6s |
| 2 | Sheet sofort nach Öffnen | Score erscheint ohne langen Skeleton | ⏳ |

**Letzter Test:** 2026-06-09
**Status:** ✅

---

## Gesamtstatus

| Feature | Status | Zuletzt getestet |
|---------|--------|-----------------|
| F1 — Textarea + Enter | ⏳ | — |
| F2 — 4 Balken immer | ⏳ | — |
| F3 — Text-Highlights | ⏳ | — |
| F4 — Kein Text loading | ⏳ | — |
| F5 — Inspiriere mich | ⏳ | — |
| F6 — Grüner Rand | ⏳ | — |
| F7 — Delta-Animation | ⏳ | — |
| I1 — Cold Start fix | ✅ | 2026-06-09 |

**0 / 7 verifiziert** — UI-Test ausstehend (bitte Sheet öffnen und Screenshots schicken)
