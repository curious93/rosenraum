'use client'

import { motion } from 'framer-motion'
import type { GfkScoreResult } from '@/lib/gfkScore'

/** Props für das GFK-Score-Panel */
export interface GfkScorePanelProps {
  /** Scoring-Ergebnis, null solange nicht geladen */
  score: GfkScoreResult | null
  /** Ob die Analyse noch läuft */
  loading: boolean
  /** Vorheriges Scoring für Delta-Animation */
  prevScore?: GfkScoreResult | null
}

const DIMENSIONS = [
  { key: 'beobachtung' as const, label: 'Beobachtung', color: 'var(--color-gfk-beobachtung)' },
  { key: 'gefuehl' as const, label: 'Gefühl', color: 'var(--color-gfk-gefuehl)' },
  { key: 'beduerfnis' as const, label: 'Bedürfnis', color: 'var(--color-gfk-beduerfnis)' },
  { key: 'bitte' as const, label: 'Bitte', color: 'var(--color-gfk-bitte)' },
] as const

/**
 * Liefert den motivierenden Leitsatz zum aktuellen Score (oder null).
 * Wird prominent oberhalb des Panels gerendert, nicht mehr im Panel selbst.
 *
 * @param score - Scoring-Ergebnis, null solange nicht geladen
 * @param loading - Ob die Analyse noch läuft
 * @returns Text + Farbe, oder null wenn nichts anzuzeigen ist
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
 * GFK-Score-Panel: animierte Balken pro Dimension mit Delta-Badges.
 *
 * @param props - Panel-Props
 * @param props.score - Scoring-Ergebnis, null solange nicht geladen
 * @param props.loading - Ob die Analyse noch läuft
 * @param props.prevScore - Vorheriges Scoring für Delta-Animation
 * @returns GfkScorePanel JSX
 */
export function GfkScorePanel({ score, loading, prevScore }: GfkScorePanelProps) {
  const alreadyOpen =
    !loading &&
    score !== null &&
    DIMENSIONS.every((d) => (score.dimensions[d.key]?.score ?? 0) >= 7)

  const hasScore = score !== null

  return (
    <div
      className="rounded-2xl p-3.5 mb-3"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
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
        <>
          <div className="space-y-2">
            {DIMENSIONS.map((dim, idx) => {
              const dimScore = hasScore ? (score!.dimensions[dim.key]?.score ?? 0) : 0
              const prevDimScore = prevScore?.dimensions[dim.key]?.score ?? null
              const delta =
                prevDimScore !== null && !loading && hasScore ? dimScore - prevDimScore : 0
              // Skeleton only on initial load (no score yet) — keep bars stable during re-scoring
              const initialLoad = loading && !hasScore
              const barColor = hasScore ? dim.color : 'var(--color-skeleton)'
              const labelColor = hasScore ? dim.color : 'var(--color-text-muted)'

              return (
                <div key={dim.key} className="flex items-center gap-2">
                  <span
                    className="text-xs w-20 flex-shrink-0"
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
                    {/* Delta-Slot — feste Breite, schiebt die Zahl nie */}
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
                    {/* Score — feste, rechtsbündige Zelle, bewegt sich nie */}
                    <span
                      className="text-xs tabular-nums text-right"
                      style={{ width: '1.25rem', display: 'inline-block', color: labelColor }}
                    >
                      {!hasScore ? '–' : dimScore}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
