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
  ChevronDown,
  CircleDollarSign,
  DoorOpen,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  MessageCircle,
  RefreshCw,
  Search,
  Star,
  Users,
  XCircle,
} from 'lucide-react'
import { app } from '@/lib/firebase'

/** Auto-Logout nach 10 Minuten */
const SESSION_MS = 10 * 60 * 1000

interface FeedbackTopic {
  id: string
  label: string
  description: string
  count: number
}

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
  series: {
    calls24h: Array<{ calls: number; errors: number }>
    days: number[]
    messages7d: number[]
    rooms7d: number[]
    cost7d: number[]
  }
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
    latest: Array<{
      id: string
      text: string
      source: string
      rating: 'sad' | 'happy' | 'love' | null
      email: string | null
      roomId: string | null
      aiScore: number | null
      createdAt: number | null
      topics: string[]
    }>
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

/** Gemeinsamer Kachel-Look (Surface, Border, Schatten) */
const TILE_STYLE: React.CSSProperties = {
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border-subtle)',
  boxShadow: 'var(--shadow-sm)',
}

/**
 * Halbkreis-Gauge mit animiertem Bogen und Wert in der Mitte.
 *
 * @param props - Gauge-Props
 * @param props.label - Beschriftung unter dem Bogen
 * @param props.pct - Füllstand 0–100
 * @param props.display - Text in der Bogenmitte
 * @param props.color - Bogenfarbe (Token-Var)
 * @returns Gauge JSX
 */
function Gauge({
  label,
  pct,
  display,
  color,
}: {
  label: string
  pct: number
  display: string
  color: string
}) {
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div className="flex flex-col items-center rounded-2xl p-4" style={TILE_STYLE}>
      <svg
        viewBox="0 0 100 58"
        className="w-full max-w-[8.5rem]"
        role="img"
        aria-label={`${label}: ${display}`}
      >
        <path
          d="M 8 52 A 42 42 0 0 1 92 52"
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {clamped > 0 && (
          <motion.path
            d="M 8 52 A 42 42 0 0 1 92 52"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 100 - clamped }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          style={{ fill: 'var(--color-text-primary)', fontSize: '15px', fontWeight: 600 }}
        >
          {display}
        </text>
      </svg>
      <p
        className="mt-1 text-center text-xs font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </p>
    </div>
  )
}

/**
 * Flächen-Liniendiagramm (7 Punkte) mit weichem Verlauf.
 *
 * @param props - Chart-Props
 * @param props.values - Werte, älteste zuerst
 * @param props.labels - X-Achsen-Beschriftungen (gleiche Länge)
 * @returns AreaChart JSX
 */
function AreaChart({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 280
  const H = 64
  const max = Math.max(...values, 1)
  const pts = values.map(
    (v, i) => [(i / Math.max(values.length - 1, 1)) * W, H - 4 - (v / max) * (H - 14)] as const
  )
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-20 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={area} fill="color-mix(in srgb, var(--color-primary) 14%, transparent)" />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </svg>
      <div className="mt-1 flex justify-between">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Kompakte Balkenreihe (z.B. Calls pro Stunde, Kosten pro Tag).
 *
 * @param props - Balken-Props
 * @param props.values - Balkenhöhen (roh, werden normalisiert)
 * @param props.highlight - Indizes, die in Warnfarbe markiert werden (z.B. Stunden mit Fehlern)
 * @param props.leftLabel - Beschriftung links unter den Balken
 * @param props.rightLabel - Beschriftung rechts unter den Balken
 * @returns MiniBars JSX
 */
function MiniBars({
  values,
  highlight,
  leftLabel,
  rightLabel,
}: {
  values: number[]
  highlight?: Set<number>
  leftLabel: string
  rightLabel: string
}) {
  const max = Math.max(...values, 1)
  return (
    <div>
      <div className="flex h-14 items-end gap-[2px]" aria-hidden="true">
        {values.map((v, i) => (
          <motion.div
            key={i}
            className="min-w-0 flex-1 rounded-t-sm"
            style={{
              background: highlight?.has(i)
                ? 'var(--color-warning)'
                : 'color-mix(in srgb, var(--color-primary) 55%, transparent)',
            }}
            initial={{ height: 2 }}
            animate={{ height: `${Math.max(4, (v / max) * 100)}%` }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.012 }}
          />
        ))}
      </div>
      <div
        className="mt-1 flex justify-between text-[10px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
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
 * Markiert Keyword-Treffer im Text mit einem farbigen Span.
 *
 * @param text - Feedback-Text
 * @param keywords - Suchbegriffe (lowercase, >4 Zeichen)
 * @returns React-Elemente mit hervorgehobenen Treffern
 */
function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (!keywords.length || !text) return text
  const pattern = new RegExp(
    `(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  )
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    pattern.test(part) ? (
      <span
        key={i}
        style={{
          background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
          borderRadius: '3px',
          padding: '0 2px',
        }}
      >
        {part}
      </span>
    ) : (
      part
    )
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
  const [fbSearch, setFbSearch] = useState('')
  const [fbSort, setFbSort] = useState<{ field: 'date' | 'score'; dir: 'asc' | 'desc' }>({
    field: 'date',
    dir: 'desc',
  })
  const [fbExpanded, setFbExpanded] = useState<Set<string>>(new Set())
  const [fbTopicFilter, setFbTopicFilter] = useState<string | null>(null)
  const [topics, setTopics] = useState<FeedbackTopic[] | null>(null)
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [topicSort, setTopicSort] = useState<{ field: 'newest' | 'count'; dir: 'asc' | 'desc' }>({
    field: 'newest',
    dir: 'desc',
  })
  const [topicsExpanded, setTopicsExpanded] = useState(false)
  const TOPICS_INITIAL_COUNT = 5
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null)
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

  const loadTopics = useCallback(
    async (force = false) => {
      if (!auth.currentUser) return
      setTopicsLoading(true)
      const token = await auth.currentUser.getIdToken()
      const res = await fetch('/api/admin/feedback-topics', {
        method: force ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)
      setTopicsLoading(false)
      if (!res?.ok) return
      const data = (await res.json()) as { topics: FeedbackTopic[] }
      setTopics(data.topics)
    },
    [auth]
  )

  useEffect(() => {
    if (!user) return
    const t = setTimeout(loadStats, 0)
    const t2 = setTimeout(() => loadTopics(), 500)
    fetch('/api/version')
      .then((r) => r.json())
      .then((d: { sha?: string }) => setDeploySha(d.sha?.slice(0, 7) ?? null))
      .catch(() => {})
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [user, loadStats, loadTopics])

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

  async function backfillScores() {
    if (!auth.currentUser) return
    setBackfillMsg('Läuft…')
    const token = await auth.currentUser.getIdToken()
    const res = await fetch('/api/admin/backfill-scores', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)
    if (!res?.ok) {
      setBackfillMsg('Fehler beim Backfill.')
      return
    }
    const d = (await res.json()) as { scored: number; skipped: number; total: number }
    setBackfillMsg(`${d.scored} bewertet, ${d.skipped} übersprungen (${d.total} gesamt)`)
    setTimeout(() => {
      setBackfillMsg(null)
      loadStats()
    }, 4000)
  }

  const mm = Math.floor(remaining / 60000)
  const ss = Math.floor((remaining % 60000) / 1000)
  const countdown = `${mm}:${String(ss).padStart(2, '0')}`

  // Abgeleitete Kennzahlen für Gauges & Charts
  const totalCalls24h = stats?.health.reduce((a, h) => a + h.count24h, 0) ?? 0
  const errorPct24h = totalCalls24h
    ? (stats!.health.reduce((a, h) => a + (h.count24h * h.errorRate) / 100, 0) / totalCalls24h) *
      100
    : 0
  const lernQuote =
    stats && stats.funnel.messagesTotal
      ? (stats.funnel.withLearningDots / stats.funnel.messagesTotal) * 100
      : 0
  const annahmeQuote =
    stats && stats.funnel.withLearningDots
      ? (stats.funnel.sentRosenberg / stats.funnel.withLearningDots) * 100
      : 0
  const dayLabels =
    stats?.series?.days.map((ts) =>
      new Date(ts).toLocaleDateString('de-DE', { weekday: 'short' })
    ) ?? []
  const errorHours = new Set(
    (stats?.series?.calls24h ?? []).map((c, i) => (c.errors > 0 ? i : -1)).filter((i) => i >= 0)
  )

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

            {/* Aktivität 7 Tage */}
            {stats.series && (
              <Card title="Aktivität" meta="Nachrichten pro Tag · 7 Tage">
                <AreaChart values={stats.series.messages7d} labels={dayLabels} />
              </Card>
            )}

            {/* Gauges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Gauge
                label="Cache-Anteil heute"
                pct={stats.tokens.today.cacheShare}
                display={`${stats.tokens.today.cacheShare} %`}
                color="var(--color-primary)"
              />
              <Gauge
                label="Fehlerquote 24 h"
                pct={errorPct24h}
                display={`${errorPct24h > 0 && errorPct24h < 10 ? errorPct24h.toFixed(1) : Math.round(errorPct24h)} %`}
                color={
                  errorPct24h === 0
                    ? 'var(--color-success)'
                    : errorPct24h >= 20
                      ? 'var(--color-destructive)'
                      : 'var(--color-warning)'
                }
              />
              <Gauge
                label="Lern-Angebot-Quote"
                pct={lernQuote}
                display={`${Math.round(lernQuote)} %`}
                color="var(--color-primary)"
              />
              <Gauge
                label="Annahme-Quote"
                pct={annahmeQuote}
                display={`${Math.round(annahmeQuote)} %`}
                color="var(--color-success)"
              />
            </div>

            {/* API-Health */}
            <Card title="API-Health" meta="letzte 24 h">
              {stats.series && totalCalls24h > 0 && (
                <div className="mb-3">
                  <MiniBars
                    values={stats.series.calls24h.map((c) => c.calls)}
                    highlight={errorHours}
                    leftLabel="vor 24 h"
                    rightLabel="jetzt"
                  />
                </div>
              )}
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
              {stats.series && (
                <div className="mt-4">
                  <p
                    className="mb-1.5 text-xs font-medium uppercase tracking-wide"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Kosten pro Tag
                  </p>
                  <MiniBars
                    values={stats.series.cost7d}
                    leftLabel={dayLabels[0] ?? ''}
                    rightLabel="heute"
                  />
                </div>
              )}
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

            {/* Feedback-Themen */}
            <Card title="Feedback-Themen" meta={topics ? `${topics.length} Themen` : undefined}>
              {topicsLoading && !topics && (
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-24 animate-pulse rounded-full"
                      style={{ background: 'var(--color-skeleton)' }}
                    />
                  ))}
                </div>
              )}
              {!topicsLoading && topics?.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Noch nicht genug Feedback für eine Themenanalyse.
                </p>
              )}
              {topics &&
                topics.length > 0 &&
                (() => {
                  const sortedTopics = [...topics].sort((a, b) => {
                    const mul = topicSort.dir === 'asc' ? 1 : -1
                    if (topicSort.field === 'count') return mul * (a.count - b.count)
                    // newest = original API order (index), desc = newest first (0=newest)
                    return mul * (topics.indexOf(a) - topics.indexOf(b))
                  })
                  const visibleTopics = topicsExpanded
                    ? sortedTopics
                    : sortedTopics.slice(0, TOPICS_INITIAL_COUNT)
                  return (
                    <div className="flex flex-col gap-3">
                      {/* Sort-Controls */}
                      <div className="flex items-center gap-1 text-xs">
                        {(['newest', 'count'] as const).map((field) => {
                          const active = topicSort.field === field
                          const label = field === 'newest' ? 'Neueste' : 'Häufigste'
                          const nextDir = active && topicSort.dir === 'desc' ? 'asc' : 'desc'
                          return (
                            <button
                              key={field}
                              onClick={() => setTopicSort({ field, dir: nextDir })}
                              className="flex items-center gap-0.5 rounded-lg px-2 py-1 transition-colors"
                              style={{
                                background: active
                                  ? 'var(--color-primary)'
                                  : 'var(--color-bg-elevated)',
                                color: active ? 'white' : 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border-subtle)',
                              }}
                            >
                              {label}
                              {active && (
                                <span style={{ fontSize: '10px', lineHeight: 1 }}>
                                  {topicSort.dir === 'desc' ? '↓' : '↑'}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                      {/* Themen-Pills */}
                      <div className="flex flex-wrap gap-2">
                        {visibleTopics.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setFbTopicFilter(fbTopicFilter === t.id ? null : t.id)}
                            title={t.description}
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{
                              background:
                                fbTopicFilter === t.id
                                  ? 'var(--color-primary)'
                                  : 'var(--color-bg-elevated)',
                              color:
                                fbTopicFilter === t.id ? 'white' : 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border-subtle)',
                            }}
                          >
                            <span>{t.label}</span>
                            <span
                              className="rounded-full px-1.5 py-0.5 text-xs tabular-nums"
                              style={{
                                background:
                                  fbTopicFilter === t.id
                                    ? 'rgba(255,255,255,0.25)'
                                    : 'var(--color-border)',
                                color: fbTopicFilter === t.id ? 'white' : 'var(--color-text-muted)',
                              }}
                            >
                              {t.count}
                            </span>
                          </button>
                        ))}
                        <button
                          onClick={() => loadTopics(true)}
                          disabled={topicsLoading}
                          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-colors"
                          style={{
                            background: 'var(--color-bg-elevated)',
                            color: 'var(--color-text-muted)',
                            border: '1px solid var(--color-border-subtle)',
                            opacity: topicsLoading ? 0.5 : 1,
                          }}
                          title="Themen neu analysieren"
                        >
                          <RefreshCw size={11} aria-hidden="true" />
                          Neu analysieren
                        </button>
                      </div>
                      {/* Mehr anzeigen */}
                      {topics.length > TOPICS_INITIAL_COUNT && (
                        <button
                          onClick={() => setTopicsExpanded((v) => !v)}
                          className="self-start text-xs"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {topicsExpanded
                            ? 'Weniger anzeigen ↑'
                            : `${topics.length - TOPICS_INITIAL_COUNT} weitere anzeigen ↓`}
                        </button>
                      )}
                    </div>
                  )
                })()}
              {fbTopicFilter && (
                <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Filter aktiv — Feedback-Liste zeigt nur Einträge zu diesem Thema.{' '}
                  <button
                    onClick={() => setFbTopicFilter(null)}
                    className="underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Zurücksetzen
                  </button>
                </p>
              )}
            </Card>

            {/* Feedback */}
            <Card
              title="Feedback"
              meta={`${stats.feedback.count24h} heute · ${stats.feedback.count7d} / 7 Tage`}
            >
              {/* Suchfeld + Sortierung */}
              <div className="mb-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="Suchen…"
                    value={fbSearch}
                    onChange={(e) => setFbSearch(e.target.value)}
                    className="w-full rounded-xl py-1.5 pl-7 pr-3 text-sm outline-none"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {(['date', 'score'] as const).map((field) => {
                    const active = fbSort.field === field
                    const label = field === 'date' ? 'Datum' : 'Bewertung'
                    const nextDir = active && fbSort.dir === 'desc' ? 'asc' : 'desc'
                    return (
                      <button
                        key={field}
                        onClick={() => setFbSort({ field, dir: active ? nextDir : 'desc' })}
                        className="flex items-center gap-0.5 px-2 py-1 rounded-lg transition-colors"
                        style={{
                          background: active ? 'var(--color-bg-elevated)' : 'transparent',
                          color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                          fontWeight: active ? 500 : 400,
                          border: active
                            ? '1px solid var(--color-border-subtle)'
                            : '1px solid transparent',
                        }}
                      >
                        {label}
                        {active && (
                          <span style={{ fontSize: '10px', lineHeight: 1 }}>
                            {fbSort.dir === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Backfill-KI-Score für bestehende Einträge */}
              <div className="mb-3 flex items-center gap-2">
                <button
                  onClick={backfillScores}
                  disabled={backfillMsg === 'Läuft…'}
                  className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs transition-colors"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border-subtle)',
                    opacity: backfillMsg === 'Läuft…' ? 0.5 : 1,
                  }}
                  title="KI-Score für alle Einträge ohne Bewertung nachträglich berechnen"
                >
                  <RefreshCw size={11} aria-hidden="true" />
                  KI-Scores nachberechnen
                </button>
                {backfillMsg && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {backfillMsg}
                  </span>
                )}
              </div>

              {/* Liste */}
              {stats.feedback.latest.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Noch kein Feedback — sobald jemand etwas schreibt, erscheint es hier.
                </p>
              ) : (
                (() => {
                  const q = fbSearch.toLowerCase()
                  const filtered = stats.feedback.latest.filter((f) => {
                    const matchesSearch =
                      !q ||
                      f.text.toLowerCase().includes(q) ||
                      (f.email ?? '').toLowerCase().includes(q) ||
                      f.source.toLowerCase().includes(q)
                    const matchesTopic = !fbTopicFilter || f.topics.includes(fbTopicFilter)
                    return matchesSearch && matchesTopic
                  })
                  const sorted = [...filtered].sort((a, b) => {
                    const mul = fbSort.dir === 'asc' ? 1 : -1
                    if (fbSort.field === 'score') {
                      return mul * ((a.aiScore ?? 0) - (b.aiScore ?? 0))
                    }
                    return mul * ((a.createdAt ?? 0) - (b.createdAt ?? 0))
                  })
                  if (sorted.length === 0) {
                    return (
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Keine Treffer für &bdquo;{fbSearch}&ldquo;.
                      </p>
                    )
                  }
                  return (
                    <ul
                      style={{
                        maxHeight: '420px',
                        overflowY: 'auto',
                        marginRight: '-4px',
                        paddingRight: '4px',
                      }}
                    >
                      {sorted.map((f, i) => {
                        const isOpen = fbExpanded.has(f.id)
                        const dateStr = f.createdAt
                          ? new Date(f.createdAt).toLocaleString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : null
                        const ratingEmoji =
                          f.rating === 'love'
                            ? '❤️'
                            : f.rating === 'happy'
                              ? '😊'
                              : f.rating === 'sad'
                                ? '😞'
                                : null
                        return (
                          <li
                            key={f.id}
                            className="py-2.5 first:pt-0"
                            style={{
                              borderTop: i > 0 ? '1px solid var(--color-border-subtle)' : 'none',
                            }}
                          >
                            {/* Header-Zeile — klickbar */}
                            <button
                              className="w-full text-left"
                              onClick={() =>
                                setFbExpanded((prev) => {
                                  const next = new Set(prev)
                                  if (next.has(f.id)) next.delete(f.id)
                                  else next.add(f.id)
                                  return next
                                })
                              }
                            >
                              <div className="flex items-center gap-2 mb-0.5">
                                {/* Badges links */}
                                <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                                  {/* Quelle */}
                                  <span
                                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                                    style={{
                                      background: 'var(--color-bg-elevated)',
                                      color: 'var(--color-text-secondary)',
                                    }}
                                  >
                                    {f.source || 'App'}
                                  </span>
                                  {/* Emoji-Rating */}
                                  {ratingEmoji && (
                                    <span className="text-xs" aria-label={`Bewertung: ${f.rating}`}>
                                      {ratingEmoji}
                                    </span>
                                  )}
                                </div>
                                {/* Rechte Seite: Score + Datum + Chevron — immer fixiert */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span
                                    className="flex items-center justify-center gap-0.5 rounded-full py-0.5 text-xs font-medium"
                                    style={{
                                      width: '2rem',
                                      background:
                                        f.aiScore !== null
                                          ? 'var(--color-bg-elevated)'
                                          : 'transparent',
                                      color: 'var(--color-text-secondary)',
                                    }}
                                  >
                                    {f.aiScore !== null && (
                                      <>
                                        <Star size={10} aria-hidden="true" />
                                        {f.aiScore}
                                      </>
                                    )}
                                  </span>
                                  <span
                                    className="text-xs text-right"
                                    style={{ color: 'var(--color-text-muted)', width: '4rem' }}
                                  >
                                    {f.createdAt ? relTime(f.createdAt) : ''}
                                  </span>
                                  <ChevronDown
                                    size={14}
                                    style={{
                                      color: 'var(--color-text-muted)',
                                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                      transition: 'transform 200ms',
                                      flexShrink: 0,
                                    }}
                                    aria-hidden="true"
                                  />
                                </div>
                              </div>
                              {/* Textvorschau (kompakt, 2 Zeilen) */}
                              <p
                                className="text-sm leading-relaxed"
                                style={{
                                  color: 'var(--color-text-primary)',
                                  display: '-webkit-box',
                                  WebkitLineClamp: isOpen ? undefined : 2,
                                  WebkitBoxOrient: 'vertical' as const,
                                  overflow: isOpen ? 'visible' : 'hidden',
                                }}
                              >
                                {(() => {
                                  if (!f.text) return '—'
                                  if (!fbTopicFilter || !topics) return f.text
                                  const activeTopic = topics.find((t) => t.id === fbTopicFilter)
                                  if (!activeTopic) return f.text
                                  const kws = `${activeTopic.label} ${activeTopic.description}`
                                    .toLowerCase()
                                    .split(/\s+/)
                                    .filter((w) => w.length > 4)
                                  return highlightKeywords(f.text, kws)
                                })()}
                              </p>
                            </button>

                            {/* Ausgeklappt: Metadaten */}
                            {isOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2 flex flex-col gap-1"
                              >
                                {dateStr && (
                                  <p
                                    className="text-xs"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    {dateStr}
                                  </p>
                                )}
                                {f.email && (
                                  <p
                                    className="text-xs"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                  >
                                    E-Mail: {f.email}
                                  </p>
                                )}
                                {f.roomId && (
                                  <p
                                    className="text-xs font-mono"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    Raum: {f.roomId}
                                  </p>
                                )}
                                {f.aiScore !== null && (
                                  <p
                                    className="text-xs"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                  >
                                    KI-Bewertung: {f.aiScore}/5 · Hilfsbereitschaft
                                  </p>
                                )}
                                {/* Themen-Pills */}
                                {(() => {
                                  if (!f.topics?.length || !topics?.length) return null
                                  const matched = topics.filter((t) => f.topics.includes(t.id))
                                  if (!matched.length) return null
                                  return (
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {matched.map((t) => (
                                        <span
                                          key={t.id}
                                          className="rounded-full px-2 py-0.5 text-xs"
                                          style={{
                                            background: 'var(--color-bg-elevated)',
                                            color: 'var(--color-text-secondary)',
                                          }}
                                        >
                                          {t.label}
                                        </span>
                                      ))}
                                    </div>
                                  )
                                })()}
                              </motion.div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )
                })()
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
