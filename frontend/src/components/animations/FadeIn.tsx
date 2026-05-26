'use client'

import { ReactNode, ElementType } from 'react'
import { motion } from 'framer-motion'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  x?: number
  y?: number
  className?: string
  as?: ElementType
}

const EASE = [0.25, 0.1, 0.25, 1] as const

export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  as: Tag = 'div',
}: FadeInProps) {
  const MotionTag = motion.create(Tag as 'div')

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  )
}
