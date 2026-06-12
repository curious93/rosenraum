import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { logMetric } from '@/lib/metrics'

/** Emoji-Bewertung */
export type FeedbackRating = 'sad' | 'happy' | 'love'

/** Woher das Feedback stammt */
export type FeedbackSource = 'room' | 'landing' | 'scoring'

/**
 * POST /api/feedback
 * Speichert anonymes Nutzer-Feedback in Firestore.
 *
 * @param request - { text?, rating?, email?, source, roomId?, context? (nur scoring) }
 * @returns { success: true } oder { error: string }
 */
export async function POST(request: NextRequest) {
  let body: {
    text?: string
    rating?: FeedbackRating
    email?: string
    source?: FeedbackSource
    roomId?: string
    context?: unknown
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const { text, rating, email, source, roomId, context } = body

  if (!source || !['room', 'landing', 'scoring'].includes(source)) {
    return NextResponse.json({ error: 'Ungültige Quelle' }, { status: 400 })
  }

  const data: Record<string, unknown> = {
    source,
    createdAt: FieldValue.serverTimestamp(),
    userAgent: request.headers.get('user-agent') ?? null,
  }

  if (text && typeof text === 'string' && text.trim().length > 0) {
    data.text = text.trim().slice(0, 2000)
  }
  if (rating && ['sad', 'happy', 'love'].includes(rating)) {
    data.rating = rating
  }
  if (email && typeof email === 'string' && email.trim().length > 0) {
    data.email = email.trim().slice(0, 200)
  }
  if (['room', 'scoring'].includes(source) && roomId && typeof roomId === 'string') {
    data.roomId = roomId
  }
  if (source === 'scoring' && context !== undefined) {
    // Kompletter Scoring-Kontext (Text, Scores, Vorschlag) für tiefere Analyse — max ~40KB.
    // Als JSON-String, weil Firestore verschachtelte Arrays (z.B. spans: number[][]) ablehnt.
    const raw = JSON.stringify(context)
    if (raw.length <= 40000) data.context = raw
  }

  const t0 = Date.now()
  try {
    const ref = await getAdminDb().collection('feedback').add(data)
    logMetric('feedback', true, Date.now() - t0)

    // Async AI-Scoring — blockiert nicht die Antwort
    if (data.text && typeof data.text === 'string') {
      scoreWithAi(ref.id, data.text as string).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('feedback write error:', err)
    logMetric('feedback', false, Date.now() - t0)
    return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
  }
}

/**
 * Bewertet ein Feedback-Dokument mit Claude Haiku (1–5) und schreibt `aiScore` in Firestore.
 * Fehler werden still ignoriert — aiScore bleibt null.
 *
 * @param docId - Firestore-Dokument-ID des Feedback-Eintrags
 * @param text - Feedback-Text
 */
async function scoreWithAi(docId: string, text: string): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5,
      messages: [
        {
          role: 'user',
          content: `Du bist Produktanalyst. Bewerte dieses App-Feedback von 1 (nicht hilfreich) bis 5 (sehr hilfreich und konstruktiv). Kriterien: Konkretheit, Handlungsfähigkeit, Neuheit des Anliegens. Antworte NUR mit einer einzelnen Zahl: 1, 2, 3, 4 oder 5.\n\nFeedback: "${text.slice(0, 500)}"`,
        },
      ],
    }),
  })

  if (!response.ok) return

  const result = (await response.json()) as { content?: Array<{ text?: string }> }
  const raw = result.content?.[0]?.text?.trim() ?? ''
  const score = parseInt(raw, 10)
  if (score >= 1 && score <= 5) {
    await getAdminDb().doc(`feedback/${docId}`).update({ aiScore: score })
  }
}
