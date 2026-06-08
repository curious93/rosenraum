'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Message } from '@/lib/firestore'

interface LernModalProps {
  message: Message
  open: boolean
  onClose: () => void
}

/**
 * Großes Lern-Modal das die GFK-Transformation einer Nachricht erklärt.
 * Öffnet sich wenn der Sender auf seine eigene Bubble tippt.
 *
 * @param props - Modal-Props
 * @param props.message
 * @param props.open
 * @param props.onClose
 */
export function LernModal({ message, open, onClose }: LernModalProps) {
  const originalText = message.originalText
  const gfkText = message.rosenbergText
  const sentGfk = message.sentVersion === 'rosenberg'

  if (!gfkText) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
            style={{
              background: 'var(--color-bg-surface)',
              maxHeight: '88vh',
              overflowY: 'auto',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-4">
              <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
                Was hat sich verändert?
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                aria-label="Schließen"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="px-5 pb-2 flex flex-col gap-4">

              {/* Deine Formulierung */}
              <div>
                <div
                  className="text-xs font-medium mb-2 uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Deine Formulierung
                </div>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: 'var(--color-bubble-own)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {originalText}
                </div>
              </div>

              {/* Rosenraum-Vorschlag */}
              <div>
                <div
                  className="text-xs font-medium mb-2 uppercase tracking-wide"
                  style={{ color: 'var(--color-dot-learning)' }}
                >
                  Rosenraum-Vorschlag
                </div>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: 'var(--color-bubble-gfk)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {gfkText}
                </div>
              </div>

              {/* Was wurde gesendet */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: sentGfk ? 'var(--color-dot-learning)' : 'var(--color-text-muted)' }}
                />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {sentGfk
                    ? 'Du hast den Rosenraum-Vorschlag gesendet'
                    : 'Du hast deine eigene Version gesendet'}
                </span>
              </div>

              {/* Abschluss-Text */}
              <p
                className="text-sm text-center pb-2"
                style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}
              >
                Jede Unterhaltung ist ein Angebot zum Hinschauen —<br />
                nicht zum Bewerten.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
