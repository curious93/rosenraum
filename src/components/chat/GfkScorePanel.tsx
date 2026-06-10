'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Info, X } from 'lucide-react'
import { scoreBand, type GfkScoreResult } from '@/lib/gfkScore'
import { GFK_DIMENSION_INFO, type GfkDimKey } from '@/lib/gfkDimensionInfo'

/** Props für das GFK-Score-Panel */
export interface GfkScorePanelProps {
  score: GfkScoreResult | null
  loading: boolean
  prevScore?: GfkScoreResult | null
  activeMatchId: string | null
  onDimClick: (key: string) => void
  onMatchClick: (dimKey: string, matchId: string) => void
  forceExpandDim?: string | null
}

const DIMENSIONS = [
  { key: 'beobachtung' as const, label: 'Beobachtung', color: 'var(--color-gfk-beobachtung)' },
  { key: 'gefuehl' as const, label: 'Gefühl', color: 'var(--color-gfk-gefuehl)' },
  { key: 'beduerfnis' as const, label: 'Bedürfnis', color: 'var(--color-gfk-beduerfnis)' },
  { key: 'bitte' as const, label: 'Bitte', color: 'var(--color-gfk-bitte)' },
] as const

/**
 * Liefert den motivierenden Leitsatz zum aktuellen Score.
 *
 * @param score - Scoring-Ergebnis
 * @param loading - Ob die Analyse noch läuft
 * @returns Text + Farbe, oder null
 */
export function gfkMotivation(
  score: GfkScoreResult | null,
  loading: boolean
): { text: string; color: string } | null {
  if (loading || score === null) return null
  // „Rund" = alle 4 Komponenten enthalten UND gut — das Banner im Panel übernimmt dann
  const isComplete = DIMENSIONS.every((d) => {
    const dim = score.dimensions[d.key]
    return dim?.present !== false && (dim?.score ?? 0) >= 8
  })
  if (isComplete) return null
  const total = score.total ?? 0
  if (total >= 7) return { text: 'Gut formuliert ✓', color: 'var(--color-gfk-beduerfnis)' }
  if (total >= 4) return { text: 'Fast da — noch ein Schritt', color: 'var(--color-text-primary)' }
  return { text: 'Kleine Anpassungen können viel bewirken', color: 'var(--color-text-primary)' }
}

/**
 * GFK-Score-Panel mit animierten Balken, Kurzdiagnosen und aufklappbaren Detailansichten.
 *
 * @param props - Panel-Props
 * @param props.score - Scoring-Ergebnis, null solange nicht geladen
 * @param props.loading - Ob die Analyse noch läuft
 * @param props.prevScore - Vorheriges Scoring für Delta-Animation
 * @param props.activeMatchId - Aktuell aktiver Treffer
 * @param props.onDimClick - Callback bei Klick auf eine Dimension
 * @param props.onMatchClick - Callback bei Klick auf einen Treffer
 * @param props.forceExpandDim - Dimension die von außen geöffnet werden soll (z.B. bei Span-Klick)
 * @returns GfkScorePanel JSX
 */
export function GfkScorePanel({
  score,
  loading,
  prevScore,
  activeMatchId,
  onDimClick,
  onMatchClick,
  forceExpandDim,
}: GfkScorePanelProps) {
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set())
  const [showMoreDims, setShowMoreDims] = useState<Set<string>>(new Set())
  const [infoDim, setInfoDim] = useState<GfkDimKey | null>(null)

  // „Rund" = alle 4 Komponenten enthalten UND gut (>= 8) — zeigt Banner, Balken bleiben sichtbar
  const isComplete =
    !loading &&
    score !== null &&
    DIMENSIONS.every((d) => {
      const dim = score.dimensions[d.key]
      return dim?.present !== false && (dim?.score ?? 0) >= 8
    })

  const hasScore = score !== null

  // Immer alle 4 Dimensionen zeigen
  const activeDims = DIMENSIONS
  const inactiveDims: (typeof DIMENSIONS)[number][] = []

  // Merge forceExpandDim into expandedDims without a side-effect
  const effectiveExpanded = forceExpandDim
    ? new Set([...expandedDims, forceExpandDim])
    : expandedDims

  function toggleExpand(key: string) {
    setExpandedDims((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleShowMore(key: string) {
    setShowMoreDims((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <>
      <div
        className="rounded-2xl p-3.5 mb-3"
        style={{
          background: 'var(--color-bg-elevated)',
        }}
      >
        <p
          className="text-xs font-medium mb-2.5 uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Dein Lernfeedback
        </p>

        {!hasScore && loading ? (
          <div className="flex items-center gap-2 py-1">
            {DIMENSIONS.map((dim, i) => (
              <motion.div
                key={dim.key}
                style={{ width: 8, height: 8, borderRadius: '50%', background: dim.color }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              />
            ))}
            <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
              Analysiere…
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            {isComplete && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 text-sm font-medium"
                style={{ color: 'var(--color-gfk-beduerfnis)' }}
              >
                ✓ Rund — alle vier Komponenten sind da.
              </motion.p>
            )}
            <AnimatePresence initial={false}>
              {(hasScore ? activeDims : DIMENSIONS).map((dim, idx) => {
                const dimScore = hasScore ? (score!.dimensions[dim.key]?.score ?? 0) : 0
                const prevDimScore = prevScore?.dimensions[dim.key]?.score ?? null
                const delta =
                  prevDimScore !== null && !loading && hasScore ? dimScore - prevDimScore : 0
                const initialLoad = false
                const labelColor = hasScore ? dim.color : 'var(--color-text-muted)'
                const dimData = hasScore ? score!.dimensions[dim.key] : null
                const present = dimData ? dimData.present !== false : true
                const matches = dimData?.matches ?? []
                const isExpanded = effectiveExpanded.has(dim.key)
                const visibleMatches = showMoreDims.has(dim.key) ? matches : matches.slice(0, 3)
                const hasDetails = matches.length > 0

                return (
                  <motion.div
                    key={dim.key}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    {hasScore && !present ? (
                      /* „nicht enthalten" — dezente Zeile, kein Balken/Score/Haken */
                      <div className="flex w-full items-center gap-2 py-1">
                        <div
                          className="flex-shrink-0 rounded-full"
                          style={{
                            width: 18,
                            height: 18,
                            border: '1.5px solid var(--color-border)',
                          }}
                        />
                        <span
                          className="flex flex-shrink-0 items-center gap-1 text-left text-xs"
                          style={{ color: dim.color, fontWeight: 600, width: '6rem' }}
                        >
                          {dim.label}
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={`Was bedeutet ${dim.label}?`}
                            className="cursor-pointer transition-opacity hover:opacity-70"
                            style={{ color: 'var(--color-text-muted)' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setInfoDim(dim.key)
                            }}
                          >
                            <Info size={13} aria-hidden="true" />
                          </span>
                        </span>
                        <span
                          className="text-xs italic"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          nicht enthalten
                        </span>
                        <span className="text-xs" style={{ color: dim.color, opacity: 0.75 }}>
                          · + ergänzen?
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Balken-Zeile — klickbar */}
                        <button
                          type="button"
                          onClick={() => {
                            onDimClick(dim.key)
                            if (hasDetails) toggleExpand(dim.key)
                          }}
                          className="w-full flex items-center gap-2 py-1 outline-none"
                          style={{ cursor: hasScore ? 'pointer' : 'default' }}
                        >
                          {/* Checkmark circle — grün wenn score >= 8 */}
                          <motion.div
                            className="flex-shrink-0 flex items-center justify-center rounded-full"
                            style={{
                              width: 18,
                              height: 18,
                              flexShrink: 0,
                              border:
                                hasScore && dimScore >= 8
                                  ? 'none'
                                  : '1.5px solid var(--color-text-muted)',
                            }}
                            animate={
                              hasScore && dimScore >= 8
                                ? { backgroundColor: 'var(--color-gfk-beduerfnis)' }
                                : { backgroundColor: 'transparent' }
                            }
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                          >
                            <AnimatePresence>
                              {hasScore && dimScore >= 8 && (
                                <motion.svg
                                  key="check"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  transition={{ duration: 0.25, ease: 'easeOut' }}
                                >
                                  <polyline
                                    points="2,5 4,7.5 8,3"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.div>

                          <span
                            className="flex flex-shrink-0 items-center gap-1 text-left text-xs"
                            style={{ color: dim.color, fontWeight: 600, width: '6rem' }}
                          >
                            {dim.label}
                            <span
                              role="button"
                              tabIndex={0}
                              aria-label={`Was bedeutet ${dim.label}?`}
                              className="cursor-pointer transition-opacity hover:opacity-70"
                              style={{ color: 'var(--color-text-muted)' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setInfoDim(dim.key)
                              }}
                            >
                              <Info size={13} aria-hidden="true" />
                            </span>
                          </span>

                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden relative"
                            style={{ background: 'var(--color-border)' }}
                          >
                            {initialLoad ? (
                              <div
                                className="h-full rounded-full relative overflow-hidden"
                                style={{ width: '60%', background: 'var(--color-skeleton)' }}
                              >
                                <motion.div
                                  className="absolute inset-0 rounded-full"
                                  style={{
                                    background:
                                      'linear-gradient(90deg, transparent 0%, var(--color-bg-elevated) 50%, transparent 100%)',
                                  }}
                                  animate={{ x: ['-100%', '200%'] }}
                                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                />
                              </div>
                            ) : (
                              <>
                                {/* Qualitätsverlauf rot→amber→grün, Füllung via clipPath (verzerrungsfrei) */}
                                <motion.div
                                  className="absolute inset-0 rounded-full"
                                  style={{
                                    background:
                                      'linear-gradient(90deg, var(--color-gfk-band-kritisch) 0%, var(--color-gfk-band-kritisch) 38%, var(--color-gfk-band-verbessern) 52%, var(--color-gfk-band-verbessern) 64%, var(--color-gfk-band-gut) 76%, var(--color-gfk-band-gut-deep) 100%)',
                                  }}
                                  initial={{ clipPath: 'inset(0 100% 0 0 round 9999px)' }}
                                  animate={{
                                    clipPath: hasScore
                                      ? `inset(0 ${100 - dimScore * 10}% 0 0 round 9999px)`
                                      : 'inset(0 100% 0 0 round 9999px)',
                                  }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 180,
                                    damping: 22,
                                    delay: 0.05 * idx,
                                  }}
                                />
                                {/* Schwellen-Marker an den Band-Grenzen 5→6 (50%) und 7→8 (70%) */}
                                <div
                                  className="absolute z-10"
                                  style={{
                                    left: '50%',
                                    top: 0,
                                    bottom: 0,
                                    width: '2px',
                                    background: 'var(--color-bg-elevated)',
                                  }}
                                />
                                <div
                                  className="absolute z-10"
                                  style={{
                                    left: '70%',
                                    top: 0,
                                    bottom: 0,
                                    width: '2px',
                                    background: 'var(--color-bg-elevated)',
                                  }}
                                />
                              </>
                            )}
                          </div>

                          <div className="relative flex items-center justify-end">
                            {/* Delta schwebt absolut — reserviert keine Balkenbreite */}
                            {!loading && delta !== 0 && (
                              <motion.span
                                key={`delta-${dim.key}-${prevDimScore}-${dimScore}`}
                                className="absolute right-full mr-1 text-xs tabular-nums font-semibold"
                                style={{
                                  color:
                                    delta > 0
                                      ? 'var(--color-gfk-beduerfnis)'
                                      : 'var(--color-gfk-gefuehl)',
                                }}
                                initial={{ opacity: 1, y: delta > 0 ? 4 : -4 }}
                                animate={{ opacity: 0, y: 0 }}
                                transition={{ duration: 1.5, delay: 0.3 }}
                              >
                                {delta > 0 ? `+${delta}` : `${delta}`}
                              </motion.span>
                            )}
                            <span
                              className="text-right text-xs"
                              style={{
                                display: 'inline-block',
                                width: '5.5rem',
                                color: labelColor,
                              }}
                            >
                              {!hasScore ? (
                                '–'
                              ) : (
                                <>
                                  <span className="tabular-nums font-semibold">{dimScore}</span>
                                  <span style={{ color: 'var(--color-text-muted)' }}>
                                    {' · '}
                                    {scoreBand(dimScore)}
                                  </span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Chevron — dreht nach unten wenn Details ausgeklappt */}
                          <motion.span
                            className="flex flex-shrink-0 items-center justify-center"
                            style={{ width: 16, color: 'var(--color-text-muted)' }}
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                          >
                            {hasDetails && <ChevronRight size={14} aria-hidden="true" />}
                          </motion.span>
                        </button>

                        {/* Kurzdiagnose — startet unter dem Dimensionsnamen, volle Breite */}
                        {hasScore && dimData && dimScore <= 7 && (
                          <div className="mb-1 pl-[1.625rem] pr-0.5">
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              {dimData.summary}
                            </p>
                          </div>
                        )}

                        {/* Aufgeklappte Detailansicht */}
                        <AnimatePresence>
                          {isExpanded && hasDetails && dimData && (
                            <motion.div
                              key={`detail-${dim.key}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="mb-2 pl-[1.625rem]">
                                <div className="space-y-3">
                                  {visibleMatches.map((match) => {
                                    const isActiveMatch = activeMatchId === match.id
                                    return (
                                      <motion.button
                                        key={match.id}
                                        type="button"
                                        onClick={() => onMatchClick(dim.key, match.id)}
                                        className="w-full text-left"
                                        animate={isActiveMatch ? { opacity: [1, 0.6, 1] } : {}}
                                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                                      >
                                        {/* 1. Zitat — markiert wie im Eingabefeld (Tint + Unterstrich) */}
                                        <p className="text-sm mb-1">
                                          <mark
                                            style={{
                                              background: `color-mix(in srgb, ${dim.color} 18%, transparent)`,
                                              boxShadow: `inset 0 -2px 0 ${dim.color}`,
                                              borderRadius: '3px',
                                              color: 'var(--color-text-primary)',
                                              padding: '0 2px',
                                            }}
                                          >
                                            {match.text}
                                          </mark>
                                        </p>
                                        {/* 2. Eine Begründungszeile — neutral */}
                                        <p
                                          className="text-sm mb-1.5"
                                          style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                          {match.diagnosis}
                                          {match.explanation ? ` — ${match.explanation}` : ''}
                                        </p>
                                        {/* 3. „Besser:"-Box — der Held */}
                                        {match.suggestion && (
                                          <div
                                            className="rounded-lg px-3 py-2 text-sm"
                                            style={{
                                              background: 'var(--color-bg-surface)',
                                              borderLeft: `3px solid ${dim.color}`,
                                              color: 'var(--color-text-primary)',
                                            }}
                                          >
                                            <span
                                              className="font-medium"
                                              style={{ color: 'var(--color-text-secondary)' }}
                                            >
                                              Besser:{' '}
                                            </span>
                                            {match.suggestion}
                                          </div>
                                        )}
                                      </motion.button>
                                    )
                                  })}
                                </div>

                                {matches.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleShowMore(dim.key)}
                                    className="mt-1.5 text-xs transition-opacity hover:opacity-70"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    {showMoreDims.has(dim.key)
                                      ? 'Weniger anzeigen ↑'
                                      : `Weitere ${matches.length - 3} Stellen anzeigen ↓`}
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Inaktive Dimensionen — kompakt, kein Balken */}
            {inactiveDims.length > 0 && (
              <p className="text-xs pt-1" style={{ color: 'var(--color-text-muted)' }}>
                {inactiveDims.map((d) => d.label).join(', ')} — bereits gut formuliert ✓
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dimension-Info-Modal — großes Erklär-Overlay über allem */}
      <AnimatePresence>
        {infoDim && (
          <>
            <motion.div
              key="info-backdrop"
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(0,0,0,0.35)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoDim(null)}
            />
            <motion.div
              key="info-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`${GFK_DIMENSION_INFO[infoDim].title} erklärt`}
              className="fixed left-1/2 top-1/2 z-[61] flex max-h-[85vh] w-[calc(100%-2rem)] flex-col overflow-hidden rounded-2xl"
              style={{
                maxWidth: 'var(--max-width-sheet)',
                background: 'var(--color-bg-surface)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                x: '-50%',
                y: '-50%',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {(() => {
                const info = GFK_DIMENSION_INFO[infoDim]
                const dimColor = DIMENSIONS.find((d) => d.key === infoDim)!.color
                return (
                  <>
                    <div
                      className="flex items-center justify-between px-5 pt-5 pb-3"
                      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                    >
                      <p
                        className="flex items-center gap-2 text-base font-semibold"
                        style={{ color: dimColor }}
                      >
                        <span>{info.emoji}</span>
                        {info.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => setInfoDim(null)}
                        aria-label="Schließen"
                        className="flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        <X size={15} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="overflow-y-auto px-5 py-4">
                      <p
                        className="pb-4 text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {info.intro}
                      </p>

                      {[
                        { label: 'Warum es schwer ist', body: info.challenge },
                        { label: 'Ein Beispiel', body: null },
                        { label: 'Was daran schön ist', body: info.beauty },
                        { label: 'Deine Lernkurve', body: info.curve },
                      ].map((section) => (
                        <div
                          key={section.label}
                          className="py-4 last:pb-0"
                          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
                        >
                          <p
                            className="mb-1.5 flex items-center gap-2 text-sm font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            <span
                              className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                              style={{ background: dimColor }}
                            />
                            {section.label}
                          </p>
                          {section.body ? (
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {section.body}
                            </p>
                          ) : (
                            <>
                              <p
                                className="mb-0.5 text-xs font-medium uppercase tracking-wide"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                Vorher
                              </p>
                              <p
                                className="mb-2 text-sm leading-relaxed line-through"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {info.example.vorher}
                              </p>
                              <p
                                className="mb-0.5 text-xs font-medium uppercase tracking-wide"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                Besser
                              </p>
                              <div
                                className="rounded-lg px-3 py-2 text-sm leading-relaxed"
                                style={{
                                  background: 'var(--color-bg-elevated)',
                                  borderLeft: `3px solid ${dimColor}`,
                                  color: 'var(--color-text-primary)',
                                }}
                              >
                                {info.example.nachher}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="px-5 pb-5 pt-1">
                      <button
                        type="button"
                        onClick={() => setInfoDim(null)}
                        className="w-full rounded-2xl py-3 text-sm font-medium transition-opacity hover:opacity-80"
                        style={{
                          background: 'var(--color-primary)',
                          color: 'var(--color-on-primary)',
                        }}
                      >
                        Alles klar
                      </button>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
