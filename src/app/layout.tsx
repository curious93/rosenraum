import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rosenraum',
  description: 'Ein privater Raum für empathischere Gespräche.',
}

/**
 * Root layout — sets HTML lang and global styles.
 *
 * @param props - Layout props
 * @param props.children - Page content
 * @returns HTML shell
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <head>
        {/* Applies stored theme before first paint to avoid flash of unstyled content */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('rosenraum_theme');if(t&&t!=='rose')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()` }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
