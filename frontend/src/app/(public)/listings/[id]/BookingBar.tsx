'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatLKR } from '@/lib/utils'

interface BookingBarProps {
  dailyRate: number
  listingId: string
}

export function BookingBar({ dailyRate, listingId }: BookingBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )

    const heroCta = document.querySelector('[data-hero-cta]')
    if (heroCta) observer.observe(heroCta)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl pb-safe"
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{ borderTop: '1px solid #DDE3F0' }}
        >
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-royal font-medium text-xl">{formatLKR(dailyRate)}</p>
              <p className="text-xs font-sans text-fog">per day</p>
            </div>
            <Link
              href={`/bookings/new/${listingId}`}
              className="px-8 py-3.5 rounded-full font-sans font-medium text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #1A3D8F, #122D6B)' }}
            >
              Book Now
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
