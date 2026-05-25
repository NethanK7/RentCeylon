import { Shield } from 'lucide-react'

interface DepositProtectionProps {
  amount?: number
}

export function DepositProtection({ amount }: DepositProtectionProps) {
  return (
    <div
      className="rounded-2xl p-5 flex gap-4"
      style={{
        background: '#FDF7ED',
        border: '1px solid rgba(201,151,58,0.3)',
        borderLeft: '3px solid #C9973A',
      }}
    >
      <Shield size={20} strokeWidth={1.5} className="text-gold shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-sans font-medium text-ink mb-1">Deposit Protected</p>
        <p className="text-xs font-sans text-slate leading-relaxed">
          {amount ? (
            <>Your deposit of <span className="font-mono text-royal">LKR {amount.toLocaleString()}</span> is held securely and returned within 48hrs of confirmed return in good condition.</>
          ) : (
            'Your security deposit is held securely and returned within 48hrs of confirmed return in good condition.'
          )}
        </p>
      </div>
    </div>
  )
}
