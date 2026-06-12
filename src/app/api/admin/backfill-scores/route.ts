import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { requireAdmin } from '../_auth'

/**
 * POST /api/admin/backfill-scores
 * Bewertet alle Feedback-Dokumente ohne aiScore via Claude Haiku (max 100 pro Aufruf).
 *
 * @param request - Request mit Authorization-Header
 * @returns { scored: number, skipped: number } oder { error: string }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'KI nicht konfiguriert' }, { status: 503 })

  const db = getAdminDb()
  const snap = await db.collection('feedback').orderBy('createdAt', 'desc').limit(100).get()

  const toScore = snap.docs.filter((d) => {
    const data = d.data()
    return data.aiScore === undefined && data.text && typeof data.text === 'string'
  })

  let scored = 0
  let skipped = snap.docs.length - toScore.length

  for (const doc of toScore) {
    const text = doc.data().text as string
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
          max_tokens: 5,
          messages: [
            {
              role: 'user',
              content: `Du bist Produktanalyst. Bewerte dieses App-Feedback von 1 (nicht hilfreich) bis 5 (sehr hilfreich und konstruktiv). Kriterien: Konkretheit, Handlungsfähigkeit, Neuheit des Anliegens. Antworte NUR mit einer einzelnen Zahl: 1, 2, 3, 4 oder 5.\n\nFeedback: "${text.slice(0, 500)}"`,
            },
          ],
        }),
      })

      if (!response.ok) {
        skipped++
        continue
      }

      const result = (await response.json()) as { content?: Array<{ text?: string }> }
      const raw = result.content?.[0]?.text?.trim() ?? ''
      const score = parseInt(raw, 10)
      if (score >= 1 && score <= 5) {
        await doc.ref.update({ aiScore: score })
        scored++
      } else {
        skipped++
      }
    } catch {
      skipped++
    }
  }

  return NextResponse.json({ scored, skipped, total: snap.docs.length })
}
