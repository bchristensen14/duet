import { useEffect, useState } from 'react'

/** Minimal hash router: "#/people/c-maya" -> ["people", "c-maya"]. */
export function useRoute(): string[] {
  const parse = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [route, setRoute] = useState(parse)

  useEffect(() => {
    const onChange = () => {
      setRoute(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export const navigate = (path: string) => {
  window.location.hash = path
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return `${Math.round(d / 30)}mo ago`
}
