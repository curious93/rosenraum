import { NextRequest, NextResponse } from 'next/server'
import type { GfkScoreResult } from '@/lib/gfkScore'

const SCORE_SYSTEM_PROMPT = `Du bist ein GFK-Analyse-Assistent. Analysiere den Text nach den vier Dimensionen der Gewaltfreien Kommunikation. Antworte NUR mit validem JSON, ohne Markdown-Blöcke.

Für jede Dimension:
- score: 1-10 (10 = vollständig erfüllt, 1 = fehlt komplett)
- spans: [[start, end], ...] — Zeichenpositionen im Text die diese Dimension ansprechen (leer wenn keine spans)

Dimensionen:
- beobachtung: Faktische Beobachtung ohne Urteil oder Generalisierung. Abzüge für "immer"/"nie"/Angriffe/Bewertungen.
- gefuehl: Ich-Botschaften über Gefühle ("ich fühle", "mich macht das", emotionale Wörter aus Ich-Perspektive).
- beduerfnis: Dahinterliegendes Bedürfnis ("weil ich brauche", "mir ist wichtig", "ich wünsche mir").
- bitte: Konkrete, positive Bitte ("könntest du", "ich bitte dich", "würdest du bitte").

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
