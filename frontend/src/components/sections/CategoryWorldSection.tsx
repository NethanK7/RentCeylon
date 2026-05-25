import Link from 'next/link'
import { Car, Cpu, Home, Wrench, Sofa, Plus } from 'lucide-react'

const CATEGORIES = [
  { name: 'Vehicles', slug: 'vehicles', icon: Car, items: 340, bg: '#0F2456', textColor: '#FFFFFF', accentColor: '#C9973A' },
  { name: 'Electronics', slug: 'electronics', icon: Cpu, items: 820, bg: '#FFFFFF', textColor: '#0C1124', accentColor: '#1A3D8F' },
  { name: 'Properties', slug: 'properties', icon: Home, items: 156, bg: '#F8F9FC', textColor: '#0C1124', accentColor: '#C9973A' },
  { name: 'Tools', slug: 'tools', icon: Wrench, items: 412, bg: '#1A3D8F', textColor: '#FFFFFF', accentColor: '#E8BC6A' },
  { name: 'Furniture', slug: 'furniture', icon: Sofa, items: 289, bg: '#FDF7ED', textColor: '#0C1124', accentColor: '#C9973A' },
  { name: 'More Coming', slug: null, icon: Plus, items: 0, bg: '#F0F3F9', textColor: '#8A97B5', accentColor: '#DDE3F0' },
]

export function CategoryWorldSection() {
  return (
    <section className="py-28 bg-snow">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16">
        <div className="mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog mb-4">What You Can Rent</p>
          <h2 className="font-display font-light text-ink leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            Every category,<br />one marketplace.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-ink/[0.06]">
          {CATEGORIES.map((cat) => {
            const content = (
              <div
                key={cat.name}
                className="relative aspect-square flex flex-col justify-between p-8 group overflow-hidden"
                style={{ background: cat.bg }}
              >
                {/* Ghost text */}
                <span
                  className="absolute inset-0 flex items-center justify-center font-display leading-none pointer-events-none select-none"
                  style={{ fontSize: '8vw', color: cat.accentColor, opacity: 0.06, letterSpacing: '-0.02em' }}
                  aria-hidden
                >
                  {cat.name}
                </span>

                <div
                  className="w-10 h-10 flex items-center justify-center relative z-10"
                  style={{ background: `${cat.accentColor}18`, border: `1px solid ${cat.accentColor}30` }}
                >
                  <cat.icon size={18} strokeWidth={1.5} style={{ color: cat.accentColor }} />
                </div>

                <div className="relative z-10">
                  <h3
                    className="font-heading text-xl mb-1"
                    style={{ color: cat.textColor }}
                  >
                    {cat.name}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: cat.textColor, opacity: 0.45 }}>
                    {cat.items > 0 ? `${cat.items.toLocaleString()} listings` : 'Coming Soon'}
                  </p>
                </div>
              </div>
            )

            return cat.slug ? (
              <Link key={cat.name} href={`/browse?category=${cat.slug}`} className="block hover:opacity-90 transition-opacity">
                {content}
              </Link>
            ) : (
              <div key={cat.name}>{content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
