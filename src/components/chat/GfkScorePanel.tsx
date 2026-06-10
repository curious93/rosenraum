'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GfkScoreResult } from '@/lib/gfkScore'

/** Props für das GFK-Score-Panel */
export interface GfkScorePanelProps {
  score: GfkScoreResult | null
  loading: boolean
  prevScore?: GfkScoreResult | null
  activeDim: string | null
  activeMatchId: string | null
  onDimClick: (key: string) => void
  onMatchClick: (dimKey: string, matchId: string) => void
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
  const allOpen = DIMENSIONS.every((d) => (score.dimensions[d.key]?.score ?? 0) >= 7)
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
}: GfkScorePanelProps) {
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set())
  const [showMoreDims, setShowMoreDims] = useState<Set<string>>(new Set())

  const alreadyOpen =
    !loading &&
    score !== null &&
    DIMENSIONS.every((d) => (score.dimensions[d.key]?.score ?? 0) >= 7)

  const hasScore = score !== null

  // Nur Dimensionen mit Problemen oder Matches zeigen — der Rest wird als "gut" komprimiert
  const activeDims = hasScore
    ? DIMENSIONS.filter(
        (d) =>
          (score!.dimensions[d.key]?.score ?? 10) <= 7 ||
          (score!.dimensions[d.key]?.matches?.length ?? 0) > 0
      )
    : DIMENSIONS
  const inactiveDims = hasScore
    ? DIMENSIONS.filter(
        (d) =>
          (score!.dimensions[d.key]?.score ?? 10) > 7 &&
          (score!.dimensions[d.key]?.matches?.length ?? 0) === 0
      )
    : []

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
      ) : (
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {(hasScore ? activeDims : DIMENSIONS).map((dim, idx) => {
              const dimScore = hasScore ? (score!.dimensions[dim.key]?.score ?? 0) : 0
              const prevDimScore = prevScore?.dimensions[dim.key]?.score ?? null
              const delta =
                prevDimScore !== null && !loading && hasScore ? dimScore - prevDimScore : 0
              const initialLoad = loading && !hasScore
              const barColor = hasScore ? dim.color : 'var(--color-skeleton)'
              const labelColor = hasScore ? dim.color : 'var(--color-text-muted)'
              const dimData = hasScore ? score!.dimensions[dim.key] : null
              const matches = dimData?.matches ?? []
              const isExpanded = expandedDims.has(dim.key)
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
                    <span
                      className="text-xs w-20 flex-shrink-0 text-left"
                      style={{ color: 'var(--color-text-secondary)' }}
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
                        className="text-xs tabular-nums text-right"
                        style={{ width: '1.25rem', display: 'inline-block', color: labelColor }}
                      >
                        {!hasScore ? '–' : dimScore}
                      </span>
                    </div>
                  </button>

                  {/* Kurzdiagnose + Details-Toggle */}
                  {hasScore && dimData && dimScore <= 6 && (
                    <div className="pl-[5.5rem] mb-1">
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {dimData.summary}
                      </p>
                      {hasDetails && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(dim.key)}
                          className="text-xs mt-0.5 transition-opacity hover:opacity-70"
                          style={{ color: dim.color }}
                        >
                          {isExpanded ? 'Details ausblenden ↑' : 'Details anzeigen ↓'}
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
                        <div className="ml-[5.5rem] mb-2">
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
