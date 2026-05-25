'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useMotionValue, useSpring, animate } from 'framer-motion'

interface CountUpProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function CountUp({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const startTime = performance.now()
    const step = (timestamp: number) => {
      const elapsed = (timestamp - startTime) / (duration * 1000)
      const progress = Math.min(elapsed, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  )
}
