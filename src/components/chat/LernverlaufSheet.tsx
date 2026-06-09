'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Message } from '@/lib/firestore'

/** Props für das LernverlaufSheet. */
export interface LernverlaufSheetProps {
  /** Alle Nachrichten der Session. */
  messages: Message[]
  /** Participant-ID des aktuellen Nutzers — nur eigene Nachrichten werden gezeigt. */
  participantId: string
  /** Callback zum Schließen. */
  onClose: () => void
}

/**
 * Bottom Sheet das alle GFK-Transformationen der Session auf einen Blick zeigt.
 * Nur für den Sender sichtbar — Empfänger sieht niemals Originaltexte.
 * Kein Score, kein Urteil — nur ein stilles Angebot zur Reflexion.
 *
 * @param props - Sheet-Props
 * @param props.messages - Alle Messages der Session
 * @param props.participantId - ID des aktuellen Nutzers
 * @param props.onClose - Callback zum Schließen
 * @returns LernverlaufSheet JSX
 */
export function LernverlaufSheet({ messages, participantId, onClose }: LernverlaufSheetProps) {
  const learningMessages = messages.filter(
    (m) => m.senderId === participantId && m.hasLearningDots && m.rosenbergText
  )

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.25)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl mx-auto flex flex-col"
        style={{
          background: 'var(--color-bg-surface)',
          maxWidth: 'var(--max-width-chat)',
          maxHeight: '80dvh',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        {/* Drag Handle */}
        <div className="pt-5 px-4 flex-shrink-0">
          <div
            className="w-10 h-1 rounded-full mx-auto mb-4"
            style={{ background: 'var(--color-border)' }}
          />

          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Dein Lernverlauf
            </h2>
            <button
              onClick={onClose}
              className="text-xs transition-opacity hover:opacity-70 px-2 py-1 rounded-lg"
              style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-elevated)' }}
            >
              Schließen
            </button>
          </div>

          {learningMessages.length > 0 ? (
            <p className="text-xs pb-3" style={{ color: 'var(--color-text-muted)' }}>
              {learningMessages.length === 1
                ? '1 Nachricht in dieser Unterhaltung neu formuliert.'
                : `${learningMessages.length} Nachrichten in dieser Unterhaltung neu formuliert.`}
            </p>
          ) : (
            <p className="text-xs pb-3" style={{ color: 'var(--color-text-muted)' }}>
              Noch keine Vorschläge — schreib einfach, was du sagen möchtest.
            </p>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
          {learningMessages.length === 0 ? (
            <EmptyLernverlauf />
          ) : (
            <div className="space-y-4 pb-4">
              <AnimatePresence initial={false}>
                {learningMessages.map((msg, i) => (
                  <LernCard key={msg.id} message={msg} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ── Internal ──────────────────────────────────────────────────────────────────

interface LernCardProps {
  message: Message
  index: number
}

function LernCard({ message, index }: LernCardProps) {
  const sentGfk = message.sentVersion === 'rosenberg'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
      className="space-y-1.5 rounded-2xl p-3.5"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Original */}
      <div className="space-y-1">
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Deine Version
        </span>
        <div
          className="px-3 py-2 rounded-[14px_14px_4px_14px] text-sm leading-relaxed"
          style={{
            background: 'var(--color-bubble-own)',
            color: 'var(--color-text-primary)',
          }}
        >
          {message.originalText}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          ↓
        </span>
      </div>

      {/* GFK version */}
      <div className="space-y-1">
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          GFK-Version
        </span>
        <div
          className="px-3 py-2 rounded-[14px_14px_4px_14px] text-sm leading-relaxed"
          style={{
            background: 'var(--color-bubble-gfk)',
            color: 'var(--color-text-primary)',
          }}
        >
          {message.rosenbergText}
        </div>
      </div>

      {/* Badge: was sent */}
      <div className="flex justify-end pt-0.5">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: sentGfk ? 'var(--color-bubble-gfk)' : 'var(--color-bubble-own)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          Gesendet: {sentGfk ? 'GFK-Version' : 'Deine Version'}
        </span>
      </div>
    </motion.div>
  )
}

function EmptyLernverlauf() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center gap-3"
    >
      <div className="text-3xl" aria-hidden="true">
        🌱
      </div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)', maxWidth: '240px' }}
      >
        Wenn die KI eine alternative Formulierung vorschlägt, siehst du sie hier — als ruhige
        Einladung zur Reflexion.
      </p>
    </motion.div>
  )
}
