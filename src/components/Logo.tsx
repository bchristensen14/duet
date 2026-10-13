export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size * 1.6} height={size} viewBox="0 0 64 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="var(--violet)" />
      <circle cx="44" cy="20" r="18" fill="var(--coral)" />
      <path d="M32 6.6a18 18 0 0 1 0 26.8a18 18 0 0 1 0-26.8z" fill="var(--cream)" />
    </svg>
  )
}
