'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ListingGalleryProps {
  photos: string[]
  title: string
}

export function ListingGallery({ photos, title }: ListingGalleryProps) {
  const [current, setCurrent] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  // Parallax on hero image
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return
      const scrollY = window.scrollY
      heroRef.current.style.transform = `translateY(${scrollY * 0.4}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative h-[50vh] md:h-[65vh] overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          ref={heroRef}
          className="absolute inset-0 will-animate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          data-cursor="image"
        >
          <Image
            src={photos[current]}
            alt={`${title} - photo ${current + 1}`}
            fill
            className="object-cover"
            priority={current === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ink/40" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + photos.length) % photos.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <ChevronLeft size={18} strokeWidth={1.5} className="text-ink" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % photos.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <ChevronRight size={18} strokeWidth={1.5} className="text-ink" />
          </button>
        </>
      )}

      {/* Photo count badge */}
      <div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-sans"
        style={{ background: 'rgba(12,17,36,0.7)', backdropFilter: 'blur(8px)' }}
      >
        <Images size={12} strokeWidth={1.5} />
        {current + 1} / {photos.length}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="h-1.5 rounded-full transition-all"
            style={{ background: i === current ? '#C9973A' : 'rgba(255,255,255,0.5)', width: i === current ? 20 : 6 }}
          />
        ))}
      </div>
    </div>
  )
}
