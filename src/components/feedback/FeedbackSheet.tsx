'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { FeedbackRating, FeedbackSource } from '@/app/api/feedback/route'

interface FeedbackSheetProps {
  source: FeedbackSource
  roomId?: string
  onClose: () => void
}

const RATINGS: Array<{ id: FeedbackRating; emoji: string; label: string }> = [
  { id: 'sad', emoji: '😕', label: 'Schwierig' },
  { id: 'happy', emoji: '🙂', label: 'Gut' },
  { id: 'love', emoji: '😍', label: 'Super' },
]

/**
 * Bottom Sheet für anonymes Nutzer-Feedback.
 * Unterstützt optionale Emoji-Bewertung, Freitext und E-Mail.
 * Schießt Konfetti beim Absenden.
 *
 * @param root0 - Props
 * @param root0.source - 'room' oder 'landing'
 * @param root0.roomId - nur bei source='room'
 * @param root0.onClose - Callback zum Schließen
 * @returns FeedbackSheet JSX
 */
export function FeedbackSheet({ source, roomId, onClose }: FeedbackSheetProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(null)
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (loading || done) return
    setLoading(true)

    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text || undefined,
        rating: rating ?? undefined,
        email: email || undefined,
        source,
        roomId,
      }),
    })

    const style = getComputedStyle(document.documentElement)
    const colors = [
      '--color-primary',
      '--color-bubble-gfk',
      '--color-bubble-own',
      '--color-primary-light',
      '--color-text-secondary',
    ]
      .map((v) => style.getPropertyValue(v).trim())
      .filter(Boolean)
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors, scalar: 0.9 })

    setLoading(false)
    setDone(true)
    setTimeout(onClose, 2200)
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.25)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl px-5 pt-5 mx-auto"
        style={{
          background: 'var(--color-bg-surface)',
          maxWidth: 'var(--max-width-chat)',
          paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-5"
          style={{ background: 'var(--color-border)' }}
        />

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-6 text-center space-y-2"
            >
              <div style={{ fontSize: '2rem' }}>🌸</div>
              <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Danke — das bedeutet uns viel.
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Dein Feedback hilft, Rosenraum besser zu machen.
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-4">
              <div className="space-y-1">
                <h2
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Wie war deine Erfahrung?
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Anonym · kein Account nötig
                </p>
              </div>

              {/* Emoji-Bewertung */}
              <div className="flex gap-3 justify-center py-1">
                {RATINGS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRating((v) => (v === r.id ? null : r.id))}
                    className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all"
                    style={{
                      background: rating === r.id ? 'var(--color-bg-elevated)' : 'transparent',
                      border: `2px solid ${rating === r.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      transform: rating === r.id ? 'scale(1.08)' : 'scale(1)',
                    }}
                    aria-label={r.label}
                    aria-pressed={rating === r.id}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{r.emoji}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Freitext */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Was hat gut funktioniert? Was war schwierig? (optional)"
                rows={3}
                maxLength={2000}
                className="w-full rounded-2xl p-3 text-sm leading-relaxed resize-none outline-none"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'max(16px, 0.875rem)',
                }}
              />

              {/* E-Mail optional */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail (optional — falls wir uns melden dürfen)"
                className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  fontSize: 'max(16px, 0.875rem)',
                }}
              />

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Abbrechen
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading || (!rating && !text.trim())}
                  whileTap={{ scale: 0.97 }}
                  className="flex-[2] py-3 rounded-2xl text-sm font-medium transition-opacity disabled:opacity-40"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                >
                  {loading ? 'Senden…' : 'Feedback senden 🌸'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
