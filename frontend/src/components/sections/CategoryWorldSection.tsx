'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const ROW_1 = [
  { src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=840&q=80', alt: 'Camera' },
  { src: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=840&q=80', alt: 'Drone' },
  { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=840&q=80', alt: 'Sports car' },
  { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=840&q=80', alt: 'Villa' },
  { src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=840&q=80', alt: 'Tent camping' },
  { src: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=840&q=80', alt: 'Motorcycle' },
  { src: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=840&q=80', alt: 'Surfboard' },
  { src: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=840&q=80', alt: 'Laptop' },
  { src: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=840&q=80', alt: 'Power tools' },
  { src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=840&q=80', alt: 'Projector' },
  { src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=840&q=80', alt: 'Interior' },
]

const ROW_2 = [
  { src: 'https://images.unsplash.com/photo-1590842949046-d9e8d39beaaa?w=840&q=80', alt: 'Camera lens' },
  { src: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=840&q=80', alt: 'Electric car' },
  { src: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=840&q=80', alt: 'Beach house' },
  { src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=840&q=80', alt: 'Telescope' },
  { src: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=840&q=80', alt: 'Bicycle' },
  { src: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=840&q=80', alt: 'Film crew' },
  { src: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=840&q=80', alt: 'Luxury sedan' },
  { src: 'https://images.unsplash.com/photo-1449964589673-c3cd5b7ee3a4?w=840&q=80', alt: 'Camera setup' },
  { src: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=840&q=80', alt: 'Paddle board' },
  { src: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=840&q=80', alt: 'DSLR camera' },
]

// Triple each row for seamless looping
const TILES_1 = [...ROW_1, ...ROW_1, ...ROW_1]
const TILES_2 = [...ROW_2, ...ROW_2, ...ROW_2]

export function CategoryWorldSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(200)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const sectionTop = window.scrollY + rect.top
      const raw = (window.scrollY - sectionTop + window.innerHeight) * 0.3
      setOffset(raw)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const row1X = offset - 200
  const row2X = -(offset - 200)

  return (
    <section ref={sectionRef} className="pt-24 sm:pt-32 md:pt-40 pb-10 bg-snow overflow-hidden">

      {/* Section label */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 mb-12">
        <div className="flex items-center gap-4 mb-5">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-fog/50">What You Can Rent</span>
          <div className="h-px bg-royal/20 flex-1" />
        </div>
        <h2
          className="font-display text-ink"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          Every category,<br />one marketplace.
        </h2>
      </div>

      {/* Row 1 — scrolls right */}
      <div ref={row1Ref} className="flex gap-3 mb-3" style={{ transform: `translateX(${row1X}px)`, willChange: 'transform' }}>
        {TILES_1.map((img, i) => (
          <div key={i} className="shrink-0 rounded-card overflow-hidden" style={{ width: 420, height: 270 }}>
            <Image
              src={img.src}
              alt={img.alt}
              width={420}
              height={270}
              loading="lazy"
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Row 2 — scrolls left */}
      <div ref={row2Ref} className="flex gap-3" style={{ transform: `translateX(${row2X}px)`, willChange: 'transform' }}>
        {TILES_2.map((img, i) => (
          <div key={i} className="shrink-0 rounded-card overflow-hidden" style={{ width: 420, height: 270 }}>
            <Image
              src={img.src}
              alt={img.alt}
              width={420}
              height={270}
              loading="lazy"
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Browse CTA */}
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 mt-12">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 font-sans text-sm text-royal border-b border-royal/40 pb-px hover:border-royal transition-colors"
        >
          Browse all categories →
        </Link>
      </div>
    </section>
  )
}
