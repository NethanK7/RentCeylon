import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-frost flex items-center justify-center mb-6 text-fog">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-heading text-ink mb-2">{title}</h3>
      {description && <p className="text-sm font-sans text-fog max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}
