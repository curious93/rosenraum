import { NextRequest, NextResponse } from 'next/server'
import type { GfkScoreResult } from '@/lib/gfkScore'

const SCORE_SYSTEM_PROMPT = `Du bist ein GFK-Analyse-Assistent. Analysiere den deutschen Text strikt nach den vier Dimensionen der Gewaltfreien Kommunikation (GFK).

Antworte NUR mit validem JSON, ohne Markdown-Blöcke oder Erklärungen.

GRUNDREGELN:
1. Wenn score <= 6: matches DARF NICHT leer sein. Zeige die Textstelle wo die Verbesserung möglich wäre.
2. Wenn score >= 8: matches ist immer []. Dimension ist gut oder nicht relevant.
3. isProblematic=true bei aktivem Fehler (Bewertung, Vorwurf, Forderung). isProblematic=false wenn Stelle verbesserbar aber kein Fehler (z.B. Gefühl nur angedeutet).
4. beduerfnis/bitte: score 8 + matches:[] wenn diese Dimension im Text schlicht nicht vorkommt. NUR score<=6 + matches wenn eine Forderung/Drohung im Text steht.

Dimensionen (Score 1-10):
- beobachtung: Niedrig bei Bewertungen/Verallgemeinerungen ("immer","nie","du bist..."). Match = das konkrete Wort/die Phrase.
- gefuehl: Score 6 wenn Gefühl nur implizit/angedeutet. Match = der Satzbereich der ein Gefühl enthält oder wo eines fehlt, isProblematic=false, suggestion = explizite Ich-Formulierung.
- beduerfnis: Score 8 + matches:[] wenn Dimension fehlt. Nur niedrig wenn Forderung/Drohung vorhanden.
- bitte: Score 8 + matches:[] wenn Dimension fehlt. Nur niedrig bei Forderung/Drohung.

Status-Regeln: score 8-10 → "stark", score 6-7 → "teilweise", score 3-5 → "schwach", score 1-2 → "fehlt"

matches: text = exakter Ausschnitt (max 5 Wörter) aus dem Originaltext. start/end = Zeichenpositionen (0-basiert, end exklusiv). Maximal 3 Treffer pro Dimension.
summary: Immer setzen. Kurze Zeile.
mainProblem: Nur wenn score <= 5.
spans: Array aller [start, end] aller matches (inkl. isProblematic=false). Bei keinen matches: spans:[].

Beispiel "ich finde dich wirklich immer Blöd":
{"dimensions":{"beobachtung":{"score":2,"spans":[[30,40]],"status":"fehlt","summary":"1 Stelle · Bewertung statt Beobachtung","mainProblem":"Du beschreibst kein konkretes Ereignis, sondern bewertest die Person.","matches":[{"id":"obs_1","text":"immer Blöd","start":30,"end":40,"diagnosis":"Bewertung","explanation":"Pauschale Bewertung statt konkreter Beobachtung.","suggestion":"Als du heute Abend meine Bitte ignoriert hast …","priority":1,"isProblematic":true}]},"gefuehl":{"score":6,"spans":[[0,25]],"status":"teilweise","summary":"Gefühl angedeutet, nicht klar benannt","matches":[{"id":"gef_1","text":"ich finde dich wirklich","start":0,"end":23,"diagnosis":"Gefühl fehlt","explanation":"'Finden' drückt kein klares Ich-Gefühl aus.","suggestion":"Ich fühle mich verletzt wenn …","priority":1,"isProblematic":false}]},"beduerfnis":{"score":8,"spans":[],"status":"stark","summary":"Nicht relevant für diesen Satz","matches":[]},"bitte":{"score":8,"spans":[],"status":"stark","summary":"Nicht relevant für diesen Satz","matches":[]}},"total":5}`

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

    // spans immer aus matches ableiten — API-generierte spans ignorieren
    for (const dim of Object.values(result.dimensions)) {
      if (!dim.matches) dim.matches = []
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
