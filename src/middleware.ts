import { NextRequest, NextResponse } from 'next/server'

/**
 * Site-PIN-Schutz (Edge): Jede Seite/API verlangt ein gültiges `site_access`-Cookie
 * (`{pinVersion}.{hmacHex}`). Kein Firestore hier — der Unlock-Endpoint signiert,
 * die Middleware verifiziert nur die HMAC-Signatur. PIN-Wechsel erhöht die Version
 * und macht alle alten Cookies ungültig.
 */

const PUBLIC_PATHS = ['/unlock', '/api/unlock', '/api/version']

/**
 * HMAC-SHA256-Signatur (hex) über die Cookie-Payload.
 *
 * @param payload - zu signierender Wert (z.B. "v1")
 * @param secret - SITE_LOCK_SECRET
 * @returns Hex-Signatur
 */
async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Prüft das Zugangs-Cookie und leitet sonst auf /unlock um (Seiten) bzw. 401 (APIs).
 *
 * @param request - eingehender Request
 * @returns NextResponse (next, redirect oder 401)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  const secret = process.env.SITE_LOCK_SECRET
  if (!secret) return NextResponse.next() // Schutz nicht konfiguriert → offen (Fail-open für Dev)

  const cookie = request.cookies.get('site_access')?.value
  if (cookie) {
    const dot = cookie.indexOf('.')
    if (dot > 0) {
      const version = cookie.slice(0, dot)
      const sig = cookie.slice(dot + 1)
      const expected = await hmacHex(`v${version}`, secret)
      if (sig === expected) return NextResponse.next()
    }
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Zugang gesperrt' }, { status: 401 })
  }
  const url = request.nextUrl.clone()
  url.pathname = '/unlock'
  url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2?)).*)',
  ],
}
