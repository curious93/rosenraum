'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Message } from '@/lib/firestore'

interface StatistikSheetProps {
  /** Alle Nachrichten der Session. */
  messages: Message[]
  /** ID des aktuellen Nutzers. */
  currentUserId: string
  /** Ob das Sheet sichtbar ist. */
  open: boolean
  /** Callback zum Schließen. */
  onClose: () => void
}

/**
 * Zeigt eine sympathische Lernstatistik der aktuellen Session.
 * Nur für eigene Nachrichten. Kein Score, kein Urteil.
 *
 * @param props - Sheet-Props
 * @param props.messages - Alle Nachrichten der Session
 * @param props.currentUserId - ID des aktuellen Nutzers
 * @param props.open - Ob das Sheet sichtbar ist
 * @param props.onClose - Callback zum Schließen
 * @returns Bottom Sheet JSX
 */
export function StatistikSheet({ messages, currentUserId, open, onClose }: StatistikSheetProps) {
  const own = messages.filter((m) => m.senderId === currentUserId)
  const withGfk = own.filter((m) => m.hasLearningDots && m.rosenbergText)
  const sentGfk = withGfk.filter((m) => m.sentVersion === 'rosenberg')
  const sentOriginal = withGfk.filter((m) => m.sentVersion === 'original')

  // Lernkurve: pro Nachricht 1 = GFK gesendet, 0.5 = Original bei vorhandenem Vorschlag, 0 = kein Vorschlag
  const curvePoints = own.map((m) => {
    if (!m.hasLearningDots || !m.rosenbergText) return 0
    return m.sentVersion === 'rosenberg' ? 1 : 0.4
  })

  const svgW = 280
  const svgH = 64
  const pts = curvePoints.length > 1 ? curvePoints : [0, 0]
  const step = svgW / (pts.length - 1)
  const pathD = pts
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${svgH - v * (svgH - 8) - 4}`)
    .join(' ')

  if (own.length === 0) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{
              background: 'var(--color-bg-surface)',
              maxHeight: '88vh',
              overflowY: 'auto',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'var(--color-border)' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-5">
              <div>
                <h2
                  className="font-semibold text-base"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Dein Lernweg
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Diese Unterhaltung
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                aria-label="Schließen"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="px-5 flex flex-col gap-5 pb-4">
              {/* Lernkurve */}
              {withGfk.length >= 2 && (
                <div className="rounded-2xl p-4" style={{ background: 'var(--color-bg-elevated)' }}>
                  <p
                    className="text-xs font-medium mb-3 uppercase tracking-wide"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Offenheit im Verlauf
                  </p>
                  <svg
                    width={svgW}
                    height={svgH}
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    style={{ width: '100%', height: 'auto' }}
                  >
                    {/* Grid-Linie */}
                    <line
                      x1="0"
                      y1={svgH / 2}
                      x2={svgW}
                      y2={svgH / 2}
                      stroke="var(--color-border)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    {/* Kurve */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="var(--color-dot-learning)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Punkte */}
                    {pts.map((v, i) => (
                      <circle
                        key={i}
                        cx={i * step}
                        cy={svgH - v * (svgH - 8) - 4}
                        r="3.5"
                        fill={v > 0.5 ? 'var(--color-dot-learning)' : 'var(--color-border)'}
                      />
                    ))}
                  </svg>
                </div>
              )}

              {/* Session-Zahlen */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Nachrichten', value: own.length },
                  { label: 'Mit Vorschlag', value: withGfk.length },
                  { label: 'Vorschlag gewählt', value: sentGfk.length },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{ background: 'var(--color-bg-elevated)' }}
                  >
                    <div
                      className="text-xl font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {value}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Was passierte */}
              {withGfk.length > 0 && (
                <div className="flex flex-col gap-2">
                  {sentGfk.length > 0 && (
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'var(--color-bubble-gfk)' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: 'var(--color-dot-learning)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {sentGfk.length}× Rosenraum-Vorschlag gesendet
                      </span>
                    </div>
                  )}
                  {sentOriginal.length > 0 && (
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'var(--color-bg-elevated)' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: 'var(--color-text-muted)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {sentOriginal.length}× eigene Version behalten
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Warmer Abschluss */}
              <p
                className="text-sm text-center pb-1"
                style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}
              >
                {withGfk.length === 0
                  ? 'Noch keine Transformationen in dieser Unterhaltung.'
                  : 'Jede Unterhaltung ist anders. Kein Ergebnis — nur ein Blick.'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
