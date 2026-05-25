import { calculatePlatformFee, formatLKR } from '@/lib/utils'

interface FeeTierBreakdownProps {
  rentalAmount: number
  depositAmount: number
}

export function FeeTierBreakdown({ rentalAmount, depositAmount }: FeeTierBreakdownProps) {
  const { feePercent, feeAmount } = calculatePlatformFee(rentalAmount)
  const total = rentalAmount + feeAmount + depositAmount

  return (
    <div className="bg-royal-light rounded-2xl p-5 space-y-3">
      <h4 className="text-sm font-sans font-medium text-royal">Payment Breakdown</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-sans">
          <span className="text-slate">Rental amount</span>
          <span className="text-ink font-medium">{formatLKR(rentalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm font-sans">
          <span className="text-slate">Platform fee ({feePercent}%)</span>
          <span className="text-ink">{formatLKR(feeAmount)}</span>
        </div>
        <div className="flex justify-between text-sm font-sans">
          <span className="text-slate">Refundable deposit</span>
          <span className="text-ink">{formatLKR(depositAmount)}</span>
        </div>
        <div className="border-t border-royal/20 pt-2 flex justify-between text-sm font-sans font-medium">
          <span className="text-royal">Total charged today</span>
          <span className="text-royal font-mono">{formatLKR(total)}</span>
        </div>
      </div>
      <p className="text-xs text-fog font-sans">
        Deposit returned within 48hrs of confirmed return, subject to condition check.
      </p>
    </div>
  )
}
