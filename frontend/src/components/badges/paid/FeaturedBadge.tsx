import { Star } from 'lucide-react'

export function FeaturedBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-card font-sans font-semibold text-[11px] uppercase tracking-[0.1em] select-none"
      style={{
        background: '#C9973A',
        color: '#FFFFFF',
        letterSpacing: '0.08em',
      }}
      title="Featured — Promoted Listing"
    >
      <Star size={10} strokeWidth={0} style={{ fill: '#FFFFFF' }} />
      Featured
    </div>
  )
}
