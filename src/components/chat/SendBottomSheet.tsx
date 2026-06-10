'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Mic, Square } from 'lucide-react'
import confetti from 'canvas-confetti'
import { analyzeMessage } from '@/lib/gfkPrompt'
import { scoreMessage } from '@/lib/gfkScore'
import type { GfkScoreResult } from '@/lib/gfkScore'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { GfkScorePanel, gfkMotivation } from './GfkScorePanel'
import { useSpeechRecognition } from '@/lib/useSpeechRecognition'

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
 * Rosenraum-Beispiel auf Anfrage zeigt.
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
  const [suggestionScore, setSuggestionScore] = useState<{
    forText: string
    result: GfkScoreResult
  } | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [selected, setSelected] = useState<SendVersion>('original')
  const [sendFlash, setSendFlash] = useState(false)
  const [score, setScore] = useState<GfkScoreResult | null>(null)
  const [prevScore, setPrevScore] = useState<GfkScoreResult | null>(null)
  const [scoreLoading, setScoreLoading] = useState(true)
  const scoreRef = useRef<GfkScoreResult | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Interaktions-State für bidirektionales Highlighting
  const [activeDim, setActiveDim] = useState<string | null>(null)
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null)
  const [forceExpandDim, setForceExpandDim] = useState<string | null>(null)

  // Feedback zur Scoring-Ansicht (Text + kompletter Kontext → Firestore)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackState, setFeedbackState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  // Sprachaufnahme — Live-Transkription, danach frei editierbar
  const feedbackRec = useSpeechRecognition()
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function startRecording() {
    feedbackRec.start(feedbackText.trim() ? feedbackText.trim() + ' ' : '', (full) =>
      setFeedbackText(full)
    )
  }

  function closeFeedback() {
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
    feedbackRec.reset()
    setShowFeedback(false)
    setFeedbackText('')
    setFeedbackState('idle')
  }

  // Initial score on mount — with one retry, always ends loading state
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      let result = await scoreMessage(originalText)
      if (cancelled) return
      if (result === null) {
        await new Promise((r) => setTimeout(r, 1000))
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
    return () => {
      cancelled = true
    }
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

  // Re-score when user edits text
  useEffect(() => {
    if (editedText === originalText) return
    const scoreTimer = setTimeout(() => {
      setScoreLoading(true)
      setActiveDim(null)
      setActiveMatchId(null)
      scoreMessage(editedText).then((result) => {
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

  // Vorschlagstext zusätzlich scoren → Dimensions-Highlights im Rosenraum-Beispiel (#6).
  // Score ist an den Text gekoppelt — veraltete Ergebnisse werden beim Rendern ignoriert.
  useEffect(() => {
    if (!rosenbergText) return
    let cancelled = false
    scoreMessage(rosenbergText).then((result) => {
      if (!cancelled && result !== null) setSuggestionScore({ forText: rosenbergText, result })
    })
    return () => {
      cancelled = true
    }
  }, [rosenbergText])

  const suggestionDims =
    suggestionScore && suggestionScore.forText === rosenbergText
      ? suggestionScore.result.dimensions
      : null

  function handleInspire() {
    setShowExample(true)
    if (rosenbergText === null || editedText !== originalText) {
      setAnalyzing(true)
      analyzeMessage(editedText).then((result) => {
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

  function handleDimClick(key: string) {
    setActiveDim((prev) => (prev === key ? null : key))
    setActiveMatchId(null)
  }

  function handleMatchClick(dimKey: string, matchId: string) {
    setActiveDim(dimKey)
    setActiveMatchId((prev) => (prev === matchId ? null : matchId))
  }

  async function handleFeedbackSubmit() {
    if (feedbackState === 'sending' || feedbackState === 'done' || !feedbackText.trim()) return
    setFeedbackState('sending')
    feedbackRec.reset()
    const ok = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: feedbackText.trim(),
        source: 'scoring',
        context: {
          editedText,
          originalText,
          score,
          prevScore,
          rosenbergText,
          suggestionScore: suggestionScore?.result ?? null,
        },
      }),
    })
      .then((r) => r.ok)
      .catch(() => false)
    if (!ok) {
      // Ehrlich bleiben: kein Fake-Danke — Text bleibt erhalten, Nutzer kann es erneut versuchen.
      setFeedbackState('error')
      return
    }
    confetti({ particleCount: 80, spread: 65, origin: { y: 0.75 }, scalar: 0.9 })
    setFeedbackState('done')
    doneTimerRef.current = setTimeout(closeFeedback, 5000)
  }

  function handleSpanClick(matchId: string, dimKey: string) {
    setActiveDim(dimKey)
    setActiveMatchId((prev) => (prev === matchId ? null : matchId))
    setForceExpandDim(dimKey)
  }

  const isGreenScore = !scoreLoading && score !== null && score.total >= 7
  const motivation = gfkMotivation(score, scoreLoading)

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

        {/* Feedback-Link — oben rechts auf der Karte */}
        <button
          type="button"
          onClick={() => setShowFeedback(true)}
          className="absolute right-4 top-4 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Feedback
        </button>

        {/* Prominenter Leitsatz — während Re-Analyse: 4 Punkte wie beim Start */}
        {scoreLoading && score !== null ? (
          <div className="mb-3 flex items-center gap-2 px-0.5" style={{ minHeight: '1.5rem' }}>
            {HIGHLIGHT_DIMS.map((d, i) => (
              <motion.div
                key={d.key}
                style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              />
            ))}
            <span className="ml-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Analysiere…
            </span>
          </div>
        ) : (
          motivation && (
            <p className="text-base font-semibold mb-3 px-0.5" style={{ color: motivation.color }}>
              {motivation.text}
            </p>
          )
        )}

        {/* GFK Live-Score Panel */}
        <GfkScorePanel
          score={score}
          loading={scoreLoading}
          prevScore={prevScore}
          activeMatchId={activeMatchId}
          onDimClick={handleDimClick}
          onMatchClick={handleMatchClick}
          forceExpandDim={forceExpandDim}
        />

        <div className="space-y-2.5 mb-5">
          <VersionCard
            text={editedText}
            onTextChange={setEditedText}
            onSend={handleSend}
            isGreen={isGreenScore}
            textareaRef={textareaRef}
            score={score}
            activeDim={activeDim}
            activeMatchId={activeMatchId}
            onSpanClick={handleSpanClick}
          />

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
              highlightDims={suggestionDims}
              selected={selected === 'rosenberg'}
              onSelect={() =>
                rosenbergText !== null && rosenbergText !== '' && setSelected('rosenberg')
              }
              onClose={() => {
                setShowExample(false)
                setSelected('original')
              }}
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

        {/* Feedback-Overlay — liegt über der Karte */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              key="feedback"
              className="absolute inset-0 z-10 flex flex-col gap-3 rounded-t-2xl px-4 pt-5"
              style={{
                background: 'var(--color-bg-surface)',
                paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {feedbackState === 'done' ? (
                <motion.div
                  className="relative flex flex-1 flex-col items-center justify-center gap-2 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <button
                    type="button"
                    onClick={closeFeedback}
                    aria-label="Schließen"
                    className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    ✕
                  </button>
                  <div style={{ fontSize: '2.5rem' }}>🌸</div>
                  <p
                    className="text-base font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Tausend Dank!
                  </p>
                  <p className="max-w-xs text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Dein Feedback macht Rosenraum besser — für dich und alle anderen. Gern wieder,
                    jede Idee zählt.
                  </p>
                  <div
                    className="mt-3 h-1 w-40 overflow-hidden rounded-full"
                    style={{ background: 'var(--color-border-subtle)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--color-primary)' }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              ) : (
                <>
                  <p
                    className="text-base font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Deine Idee für Rosenraum
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Was passt, was fehlt, was wäre schlauer? Schreib oder sprich es ein — diese
                    Ansicht (dein Text, die Bewertung, der Vorschlag) wird zur Analyse
                    mitgespeichert. Jedes Feedback hilft uns und allen, die Rosenraum nutzen — je
                    öfter, desto wertvoller.
                  </p>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    autoFocus
                    rows={4}
                    maxLength={2000}
                    readOnly={feedbackRec.state === 'recording'}
                    placeholder="Was passt — was nicht?"
                    className="w-full flex-1 resize-none rounded-2xl p-3 text-sm leading-relaxed outline-none"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'max(16px, 0.875rem)',
                    }}
                  />

                  {/* Sprachaufnahme — Live-Transkription, danach editierbar */}
                  {feedbackRec.supported && (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={
                          feedbackRec.state === 'recording' ? feedbackRec.stop : startRecording
                        }
                        aria-label={
                          feedbackRec.state === 'recording'
                            ? 'Aufnahme stoppen'
                            : 'Aufnahme starten'
                        }
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                        style={{
                          background:
                            feedbackRec.state === 'recording'
                              ? 'var(--color-destructive)'
                              : 'var(--color-bg-elevated)',
                          color:
                            feedbackRec.state === 'recording'
                              ? 'var(--color-on-status)'
                              : 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {feedbackRec.state === 'recording' ? (
                          <Square size={14} aria-hidden="true" />
                        ) : (
                          <Mic size={16} aria-hidden="true" />
                        )}
                      </button>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {feedbackRec.state === 'recording' ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity }}
                          >
                            ● Aufnahme läuft — sprich einfach, tippe zum Stoppen.
                          </motion.span>
                        ) : feedbackRec.state === 'stopped' ? (
                          'Aufnahme beendet — du kannst den Text oben noch anpassen.'
                        ) : (
                          'Oder einsprechen statt tippen.'
                        )}
                      </p>
                    </div>
                  )}

                  {feedbackState === 'error' && (
                    <p className="text-sm" style={{ color: 'var(--color-destructive)' }}>
                      Konnte gerade nicht gespeichert werden — dein Text bleibt erhalten, bitte
                      versuch es gleich nochmal.
                    </p>
                  )}
                  <div className="flex gap-2.5">
                    <button
                      onClick={closeFeedback}
                      className="flex-1 rounded-2xl py-3 text-sm font-medium transition-opacity hover:opacity-70"
                      style={{
                        background: 'var(--color-bg-elevated)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      Abbrechen
                    </button>
                    <motion.button
                      onClick={handleFeedbackSubmit}
                      disabled={feedbackState === 'sending' || !feedbackText.trim()}
                      whileTap={{ scale: 0.97 }}
                      className="flex-[2] rounded-2xl py-3 text-sm font-medium transition-opacity disabled:opacity-40"
                      style={{
                        background: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                      }}
                    >
                      {feedbackState === 'sending' ? 'Speichern…' : 'Feedback speichern'}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

// ── Internal ──────────────────────────────────────────────────────────────────

const HIGHLIGHT_DIMS = [
  { key: 'beobachtung' as const, color: 'var(--color-gfk-beobachtung)' },
  { key: 'gefuehl' as const, color: 'var(--color-gfk-gefuehl)' },
  { key: 'beduerfnis' as const, color: 'var(--color-gfk-beduerfnis)' },
  { key: 'bitte' as const, color: 'var(--color-gfk-bitte)' },
] as const

interface AnnotatedSeg {
  start: number
  end: number
  color: string
  dimKey: string
  matchId: string | null
}

function buildHighlightNodes(
  text: string,
  dims: GfkScoreResult['dimensions'],
  activeDim: string | null,
  activeMatchId: string | null,
  onSpanClick: (matchId: string, dimKey: string) => void,
  interactive = true
): React.ReactNode[] {
  // Collect all valid segments per dim — includes isProblematic=false (improvable spots)
  const segs: AnnotatedSeg[] = []
  for (const dim of HIGHLIGHT_DIMS) {
    const dimData = dims[dim.key]
    if (dimData.present === false) continue // „nicht enthalten" → kein Highlight
    const allMatches = dimData.matches ?? []
    for (const match of allMatches) {
      if (match.start >= 0 && match.end > match.start && match.end <= text.length) {
        segs.push({
          start: match.start,
          end: match.end,
          color: dim.color,
          dimKey: dim.key,
          matchId: match.id,
        })
      }
    }
  }

  if (segs.length === 0) return [text]

  // Build breakpoint set — all start/end positions
  const points = new Set<number>([0, text.length])
  for (const s of segs) {
    points.add(s.start)
    points.add(s.end)
  }
  const sorted = Array.from(points).sort((a, b) => a - b)

  const nodes: React.ReactNode[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i]
    const to = sorted[i + 1]
    const chunk = text.slice(from, to)
    if (!chunk) continue

    // Which segments cover this chunk?
    const covering = segs.filter((s) => s.start <= from && s.end >= to)

    if (covering.length === 0) {
      nodes.push(chunk)
      continue
    }

    // Use first covering segment for click handler, layer backgrounds via box-shadow
    const primary = covering[0]
    const isActiveMatch = covering.some(
      (s) => activeMatchId !== null && activeMatchId === s.matchId
    )
    const isActiveDim = covering.some((s) => activeDim === s.dimKey)
    const intensity = isActiveMatch ? 45 : isActiveDim ? 30 : 18

    // Stack multiple colors via layered box-shadows on bottom border
    const shadows = covering.map((s) => `inset 0 -2px 0 ${s.color}`).join(', ')
    // Blend backgrounds: first color as background, others layered
    const bg = `color-mix(in srgb, ${primary.color} ${intensity}%, transparent)`

    nodes.push(
      <mark
        key={`${from}-${to}`}
        onClick={() =>
          interactive && primary.matchId && onSpanClick(primary.matchId, primary.dimKey)
        }
        style={{
          background: bg,
          borderRadius: '3px',
          boxShadow: shadows,
          cursor: interactive && primary.matchId ? 'pointer' : 'default',
        }}
      >
        {chunk}
      </mark>
    )
  }

  return nodes
}

interface VersionCardProps {
  text: string
  onTextChange: (v: string) => void
  onSend: () => void
  isGreen?: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  score: GfkScoreResult | null
  activeDim: string | null
  activeMatchId: string | null
  onSpanClick: (matchId: string, dimKey: string) => void
}

function VersionCard({
  text,
  onTextChange,
  onSend,
  isGreen,
  textareaRef,
  score,
  activeDim,
  activeMatchId,
  onSpanClick,
}: VersionCardProps) {
  // Neuaufnahme im Edit-Modus — ersetzt den Text komplett, daher mit Bestätigung
  const editRec = useSpeechRecognition()
  const [confirmReRec, setConfirmReRec] = useState(false)

  function handleMicClick() {
    if (editRec.state === 'recording') {
      editRec.stop()
      return
    }
    if (text.trim()) {
      setConfirmReRec(true)
      return
    }
    editRec.start('', (full) => onTextChange(full))
  }

  function startReRecording() {
    setConfirmReRec(false)
    onTextChange('')
    editRec.start('', (full) => onTextChange(full))
  }
  const borderColor = isGreen ? 'var(--color-gfk-beduerfnis)' : 'var(--color-primary)'
  const hasHighlights = score !== null

  const textStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    fontSize: '16px',
    lineHeight: '1.5',
    letterSpacing: 'normal',
    padding: 0,
    margin: 0,
    border: 0,
    width: '100%',
    minHeight: '4.5rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  }

  return (
    <div
      className="w-full rounded-2xl p-3.5"
      style={{
        background: 'var(--color-bubble-own)',
        border: `2px solid ${borderColor}`,
        transition: 'border-color 400ms',
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Highlight overlay — rendered as visible text behind transparent textarea */}
        <div
          aria-hidden
          style={{
            ...textStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            color: 'var(--color-text-primary)',
          }}
        >
          {hasHighlights
            ? buildHighlightNodes(text, score!.dimensions, activeDim, activeMatchId, onSpanClick)
            : text}
        </div>

        {/* Editable textarea — color transparent so overlay shows through */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          rows={3}
          readOnly={editRec.state === 'recording'}
          style={{
            ...textStyle,
            position: 'relative',
            display: 'block',
            background: 'transparent',
            color: 'transparent',
            caretColor: 'var(--color-text-primary)',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
          }}
          placeholder="Schreib deine Nachricht..."
          aria-label="Nachricht bearbeiten"
        />
      </div>

      {/* Neuaufnahme — ersetzt den Text (mit Bestätigung) */}
      {editRec.supported && (
        <div className="mt-2 flex items-center gap-2.5">
          {confirmReRec ? (
            <>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Neu aufnehmen? Der bisherige Text wird ersetzt.
              </p>
              <button
                type="button"
                onClick={startReRecording}
                className="rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              >
                Ja, neu aufnehmen
              </button>
              <button
                type="button"
                onClick={() => setConfirmReRec(false)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{
                  background: 'var(--color-bg-surface)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Abbrechen
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleMicClick}
                aria-label={
                  editRec.state === 'recording' ? 'Aufnahme stoppen' : 'Nachricht neu einsprechen'
                }
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                style={{
                  background:
                    editRec.state === 'recording'
                      ? 'var(--color-destructive)'
                      : 'var(--color-bg-surface)',
                  color:
                    editRec.state === 'recording'
                      ? 'var(--color-on-status)'
                      : 'var(--color-text-secondary)',
                }}
              >
                {editRec.state === 'recording' ? (
                  <Square size={13} aria-hidden="true" />
                ) : (
                  <Mic size={15} aria-hidden="true" />
                )}
              </button>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {editRec.state === 'recording' ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    ● Aufnahme läuft — sprich einfach, tippe zum Stoppen.
                  </motion.span>
                ) : editRec.state === 'stopped' ? (
                  'Aufnahme beendet — du kannst den Text anpassen.'
                ) : (
                  'Text anpassen oder neu einsprechen (ersetzt den Text).'
                )}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface GfkVersionCardProps {
  text: string | null
  selected: boolean
  onSelect: () => void
  onClose: () => void
  loading: boolean
  /** Dimensions-Daten für farbige Highlights im Vorschlagstext (null solange nicht gescored) */
  highlightDims?: GfkScoreResult['dimensions'] | null
}

const noopSpanClick = () => {}

function GfkVersionCard({
  text,
  selected,
  onSelect,
  onClose,
  loading,
  highlightDims,
}: GfkVersionCardProps) {
  const borderColor = selected ? 'var(--color-primary)' : 'var(--color-border)'
  const isAlreadyOpen = text === ''
  const isError = text === null && !loading
  const selectable = !loading && !isAlreadyOpen && !isError

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={selectable ? 0 : -1}
        aria-disabled={!selectable}
        onClick={() => selectable && onSelect()}
        onKeyDown={(e) => {
          if (selectable && (e.key === 'Enter' || e.key === ' ')) onSelect()
        }}
        className="w-full text-left rounded-2xl p-3.5 transition-all outline-none"
        style={{
          background: 'var(--color-bubble-gfk)',
          border: `2px solid ${borderColor}`,
          transition: 'border-color 200ms',
          cursor: selectable ? 'pointer' : 'default',
        }}
      >
        <div className="flex items-center justify-between mb-1.5 pr-6">
          <span
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--color-primary-dark)' }}
          >
            Rosenraum-Beispiel
            <InfoTooltip
              text="Nur zur Inspiration — Rosenraum zeigt wie diese Nachricht in der Gewaltfreien Kommunikation klingen könnte. Du entscheidest immer selbst."
              label="Was ist das Rosenraum-Beispiel?"
            />
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Nur zur Inspiration
          </span>
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
                      background:
                        'linear-gradient(90deg, transparent 0%, var(--color-bg-elevated) 50%, transparent 100%)',
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
              style={{ color: 'var(--color-text-primary)' }}
            >
              {isAlreadyOpen ? (
                'Diese Nachricht klingt bereits offen und wertschätzend.'
              ) : isError ? (
                'Rosenraum konnte keinen Vorschlag erstellen. Schreib einfach so wie du bist.'
              ) : highlightDims && text ? (
                <motion.span
                  key="highlighted"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  {buildHighlightNodes(text, highlightDims, null, null, noopSpanClick, false)}
                </motion.span>
              ) : (
                text
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Rosenraum-Beispiel schließen"
        className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-sm leading-none transition-opacity hover:opacity-70"
        style={{
          color: 'var(--color-text-secondary)',
          background: 'var(--color-bg-surface)',
        }}
      >
        ✕
      </button>
    </div>
  )
}
