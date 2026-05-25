import { ShieldCheck } from 'lucide-react'

export function VerifiedItemBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium"
      style={{
        border: '1.5px solid #1A3D8F',
        color: '#1A3D8F',
        background: 'rgba(26,61,143,0.06)',
      }}
      title="Earned Badge"
    >
      <ShieldCheck size={11} strokeWidth={1.5} />
      Verified Item
      <span className="text-[9px] uppercase tracking-widest ml-0.5 opacity-60">Earned</span>
    </div>
  )
}
