import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { requireAdmin } from '../_auth'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 Stunden

/**
 *
 */
export interface FeedbackTopic {
  id: string
  label: string
  description: string
  count: number
}

/**
 * GET /api/admin/feedback-topics
 * Gibt gecachte KI-Themen zurück (max 6h alt). Generiert neu wenn Cache abgelaufen.
 *
 * @param request - Request mit Authorization-Header
 * @returns { topics: FeedbackTopic[] } oder { error: string }
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const db = getAdminDb()

  // Cache lesen
  const cacheDoc = await db.doc('config/feedbackTopics').get()
  const cache = cacheDoc.data()
  if (cache?.topics && cache.generatedAt && Date.now() - cache.generatedAt < CACHE_TTL_MS) {
    return NextResponse.json({ topics: cache.topics as FeedbackTopic[] })
  }

  // Neu generieren
  const topics = await generateTopics(db)
  if (topics) {
    await db.doc('config/feedbackTopics').set({
      topics,
      generatedAt: Date.now(),
    })
  }

  return NextResponse.json({ topics: topics ?? [] })
}

/**
 * POST /api/admin/feedback-topics
 * Invalidiert den Cache und generiert Themen sofort neu.
 *
 * @param request - Request mit Authorization-Header
 * @returns { topics: FeedbackTopic[] } oder { error: string }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const db = getAdminDb()
  await db.doc('config/feedbackTopics').set({ topics: [], generatedAt: 0 })

  const topics = await generateTopics(db)
  if (topics) {
    await db.doc('config/feedbackTopics').set({
      topics,
      generatedAt: Date.now(),
    })
  }

  return NextResponse.json({ topics: topics ?? [] })
}

/**
 * Liest die letzten 100 Feedbacks, analysiert Themen via Claude Haiku und
 * zählt anschließend wie viele Einträge je Thema passen (keyword-basiert).
 *
 * @param db - Firestore Admin-Instanz
 * @returns Array der erkannten Themen mit Zählern, oder null bei Fehler
 */
async function generateTopics(db: ReturnType<typeof getAdminDb>): Promise<FeedbackTopic[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const snap = await db.collection('feedback').orderBy('createdAt', 'desc').limit(100).get()
  const texts = snap.docs
    .map((d) => (d.data().text as string | undefined)?.trim())
    .filter((t): t is string => !!t && t.length > 3)

  if (texts.length < 3) return []

  const joined = texts.map((t, i) => `${i + 1}. ${t.slice(0, 200)}`).join('\n')

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
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: `Analysiere diese Nutzerfeedbacks einer App und erkenne bis zu 6 wiederkehrende Themen.\nGib ein JSON-Array zurück (NUR das Array, kein anderer Text):\n[{"id":"kebab-slug","label":"Aussagekräftiges Kurzthema (3–6 Wörter)","description":"Ein Satz was dieses Thema umfasst"}]\nKeine Einwort-Topics. Beispiele: "Unklare Navigation beim Einstieg", "KI-Analyse zu langsam", "Wunsch nach Dunkel-Modus".\n\nFeedbacks:\n${joined}`,
          },
        ],
      }),
    })

    if (!response.ok) return null

    const result = (await response.json()) as { content?: Array<{ text?: string }> }
    const raw = result.content?.[0]?.text?.trim() ?? ''

    // JSON aus der Antwort extrahieren
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) return null

    const parsed = JSON.parse(match[0]) as Array<{
      id: string
      label: string
      description: string
    }>
    if (!Array.isArray(parsed)) return null

    // Zähler: wie viele Feedback-Texte enthalten Keywords aus dem Label/Description
    const topics: FeedbackTopic[] = parsed
      .filter((t) => t.id && t.label && t.description)
      .map((t) => {
        const keywords = `${t.label} ${t.description}`
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 4)
        const count = texts.filter((fb) => {
          const lower = fb.toLowerCase()
          return keywords.some((kw) => lower.includes(kw))
        }).length
        return { id: t.id, label: t.label, description: t.description, count }
      })
      .sort((a, b) => b.count - a.count)

    // Zähler auch in Firestore pro Feedback-Dokument setzen (topics-Array)
    const batch = db.batch()
    for (const doc of snap.docs) {
      const fbText = (doc.data().text as string | undefined)?.toLowerCase() ?? ''
      const matchedIds = topics
        .filter((t) => {
          const kws = `${t.label} ${t.description}`
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 4)
          return kws.some((kw) => fbText.includes(kw))
        })
        .map((t) => t.id)
      batch.update(doc.ref, { topics: matchedIds.length > 0 ? matchedIds : FieldValue.delete() })
    }
    await batch.commit().catch(() => {})

    return topics
  } catch {
    return null
  }
}
