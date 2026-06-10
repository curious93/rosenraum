import { NextRequest, NextResponse } from 'next/server'

const PUNCTUATE_SYSTEM_PROMPT = `Du formatierst deutsche Sprachdiktate. Füge Interpunktion (Punkte, Kommas, Fragezeichen), Groß-/Kleinschreibung am Satzanfang und einen Schlusspunkt ein.
REGELN: Ändere KEINE Wörter. Füge keine Wörter hinzu. Lasse keine Wörter weg. Keine Anführungszeichen ergänzen. Antworte NUR mit dem formatierten Text, ohne Erklärung.`

/**
 * POST /api/punctuate
 * Formatiert ein Sprachdiktat: Interpunktion + Groß-/Kleinschreibung, Wörter unverändert.
 * Fällt bei Fehlern clientseitig auf den Rohtext zurück (Antwort hier trotzdem 4xx/5xx).
 *
 * @param request - { text: string }
 * @returns { text: string } oder { error: string }
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
        max_tokens: Math.min(1000, Math.ceil(text.length / 2) + 60),
        temperature: 0,
        system: [
          { type: 'text', text: PUNCTUATE_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        messages: [{ role: 'user', content: text }],
      }),
    })
    if (!response.ok) {
      console.error('punctuate API error:', response.status)
      return NextResponse.json({ error: 'KI-Dienst nicht verfügbar' }, { status: 502 })
    }
    const data = (await response.json()) as { content?: Array<{ text?: string }> }
    const formatted = (data.content?.[0]?.text ?? '').trim()
    return NextResponse.json({ text: formatted || text })
  } catch (err) {
    console.error('punctuate route error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
