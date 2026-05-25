import { ReactNode } from 'react'

interface CardStaggerProps {
  children: ReactNode
  className?: string
}

export function CardStagger({ children, className = '' }: CardStaggerProps) {
  return <div className={className}>{children}</div>
}
