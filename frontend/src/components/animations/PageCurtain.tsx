'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

export function PageCurtain() {
  const pathname = usePathname()
  const [key, setKey] = useState(pathname)

  useEffect(() => {
    setKey(pathname)
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        className="fixed inset-0 z-[9998] pointer-events-none"
        initial={{ y: '0%' }}
        animate={{ y: '-100%' }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        style={{ originY: '0%' }}
      >
        <div className="w-full h-full bg-white relative">
          {/* Gold leading edge */}
          <div
            className="absolute bottom-0 left-0 w-full h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, #C9973A 20%, #E8BC6A 50%, #C9973A 80%, transparent)' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
