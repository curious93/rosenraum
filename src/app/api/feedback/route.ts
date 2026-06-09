import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebaseAdmin'

/** Emoji-Bewertung */
export type FeedbackRating = 'sad' | 'happy' | 'love'

/** Woher das Feedback stammt */
export type FeedbackSource = 'room' | 'landing'

/**
 * POST /api/feedback
 * Speichert anonymes Nutzer-Feedback in Firestore.
 *
 * @param request - { text?, rating?, email?, source, roomId? }
 * @returns { success: true } oder { error: string }
 */
export async function POST(request: NextRequest) {
  let body: {
    text?: string
    rating?: FeedbackRating
    email?: string
    source?: FeedbackSource
    roomId?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const { text, rating, email, source, roomId } = body

  if (!source || !['room', 'landing'].includes(source)) {
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
  if (source === 'room' && roomId && typeof roomId === 'string') {
    data.roomId = roomId
  }

  try {
    await adminDb.collection('feedback').add(data)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('feedback write error:', err)
    return NextResponse.json({ error: 'Konnte nicht gespeichert werden' }, { status: 500 })
  }
}
