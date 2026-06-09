import { NextRequest, NextResponse } from 'next/server'
import type { GfkScoreResult } from '@/lib/gfkScore'

const SCORE_SYSTEM_PROMPT = `Du bist ein GFK-Analyse-Assistent. Analysiere den deutschen Text nach den vier Dimensionen der Gewaltfreien Kommunikation.
Antworte NUR mit validem JSON, ohne Markdown-Blöcke oder Erklärungen.

GRUNDREGEL: Positive, harmlose oder neutrale Nachrichten ("du bist toll", "ich liebe dich", "wie geht es dir?") bekommen hohe Scores (7-10) auf allen Dimensionen. Niedrige Scores (1-4) nur wenn eine Dimension aktiv problematisch ist.

Dimensionen (Score 1-10):
- beobachtung: Hoch wenn Aussagen faktisch/neutral/positiv sind. Niedrig wenn Generalisierungen ("immer"/"nie"), Angriffe oder Schuldzuweisungen.
- gefuehl: Hoch wenn Ich-Perspektive genutzt wird oder keine negativen Emotionen gegen andere gerichtet sind. Niedrig wenn Emotionen als Vorwurf eingesetzt werden.
- beduerfnis: Hoch wenn ein Bedürfnis ausgedrückt wird oder die Nachricht keinen versteckten Forderungscharakter hat. Niedrig wenn bei klarem Konflikt kein Bedürfnis genannt wird.
- bitte: Hoch wenn eine freundliche Bitte vorhanden ist oder keine Bitte nötig ist. Niedrig wenn Forderungen oder Drohungen enthalten sind.

spans: Exakte Zeichenpositionen (0-basiert, Ende exklusiv) der Textstelle die diese Dimension konkret betrifft.
Nur spans setzen wenn die Dimension an dieser Stelle ein PROBLEM hat (niedrige Score-Relevanz). Bei hohen Scores: spans leer [].

Beispiele:
"du bist ein Freund" → {"dimensions":{"beobachtung":{"score":9,"spans":[]},"gefuehl":{"score":9,"spans":[]},"beduerfnis":{"score":8,"spans":[]},"bitte":{"score":9,"spans":[]}},"total":9}
"Du hörst mir nie zu!" → {"dimensions":{"beobachtung":{"score":2,"spans":[[3,19]]},"gefuehl":{"score":3,"spans":[]},"beduerfnis":{"score":2,"spans":[]},"bitte":{"score":2,"spans":[]}},"total":2}
"Ich bin traurig wenn du früh gehst" → {"dimensions":{"beobachtung":{"score":6,"spans":[[16,34]]},"gefuehl":{"score":8,"spans":[[0,15]]},"beduerfnis":{"score":4,"spans":[]},"bitte":{"score":3,"spans":[]}},"total":5}

Format exakt: {"dimensions":{"beobachtung":{"score":N,"spans":[[s,e],...]},"gefuehl":{"score":N,"spans":[[s,e],...]},"beduerfnis":{"score":N,"spans":[[s,e],...]},"bitte":{"score":N,"spans":[[s,e],...]}},"total":N}`

/**
 * POST /api/score
 * Bewertet einen Text nach GFK-Dimensionen (1–10 je Dimension).
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
        max_tokens: 400,
        system: SCORE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude score API error:', response.status, err)
      return NextResponse.json({ error: 'KI-Dienst nicht verfügbar' }, { status: 502 })
    }

    const data = await response.json() as { content?: Array<{ text?: string }> }
    const raw = (data.content?.[0]?.text ?? '').trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    const result: GfkScoreResult = JSON.parse(raw)
    return NextResponse.json(result)
  } catch (err) {
    console.error('score route error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
