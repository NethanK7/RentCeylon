import { Star } from 'lucide-react'

export function TopRatedBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium"
      style={{
        border: '1.5px solid #0A7855',
        color: '#0A7855',
        background: 'rgba(10,120,85,0.06)',
      }}
      title="Earned Badge"
    >
      <Star size={11} strokeWidth={1.5} style={{ fill: '#C9973A', color: '#C9973A' }} />
      Top Rated
      <span className="text-[9px] uppercase tracking-widest ml-0.5 opacity-60">Earned</span>
    </div>
  )
}
