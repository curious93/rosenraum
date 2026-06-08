import { notFound } from 'next/navigation'

export const metadata = { title: 'Preview — Rosenraum' }

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  // Dev-only: never expose component previews in production builds.
  if (process.env.NODE_ENV === 'production') notFound()
  return children
}
