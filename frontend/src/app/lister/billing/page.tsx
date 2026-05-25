'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  X,
  Download,
  ChevronDown,
  AlertTriangle,
  CreditCard,
  Zap,
  Shield,
  BarChart2,
  Headphones,
  Code,
  List,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanKey = 'basic' | 'standard' | 'premium'
type CancelStep = 1 | 2 | 3

interface PaymentRecord {
  id: string
  date: string
  amount: number
  plan: string
  status: 'paid' | 'pending' | 'failed'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANS: {
  key: PlanKey
  name: string
  price: number
  listings: number
  featured: number
  analytics: boolean
  priority: boolean
  api: boolean
}[] = [
  {
    key: 'basic',
    name: 'Basic',
    price: 0,
    listings: 3,
    featured: 0,
    analytics: false,
    priority: false,
    api: false,
  },
  {
    key: 'standard',
    name: 'Standard',
    price: 2500,
    listings: 15,
    featured: 2,
    analytics: true,
    priority: false,
    api: false,
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 6000,
    listings: 999,
    featured: 10,
    analytics: true,
    priority: true,
    api: true,
  },
]

const CANCEL_REASONS = [
  'Too expensive for my needs',
  'Not getting enough bookings',
  'Switching to another platform',
  'Temporarily pausing my listings',
  'Technical issues or bugs',
  'Missing features I need',
  'Other',
]

const PAYMENT_HISTORY: PaymentRecord[] = [
  { id: 'inv001', date: 'May 1, 2026', amount: 2500, plan: 'Standard', status: 'paid' },
  { id: 'inv002', date: 'Apr 1, 2026', amount: 2500, plan: 'Standard', status: 'paid' },
  { id: 'inv003', date: 'Mar 1, 2026', amount: 2500, plan: 'Standard', status: 'paid' },
  { id: 'inv004', date: 'Feb 1, 2026', amount: 0, plan: 'Basic', status: 'paid' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return `Rs. ${n.toLocaleString('en-LK')}`
}

function Cell({ yes }: { yes: boolean }) {
  return yes ? (
    <div className="flex justify-center">
      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
        <Check size={12} className="text-emerald-600" strokeWidth={2.5} />
      </div>
    </div>
  ) : (
    <div className="flex justify-center">
      <div className="w-5 h-5 rounded-full bg-[#F0F3F9] flex items-center justify-center">
        <X size={10} className="text-[#8A97B5]" strokeWidth={2.5} />
      </div>
    </div>
  )
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({
  currentPlan,
  renewalDate,
  onClose,
}: {
  currentPlan: PlanKey
  renewalDate: string
  onClose: () => void
}) {
  const [step, setStep] = useState<CancelStep>(1)
  const [reason, setReason] = useState('')

  const stepVariants = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && step !== 3 && onClose()}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0C1124]/50 backdrop-blur-sm"
        onClick={() => step !== 3 && onClose()}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#C9973A]' : 'bg-[#DDE3F0]'
              }`}
            />
          ))}
        </div>

        <div className="px-6 pb-6 pt-5 min-h-[280px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* Step 1: Confirmation */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                <div className="w-12 h-12 rounded-card bg-red-50 flex items-center justify-center mb-4">
                  <AlertTriangle size={22} className="text-red-500" />
                </div>
                <h3 className="font-heading text-2xl text-[#0C1124] mb-2">Cancel subscription?</h3>
                <p className="text-sm font-sans text-[#8A97B5] leading-relaxed mb-6">
                  You are on the{' '}
                  <strong className="text-[#0C1124]">
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                  </strong>{' '}
                  plan. Cancelling will downgrade you to Basic at the end of your billing period on{' '}
                  <strong className="text-[#0C1124]">{renewalDate}</strong>.
                </p>
                <p className="text-xs font-sans text-[#8A97B5] bg-[#FDF7ED] border border-[#C9973A]/20 rounded-card px-4 py-3 mb-6">
                  Your listings and bookings remain accessible until the billing period ends.
                </p>
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-[#DDE3F0] text-[#3D4F73] text-sm font-sans font-medium rounded-card hover:bg-[#F0F3F9] transition-colors"
                  >
                    Keep subscription
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-2.5 bg-red-500 text-white text-sm font-sans font-medium rounded-card hover:bg-red-600 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Reason */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col"
              >
                <h3 className="font-heading text-2xl text-[#0C1124] mb-1">Why are you leaving?</h3>
                <p className="text-sm font-sans text-[#8A97B5] mb-5">
                  Your feedback helps us improve RentCeylon.
                </p>

                <div className="relative mb-6">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#DDE3F0] rounded-card px-4 py-3 text-sm font-sans text-[#0C1124] focus:outline-none focus:border-[#1A3D8F] focus:ring-1 focus:ring-[#1A3D8F] cursor-pointer"
                  >
                    <option value="">Select a reason…</option>
                    {CANCEL_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A97B5] pointer-events-none"
                  />
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-[#DDE3F0] text-[#3D4F73] text-sm font-sans font-medium rounded-card hover:bg-[#F0F3F9] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!reason}
                    className={`flex-1 py-2.5 text-sm font-sans font-medium rounded-card transition-colors ${
                      reason
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-[#F0F3F9] text-[#8A97B5] cursor-not-allowed'
                    }`}
                  >
                    Confirm cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
                  className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-5 mt-2"
                >
                  <Check size={24} className="text-emerald-600" strokeWidth={2.5} />
                </motion.div>
                <h3 className="font-heading text-2xl text-[#0C1124] mb-2">Subscription cancelled</h3>
                <p className="text-sm font-sans text-[#8A97B5] leading-relaxed mb-2">
                  Your subscription ends on
                </p>
                <p className="text-lg font-mono font-semibold text-[#0C1124] mb-5">{renewalDate}</p>
                <p className="text-xs font-sans text-[#8A97B5] mb-8">
                  You will be downgraded to the free Basic plan automatically. All your listings remain
                  accessible until then.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-[#1A3D8F] text-white text-sm font-sans font-medium rounded-card hover:bg-[#122D6B] transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [currentPlan] = useState<PlanKey>('standard')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  const renewalDate = 'June 1, 2026'
  const listingsUsed = 7
  const currentPlanData = PLANS.find((p) => p.key === currentPlan)!


  const tableFeatures: {
    label: string
    icon: React.ReactNode
    getValue: (p: (typeof PLANS)[number]) => React.ReactNode
  }[] = [
    {
      label: 'Active Listings',
      icon: <List size={14} />,
      getValue: (p) => (
        <span className="text-sm font-mono font-medium text-[#0C1124]">
          {p.listings === 999 ? 'Unlimited' : p.listings}
        </span>
      ),
    },
    {
      label: 'Featured Slots',
      icon: <Zap size={14} />,
      getValue: (p) => (
        <span className="text-sm font-mono font-medium text-[#0C1124]">{p.featured}</span>
      ),
    },
    {
      label: 'Analytics',
      icon: <BarChart2 size={14} />,
      getValue: (p) => <Cell yes={p.analytics} />,
    },
    {
      label: 'Priority Support',
      icon: <Headphones size={14} />,
      getValue: (p) => <Cell yes={p.priority} />,
    },
    {
      label: 'API Access',
      icon: <Code size={14} />,
      getValue: (p) => <Cell yes={p.api} />,
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-16">
      {/* Header */}
      <div ref={headerRef} className="bg-white border-b border-[#DDE3F0] px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-sans text-[#8A97B5] mb-1">Account</p>
          <h1 className="font-heading text-3xl text-[#0C1124]">Billing & Subscription</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 space-y-8">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-[#DDE3F0] rounded-card p-6 shadow-card"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-[#C9973A]" />
                <p className="text-xs font-sans text-[#8A97B5] uppercase tracking-widest">Current Plan</p>
              </div>
              <h2 className="font-heading text-2xl text-[#0C1124] mb-1">
                {currentPlanData.name}
              </h2>
              <p className="text-sm font-sans text-[#8A97B5]">
                Renews on <strong className="text-[#3D4F73]">{renewalDate}</strong>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-mono font-bold text-[#C9973A]">
                {currentPlanData.price === 0 ? 'Free' : formatCurrency(currentPlanData.price)}
              </p>
              {currentPlanData.price > 0 && (
                <p className="text-xs font-sans text-[#8A97B5]">/ month</p>
              )}
            </div>
          </div>

          {/* Listings usage */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-sans text-[#8A97B5]">Listings used</p>
              <p className="text-xs font-mono text-[#3D4F73]">
                {listingsUsed} / {currentPlanData.listings === 999 ? '∞' : currentPlanData.listings}
              </p>
            </div>
            <div className="h-2 bg-[#F0F3F9] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    currentPlanData.listings === 999
                      ? 46
                      : (listingsUsed / currentPlanData.listings) * 100
                  }%`,
                }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-[#1A3D8F] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Tier Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-[#DDE3F0] rounded-card shadow-card overflow-hidden"
        >
          <div className="p-6 border-b border-[#F0F3F9]">
            <h2 className="font-heading text-xl text-[#0C1124]">Choose your plan</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left px-6 py-4 w-40">
                    <span className="text-xs font-sans text-[#8A97B5] uppercase tracking-wider">Feature</span>
                  </th>
                  {PLANS.map((plan) => (
                    <th key={plan.key} className="px-4 py-4 text-center">
                      <div
                        className={`rounded-card py-3 px-2 ${
                          plan.key === 'standard'
                            ? 'bg-[#FDF7ED] border border-[#C9973A]/30'
                            : 'bg-[#F8F9FC]'
                        }`}
                      >
                        {plan.key === 'standard' && (
                          <p className="text-[9px] font-sans font-bold text-[#C9973A] uppercase tracking-widest mb-1">
                            Most Popular
                          </p>
                        )}
                        <p
                          className={`text-sm font-sans font-semibold mb-1 ${
                            plan.key === 'standard' ? 'text-[#C9973A]' : 'text-[#0C1124]'
                          }`}
                        >
                          {plan.name}
                        </p>
                        <p
                          className={`text-lg font-mono font-bold ${
                            plan.key === 'standard' ? 'text-[#C9973A]' : 'text-[#0C1124]'
                          }`}
                        >
                          {plan.price === 0 ? 'Free' : `Rs. ${(plan.price / 1000).toFixed(1)}k`}
                        </p>
                        {plan.price > 0 && (
                          <p className="text-[10px] font-sans text-[#8A97B5]">/month</p>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {tableFeatures.map((feature, i) => (
                  <tr key={feature.label} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FC]'}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 text-sm font-sans text-[#3D4F73]">
                        <span className="text-[#8A97B5]">{feature.icon}</span>
                        {feature.label}
                      </div>
                    </td>
                    {PLANS.map((plan) => (
                      <td key={plan.key} className="px-4 py-3.5 text-center">
                        {feature.getValue(plan)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* CTA Row */}
                <tr>
                  <td className="px-6 py-5" />
                  {PLANS.map((plan) => (
                    <td key={plan.key} className="px-4 py-5 text-center">
                      {plan.key === currentPlan ? (
                        <span className="inline-block px-4 py-2 text-xs font-sans font-medium text-[#8A97B5] bg-[#F0F3F9] rounded-card">
                          Current plan
                        </span>
                      ) : plan.price > (currentPlanData.price ?? 0) ? (
                        <button className="px-4 py-2 text-xs font-sans font-medium text-white bg-[#C9973A] rounded-card hover:bg-[#A67928] transition-colors">
                          Upgrade
                        </button>
                      ) : (
                        <button className="px-4 py-2 text-xs font-sans font-medium text-[#8A97B5] border border-[#DDE3F0] rounded-card hover:bg-[#F0F3F9] transition-colors">
                          Downgrade
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white border border-[#DDE3F0] rounded-card shadow-card overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-[#F0F3F9] flex items-center justify-between">
            <h2 className="font-heading text-xl text-[#0C1124]">Payment History</h2>
            <CreditCard size={18} className="text-[#8A97B5]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F3F9]">
                  <th className="text-left px-6 py-3 text-xs font-sans text-[#8A97B5] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-sans text-[#8A97B5] uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-sans text-[#8A97B5] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-sans text-[#8A97B5] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {PAYMENT_HISTORY.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className={`border-b border-[#F0F3F9] last:border-0 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FC]'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-sans text-[#3D4F73]">{record.date}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-sans text-[#3D4F73]">{record.plan}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-mono font-semibold text-[#0C1124]">
                        {record.amount === 0 ? '—' : formatCurrency(record.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-sans font-medium ${
                          record.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : record.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          // Mock invoice download
                          const a = document.createElement('a')
                          a.href = '#'
                          a.download = `invoice-${record.id}.pdf`
                          console.log('Download invoice:', record.id)
                        }}
                        className="flex items-center gap-1 text-xs font-sans text-[#1A3D8F] hover:underline ml-auto"
                      >
                        <Download size={12} />
                        Invoice
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Cancel Subscription */}
        {currentPlan !== 'basic' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between p-5 bg-white border border-[#DDE3F0] rounded-card"
          >
            <div>
              <p className="text-sm font-sans font-semibold text-[#0C1124]">Cancel subscription</p>
              <p className="text-xs font-sans text-[#8A97B5] mt-0.5">
                You will be downgraded to Basic at the end of your billing period.
              </p>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              className="shrink-0 px-4 py-2 border border-red-200 text-red-500 text-sm font-sans font-medium rounded-card hover:bg-red-50 transition-colors"
            >
              Cancel plan
            </button>
          </motion.div>
        )}
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <CancelModal
            currentPlan={currentPlan}
            renewalDate={renewalDate}
            onClose={() => setShowCancelModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
