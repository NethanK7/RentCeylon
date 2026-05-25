import { Lock } from 'lucide-react'

interface ContactRedactedProps {
  message?: string
}

export function ContactRedacted({ message = 'Available after booking is confirmed' }: ContactRedactedProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-frost rounded-xl border border-border">
      <Lock size={16} strokeWidth={1.5} className="text-fog shrink-0" />
      <div>
        <p className="text-sm font-sans text-fog">{message}</p>
        <p
          className="text-base font-mono text-fog mt-0.5 select-none"
          style={{ filter: 'blur(4px)', userSelect: 'none' }}
          aria-hidden="true"
        >
          +94 7X XXX XXXX
        </p>
      </div>
    </div>
  )
}
