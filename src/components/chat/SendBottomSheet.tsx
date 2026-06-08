'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeMessage } from '@/lib/gfkPrompt'

/** Welche Version der Nutzer abschicken möchte */
export type SendVersion = 'original' | 'rosenberg'

/** Props für das SendBottomSheet */
export interface SendBottomSheetProps {
  /** Originalnachricht des Nutzers */
  originalText: string
  /** Callback wenn der Nutzer eine Version wählt */
  onSend: (text: string, version: SendVersion, rosenbergText?: string) => void
  /** Callback zum Schließen ohne Senden */
  onClose: () => void
}

/**
 * Bottom Sheet das die Originalnachricht und eine KI-GFK-Version gegenüberstellt.
 * Taucht nach dem Tippen auf, bevor die Nachricht gesendet wird.
 *
 * @param props - Sheet-Props
 * @param props.originalText - Originalnachricht des Nutzers
 * @param props.onSend - Callback wenn der Nutzer eine Version wählt
 * @param props.onClose - Callback zum Schließen ohne Senden
 * @returns SendBottomSheet JSX
 */
export function SendBottomSheet({ originalText, onSend, onClose }: SendBottomSheetProps) {
  const [rosenbergText, setRosenbergText] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(true)
  const [selected, setSelected] = useState<SendVersion>('original')

  useEffect(() => {
    let cancelled = false
    analyzeMessage(originalText).then(result => {
      if (!cancelled) {
        setRosenbergText(result)
        if (result) setSelected('rosenberg')
        setAnalyzing(false)
      }
    })
    return () => { cancelled = true }
  }, [originalText])

  function handleSend() {
    if (selected === 'rosenberg' && rosenbergText) {
      onSend(rosenbergText, 'rosenberg', rosenbergText)
    } else {
      onSend(originalText, 'original', rosenbergText || undefined)
    }
  }

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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl px-4 pb-safe pt-5 mx-auto"
        style={{
          background: 'var(--color-bg-surface)',
          maxWidth: 'var(--max-width-chat)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        {/* Drag Handle */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-5"
          style={{ background: 'var(--color-border)' }}
        />

        <p className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Welche Version senden?
        </p>

        <div className="space-y-2.5 mb-5">
          {/* Original */}
          <VersionCard
            label="Deine Version"
            text={originalText}
            selected={selected === 'original'}
            onSelect={() => setSelected('original')}
            variant="original"
          />

          {/* GFK-Version */}
          <VersionCard
            label="GFK-Version"
            text={rosenbergText}
            selected={selected === 'rosenberg'}
            onSelect={() => rosenbergText && setSelected('rosenberg')}
            loading={analyzing}
            variant="rosenberg"
          />
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
            style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSend}
            disabled={analyzing && selected === 'rosenberg'}
            className="flex-[2] py-3 rounded-2xl text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            Senden →
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ── Internal ──────────────────────────────────────────────────────────────────

interface VersionCardProps {
  label: string
  text: string | null
  selected: boolean
  onSelect: () => void
  loading?: boolean
  variant: 'original' | 'rosenberg'
}

function VersionCard({ label, text, selected, onSelect, loading, variant }: VersionCardProps) {
  const borderColor = selected
    ? 'var(--color-primary)'
    : 'var(--color-border)'
  const bgColor = variant === 'rosenberg'
    ? 'var(--color-bubble-gfk)'
    : 'var(--color-bubble-own)'

  return (
    <button
      onClick={onSelect}
      disabled={!text && !loading}
      className="w-full text-left rounded-2xl p-3.5 transition-all"
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        opacity: !text && !loading ? 0.75 : 1,
        transition: 'border-color 200ms',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </span>
        {selected && (
          <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
            ✓ ausgewählt
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5"
          >
            {[100, 85, 60].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded-full"
                style={{
                  width: `${w}%`,
                  background: 'var(--color-skeleton)',
                  animation: 'pulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.p
            key="text"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm leading-relaxed"
            style={{
              color: text ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontStyle: text ? 'normal' : 'italic',
            }}
          >
            {text || 'Diese Nachricht klingt bereits offen.'}
          </motion.p>
        )}
      </AnimatePresence>
    </button>
  )
}
