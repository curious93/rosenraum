'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Eingabeformular für den Site-Code — warm gehalten, ein Feld, Enter sendet.
 *
 * @returns Unlock-Formular JSX
 */
function UnlockForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!code.trim() || loading) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    }).catch(() => null)
    if (res?.ok) {
      router.replace(params.get('next') || '/')
      return
    }
    const data = (await res?.json().catch(() => null)) as { error?: string } | null
    setError(data?.error ?? 'Das hat nicht geklappt — bitte versuch es erneut.')
    setLoading(false)
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-5 px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div style={{ fontSize: '2.5rem' }}>🌸</div>
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Rosenraum ist privat.
      </h1>
      <p className="max-w-xs text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Gib den Zugangscode ein, den du bekommen hast.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        autoFocus
        inputMode="numeric"
        maxLength={12}
        placeholder="Code"
        aria-label="Zugangscode"
        className="w-40 rounded-2xl px-4 py-3 text-center text-lg tracking-widest outline-none"
        style={{
          background: 'var(--color-bg-surface)',
          color: 'var(--color-text-primary)',
          border: '2px solid var(--color-border)',
        }}
      />
      {error && (
        <p className="text-sm" style={{ color: 'var(--color-destructive)' }}>
          {error}
        </p>
      )}
      <button
        onClick={submit}
        disabled={loading || !code.trim()}
        className="w-40 rounded-2xl py-3 text-sm font-medium transition-opacity disabled:opacity-40"
        style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
      >
        {loading ? 'Prüfe…' : 'Öffnen'}
      </button>
    </main>
  )
}

/**
 * /unlock — Site-Code-Eingabe (von der Middleware angesteuert).
 *
 * @returns Unlock-Seite JSX
 */
export default function UnlockPage() {
  return (
    <Suspense>
      <UnlockForm />
    </Suspense>
  )
}
