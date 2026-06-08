'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

/** Props für den PageTransition-Wrapper */
interface PageTransitionProps {
  /** Seiteninhalt */
  children: React.ReactNode
}

/**
 * Wrapt alle Pages mit einer sanften Fade+Slide-Transition.
 * Wird im Root-Layout verwendet.
 *
 * @param props - Wrapper-Props
 * @param props.children - Seiteninhalt
 * @returns Animierter Page-Wrapper
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
