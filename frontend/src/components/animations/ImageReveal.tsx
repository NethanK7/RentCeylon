import { ReactNode } from 'react'

interface ImageRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ImageReveal({ children, className = '' }: ImageRevealProps) {
  return <div className={`overflow-hidden ${className}`}>{children}</div>
}
