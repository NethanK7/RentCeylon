'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

interface AnimatedTextProps {
  text: string
  className?: string
  scrollOffset?: [string, string]
}

function AnimatedChar({ char, progress, index, total }: { char: string; progress: MotionValue<number>; index: number; total: number }) {
  const start = index / total
  const end = Math.min(start + 1 / total * 2, 1)

  const opacity = useTransform(progress, [start, end], [0.15, 1])

  return (
    <span className="relative inline-block whitespace-pre">
      <span className="invisible">{char}</span>
      <motion.span
        className="absolute inset-0"
        style={{ opacity }}
      >
        {char}
      </motion.span>
    </span>
  )
}

export function AnimatedText({
  text,
  className = '',
  scrollOffset = ['start 0.85', 'end 0.15'],
}: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: scrollOffset as ['start 0.85', 'end 0.15'],
  })

  const chars = text.split('')

  return (
    <p ref={ref} className={className}>
      {chars.map((char, i) => (
        <AnimatedChar
          key={i}
          char={char}
          progress={scrollYProgress}
          index={i}
          total={chars.length}
        />
      ))}
    </p>
  )
}
