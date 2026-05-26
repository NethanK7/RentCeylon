'use client'

import { useRef, useState, useCallback, ReactNode } from 'react'

interface MagnetProps {
  children: ReactNode
  padding?: number
  strength?: number
  activeTransition?: string
  inactiveTransition?: string
  className?: string
}

export function Magnet({
  children,
  padding = 80,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    el.style.transition = activeTransition
    el.style.transform = `translate3d(${dx / strength}px, ${dy / strength}px, 0)`
  }, [activeTransition, strength])

  const onEnter = useCallback((e: React.MouseEvent) => {
    setActive(true)
    onMove(e)
  }, [onMove])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    setActive(false)
    el.style.transition = inactiveTransition
    el.style.transform = 'translate3d(0, 0, 0)'
  }, [inactiveTransition])

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-block', willChange: 'transform', padding }}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div style={{ margin: -padding }}>
        {children}
      </div>
    </div>
  )
}
