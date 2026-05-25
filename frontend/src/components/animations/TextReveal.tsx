import { ReactNode } from 'react'

interface TextRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
}

export function TextReveal({ children, className = '', as: Tag = 'div' }: TextRevealProps) {
  return <Tag className={className}>{children}</Tag>
}
