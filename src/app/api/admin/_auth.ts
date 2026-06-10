import { NextRequest } from 'next/server'
import { getAdminAuth } from '@/lib/firebaseAdmin'

/**
 * Verifiziert das Firebase-ID-Token aus dem Authorization-Header und prüft
 * die E-Mail gegen die ADMIN_EMAILS-Allowlist (kommasepariert).
 *
 * @param request - eingehender Request mit `Authorization: Bearer <idToken>`
 * @returns E-Mail des Admins oder ein Fehlerobjekt mit Status
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ email: string } | { error: string; status: number }> {
  const allow = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  if (allow.length === 0) return { error: 'Admin nicht konfiguriert', status: 503 }

  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return { error: 'Nicht angemeldet', status: 401 }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    const email = (decoded.email ?? '').toLowerCase()
    if (!email || !allow.includes(email)) {
      return { error: 'Kein Zugriff für dieses Konto', status: 403 }
    }
    return { email }
  } catch {
    return { error: 'Ungültiges Token', status: 401 }
  }
}
