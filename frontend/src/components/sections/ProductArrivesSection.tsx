import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    headline: 'Find it.',
    body: 'Browse thousands of verified listings across Sri Lanka — cameras, vehicles, villas, and more.',
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop',
    alt: 'Camera listing',
  },
  {
    number: '02',
    headline: 'Book it.',
    body: "Request with one tap. Deposit held securely in escrow — you're covered from the moment you confirm.",
    img: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&auto=format&fit=crop',
    alt: 'Booking confirmation',
  },
  {
    number: '03',
    headline: 'Enjoy it.',
    body: 'Pick up, use, return. Photos logged at both ends. Deposit back within 48 hours.',
    img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop',
    alt: 'Using a rental',
  },
]

export function ProductArrivesSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog mb-4">How It Works</p>
            <h2 className="font-display font-light text-ink leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              Rent anything,<br />from anyone.
            </h2>
          </div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 border border-royal text-royal px-6 py-3 font-sans text-sm font-medium hover:bg-royal hover:text-white transition-all duration-200 self-start md:self-auto shrink-0"
          >
            Browse Listings <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/[0.06]">
          {STEPS.map((step) => (
            <div key={step.number} className="bg-white group">
              <div className="aspect-[4/3] overflow-hidden bg-frost relative">
                <Image
                  src={step.img}
                  alt={step.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
              </div>
              <div className="p-8 border-t border-ink/[0.06]">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog block mb-4">{step.number}</span>
                <h3 className="font-display text-2xl text-ink font-light mb-3">{step.headline}</h3>
                <p className="font-sans text-sm text-slate leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
