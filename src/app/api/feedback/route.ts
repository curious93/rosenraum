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
    // Kompletter Scoring-Kontext (Text, Scores, Vorschlag) für tiefere Analyse — max ~40KB
    const raw = JSON.stringify(context)
    if (raw.length <= 40000) data.context = JSON.parse(raw)
  }

  const t0 = Date.now()
  try {
    await getAdminDb().collection('feedback').add(data)
    logMetric('feedback', true, Date.now() - t0)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('feedback write error:', err)
    logMetric('feedback', false, Date.now() - t0)
    return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
  }
}
