'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scoreBand, type GfkScoreResult } from '@/lib/gfkScore'

/** Props für das GFK-Score-Panel */
export interface GfkScorePanelProps {
  score: GfkScoreResult | null
  loading: boolean
  prevScore?: GfkScoreResult | null
  activeDim: string | null
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
  const presentDims = DIMENSIONS.filter((d) => score.dimensions[d.key]?.present !== false)
  const allOpen =
    presentDims.length > 0 && presentDims.every((d) => (score.dimensions[d.key]?.score ?? 0) >= 8)
  if (allOpen) return null
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
 * @param props.activeDim - Aktuell aktive Dimension (bidirektionales Highlight)
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
  activeDim,
  activeMatchId,
  onDimClick,
  onMatchClick,
  forceExpandDim,
}: GfkScorePanelProps) {
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set())
  const [showMoreDims, setShowMoreDims] = useState<Set<string>>(new Set())

  const presentDims = score
    ? DIMENSIONS.filter((d) => score.dimensions[d.key]?.present !== false)
    : []
  const alreadyOpen =
    !loading &&
    score !== null &&
    presentDims.length > 0 &&
    presentDims.every((d) => (score.dimensions[d.key]?.score ?? 0) >= 8)

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
        Dein GFK-Lernfeedback
      </p>

      {alreadyOpen ? (
        <p className="text-sm font-medium" style={{ color: 'var(--color-gfk-beduerfnis)' }}>
          ✓ Diese Nachricht klingt bereits offen.
        </p>
      ) : !hasScore && loading ? (
        <div className="flex items-center gap-2 py-1">
          <motion.div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-text-muted)',
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-text-muted)',
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          <motion.div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-text-muted)',
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
          <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
            Analysiere…
          </span>
        </div>
      ) : (
        <div className="space-y-1">
          {hasScore && (
            <p
              className="mb-1.5 tracking-wide"
              style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}
            >
              1–5 kritisch · 6–7 verbessern · 8–10 gut
            </p>
          )}
          <AnimatePresence initial={false}>
            {(hasScore ? activeDims : DIMENSIONS).map((dim, idx) => {
              const dimScore = hasScore ? (score!.dimensions[dim.key]?.score ?? 0) : 0
              const prevDimScore = prevScore?.dimensions[dim.key]?.score ?? null
              const delta =
                prevDimScore !== null && !loading && hasScore ? dimScore - prevDimScore : 0
              const initialLoad = false
              const barColor = hasScore ? dim.color : 'var(--color-skeleton)'
              const labelColor = hasScore ? dim.color : 'var(--color-text-muted)'
              const dimData = hasScore ? score!.dimensions[dim.key] : null
              const present = dimData ? dimData.present !== false : true
              const matches = dimData?.matches ?? []
              const isExpanded = effectiveExpanded.has(dim.key)
              const isActive = activeDim === dim.key
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
                        className="flex-shrink-0 text-left text-xs"
                        style={{ color: 'var(--color-text-muted)', width: '4.5rem' }}
                      >
                        {dim.label}
                      </span>
                      <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                        nicht enthalten
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
                        className="w-full flex items-center gap-2 py-1 rounded-lg transition-colors"
                        style={{
                          background: isActive
                            ? `color-mix(in srgb, ${dim.color} 8%, transparent)`
                            : 'transparent',
                          cursor: hasScore ? 'pointer' : 'default',
                        }}
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
                          className="text-xs flex-shrink-0 text-left"
                          style={{ color: 'var(--color-text-secondary)', width: '4.5rem' }}
                        >
                          {dim.label}
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
                              {prevDimScore !== null && prevDimScore !== dimScore && hasScore && (
                                <motion.div
                                  key={`ghost-${dim.key}-${prevDimScore}-${dimScore}`}
                                  className="absolute rounded-full z-10"
                                  style={{
                                    left: `calc(${prevDimScore * 10}% - 1.5px)`,
                                    top: '15%',
                                    bottom: '15%',
                                    width: '3px',
                                    background: 'var(--color-text-primary)',
                                  }}
                                  initial={{ opacity: 1 }}
                                  animate={{ opacity: [1, 0.2, 1, 0.2, 1] }}
                                  transition={{
                                    duration: 2,
                                    ease: 'easeInOut',
                                    times: [0, 0.25, 0.5, 0.75, 1],
                                  }}
                                />
                              )}
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: barColor }}
                                initial={{ width: '0%' }}
                                animate={{ width: hasScore ? `${dimScore * 10}%` : '0%' }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 180,
                                  damping: 22,
                                  delay: 0.05 * idx,
                                }}
                              />
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-end">
                          <span
                            className="text-xs tabular-nums font-semibold text-right"
                            style={{ width: '1.75rem', display: 'inline-block' }}
                          >
                            {!loading && delta !== 0 && (
                              <motion.span
                                key={`delta-${dim.key}-${prevDimScore}-${dimScore}`}
                                style={{
                                  display: 'inline-block',
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
                          </span>
                          <span
                            className="text-right text-xs"
                            style={{ display: 'inline-block', color: labelColor }}
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
                      </button>

                      {/* Kurzdiagnose + Details-Toggle — startet unter dem Dimensionsnamen, volle Breite */}
                      {hasScore && dimData && dimScore <= 7 && (
                        <div className="mb-1 flex items-start justify-between gap-2 pl-[1.625rem] pr-0.5">
                          <p
                            className="flex-1 text-xs"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {dimData.summary}
                          </p>
                          {hasDetails && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(dim.key)}
                              className="flex-shrink-0 text-xs transition-opacity hover:opacity-70"
                              style={{ color: dim.color }}
                            >
                              {isExpanded ? 'ausblenden ↑' : 'Details ↓'}
                            </button>
                          )}
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
                              {dimData.mainProblem && (
                                <p
                                  className="text-xs mb-2"
                                  style={{ color: 'var(--color-text-secondary)' }}
                                >
                                  {dimData.mainProblem}
                                </p>
                              )}

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
                                      <p
                                        className="text-xs font-medium mb-0.5"
                                        style={{
                                          color: isActiveMatch
                                            ? dim.color
                                            : 'var(--color-text-primary)',
                                        }}
                                      >
                                        &bdquo;{match.text}&ldquo;
                                      </p>
                                      <p
                                        className="text-xs mb-0.5"
                                        style={{ color: dim.color, fontWeight: 500 }}
                                      >
                                        {match.diagnosis}
                                      </p>
                                      <p
                                        className="text-xs italic"
                                        style={{ color: 'var(--color-text-muted)' }}
                                      >
                                        → {match.suggestion}
                                      </p>
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
  )
}
