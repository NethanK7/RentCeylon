import { Zap } from 'lucide-react'

export function FastResponderBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium"
      style={{
        border: '1.5px solid #0D9488',
        color: '#0D9488',
        background: 'rgba(13,148,136,0.06)',
      }}
      title="Earned Badge"
    >
      <Zap size={11} strokeWidth={1.5} />
      Fast Responder
      <span className="text-[9px] uppercase tracking-widest ml-0.5 opacity-60">Earned</span>
    </div>
  )
}
