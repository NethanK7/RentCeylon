import { cn } from '@/lib/utils'
import { formatLKR } from '@/lib/utils'

interface PriceTagProps {
  amount: number
  period?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceTag({ amount, period = '/day', size = 'md', className }: PriceTagProps) {
  const sizeClass = {
    sm: 'text-base',
    md: 'text-price',
    lg: 'text-2xl',
  }[size]

  return (
    <div className={cn('flex items-baseline gap-1', className)}>
      <span
        className={cn('font-mono font-medium text-royal', sizeClass)}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatLKR(amount)}
      </span>
      {period && <span className="text-xs font-sans text-fog">{period}</span>}
    </div>
  )
}
