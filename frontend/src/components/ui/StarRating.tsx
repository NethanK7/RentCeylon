import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (value: number) => void
  className?: string
}

export function StarRating({
  value,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(value)
        const partial = !filled && i < value

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={cn(
              'transition-transform',
              interactive && 'hover:scale-125 cursor-pointer',
              !interactive && 'cursor-default',
            )}
          >
            <Star
              size={size}
              strokeWidth={1.5}
              style={{
                fill: filled ? '#C9973A' : 'none',
                color: filled || partial ? '#C9973A' : '#DDE3F0',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
