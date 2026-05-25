import { Star } from 'lucide-react'

export function FeaturedBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium"
      style={{
        border: '1.5px solid #E8BC6A',
        color: '#A67928',
        background: 'linear-gradient(135deg, rgba(249,241,226,0.9), rgba(232,188,106,0.15))',
      }}
      title="Promoted Listing"
    >
      <Star size={11} strokeWidth={1.5} style={{ fill: '#E8BC6A', color: '#E8BC6A' }} />
      Featured
      <span className="text-[9px] uppercase tracking-widest ml-0.5 opacity-60">Promoted</span>
    </div>
  )
}
