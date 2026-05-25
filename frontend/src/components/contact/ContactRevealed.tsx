'use client'

import { Phone, Copy, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ContactRevealedProps {
  phone: string
  name: string
}

export function ContactRevealed({ phone, name }: ContactRevealedProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(phone)
    toast.success('Number copied')
  }

  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl"
      style={{ border: '1.5px solid rgba(201,151,58,0.3)', background: '#FDF7ED' }}
    >
      <div className="flex items-center gap-3">
        <Phone size={16} strokeWidth={1.5} className="text-gold shrink-0" />
        <div>
          <p className="text-xs font-sans text-fog">{name}</p>
          <p
            className="text-base font-mono text-ink"
            style={{ textDecoration: 'underline', textDecorationColor: '#C9973A', textDecorationThickness: 1 }}
          >
            {phone}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="p-2 rounded-full hover:bg-gold-light transition-colors"
          aria-label="Copy number"
        >
          <Copy size={14} strokeWidth={1.5} className="text-gold" />
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium text-white"
          style={{ background: '#25D366' }}
        >
          <MessageCircle size={12} strokeWidth={1.5} />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
