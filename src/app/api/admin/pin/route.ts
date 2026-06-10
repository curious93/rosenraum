import { createHash, createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { requireAdmin } from '../_auth'

/**
 * POST /api/admin/pin
 * Ändert den Site-Zugangscode: neuer Hash + pinVersion++ — alle bestehenden
 * Zugangs-Cookies werden dadurch ungültig. Das eigene Cookie wird direkt
 * auf die neue Version erneuert, damit der Admin nicht ausgesperrt wird.
 *
 * @param request - { pin: string } (4–12 Zeichen) + Authorization Bearer
 * @returns { success: true, pinVersion } oder Fehler
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const secret = process.env.SITE_LOCK_SECRET
  if (!secret) return NextResponse.json({ error: 'Schutz nicht konfiguriert' }, { status: 503 })

  let pin: string
  try {
    const body = await request.json()
    pin = typeof body.pin === 'string' ? body.pin.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }
  if (pin.length < 4 || pin.length > 12) {
    return NextResponse.json({ error: 'Code muss 4–12 Zeichen haben' }, { status: 400 })
  }

  const ref = getAdminDb().doc('config/site')
  const current = (await ref.get()).data() as { pinVersion?: number } | undefined
  const pinVersion = (current?.pinVersion ?? 0) + 1
  const pinHash = createHash('sha256')
    .update(pin + secret)
    .digest('hex')
  await ref.set({ pinHash, pinVersion }, { merge: true })

  const sig = createHmac('sha256', secret).update(`v${pinVersion}`).digest('hex')
  const res = NextResponse.json({ success: true, pinVersion })
  res.cookies.set('site_access', `${pinVersion}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
