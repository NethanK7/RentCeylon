import { ReactNode } from 'react'

interface ParallaxSectionProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function ParallaxSection({ children, className = '' }: ParallaxSectionProps) {
  return <div className={className}>{children}</div>
}
