import { cn } from '@/lib/utils'
import { formatLKR } from '@/lib/utils'

interface PolicyTier {
  days: string
  refund: string
  note?: string
}

const TIERS: PolicyTier[] = [
  { days: '7+ days before', refund: 'Full rental refund', note: 'minus platform fee' },
  { days: '3–6 days before', refund: '50% rental refund', note: 'deposit returned' },
  { days: '<3 days before', refund: 'No rental refund', note: 'deposit returned' },
  { days: 'No-show', refund: 'No rental refund', note: 'deposit forfeited' },
]

interface CancellationPolicyProps {
  highlightDays?: number
  className?: string
}

export function CancellationPolicy({ highlightDays, className }: CancellationPolicyProps) {
  const getHighlight = (tier: PolicyTier) => {
    if (highlightDays === undefined) return false
    if (tier.days === '7+ days before' && highlightDays >= 7) return true
    if (tier.days === '3–6 days before' && highlightDays >= 3 && highlightDays < 7) return true
    if (tier.days === '<3 days before' && highlightDays < 3) return true
    return false
  }

  return (
    <div className={cn('rounded-2xl border border-border overflow-hidden', className)}>
      <div className="px-5 py-3 bg-frost border-b border-border">
        <p className="text-sm font-sans font-medium text-ink">Cancellation Policy</p>
      </div>
      {TIERS.map((tier) => {
        const highlighted = getHighlight(tier)
        return (
          <div
            key={tier.days}
            className={cn(
              'flex items-start justify-between px-5 py-3 border-b border-border last:border-0 transition-colors',
              highlighted && 'bg-gold-pale',
            )}
          >
            <div>
              <p className={cn('text-sm font-sans', highlighted ? 'text-ink font-medium' : 'text-slate')}>
                {tier.days}
              </p>
              {tier.note && <p className="text-xs text-fog font-sans">{tier.note}</p>}
            </div>
            <span
              className={cn(
                'text-sm font-sans font-medium ml-4 shrink-0',
                highlighted ? 'text-gold' : 'text-slate',
              )}
            >
              {tier.refund}
            </span>
          </div>
        )
      })}
    </div>
  )
}
