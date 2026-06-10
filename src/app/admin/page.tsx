'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { app } from '@/lib/firebase'

/** Auto-Logout nach 10 Minuten */
const SESSION_MS = 10 * 60 * 1000

interface Stats {
  generatedAt: number
  health: Array<{
    route: string
    count24h: number
    errorRate: number
    p50: number
    p95: number
    lastError: number | null
  }>
  tokens: {
    today: { tokensIn: number; tokensOut: number; cacheShare: number; costUsd: number }
    week: { tokensIn: number; tokensOut: number; cacheShare: number; costUsd: number }
  }
  usage: {
    roomsTotal: number
    rooms24h: number
    rooms7d: number
    messagesTotal: number
    messages24h: number
    participantsTotal: number
  }
  funnel: { messagesTotal: number; withLearningDots: number; sentRosenberg: number }
  feedback: {
    count24h: number
    count7d: number
    latest: Array<{ id: string; text: string; source: string; createdAt: number | null }>
  }
  system: { pinVersion: number | null }
}

/**
 * Karten-Hülle im App-Stil.
 *
 * @param props - title + children
 * @param props.title - Kartentitel
 * @param props.children - Karteninhalt
 * @returns Card JSX
 */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl p-4"
      style={{ background: 'var(--color-bg-elevated)' }}
      aria-label={title}
    >
      <h2 className="mb-2 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

/**
 * /admin — Dashboard mit Google-Login (Allowlist), Auto-Logout nach 10 Minuten.
 *
 * @returns Admin-Seite JSX
 */
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(SESSION_MS)
  const [newPin, setNewPin] = useState('')
  const [pinMsg, setPinMsg] = useState<string | null>(null)
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const auth = getAuth(app)

  const doLogout = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    signOut(auth).catch(() => {})
    setStats(null)
  }, [auth])

  useEffect(() => onAuthStateChanged(auth, setUser), [auth])

  // Auto-Logout + Countdown
  useEffect(() => {
    if (!user) return
    const start = Date.now()
    logoutTimer.current = setTimeout(doLogout, SESSION_MS)
    const tick = setInterval(
      () => setRemaining(Math.max(0, SESSION_MS - (Date.now() - start))),
      1000
    )
    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current)
      clearInterval(tick)
    }
  }, [user, doLogout])

  const loadStats = useCallback(async () => {
    if (!auth.currentUser) return
    const token = await auth.currentUser.getIdToken()
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)
    if (!res) {
      setError('Netzwerkfehler.')
      return
    }
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? `Fehler ${res.status}.`)
      if (res.status === 403) setTimeout(doLogout, 2500)
      return
    }
    setError(null)
    setStats((await res.json()) as Stats)
  }, [auth, doLogout])

  useEffect(() => {
    if (!user) return
    const t = setTimeout(loadStats, 0)
    return () => clearTimeout(t)
  }, [user, loadStats])

  async function changePin() {
    if (!auth.currentUser || newPin.trim().length < 4) return
    const token = await auth.currentUser.getIdToken()
    const res = await fetch('/api/admin/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pin: newPin.trim() }),
    }).catch(() => null)
    if (res?.ok) {
      setPinMsg('Code geändert — alle bestehenden Zugänge müssen neu entsperren.')
      setNewPin('')
      loadStats()
    } else {
      const data = (await res?.json().catch(() => null)) as { error?: string } | null
      setPinMsg(data?.error ?? 'Änderung fehlgeschlagen.')
    }
  }

  const fmt = (n: number) => n.toLocaleString('de-DE')
  const ampel = (h: Stats['health'][number]) =>
    h.errorRate >= 20 ? '🔴' : h.errorRate > 0 || h.p95 > 10000 ? '🟡' : '🟢'

  if (!user) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-6"
        style={{ background: 'var(--color-bg-page)' }}
      >
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Rosenraum Admin
        </h1>
        <button
          onClick={() =>
            signInWithPopup(auth, new GoogleAuthProvider()).catch(() =>
              setError('Login fehlgeschlagen.')
            )
          }
          className="rounded-2xl px-6 py-3 text-sm font-medium"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          Mit Google anmelden
        </button>
        {error && (
          <p className="text-sm" style={{ color: 'var(--color-destructive)' }}>
            {error}
          </p>
        )}
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6" style={{ background: 'var(--color-bg-page)' }}>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Rosenraum Admin
          </h1>
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span>
              {user.email} · Auto-Logout in {Math.ceil(remaining / 60000)} Min
            </span>
            <button
              onClick={doLogout}
              className="rounded-full px-3 py-1.5 font-medium"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Abmelden
            </button>
          </div>
        </header>

        {error && (
          <p className="text-sm" style={{ color: 'var(--color-destructive)' }}>
            {error}
          </p>
        )}
        {!stats && !error && (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Lade Statistiken…
          </p>
        )}

        {stats && (
          <>
            <Card title="API-Health (24h)">
              <table className="w-full text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <tbody>
                  {stats.health.length === 0 && (
                    <tr>
                      <td>Noch keine Metriken.</td>
                    </tr>
                  )}
                  {stats.health.map((h) => (
                    <tr key={h.route}>
                      <td className="py-0.5">
                        {ampel(h)} {h.route}
                      </td>
                      <td className="text-right tabular-nums">{h.count24h} Calls</td>
                      <td className="text-right tabular-nums">{h.errorRate}% Fehler</td>
                      <td className="text-right tabular-nums">
                        p50 {(h.p50 / 1000).toFixed(1)}s · p95 {(h.p95 / 1000).toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card title="Token-Verbrauch & Kosten">
              <div
                className="grid grid-cols-2 gap-3 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide">Heute</p>
                  <p className="tabular-nums">
                    {fmt(stats.tokens.today.tokensIn)} in · {fmt(stats.tokens.today.tokensOut)} out
                  </p>
                  <p className="tabular-nums">
                    Cache {stats.tokens.today.cacheShare}% · ~
                    {stats.tokens.today.costUsd.toFixed(2)} $
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide">7 Tage</p>
                  <p className="tabular-nums">
                    {fmt(stats.tokens.week.tokensIn)} in · {fmt(stats.tokens.week.tokensOut)} out
                  </p>
                  <p className="tabular-nums">
                    Cache {stats.tokens.week.cacheShare}% · ~{stats.tokens.week.costUsd.toFixed(2)}{' '}
                    $
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Nutzung">
              <div
                className="grid grid-cols-3 gap-3 text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <p>
                  Räume: <b className="tabular-nums">{fmt(stats.usage.roomsTotal)}</b>
                  <br />+{stats.usage.rooms24h} (24h) · +{stats.usage.rooms7d} (7d)
                </p>
                <p>
                  Nachrichten: <b className="tabular-nums">{fmt(stats.usage.messagesTotal)}</b>
                  <br />+{stats.usage.messages24h} (24h)
                </p>
                <p>
                  Teilnehmer: <b className="tabular-nums">{fmt(stats.usage.participantsTotal)}</b>
                </p>
              </div>
            </Card>

            <Card title="Lern-Funnel">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {fmt(stats.funnel.withLearningDots)} von {fmt(stats.funnel.messagesTotal)}{' '}
                Nachrichten mit Lern-Angebot · {fmt(stats.funnel.sentRosenberg)}× Rosenraum-Version
                gesendet
              </p>
            </Card>

            <Card
              title={`Feedback (${stats.feedback.count24h} heute · ${stats.feedback.count7d} / 7d)`}
            >
              <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {stats.feedback.latest.length === 0 && <li>Noch kein Feedback.</li>}
                {stats.feedback.latest.map((f) => (
                  <li key={f.id}>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      [{f.source}]{' '}
                      {f.createdAt ? new Date(f.createdAt).toLocaleString('de-DE') : ''}
                    </span>
                    <br />
                    {f.text || '—'}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title={`System · Zugangscode (Version ${stats.system.pinVersion ?? '–'})`}>
              <div className="flex items-center gap-2">
                <input
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Neuer Code (4–12)"
                  maxLength={12}
                  className="w-44 rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <button
                  onClick={changePin}
                  disabled={newPin.trim().length < 4}
                  className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                >
                  Code ändern
                </button>
              </div>
              {pinMsg && (
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {pinMsg}
                </p>
              )}
            </Card>
          </>
        )}
      </div>
    </main>
  )
}
