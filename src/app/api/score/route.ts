import { NextRequest, NextResponse } from 'next/server'
import type { GfkScoreResult } from '@/lib/gfkScore'

const SCORE_SYSTEM_PROMPT = `Du bist ein GFK-Analyse-Assistent. Analysiere den deutschen Text strikt nach den vier Dimensionen der Gewaltfreien Kommunikation (GFK).

Antworte NUR mit validem JSON, ohne Markdown-Blöcke oder Erklärungen.

GRUNDREGEL: Positive, harmlose oder neutrale Nachrichten bekommen hohe Scores (7-10) auf allen Dimensionen und leere matches []. Niedrige Scores (1-5) und matches NUR wenn eine Dimension aktiv problematisch ist.

Dimensionen (Score 1-10):
- beobachtung: Hoch bei faktischen/neutralen/positiven Aussagen. Niedrig bei Generalisierungen ("immer"/"nie"), Bewertungen, Schuldzuweisungen.
- gefuehl: Hoch bei Ich-Perspektive oder fehlenden Negativemotionen. Niedrig wenn Emotionen als Vorwurf eingesetzt werden.
- beduerfnis: Hoch wenn Bedürfnis ausgedrückt oder nicht nötig. Niedrig wenn bei klarem Konflikt kein Bedürfnis genannt.
- bitte: Hoch bei freundlicher Bitte oder keiner nötigen Bitte. Niedrig bei Forderungen oder Drohungen.

Status-Regeln: score 8-10 → "stark", score 6-7 → "teilweise", score 3-5 → "schwach", score 1-2 → "fehlt"

matches: Nur bei score <= 6 UND konkreten Problemstellen. Maximal 5 Treffer pro Dimension, sortiert nach priority (1 = wichtigster). Jeder Match: id (z.B. "obs_1"), text (exakter Ausschnitt aus dem Originaltext), start (0-basiert), end (exklusiv), diagnosis (1-3 Wörter), explanation (1 Satz), suggestion (konkrete Umformulierung), priority (1-5), isProblematic (true/false).

summary: Immer setzen. Kurze Zeile, z.B. "2 Stellen · Bewertung statt Beobachtung" oder "Klar und faktisch formuliert".
mainProblem: Nur wenn score <= 5 — ein Satz der das Hauptproblem beschreibt.
spans: Setze spans = Array aller [start, end] von isProblematic matches. Bei keinen matches: spans = [].

Beispiel "ich finde dich wirklich immer Blöd":
{"dimensions":{"beobachtung":{"score":2,"spans":[[24,34]],"status":"fehlt","summary":"1 Stelle · Bewertung statt Beobachtung","mainProblem":"Du beschreibst kein konkretes Ereignis, sondern bewertest die Person.","matches":[{"id":"obs_1","text":"immer Blöd","start":24,"end":34,"diagnosis":"Bewertung / Verallgemeinerung","explanation":"Diese Stelle enthält eine pauschale Bewertung statt einer konkreten Beobachtung.","suggestion":"Als du heute Abend meine Bitte ignoriert hast …","priority":1,"isProblematic":true}]},"gefuehl":{"score":4,"spans":[],"status":"schwach","summary":"Gefühl angedeutet, aber nicht klar ausgedrückt","mainProblem":"Ein konkretes Ich-Gefühl fehlt.","matches":[]},"beduerfnis":{"score":2,"spans":[],"status":"fehlt","summary":"Kein Bedürfnis genannt","mainProblem":"Was du dir wünschst wird nicht benannt.","matches":[]},"bitte":{"score":2,"spans":[],"status":"fehlt","summary":"Keine konkrete Bitte","mainProblem":"Es fehlt eine freundliche Bitte.","matches":[]}},"total":3}`

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

    // Sicherstellen dass alle Felder vorhanden sind (Fallback für ältere Antworten)
    for (const dim of Object.values(result.dimensions)) {
      if (!dim.matches) dim.matches = []
      if (!dim.spans || dim.spans.length === 0) {
        dim.spans = dim.matches
          .filter((m) => m.isProblematic)
          .map((m) => [m.start, m.end] as [number, number])
      }
      if (!dim.status) dim.status = 'teilweise'
      if (!dim.summary) dim.summary = ''
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('score route error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
