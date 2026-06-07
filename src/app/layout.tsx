import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rosenraum',
  description: 'Ein privater Raum für empathischere Gespräche.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
