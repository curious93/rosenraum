import { NextRequest, NextResponse } from 'next/server'
import type { GfkScoreResult } from '@/lib/gfkScore'

const SCORE_SYSTEM_PROMPT = `Du bist ein GFK-Analyse-Assistent. Analysiere den deutschen Text strikt nach den vier Dimensionen der Gewaltfreien Kommunikation (GFK).

Antworte NUR mit validem JSON, ohne Markdown-Blöcke oder Erklärungen.

Bewerte jede Dimension in ZWEI SCHRITTEN:

SCHRITT 1 — present: Ist die Kategorie im Text überhaupt enthalten oder erkennbar berührt?
  present=false → Kategorie kommt nicht vor. Setze score:0, matches:[], spans:[], summary kurz & neutral (z.B. "Kein Bedürfnis ausdrücklich genannt"). Das ist KEINE schlechte Note und KEIN Fehler.
  WICHTIG: Eine Kategorie NIE schlecht bewerten nur weil sie fehlt. Fehlt = present:false, nicht score 1-5.

SCHRITT 2 — nur wenn present=true: Qualität bewerten (score 1-10). JEDE present=true Dimension MUSS mindestens 1 match haben (markiert die relevante Textstelle, damit der Balken im Text sichtbar ist):
  1-5 (kritisch):   enthalten aber problematisch (Bewertung, Vorwurf, Forderung) → matches MIT isProblematic=true.
  6-7 (verbessern): enthalten aber unsauber/unhöflich formuliert → matches MIT isProblematic=true (sanfter formulierte explanation).
  8-10 (gut):       enthalten und GFK-nah → 1 match MIT isProblematic=false, der die gelungene Stelle markiert (z.B. das klar benannte Gefühl). diagnosis = kurzes Lob (z.B. "Klares Gefühl"), suggestion = "".

Pro Dimension:
- beobachtung: present wenn der Text ein Verhalten/Ereignis beschreibt ODER bewertet. Niedrig (1-5) bei Bewertung/Verallgemeinerung ("immer","nie","scheiß spät") statt konkreter Beobachtung.
- gefuehl: present NUR wenn ein Gefühl ausgedrückt wird ("ich freue mich","ich bin traurig"). Sonst present:false.
- beduerfnis: present NUR wenn ein Bedürfnis (Verlässlichkeit, Nähe, Respekt, Pünktlichkeit …) ausdrücklich genannt/klar berührt ist. Meist present:false.
- bitte: present wenn eine Aufforderung/Bitte/Forderung im Text steht. Niedrig (1-5) bei Forderung/Drohung, mittel (6-7) wenn Aufforderung unhöflich klingt.

Status-Regeln: score 8-10 → "stark", score 6-7 → "teilweise", score 3-5 → "schwach", score 1-2 → "fehlt".
matches: text = exakter Ausschnitt (max 5 Wörter) aus dem Originaltext. start/end = Zeichenpositionen (0-basiert, end exklusiv). Maximal 3 Treffer pro Dimension.
summary: Immer setzen. Kurze Zeile.
WICHTIG: Innerhalb von JSON-Stringwerten NIEMALS doppelte Anführungszeichen verwenden. Für Zitate aus dem Text nutze einfache Anführungszeichen 'so'.
mainProblem: Nur wenn present=true und score <= 5.
spans: Array aller [start, end] aller matches. Bei keinen matches: spans:[].
total: Holistische GFK-Qualität 1-10. Eine fehlende (present:false) Kategorie senkt total NICHT.

Beispiel "Hallo mein Freund, ich freue mich, wenn wir uns morgen sehen. Sei allerdings nicht wieder so scheiß spät.":
{"dimensions":{"beobachtung":{"present":true,"score":5,"spans":[[76,103]],"status":"schwach","summary":"Bewertung statt Beobachtung","mainProblem":"'scheiß spät' bewertet, statt ein konkretes Ereignis zu beschreiben.","matches":[{"id":"obs_1","text":"nicht wieder so scheiß spät","start":76,"end":103,"diagnosis":"Bewertung","explanation":"Pauschale Abwertung statt konkreter Beobachtung.","suggestion":"Als du letztes Mal eine Stunde später kamst …","priority":1,"isProblematic":true}]},"gefuehl":{"present":true,"score":8,"spans":[[18,31]],"status":"stark","summary":"Klares Gefühl benannt","matches":[{"id":"gef_1","text":"ich freue mich","start":18,"end":32,"diagnosis":"Klares Gefühl","explanation":"Du benennst dein Gefühl direkt und klar.","suggestion":"","priority":1,"isProblematic":false}]},"beduerfnis":{"present":false,"score":0,"spans":[],"status":"fehlt","summary":"Kein Bedürfnis ausdrücklich genannt","matches":[]},"bitte":{"present":true,"score":6,"spans":[[62,103]],"status":"teilweise","summary":"Klingt eher wie Forderung","matches":[{"id":"bit_1","text":"Sei allerdings nicht wieder","start":62,"end":89,"diagnosis":"Forderung statt Bitte","explanation":"Die Aufforderung klingt wie eine Forderung, nicht wie eine höfliche Bitte.","suggestion":"Wärst du das nächste Mal pünktlich? Das wäre mir wichtig.","priority":1,"isProblematic":true}]}},"total":6}`

/**
 * POST /api/score
 * Bewertet einen Text nach GFK-Dimensionen mit strukturierten Treffern.
 *
 * @param request - { text: string }
 * @returns GfkScoreResult oder { error: string }
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'KI nicht konfiguriert' }, { status: 503 })
  }

  let text: string
  try {
    const body = await request.json()
    text = typeof body.text === 'string' ? body.text.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  if (!text || text.length > 2000) {
    return NextResponse.json({ error: 'Text fehlt oder zu lang' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        temperature: 0,
        system: SCORE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude score API error:', response.status, err)
      return NextResponse.json({ error: 'KI-Dienst nicht verfügbar' }, { status: 502 })
    }

    const data = (await response.json()) as { content?: Array<{ text?: string }> }
    const raw = (data.content?.[0]?.text ?? '')
      .trim()
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    const result: GfkScoreResult = JSON.parse(raw)

    // Positionen aus match.text verifizieren und korrigieren, spans ableiten
    for (const dim of Object.values(result.dimensions)) {
      if (typeof dim.present !== 'boolean') dim.present = true // Fallback: anzeigen
      if (!dim.matches) dim.matches = []
      if (!dim.present) {
        // „nicht enthalten" → nichts highlighten, kein Score
        dim.matches = []
        dim.spans = []
        if (!dim.status) dim.status = 'fehlt'
        if (!dim.summary) dim.summary = 'Nicht enthalten'
        continue
      }
      dim.matches = dim.matches
        .filter((m) => m.text && m.text.length > 0)
        .map((m) => {
          // Modell-Positionen gegen den echten Text prüfen
          const slice = text.slice(m.start, m.end)
          if (slice === m.text) return m // korrekt
          // Korrigieren: echte Position suchen
          const idx = text.indexOf(m.text)
          if (idx !== -1) return { ...m, start: idx, end: idx + m.text.length }
          // Fallback: ungültigen Match entfernen
          return null
        })
        .filter(Boolean) as typeof dim.matches
      dim.spans = dim.matches.map((m) => [m.start, m.end] as [number, number])
      if (!dim.status) dim.status = 'teilweise'
      if (!dim.summary) dim.summary = ''
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('score route error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
