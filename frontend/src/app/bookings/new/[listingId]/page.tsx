'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Calendar, FileText, CreditCard, CheckCircle, ChevronLeft, Shield } from 'lucide-react'
import Link from 'next/link'
import { FeeTierBreakdown } from '@/components/ui/FeeTierBreakdown'
import { DepositProtection } from '@/components/ui/DepositProtection'
import { CancellationPolicy } from '@/components/ui/CancellationPolicy'
import { formatLKR } from '@/lib/utils'

const STEPS = [
  { label: 'Dates', icon: Calendar },
  { label: 'Policy', icon: FileText },
  { label: 'Payment', icon: CreditCard },
  { label: 'Confirmed', icon: CheckCircle },
]

const LISTING = {
  id: '1',
  title: 'Sony A7III Mirrorless Camera',
  dailyRate: 3500,
  depositAmount: 15000,
  owner: 'Dinuka Perera',
  imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop',
}

function CalendarPicker({ startDate, endDate, onSelect }: { startDate: Date | null; endDate: Date | null; onSelect: (start: Date, end: Date) => void }) {
  const today = new Date()
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i - today.getDay() + 1)
    return d
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-ink text-xl" style={{ fontWeight: 400 }}>
          {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-sans text-fog py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString()
          const isPast = day < today
          const isStart = startDate && day.toDateString() === startDate.toDateString()
          const isEnd = endDate && day.toDateString() === endDate.toDateString()
          const isInRange = startDate && endDate && day > startDate && day < endDate

          return (
            <button
              key={i}
              disabled={isPast}
              onClick={() => {
                if (!startDate || (startDate && endDate)) {
                  onSelect(day, day)
                } else if (day > startDate) {
                  onSelect(startDate, day)
                }
              }}
              className="h-9 rounded-card text-sm font-sans transition-all"
              style={{
                background: isStart || isEnd ? '#1A3D8F' : isInRange ? '#EEF2FB' : 'transparent',
                color: isStart || isEnd ? '#FFFFFF' : isPast ? '#C4CEEA' : isToday ? '#1A3D8F' : '#0C1124',
                fontWeight: isToday ? 600 : 400,
                cursor: isPast ? 'not-allowed' : 'pointer',
              }}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CheckoutPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = React.use(params)
  const [step, setStep] = useState(0)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'PAYHERE' | 'IPAY' | 'STRIPE' | null>(null)
  const [bookingRef] = useState(`RL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)

  const totalDays = startDate && endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 1
  const rentalAmount = totalDays * LISTING.dailyRate

  const feePercent = rentalAmount <= 10000 ? 10 : rentalAmount <= 50000 ? 7 : 5
  const feeAmount = Math.round(rentalAmount * feePercent / 100)
  const total = rentalAmount + feeAmount + LISTING.depositAmount

  return (
    <div className="min-h-screen bg-snow pt-20 pb-20 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back link */}
        {step < 3 && (
          <Link href={`/listings/${listingId}`} className="flex items-center gap-2 text-sm font-sans text-fog hover:text-ink transition-colors mb-6">
            <ChevronLeft size={16} strokeWidth={1.5} />
            Back to listing
          </Link>
        )}

        {/* Stepper */}
        {step < 3 && (
          <div className="flex items-center mb-8">
            {STEPS.slice(0, 3).map((s, i) => {
              const done = i < step
              const active = i === step
              return (
                <div key={s.label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        background: done ? '#1A3D8F' : active ? 'linear-gradient(135deg, #C9973A, #E8BC6A)' : '#E4EAF4',
                        transform: active ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: active ? '0 4px 16px rgba(201,151,58,0.4)' : 'none',
                      }}
                    >
                      {done ? (
                        <Check size={14} strokeWidth={2.5} style={{ color: '#FFFFFF' }} />
                      ) : (
                        <s.icon size={14} strokeWidth={1.5} style={{ color: active ? '#0C1124' : '#8A97B5' }} />
                      )}
                    </div>
                    <span className="text-xs font-sans" style={{ color: active ? '#C9973A' : done ? '#3D4F73' : '#8A97B5', fontWeight: active ? 500 : 400 }}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="flex-1 h-px mx-2 mb-5 transition-colors" style={{ background: done ? '#1A3D8F' : '#E4EAF4' }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Listing summary */}
        {step < 3 && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-card border border-border mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LISTING.imageUrl} alt={LISTING.title} className="w-16 h-16 rounded-card object-cover shrink-0" />
            <div>
              <p className="font-sans font-medium text-ink text-sm">{LISTING.title}</p>
              <p className="font-sans text-fog text-xs mt-0.5">by {LISTING.owner}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-mono text-royal font-medium">{formatLKR(LISTING.dailyRate)}</p>
              <p className="text-xs font-sans text-fog">/day</p>
            </div>
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* Step 0: Dates */}
          {step === 0 && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-card border border-border p-6 space-y-6"
            >
              <CalendarPicker
                startDate={startDate}
                endDate={endDate}
                onSelect={(s, e) => { setStartDate(s); setEndDate(e) }}
              />

              {startDate && endDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex justify-between text-sm font-sans p-3 bg-frost rounded-card">
                    <span className="text-slate">Check-in</span>
                    <span className="text-ink font-medium">{startDate.toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans p-3 bg-frost rounded-card">
                    <span className="text-slate">Return</span>
                    <span className="text-ink font-medium">{endDate.toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans p-3 bg-royal-light rounded-card">
                    <span className="text-royal font-medium">{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                    <span className="font-mono text-royal font-medium">{formatLKR(rentalAmount)}</span>
                  </div>
                </motion.div>
              )}

              <FeeTierBreakdown rentalAmount={rentalAmount} depositAmount={LISTING.depositAmount} />

              <button
                disabled={!startDate || !endDate}
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-full font-sans font-medium text-sm transition-all"
                style={{
                  background: startDate && endDate ? 'linear-gradient(135deg, #1A3D8F, #122D6B)' : '#E4EAF4',
                  color: startDate && endDate ? '#FFFFFF' : '#8A97B5',
                }}
              >
                Continue to Policy
              </button>
            </motion.div>
          )}

          {/* Step 1: Policy */}
          {step === 1 && (
            <motion.div
              key="policy"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-card border border-border p-6 space-y-6"
            >
              <div>
                <h2 className="font-heading text-ink text-xl mb-2">Cancellation Policy</h2>
                <p className="font-sans text-fog text-sm mb-4">Review before continuing — you must scroll through this.</p>
                <CancellationPolicy />
              </div>

              <DepositProtection amount={LISTING.depositAmount} />

              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  className="w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all"
                  style={{ borderColor: policyAccepted ? '#C9973A' : '#C4CEEA', background: policyAccepted ? '#C9973A' : 'transparent' }}
                  onClick={() => setPolicyAccepted((v) => !v)}
                >
                  {policyAccepted && <Check size={11} strokeWidth={2.5} style={{ color: '#FFFFFF' }} />}
                </div>
                <span className="text-sm font-sans text-slate leading-relaxed">
                  I have read and agree to the cancellation policy. I understand that cancelling within 3 days of pickup will result in no refund.
                </span>
              </label>

              <button
                disabled={!policyAccepted}
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-full font-sans font-medium text-sm transition-all"
                style={{
                  background: policyAccepted ? 'linear-gradient(135deg, #1A3D8F, #122D6B)' : '#E4EAF4',
                  color: policyAccepted ? '#FFFFFF' : '#8A97B5',
                }}
              >
                Continue to Payment
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-card border border-border p-6 space-y-6"
            >
              <div>
                <h2 className="font-heading text-ink text-xl mb-4">Choose payment method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'PAYHERE', label: 'PayHere', sub: 'Cards, online banking, mobile payments', icon: '🇱🇰' },
                    { id: 'IPAY', label: 'iPay', sub: 'Dialog, Mobitel, Hutch mobile wallets', icon: '📱' },
                    { id: 'STRIPE', label: 'Card (International)', sub: 'Visa, Mastercard — Stripe secured', icon: '💳' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as 'PAYHERE' | 'IPAY' | 'STRIPE')}
                      className="w-full flex items-center gap-4 p-4 rounded-card border-2 text-left transition-all"
                      style={{
                        borderColor: paymentMethod === method.id ? '#1A3D8F' : '#DDE3F0',
                        background: paymentMethod === method.id ? '#EEF2FB' : '#FFFFFF',
                      }}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className="font-sans font-medium text-ink text-sm">{method.label}</p>
                        <p className="font-sans text-fog text-xs">{method.sub}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="w-5 h-5 rounded-full bg-royal flex items-center justify-center">
                          <Check size={10} strokeWidth={2.5} style={{ color: '#FFFFFF' }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-frost rounded-card space-y-2">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-slate">Rental ({totalDays} days)</span>
                  <span className="text-ink">{formatLKR(rentalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-slate">Platform fee ({feePercent}%)</span>
                  <span className="text-ink">{formatLKR(feeAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-slate">Refundable deposit</span>
                  <span className="text-ink">{formatLKR(LISTING.depositAmount)}</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between font-medium">
                  <span className="font-sans text-royal">Total due today</span>
                  <span className="font-mono text-royal">{formatLKR(total)}</span>
                </div>
              </div>

              {/* Rental agreement */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  className="w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all"
                  style={{ borderColor: agreementAccepted ? '#C9973A' : '#C4CEEA', background: agreementAccepted ? '#C9973A' : 'transparent' }}
                  onClick={() => setAgreementAccepted((v) => !v)}
                >
                  {agreementAccepted && <Check size={11} strokeWidth={2.5} style={{ color: '#FFFFFF' }} />}
                </div>
                <span className="text-sm font-sans text-slate leading-relaxed">
                  I agree to the <span className="text-royal cursor-pointer underline">Rental Agreement</span> and confirm I will return the item in the same condition.
                </span>
              </label>

              <button
                disabled={!paymentMethod || !agreementAccepted}
                onClick={() => setStep(3)}
                className="w-full py-4 rounded-full font-sans font-medium text-sm transition-all"
                style={{
                  background: paymentMethod && agreementAccepted ? 'linear-gradient(135deg, #C9973A, #E8BC6A)' : '#E4EAF4',
                  color: paymentMethod && agreementAccepted ? '#0C1124' : '#8A97B5',
                }}
              >
                Pay {formatLKR(total)}
              </button>
            </motion.div>
          )}

          {/* Step 3: Confirmed */}
          {step === 3 && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              {/* Gold circle checkmark animation */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <svg viewBox="0 0 96 96" className="w-full h-full">
                  <motion.circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke="#C9973A"
                    strokeWidth="2"
                    strokeDasharray="276"
                    initial={{ strokeDashoffset: 276 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />
                  <motion.path
                    d="M28 48l14 14 26-26"
                    fill="none"
                    stroke="#C9973A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="60"
                    initial={{ strokeDashoffset: 60 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.5, delay: 0.8, ease: 'easeInOut' }}
                  />
                </svg>
              </div>

              <h1 className="font-heading text-ink text-3xl mb-3">Booking Confirmed!</h1>
              <p className="font-sans text-fog mb-6">Your booking request has been sent to {LISTING.owner}</p>

              <div
                className="inline-flex items-center gap-3 px-6 py-3 rounded-card mb-8"
                style={{ background: '#EEF2FB', border: '1px solid #DDE3F0' }}
              >
                <span className="font-sans text-fog text-sm">Booking Reference</span>
                <span className="font-mono text-royal font-medium text-lg">{bookingRef}</span>
              </div>

              <div
                className="p-6 rounded-card text-left mb-8"
                style={{ background: '#0F2456' }}
              >
                <h3 className="font-heading text-white text-lg mb-4">What happens next</h3>
                <div className="space-y-3">
                  {[
                    `${LISTING.owner} has 24hrs to confirm your booking`,
                    'You\'ll receive a confirmation SMS and email',
                    'Both parties upload condition photos at pickup',
                    'Return the item and release your deposit within 48hrs',
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white/60 text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        {i + 1}
                      </span>
                      <p className="font-sans text-white/80 text-sm leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard/active/booking-1"
                  className="flex-1 py-3.5 rounded-full font-sans font-medium text-sm text-white text-center"
                  style={{ background: 'linear-gradient(135deg, #1A3D8F, #122D6B)' }}
                >
                  View Booking
                </Link>
                <Link
                  href="/browse"
                  className="flex-1 py-3.5 rounded-full font-sans font-medium text-sm text-royal text-center border border-border"
                >
                  Keep Browsing
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
