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
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  DoorOpen,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  MessageCircle,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react'
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
 * Zahl im deutschen Format.
 *
 * @param n - Zahl
 * @returns Formatierter String
 */
function fmt(n: number): string {
  return n.toLocaleString('de-DE')
}

/**
 * Relative Zeitangabe ("vor 3 Std").
 *
 * @param ts - Zeitstempel in ms
 * @returns Lesbarer Abstand zu jetzt
 */
function relTime(ts: number): string {
  const min = Math.round((Date.now() - ts) / 60000)
  if (min < 1) return 'gerade eben'
  if (min < 60) return `vor ${min} Min`
  const h = Math.round(min / 60)
  if (h < 24) return `vor ${h} Std`
  return `vor ${Math.round(h / 24)} Tg`
}

/**
 * Ampel-Status einer Route: Label, Farbe und Icon (nie Farbe allein).
 *
 * @param h - Health-Eintrag der Route
 * @returns Status-Deskriptor
 */
function healthStatus(h: Stats['health'][number]): {
  label: string
  color: string
  Icon: typeof CheckCircle2
} {
  if (h.errorRate >= 20)
    return { label: `${h.errorRate}% Fehler`, color: 'var(--color-destructive)', Icon: XCircle }
  if (h.errorRate > 0)
    return { label: `${h.errorRate}% Fehler`, color: 'var(--color-warning)', Icon: AlertTriangle }
  if (h.p95 > 10000) return { label: 'langsam', color: 'var(--color-warning)', Icon: AlertTriangle }
  return { label: 'OK', color: 'var(--color-success)', Icon: CheckCircle2 }
}

/**
 * Dashboard-Karte: Titel → optionale Meta → Inhalt.
 *
 * @param props - Karten-Props
 * @param props.title - Kartentitel
 * @param props.meta - Optionale Zusatzinfo rechts neben dem Titel
 * @param props.children - Karteninhalt
 * @returns Card JSX
 */
function Card({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl p-5"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-label={title}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
        {meta && (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {meta}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

/**
 * KPI-Kachel mit großer Zahl, Label und Trend-Zeile.
 *
 * @param props - Kachel-Props
 * @param props.icon - Icon oben rechts
 * @param props.label - Beschriftung
 * @param props.value - Hauptwert
 * @param props.sub - Trend-/Zusatzzeile
 * @returns StatTile JSX
 */
function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </p>
        <span style={{ color: 'var(--color-text-muted)' }} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p
        className="mt-1.5 text-2xl font-semibold tabular-nums leading-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

/**
 * Funnel-Stufe: Label, Wert und Balken relativ zur Gesamtmenge.
 *
 * @param props - Stufen-Props
 * @param props.label - Stufenname
 * @param props.value - Absoluter Wert
 * @param props.total - Bezugsgröße (100 %)
 * @param props.opacity - Füll-Deckkraft des Balkens (Stufen-Abstufung)
 * @returns FunnelBar JSX
 */
function FunnelBar({
  label,
  value,
  total,
  opacity,
}: {
  label: string
  value: number
  total: number
  opacity: number
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
          {fmt(value)} · {pct} %
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ background: 'var(--color-border-subtle)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `color-mix(in srgb, var(--color-primary) ${opacity}%, transparent)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/**
 * Skeleton-Platzhalter während die Statistiken laden.
 *
 * @returns Skeleton JSX
 */
function Skeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl"
            style={{ background: 'var(--color-skeleton)' }}
          />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-2xl"
          style={{ background: 'var(--color-skeleton)' }}
        />
      ))}
    </div>
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
  const [refreshing, setRefreshing] = useState(false)
  const [remaining, setRemaining] = useState(SESSION_MS)
  const [newPin, setNewPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [pinMsg, setPinMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [deploySha, setDeploySha] = useState<string | null>(null)
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
    setRefreshing(true)
    const token = await auth.currentUser.getIdToken()
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)
    setRefreshing(false)
    if (!res) {
      setError('Verbindung fehlgeschlagen — bitte erneut versuchen.')
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
    fetch('/api/version')
      .then((r) => r.json())
      .then((d: { sha?: string }) => setDeploySha(d.sha?.slice(0, 7) ?? null))
      .catch(() => {})
    return () => clearTimeout(t)
  }, [user, loadStats])

  /**
   * Setzt den Site-Zugangscode neu (invalidiert alle bestehenden Cookies).
   */
  async function changePin() {
    if (!auth.currentUser || newPin.trim().length < 4) return
    const token = await auth.currentUser.getIdToken()
    const res = await fetch('/api/admin/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ pin: newPin.trim() }),
    }).catch(() => null)
    if (res?.ok) {
      setPinMsg({ ok: true, text: 'Code geändert — alle Geräte müssen neu entsperren.' })
      setNewPin('')
      loadStats()
    } else {
      const data = (await res?.json().catch(() => null)) as { error?: string } | null
      setPinMsg({ ok: false, text: data?.error ?? 'Änderung fehlgeschlagen.' })
    }
  }

  const mm = Math.floor(remaining / 60000)
  const ss = Math.floor((remaining % 60000) / 1000)
  const countdown = `${mm}:${String(ss).padStart(2, '0')}`

  // ── Login-Gate ──
  if (!user) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: 'var(--color-bg-page)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl px-8 py-10 text-center"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            <KeyRound size={22} style={{ color: 'var(--color-on-primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Rosenraum Admin
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Zugang nur für freigeschaltete Konten.
            </p>
          </div>
          <button
            onClick={() =>
              signInWithPopup(auth, new GoogleAuthProvider()).catch(() =>
                setError('Login fehlgeschlagen — bitte erneut versuchen.')
              )
            }
            className="w-full rounded-2xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Mit Google anmelden
          </button>
          {error && (
            <p role="alert" className="text-sm" style={{ color: 'var(--color-destructive)' }}>
              {error}
            </p>
          )}
        </motion.div>
      </main>
    )
  }

  // ── Dashboard ──
  return (
    <main className="min-h-screen px-4 py-6 sm:py-8" style={{ background: 'var(--color-bg-page)' }}>
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Rosenraum Admin
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {user.email} · Auto-Logout in {countdown}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadStats}
              aria-label="Aktualisieren"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={doLogout}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-opacity hover:opacity-70"
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <LogOut size={13} aria-hidden="true" />
              Abmelden
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-destructive)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-destructive)' }}>
              {error}
            </p>
            <button
              onClick={loadStats}
              className="flex-shrink-0 text-sm font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Erneut versuchen
            </button>
          </div>
        )}

        {!stats && !error && <Skeleton />}

        {stats && (
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* KPI-Kacheln */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                icon={<DoorOpen size={15} />}
                label="Räume"
                value={fmt(stats.usage.roomsTotal)}
                sub={`+${stats.usage.rooms24h} heute · +${stats.usage.rooms7d} / 7 Tage`}
              />
              <StatTile
                icon={<MessageCircle size={15} />}
                label="Nachrichten"
                value={fmt(stats.usage.messagesTotal)}
                sub={`+${stats.usage.messages24h} heute`}
              />
              <StatTile
                icon={<Users size={15} />}
                label="Teilnehmer"
                value={fmt(stats.usage.participantsTotal)}
              />
              <StatTile
                icon={<CircleDollarSign size={15} />}
                label="KI-Kosten 7 Tage"
                value={`${stats.tokens.week.costUsd.toFixed(2).replace('.', ',')} $`}
                sub={`heute ${stats.tokens.today.costUsd.toFixed(2).replace('.', ',')} $`}
              />
            </div>

            {/* API-Health */}
            <Card title="API-Health" meta="letzte 24 h">
              {stats.health.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Noch keine Anfragen — Metriken erscheinen, sobald die App genutzt wird.
                </p>
              ) : (
                <ul>
                  {stats.health.map((h, i) => {
                    const s = healthStatus(h)
                    return (
                      <li
                        key={h.route}
                        className="py-2.5 first:pt-0 last:pb-0"
                        style={{
                          borderTop: i > 0 ? '1px solid var(--color-border-subtle)' : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="flex min-w-0 items-center gap-1.5 text-sm font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            <Activity
                              size={13}
                              aria-hidden="true"
                              style={{ color: 'var(--color-text-muted)' }}
                            />
                            <span className="truncate">/{h.route}</span>
                          </span>
                          <span
                            className="flex flex-shrink-0 items-center gap-1 text-xs font-medium"
                            style={{ color: s.color }}
                          >
                            <s.Icon size={13} aria-hidden="true" />
                            {s.label}
                          </span>
                        </div>
                        <p
                          className="mt-0.5 pl-[1.3rem] text-xs tabular-nums"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {fmt(h.count24h)} Calls · p50 {(h.p50 / 1000).toFixed(1)} s · p95{' '}
                          {(h.p95 / 1000).toFixed(1)} s
                          {h.lastError ? ` · letzter Fehler ${relTime(h.lastError)}` : ''}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>

            {/* Token-Verbrauch */}
            <Card title="Token-Verbrauch" meta="Schätzung, Haiku-Preise">
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    ['Heute', stats.tokens.today],
                    ['7 Tage', stats.tokens.week],
                  ] as const
                ).map(([label, t]) => (
                  <div key={label}>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {label}
                    </p>
                    <p
                      className="mt-1 text-xl font-semibold tabular-nums"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {t.costUsd.toFixed(2).replace('.', ',')} $
                    </p>
                    <p
                      className="mt-0.5 text-xs tabular-nums leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {fmt(t.tokensIn)} in · {fmt(t.tokensOut)} out
                      <br />
                      Cache-Anteil {t.cacheShare} %
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Lern-Funnel */}
            <Card title="Lern-Funnel" meta="gesamt">
              <div className="flex flex-col gap-3">
                <FunnelBar
                  label="Nachrichten"
                  value={stats.funnel.messagesTotal}
                  total={stats.funnel.messagesTotal}
                  opacity={100}
                />
                <FunnelBar
                  label="Mit Lern-Angebot"
                  value={stats.funnel.withLearningDots}
                  total={stats.funnel.messagesTotal}
                  opacity={70}
                />
                <FunnelBar
                  label="Rosenraum-Version gesendet"
                  value={stats.funnel.sentRosenberg}
                  total={stats.funnel.messagesTotal}
                  opacity={45}
                />
              </div>
            </Card>

            {/* Feedback */}
            <Card
              title="Feedback"
              meta={`${stats.feedback.count24h} heute · ${stats.feedback.count7d} / 7 Tage`}
            >
              {stats.feedback.latest.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Noch kein Feedback — sobald jemand etwas schreibt, erscheint es hier.
                </p>
              ) : (
                <ul>
                  {stats.feedback.latest.map((f, i) => (
                    <li
                      key={f.id}
                      className="py-2.5 first:pt-0 last:pb-0"
                      style={{
                        borderTop: i > 0 ? '1px solid var(--color-border-subtle)' : 'none',
                      }}
                    >
                      <div className="mb-0.5 flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: 'var(--color-bg-elevated)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {f.source || 'App'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {f.createdAt ? relTime(f.createdAt) : ''}
                        </span>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {f.text || '—'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* System */}
            <Card title="System" meta={deploySha ? `Deploy ${deploySha}` : undefined}>
              <label
                htmlFor="new-pin"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Zugangscode ändern (Version {stats.system.pinVersion ?? '–'})
              </label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    id="new-pin"
                    type={showPin ? 'text' : 'password'}
                    autoComplete="off"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Neuer Code"
                    maxLength={12}
                    className="w-44 rounded-xl py-2 pl-3 pr-10 text-sm outline-none focus-visible:ring-2"
                    style={{
                      background: 'var(--color-bg-page)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    aria-label={showPin ? 'Code verbergen' : 'Code anzeigen'}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {showPin ? (
                      <EyeOff size={15} aria-hidden="true" />
                    ) : (
                      <Eye size={15} aria-hidden="true" />
                    )}
                  </button>
                </div>
                <button
                  onClick={changePin}
                  disabled={newPin.trim().length < 4}
                  className="rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                >
                  Ändern
                </button>
              </div>
              <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                4–12 Zeichen. Alle entsperrten Geräte müssen danach neu entsperren.
              </p>
              {pinMsg && (
                <p
                  role="status"
                  className="mt-2 flex items-center gap-1.5 text-sm"
                  style={{
                    color: pinMsg.ok ? 'var(--color-success)' : 'var(--color-destructive)',
                  }}
                >
                  {pinMsg.ok ? (
                    <CheckCircle2 size={14} aria-hidden="true" />
                  ) : (
                    <XCircle size={14} aria-hidden="true" />
                  )}
                  {pinMsg.text}
                </p>
              )}
            </Card>

            <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Stand {new Date(stats.generatedAt).toLocaleTimeString('de-DE')} Uhr
            </p>
          </motion.div>
        )}
      </div>
    </main>
  )
}
