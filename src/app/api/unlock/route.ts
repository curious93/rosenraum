import { createHash, createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'

/** Fehlversuche pro IP: max. 5 in 15 Minuten, danach 429. */
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILS = 5
const failsByIp = new Map<string, number[]>()

/**
 * POST /api/unlock
 * Prüft den Site-Code gegen `config/site` und setzt bei Erfolg das signierte
 * Zugangs-Cookie (`{pinVersion}.{hmac}`), das die Edge-Middleware verifiziert.
 * Brute-Force-Schutz: konstante 800ms-Verzögerung bei Fehlversuch + IP-Rate-Limit.
 *
 * @param request - { code: string }
 * @returns { success: true } oder { error } (401 falsch, 429 zu viele Versuche)
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SITE_LOCK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Schutz nicht konfiguriert' }, { status: 503 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  const now = Date.now()
  const fails = (failsByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (fails.length >= MAX_FAILS) {
    const retryMin = Math.ceil((WINDOW_MS - (now - fails[0])) / 60000)
    return NextResponse.json(
      { error: `Zu viele Versuche — bitte in ${retryMin} Min erneut.` },
      { status: 429 }
    )
  }

  let code: string
  try {
    const body = await request.json()
    code = typeof body.code === 'string' ? body.code.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  const siteDoc = await getAdminDb().doc('config/site').get()
  const site = siteDoc.data() as { pinHash?: string; pinVersion?: number } | undefined
  const pinHash = site?.pinHash
  const pinVersion = site?.pinVersion ?? 1

  const codeHash = createHash('sha256')
    .update(code + secret)
    .digest('hex')

  if (!pinHash || codeHash !== pinHash) {
    failsByIp.set(ip, [...fails, now])
    await new Promise((r) => setTimeout(r, 800))
    return NextResponse.json({ error: 'Falscher Code' }, { status: 401 })
  }

  failsByIp.delete(ip)
  const sig = createHmac('sha256', secret).update(`v${pinVersion}`).digest('hex')
  const res = NextResponse.json({ success: true })
  res.cookies.set('site_access', `${pinVersion}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
