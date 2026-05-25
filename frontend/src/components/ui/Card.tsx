'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  goldTrace?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = true, goldTrace = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-cursor="card"
        className={cn(
          'bg-white rounded-card border border-border shadow-card transition-all duration-300 relative overflow-hidden',
          hover && 'hover:-translate-y-1.5 hover:shadow-card-hover group',
          className,
        )}
        {...props}
      >
        {/* Gold trace border on hover */}
        {goldTrace && (
          <div
            className="absolute inset-0 rounded-card pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, rgba(201,151,58,0.3), rgba(232,188,106,0.3), rgba(201,151,58,0.3))',
              padding: '1px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
        )}
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
