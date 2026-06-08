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
        {/* Restores stored theme + colour mode before first paint to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('rosenraum_theme');if(t&&t!=='rose')d.setAttribute('data-theme',t);var m=localStorage.getItem('rosenraum_mode')||'system';var dark=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(dark)d.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
