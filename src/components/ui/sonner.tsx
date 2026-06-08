'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'

/**
 * App toast host. Mount once near the root. Themed via CSS vars so toasts
 * follow the active preset and dark mode. Use `toast()` from this module.
 *
 * @param props - Passthrough props for the underlying Sonner Toaster.
 * @returns The configured Toaster.
 */
function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--color-bg-surface)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
