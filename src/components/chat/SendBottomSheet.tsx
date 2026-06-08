'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Pencil } from 'lucide-react'
import { analyzeMessage } from '@/lib/gfkPrompt'

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
 * Bottom Sheet das die Originalnachricht und eine KI-GFK-Version gegenüberstellt.
 * Taucht nach dem Tippen auf, bevor die Nachricht gesendet wird.
 * Der User kann seinen Text inline editieren und die GFK-Prüfung neu starten.
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
  const [analyzing, setAnalyzing] = useState(true)
  const [selected, setSelected] = useState<SendVersion>('original')
  const [editMode, setEditMode] = useState(false)
  const [sendFlash, setSendFlash] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function runAnalysis(text: string) {
    setRosenbergText(null)
    setAnalyzing(true)
    analyzeMessage(text).then(result => {
      setRosenbergText(result)
      if (result !== null && result !== '') setSelected('rosenberg')
      else setSelected('original')
      setAnalyzing(false)
    })
  }

  useEffect(() => {
    runAnalysis(originalText)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (editMode && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(editedText.length, editedText.length)
    }
  }, [editMode, editedText.length])

  function handleRecheck() {
    setEditMode(false)
    runAnalysis(editedText)
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

  const canRecheck = editMode && editedText.trim().length > 0 && editedText !== originalText

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

        <p className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Welche Version senden?
        </p>

        <div className="space-y-2.5 mb-5">
          {/* Eigene Version — editierbar */}
          <VersionCard
            label="Deine Version"
            text={editedText}
            selected={selected === 'original'}
            onSelect={() => setSelected('original')}
            variant="original"
            editMode={editMode}
            onEditToggle={() => setEditMode(v => !v)}
            onTextChange={setEditedText}
            onRecheck={canRecheck ? handleRecheck : undefined}
            textareaRef={textareaRef}
          />

          {/* GFK-Version */}
          <GfkVersionCard
            text={rosenbergText}
            selected={selected === 'rosenberg'}
            onSelect={() => rosenbergText !== null && rosenbergText !== '' && setSelected('rosenberg')}
            loading={analyzing}
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
          <motion.button
            onClick={handleSend}
            disabled={(analyzing && selected === 'rosenberg') || sendFlash}
            className="flex-[2] py-3 rounded-2xl text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: 'var(--color-primary)' }}
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
                <motion.span
                  key="label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
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
  label: string
  text: string
  selected: boolean
  onSelect: () => void
  variant: 'original'
  editMode: boolean
  onEditToggle: () => void
  onTextChange: (v: string) => void
  onRecheck?: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

function VersionCard({
  label, text, selected, onSelect, editMode,
  onEditToggle, onTextChange, onRecheck, textareaRef,
}: VersionCardProps) {
  const borderColor = selected ? 'var(--color-primary)' : 'var(--color-border)'

  return (
    <div
      className="w-full text-left rounded-2xl p-3.5 cursor-pointer"
      style={{
        background: 'var(--color-bubble-own)',
        border: `2px solid ${borderColor}`,
        transition: 'border-color 200ms',
      }}
      onClick={() => { if (!editMode) onSelect() }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {selected && !editMode && (
            <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              ✓ ausgewählt
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onEditToggle() }}
            className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70 px-1.5 py-0.5 rounded-lg"
            style={{
              color: editMode ? 'var(--color-primary)' : 'var(--color-text-muted)',
              background: editMode ? 'var(--color-primary-light)' : 'transparent',
            }}
            aria-label="Nachricht bearbeiten"
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
            <span>{editMode ? 'Fertig' : 'Anpassen'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {editMode ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => onTextChange(e.target.value)}
              rows={3}
              className="w-full text-sm leading-relaxed bg-transparent outline-none resize-none"
              style={{ color: 'var(--color-text-primary)' }}
              onClick={e => e.stopPropagation()}
            />
            {onRecheck && (
              <button
                onClick={e => { e.stopPropagation(); onRecheck() }}
                className="text-xs font-medium px-3 py-1.5 rounded-xl transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                }}
              >
                GFK nochmal prüfen →
              </button>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="text"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
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
        opacity: (isAlreadyOpen || isError) ? 0.75 : 1,
        transition: 'border-color 200ms',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          GFK-Version
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
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, var(--color-bg-elevated) 50%, transparent 100%)',
                  }}
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
            style={{
              color: (isAlreadyOpen || isError) ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
              fontStyle: (isAlreadyOpen || isError) ? 'italic' : 'normal',
            }}
          >
            {isAlreadyOpen
              ? 'Diese Nachricht klingt bereits offen und wertschätzend.'
              : isError
                ? 'Analyse fehlgeschlagen – passe deinen Text an und prüfe nochmal.'
                : text}
          </motion.p>
        )}
      </AnimatePresence>
    </button>
  )
}
