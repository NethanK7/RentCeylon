'use client'

import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      if (!barRef.current) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      barRef.current.style.width = `${progress}%`
    }

    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-[9997] bg-transparent">
      <div
        ref={barRef}
        className="h-full transition-none"
        style={{
          width: '0%',
          background: 'linear-gradient(90deg, #C9973A, #E8BC6A)',
        }}
      />
    </div>
  )
}
