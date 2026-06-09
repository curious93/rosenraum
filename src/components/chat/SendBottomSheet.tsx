'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { analyzeMessage } from '@/lib/gfkPrompt'
import { scoreMessage } from '@/lib/gfkScore'
import type { GfkScoreResult } from '@/lib/gfkScore'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { GfkScorePanel } from './GfkScorePanel'

/** Welche Version der Nutzer abschicken möchte */
export type SendVersion = 'original' | 'rosenberg'

/** Props für das SendBottomSheet */
export interface SendBottomSheetProps {
  /** Originalnachricht des Nutzers */
  originalText: string
  /** Callback wenn der Nutzer eine Version wählt und sendet */
  onSend: (text: string, version: SendVersion, rosenbergText?: string) => void
  /** Callback zum Schließen ohne Senden */
  onClose: () => void
}

/**
 * Bottom Sheet das die Originalnachricht nach GFK bewertet und optional ein
 * Rosenraum-Beispiel auf Anfrage zeigt. Textarea sofort editierbar, Enter sendet.
 *
 * @param props - Sheet-Props
 * @param props.originalText - Originalnachricht des Nutzers
 * @param props.onSend - Callback wenn der Nutzer eine Version wählt
 * @param props.onClose - Callback zum Schließen ohne Senden
 * @returns SendBottomSheet JSX
 */
export function SendBottomSheet({ originalText, onSend, onClose }: SendBottomSheetProps) {
  const [editedText, setEditedText] = useState(originalText)
  const [rosenbergText, setRosenbergText] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [selected, setSelected] = useState<SendVersion>('original')
  const [sendFlash, setSendFlash] = useState(false)
  const [score, setScore] = useState<GfkScoreResult | null>(null)
  const [prevScore, setPrevScore] = useState<GfkScoreResult | null>(null)
  const [scoreLoading, setScoreLoading] = useState(true)
  const scoreRef = useRef<GfkScoreResult | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initial score on mount — with one retry, always ends loading state
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      let result = await scoreMessage(originalText)
      if (cancelled) return
      if (result === null) {
        await new Promise(r => setTimeout(r, 1000))
        if (cancelled) return
        result = await scoreMessage(originalText)
        if (cancelled) return
      }
      scoreRef.current = result
      setScore(result)
      setScoreLoading(false)
    }
    run().catch(() => {
      if (!cancelled) setScoreLoading(false)
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Focus textarea on mount
  useEffect(() => {
    const t = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const len = textareaRef.current.value.length
        textareaRef.current.setSelectionRange(len, len)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [])

  // Re-score when user edits text — skeleton starts only when fetch fires, not while typing
  useEffect(() => {
    if (editedText === originalText) return
    const scoreTimer = setTimeout(() => {
      setScoreLoading(true)
      scoreMessage(editedText).then(result => {
        if (result !== null) {
          setPrevScore(scoreRef.current)
          scoreRef.current = result
          setScore(result)
        }
        setScoreLoading(false)
      })
    }, 800)
    return () => clearTimeout(scoreTimer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedText])

  function handleInspire() {
    setShowExample(true)
    if (rosenbergText === null || editedText !== originalText) {
      setAnalyzing(true)
      analyzeMessage(editedText).then(result => {
        setRosenbergText(result)
        setAnalyzing(false)
      })
    }
  }

  function handleSend() {
    setSendFlash(true)
    setTimeout(() => {
      if (selected === 'rosenberg' && rosenbergText) {
        onSend(rosenbergText, 'rosenberg', rosenbergText)
      } else {
        onSend(editedText, 'original', rosenbergText ?? undefined)
      }
    }, 320)
  }

  const isGreenScore = !scoreLoading && score !== null && score.total >= 7

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
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl px-4 pt-5 mx-auto"
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

        {/* GFK Live-Score Panel */}
        <GfkScorePanel
          score={score}
          loading={scoreLoading}
          prevScore={prevScore}
        />

        <p className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Deine Nachricht
        </p>

        <div className="space-y-2.5 mb-5">
          {/* Eigene Version — sofort editierbar */}
          <VersionCard
            text={editedText}
            onTextChange={setEditedText}
            onSend={handleSend}
            isGreen={isGreenScore}
            textareaRef={textareaRef}
          />

          {/* Rosenraum-Beispiel — nur auf Anfrage */}
          {!showExample ? (
            <button
              onClick={handleInspire}
              className="w-full text-left px-3.5 py-2.5 rounded-2xl text-sm transition-opacity hover:opacity-70"
              style={{
                background: 'var(--color-bubble-gfk)',
                color: 'var(--color-primary-dark)',
                border: '2px solid var(--color-border)',
              }}
            >
              Inspiriere mich →
            </button>
          ) : (
            <GfkVersionCard
              text={rosenbergText}
              selected={selected === 'rosenberg'}
              onSelect={() => rosenbergText !== null && rosenbergText !== '' && setSelected('rosenberg')}
              loading={analyzing}
            />
          )}
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
            style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
          >
            Abbrechen
          </button>
          <motion.button
            onClick={handleSend}
            disabled={sendFlash}
            className="flex-[2] py-3 rounded-2xl text-sm font-medium text-primary-foreground transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{
              background: isGreenScore ? 'var(--color-gfk-beduerfnis)' : 'var(--color-primary)',
              transition: 'background 400ms',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <AnimatePresence mode="wait">
              {sendFlash ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Senden →
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}

// ── Internal ──────────────────────────────────────────────────────────────────

interface VersionCardProps {
  text: string
  onTextChange: (v: string) => void
  onSend: () => void
  isGreen?: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

/**
 * Editierbare Karte für die eigene Nachricht. Textarea sofort aktiv, Enter sendet.
 *
 * @param props - Karten-Props
 * @param props.text - Aktueller Nachrichtentext
 * @param props.onTextChange - Callback bei Textänderung
 * @param props.onSend - Callback zum Senden (Enter-Taste)
 * @param props.isGreen - Grüner Rand wenn Score >= 7
 * @param props.textareaRef - Ref für Fokus-Management
 * @returns VersionCard JSX
 */
function VersionCard({ text, onTextChange, onSend, isGreen, textareaRef }: VersionCardProps) {
  const borderColor = isGreen ? 'var(--color-gfk-beduerfnis)' : 'var(--color-primary)'

  return (
    <div
      className="w-full rounded-2xl p-3.5"
      style={{
        background: 'var(--color-bubble-own)',
        border: `2px solid ${borderColor}`,
        transition: 'border-color 400ms',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Deine Version
        </span>
        {isGreen && (
          <span className="text-xs font-medium" style={{ color: 'var(--color-gfk-beduerfnis)' }}>
            ✓ Gut formuliert
          </span>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => onTextChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        rows={3}
        className="w-full text-sm leading-relaxed bg-transparent outline-none resize-none"
        style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}
        placeholder="Schreib deine Nachricht..."
        aria-label="Nachricht bearbeiten"
      />
    </div>
  )
}

interface GfkVersionCardProps {
  text: string | null
  selected: boolean
  onSelect: () => void
  loading: boolean
}

function GfkVersionCard({ text, selected, onSelect, loading }: GfkVersionCardProps) {
  const borderColor = selected ? 'var(--color-primary)' : 'var(--color-border)'
  const isAlreadyOpen = text === ''
  const isError = text === null && !loading

  return (
    <button
      onClick={onSelect}
      disabled={loading || isAlreadyOpen || isError}
      className="w-full text-left rounded-2xl p-3.5 transition-all"
      style={{
        background: 'var(--color-bubble-gfk)',
        border: `2px solid ${borderColor}`,
        transition: 'border-color 200ms',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-primary-dark)' }}>
          Rosenraum-Beispiel
          <InfoTooltip text="Nur zur Inspiration — Rosenraum zeigt wie diese Nachricht in der Gewaltfreien Kommunikation klingen könnte. Du entscheidest immer selbst." label="Was ist das Rosenraum-Beispiel?" />
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Nur zur Inspiration
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
            className="space-y-1.5 overflow-hidden"
          >
            {[100, 85, 60].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded-full relative overflow-hidden"
                style={{ width: `${w}%`, background: 'var(--color-skeleton)' }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-bg-elevated) 50%, transparent 100%)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.p
            key="text"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {isAlreadyOpen
              ? 'Diese Nachricht klingt bereits offen und wertschätzend.'
              : isError
                ? 'Rosenraum konnte keinen Vorschlag erstellen. Schreib einfach so wie du bist.'
                : text}
          </motion.p>
        )}
      </AnimatePresence>
    </button>
  )
}
