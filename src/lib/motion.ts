import type { TargetAndTransition, Transition } from 'framer-motion'

/**
 * Geteilte Motion-Varianten für Panel-Wechsel und Karten-Eintritte.
 * Panel-Morph: iOS-artiger Cross-Morph (Opacity + Scale + Y + Blur) —
 * das ausgehende Panel hebt ab und verschwimmt, das eintretende
 * materialisiert an seiner Stelle. Mit AnimatePresence mode="wait" nutzen.
 */

/** Austritts-Zustand für Panel-Morph (exit-Prop). */
export const morphOut: TargetAndTransition = {
  opacity: 0,
  scale: 0.96,
  y: -10,
  filter: 'blur(6px)',
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
}

/** Eintritts-Start für Panel-Morph (initial-Prop). */
export const morphIn = {
  opacity: 0,
  scale: 1.03,
  y: 10,
  filter: 'blur(6px)',
}

/** Eintritts-Ziel für Panel-Morph (animate-Prop). */
export const morphTo: TargetAndTransition = {
  opacity: 1,
  scale: 1,
  y: 0,
  filter: 'blur(0px)',
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

/** Karten-Eintritt mit Spring-Overshoot (initial-Prop). */
export const cardIn = {
  opacity: 0,
  y: 32,
  scale: 0.95,
}

/** Spring-Transition für cardIn — leichtes Überschwingen. */
export const cardInSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 19,
}
