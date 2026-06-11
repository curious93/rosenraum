import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { requireAdmin } from '../_auth'

/** Haiku-Preise (USD pro 1M Tokens) für die grobe Kostenschätzung */
const PRICE_IN = 1.0
const PRICE_OUT = 5.0
const PRICE_CACHE_READ = 0.1

interface MetricDoc {
  route: string
  ok: boolean
  ms: number
  tokensIn: number | null
  tokensOut: number | null
  cacheRead: number | null
  createdAt?: Timestamp
}

/**
 * Perzentil aus einer (unsortierten) Liste.
 *
 * @param values - Messwerte
 * @param p - Perzentil 0–1
 * @returns Wert am Perzentil oder 0
 */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
}

/**
 * GET /api/admin/stats
 * Aggregiert Dashboard-Daten: API-Health, Token/Kosten, Nutzung, Lern-Funnel,
 * Feedback-Insights, System. Nur für Allowlist-Admins (Bearer-ID-Token).
 *
 * @param request - Request mit Authorization-Header
 * @returns Aggregierte Statistiken oder Fehler
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const db = getAdminDb()
  const now = Date.now()
  const t24h = Timestamp.fromMillis(now - 24 * 3600 * 1000)
  const t7d = Timestamp.fromMillis(now - 7 * 24 * 3600 * 1000)

  try {
    // ── Metrics (7 Tage laden, lokal aggregieren — Volumen ist klein) ──
    const metricsSnap = await db
      .collection('metrics')
      .where('createdAt', '>=', t7d)
      .orderBy('createdAt', 'desc')
      .limit(5000)
      .get()
    const metrics = metricsSnap.docs.map((d) => d.data() as MetricDoc)
    const m24 = metrics.filter((m) => (m.createdAt?.toMillis() ?? 0) >= t24h.toMillis())

    const routes = [...new Set(metrics.map((m) => m.route))].sort()
    const health = routes.map((route) => {
      const r24 = m24.filter((m) => m.route === route)
      const errs = r24.filter((m) => !m.ok)
      const lastErr = metrics.find((m) => m.route === route && !m.ok)
      return {
        route,
        count24h: r24.length,
        errorRate: r24.length ? Math.round((errs.length / r24.length) * 100) : 0,
        p50: percentile(
          r24.map((m) => m.ms),
          0.5
        ),
        p95: percentile(
          r24.map((m) => m.ms),
          0.95
        ),
        lastError: lastErr?.createdAt?.toMillis() ?? null,
      }
    })

    const tokenAgg = (list: MetricDoc[]) => {
      const tIn = list.reduce((a, m) => a + (m.tokensIn ?? 0), 0)
      const tOut = list.reduce((a, m) => a + (m.tokensOut ?? 0), 0)
      const tCache = list.reduce((a, m) => a + (m.cacheRead ?? 0), 0)
      const cost = (tIn * PRICE_IN + tOut * PRICE_OUT + tCache * PRICE_CACHE_READ) / 1_000_000
      return {
        tokensIn: tIn,
        tokensOut: tOut,
        cacheRead: tCache,
        cacheShare: tIn + tCache > 0 ? Math.round((tCache / (tIn + tCache)) * 100) : 0,
        costUsd: Math.round(cost * 100) / 100,
      }
    }

    // ── Zeitreihen ──
    const HOUR = 3600_000
    const DAY = 24 * HOUR
    const start24h = now - 24 * HOUR
    const start7d = now - 7 * DAY
    const calls24h = Array.from({ length: 24 }, () => ({ calls: 0, errors: 0 }))
    for (const m of m24) {
      const ts = m.createdAt?.toMillis() ?? 0
      const idx = Math.min(23, Math.max(0, Math.floor((ts - start24h) / HOUR)))
      calls24h[idx].calls++
      if (!m.ok) calls24h[idx].errors++
    }
    const cost7d = Array.from({ length: 7 }, () => 0)
    for (const m of metrics) {
      const ts = m.createdAt?.toMillis() ?? 0
      const idx = Math.min(6, Math.max(0, Math.floor((ts - start7d) / DAY)))
      const cost =
        ((m.tokensIn ?? 0) * PRICE_IN +
          (m.tokensOut ?? 0) * PRICE_OUT +
          (m.cacheRead ?? 0) * PRICE_CACHE_READ) /
        1_000_000
      cost7d[idx] += cost
    }
    const [msgs7dSnap, rooms7dSnap] = await Promise.all([
      db.collectionGroup('messages').where('timestamp', '>=', t7d).get(),
      db.collection('rooms').where('createdAt', '>=', t7d).get(),
    ])
    const messages7d = Array.from({ length: 7 }, () => 0)
    for (const d of msgs7dSnap.docs) {
      const ts = (d.data().timestamp as Timestamp | undefined)?.toMillis() ?? 0
      messages7d[Math.min(6, Math.max(0, Math.floor((ts - start7d) / DAY)))]++
    }
    const roomsSeries7d = Array.from({ length: 7 }, () => 0)
    for (const d of rooms7dSnap.docs) {
      const ts = (d.data().createdAt as Timestamp | undefined)?.toMillis() ?? 0
      roomsSeries7d[Math.min(6, Math.max(0, Math.floor((ts - start7d) / DAY)))]++
    }
    const days = Array.from({ length: 7 }, (_, i) => start7d + i * DAY)

    // ── Nutzung ──
    const [roomsTotal, rooms24h, rooms7d] = await Promise.all([
      db.collection('rooms').count().get(),
      db.collection('rooms').where('createdAt', '>=', t24h).count().get(),
      db.collection('rooms').where('createdAt', '>=', t7d).count().get(),
    ])
    const [msgsTotal, msgs24h, participants] = await Promise.all([
      db.collectionGroup('messages').count().get(),
      db.collectionGroup('messages').where('timestamp', '>=', t24h).count().get(),
      db.collectionGroup('participants').count().get(),
    ])

    // ── Lern-Funnel ──
    const [withDots, sentRosenberg] = await Promise.all([
      db.collectionGroup('messages').where('hasLearningDots', '==', true).count().get(),
      db.collectionGroup('messages').where('sentVersion', '==', 'rosenberg').count().get(),
    ])

    // ── Feedback ──
    const [fb24h, fb7d, fbLatest] = await Promise.all([
      db.collection('feedback').where('createdAt', '>=', t24h).count().get(),
      db.collection('feedback').where('createdAt', '>=', t7d).count().get(),
      db.collection('feedback').orderBy('createdAt', 'desc').limit(10).get(),
    ])

    // ── System ──
    const site = (await db.doc('config/site').get()).data()

    return NextResponse.json({
      generatedAt: now,
      health,
      series: {
        calls24h,
        days,
        messages7d,
        rooms7d: roomsSeries7d,
        cost7d: cost7d.map((c) => Math.round(c * 1000) / 1000),
      },
      tokens: { today: tokenAgg(m24), week: tokenAgg(metrics) },
      usage: {
        roomsTotal: roomsTotal.data().count,
        rooms24h: rooms24h.data().count,
        rooms7d: rooms7d.data().count,
        messagesTotal: msgsTotal.data().count,
        messages24h: msgs24h.data().count,
        participantsTotal: participants.data().count,
      },
      funnel: {
        messagesTotal: msgsTotal.data().count,
        withLearningDots: withDots.data().count,
        sentRosenberg: sentRosenberg.data().count,
      },
      feedback: {
        count24h: fb24h.data().count,
        count7d: fb7d.data().count,
        latest: fbLatest.docs.map((d) => {
          const x = d.data()
          return {
            id: d.id,
            text: x.text ?? '',
            source: x.source ?? '',
            createdAt: x.createdAt?.toMillis?.() ?? null,
          }
        }),
      },
      system: { pinVersion: site?.pinVersion ?? null },
    })
  } catch (err) {
    console.error('admin stats error:', err)
    return NextResponse.json({ error: 'Statistiken nicht verfügbar' }, { status: 500 })
  }
}
