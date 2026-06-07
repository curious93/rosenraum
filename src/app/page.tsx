'use client'

import Link from 'next/link'

/**
 * Rosenraum Landingpage — CTA zu Raum erstellen.
 *
 * @returns Landingpage JSX
 */
export default function HomePage() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div className="w-full max-w-sm text-center space-y-8">
        {/* Logo / Name */}
        <div className="space-y-2">
          <div className="text-5xl">🌹</div>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Rosenraum
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Ein privater Raum für Gespräche, die von Herzen kommen.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href="/create"
            className="block w-full py-3.5 px-6 rounded-2xl text-white font-medium text-base transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: 'var(--color-primary)' }}
          >
            Raum erstellen
          </Link>
          <Link
            href="/join"
            className="block w-full py-3.5 px-6 rounded-2xl text-base font-medium transition-colors"
            style={{
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Code eingeben
          </Link>
        </div>

        {/* Features — minimal */}
        <div className="pt-4 space-y-3">
          {[
            ['💬', 'Privater 1:1 Chat'],
            ['🌿', 'Sanfte KI-Unterstützung'],
            ['🔒', 'Kein Account nötig'],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="flex items-center gap-3 text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
