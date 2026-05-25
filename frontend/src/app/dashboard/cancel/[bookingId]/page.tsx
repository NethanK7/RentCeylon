'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ArrowLeft, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react'
import { CancellationPolicy } from '@/components/ui/CancellationPolicy'
import { formatLKR } from '@/lib/utils'

// ─── Mock booking data ────────────────────────────────────────────────────────
const MOCK_BOOKING = {
  id: 'bk_001',
  title: 'Canon EOS R6 Mark II + 24-105mm Kit',
  startDate: new Date('2026-06-05'),
  endDate: new Date('2026-06-10'),
  totalPaid: 18500,
  deposit: 25000,
}

function computeRefundTier(daysUntilBooking: number): { label: string; refundPercent: number } {
  if (daysUntilBooking >= 7) return { label: '7+ days — Full refund', refundPercent: 100 }
  if (daysUntilBooking >= 3) return { label: '3–6 days — 50% refund', refundPercent: 50 }
  return { label: '<3 days — No refund', refundPercent: 0 }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CancelBookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const booking = MOCK_BOOKING

  const today = new Date()
  const daysUntil = Math.max(0, Math.ceil((booking.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  const { refundPercent } = computeRefundTier(daysUntil)
  const refundAmount = Math.round((booking.totalPaid * refundPercent) / 100)

  // 3-click confirmation state
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false)
  const [cancelInput, setCancelInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const cancelMatches = cancelInput.trim().toUpperCase() === 'CANCEL'

  const handleProceedToStep2 = () => {
    if (policyAcknowledged) setStep(2)
  }

  const handleProceedToStep3 = () => {
    if (cancelMatches) setStep(3)
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-snow pb-24">
      {/* ── Warning hero strip ── */}
      <div
        className="relative px-6 py-8"
        style={{ background: 'linear-gradient(135deg, #C9973A 0%, #8B5E1A 100%)' }}
      >
        <div className="max-w-xl mx-auto">
          <Link
            href={`/dashboard/active/${bookingId}`}
            className="inline-flex items-center gap-2 text-sm font-sans text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            Back to rental
          </Link>

          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <AlertTriangle size={18} strokeWidth={1.5} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-white leading-tight">Cancel Booking</h1>
              <p className="text-sm font-sans text-white/70 mt-1">
                Please read the cancellation policy carefully.
              </p>
            </div>
          </div>

          {/* Booking summary */}
          <div
            className="mt-6 rounded-card px-5 py-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <p className="font-sans text-sm font-medium text-white line-clamp-2">{booking.title}</p>
            <div className="flex items-center gap-2 text-white/80">
              <Calendar size={13} strokeWidth={1.5} />
              <span className="text-xs font-sans">
                {booking.startDate.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' → '}
                {booking.endDate.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/20 pt-3">
              <span className="text-xs font-sans text-white/70">Total Paid</span>
              <span className="font-mono text-base text-white">{formatLKR(booking.totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8 space-y-8">

        {/* ── Cancellation Policy ── */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-ink">Cancellation Policy</h2>
          <CancellationPolicy highlightDays={daysUntil} />
          <p className="text-xs font-sans text-fog">
            Your booking starts in <span className="font-medium text-ink">{daysUntil} day{daysUntil !== 1 ? 's' : ''}</span> — the highlighted tier applies.
          </p>
        </section>

        {/* ── Refund Calculation ── */}
        <section className="space-y-3">
          <h2 className="font-heading text-xl text-ink">Refund Estimate</h2>
          <div className="bg-white border border-frost rounded-card overflow-hidden">
            <div className="divide-y divide-frost">
              <div className="flex justify-between items-center px-5 py-4">
                <span className="text-sm font-sans text-slate">Rental paid</span>
                <span className="font-mono text-sm text-ink">{formatLKR(booking.totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center px-5 py-4">
                <span className="text-sm font-sans text-slate">Refund rate</span>
                <span
                  className="text-sm font-sans font-medium"
                  style={{ color: refundPercent === 100 ? '#0A7855' : refundPercent === 50 ? '#C9973A' : '#9B1C1C' }}
                >
                  {refundPercent}%
                </span>
              </div>
              <div className="flex justify-between items-center px-5 py-4">
                <span className="text-sm font-sans text-slate">Deposit</span>
                <span
                  className="text-sm font-sans font-medium"
                  style={{ color: '#0A7855' }}
                >
                  {formatLKR(booking.deposit)} returned
                </span>
              </div>
              <div
                className="flex justify-between items-center px-5 py-4"
                style={{ background: '#FDF6E3' }}
              >
                <span className="text-sm font-sans font-medium text-ink">You receive back</span>
                <span className="font-mono text-lg font-medium" style={{ color: '#C9973A' }}>
                  {formatLKR(refundAmount + booking.deposit)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-step confirmation or success state ── */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-card overflow-hidden"
              style={{ background: 'rgba(10,120,85,0.06)', border: '1.5px solid rgba(10,120,85,0.25)' }}
            >
              <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
                >
                  <CheckCircle2 size={52} strokeWidth={1.5} style={{ color: '#0A7855' }} />
                </motion.div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-1">Cancellation Confirmed</h3>
                  <p className="text-sm font-sans text-slate leading-relaxed">
                    Your booking has been cancelled. Refunds are typically processed within{' '}
                    <span className="font-medium text-ink">3–5 business days</span>.
                  </p>
                </div>
                <div className="w-full rounded-card border border-frost bg-white px-5 py-4 space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-slate">Rental refund</span>
                    <span className="font-mono font-medium text-ink">{formatLKR(refundAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-slate">Deposit return</span>
                    <span className="font-mono font-medium text-ink">{formatLKR(booking.deposit)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans border-t border-frost pt-2">
                    <span className="font-medium text-ink">Total</span>
                    <span className="font-mono font-medium" style={{ color: '#0A7855' }}>
                      {formatLKR(refundAmount + booking.deposit)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-sans font-medium text-royal hover:underline mt-2"
                >
                  Back to Dashboard <ChevronRight size={14} strokeWidth={2} />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.section
              key="confirm-flow"
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-heading text-xl text-ink">Confirm Cancellation</h2>

              {/* Step 1: Checkbox */}
              <div
                className="bg-white border border-frost rounded-card px-5 py-4"
                style={{ opacity: step >= 1 ? 1 : 0.5 }}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={policyAcknowledged}
                      onChange={(e) => {
                        setPolicyAcknowledged(e.target.checked)
                        if (e.target.checked && step === 1) setStep(2)
                        else if (!e.target.checked) setStep(1)
                      }}
                      className="sr-only peer"
                    />
                    <div
                      className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
                      style={{
                        borderColor: policyAcknowledged ? '#C9973A' : '#D1CFC9',
                        background: policyAcknowledged ? '#C9973A' : 'transparent',
                      }}
                    >
                      {policyAcknowledged && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6 L5 9 L10 3"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-sans text-ink leading-relaxed">
                    I understand the refund policy and accept that this cancellation is final.
                  </p>
                </label>
              </div>

              {/* Step 2: Type CANCEL */}
              <AnimatePresence>
                {step >= 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white border border-frost rounded-card px-5 py-4 space-y-3"
                  >
                    <p className="text-sm font-sans font-medium text-ink">
                      Type <span className="font-mono text-red-700">CANCEL</span> to confirm
                    </p>
                    <input
                      type="text"
                      value={cancelInput}
                      onChange={(e) => setCancelInput(e.target.value)}
                      placeholder="Type CANCEL here..."
                      className="w-full rounded-card border px-4 py-3 text-sm font-mono text-ink placeholder:text-fog focus:outline-none transition-colors"
                      style={{
                        borderColor: cancelMatches ? '#C9973A' : '#E8E6E1',
                        background: cancelMatches ? '#FDF6E3' : '#fff',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: Submit button */}
              <AnimatePresence>
                {step >= 2 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-3"
                  >
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!cancelMatches}
                      animate={{
                        background: cancelMatches ? '#C9973A' : '#1A3D8F',
                        opacity: cancelMatches ? 1 : 0.6,
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-full py-4 rounded-card font-sans font-medium text-white text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Confirm Cancellation
                      <ChevronRight size={16} strokeWidth={2} />
                    </motion.button>

                    <Link
                      href={`/dashboard/active/${bookingId}`}
                      className="flex items-center justify-center gap-1 text-sm font-sans text-slate hover:text-ink transition-colors"
                    >
                      <ArrowLeft size={14} strokeWidth={1.5} />
                      Never mind, keep my booking
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
