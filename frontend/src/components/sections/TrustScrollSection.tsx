import { ShieldCheck, Camera, FileCheck, Clock } from 'lucide-react'

const PILLARS = [
  {
    number: '01',
    title: 'ID Verified Owners',
    description: 'Every lister submits government-issued ID. Verified within 24 hours by our trust team.',
    icon: ShieldCheck,
    color: '#1A3D8F',
  },
  {
    number: '02',
    title: 'Security Deposit',
    description: 'Your deposit is held securely and returned within 48 hours of confirmed return in good condition.',
    icon: FileCheck,
    color: '#C9973A',
  },
  {
    number: '03',
    title: 'Condition Photos',
    description: 'Four mandatory timestamped photos — before and after — from both parties. No disputes without evidence.',
    icon: Camera,
    color: '#0A7855',
  },
  {
    number: '04',
    title: '72hr Resolution',
    description: 'Every dispute is reviewed and resolved within 72 hours. Guaranteed by our trust team.',
    icon: Clock,
    color: '#0F2456',
  },
]

export function TrustScrollSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16">
        <div className="mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog mb-4">Built for Trust</p>
          <h2 className="font-display font-light text-ink leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            Why renters trust RentLoop
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/[0.06]">
          {PILLARS.map((pillar) => (
            <div key={pillar.number} className="bg-white p-8 group">
              <span
                className="font-mono text-4xl block mb-6"
                style={{ color: pillar.color, opacity: 0.2 }}
              >
                {pillar.number}
              </span>
              <div
                className="w-10 h-10 flex items-center justify-center mb-5"
                style={{ background: `${pillar.color}10`, border: `1px solid ${pillar.color}25` }}
              >
                <pillar.icon size={18} strokeWidth={1.5} style={{ color: pillar.color }} />
              </div>
              <h3 className="font-heading text-ink text-lg mb-3">{pillar.title}</h3>
              <p className="font-sans text-sm text-slate leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
