'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Copy,
  Check,
  Gift,
  Share2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReferralStatus = 'Signed Up' | 'First Booking' | 'Reward Paid'

interface Referral {
  id: string
  name: string
  date: string
  status: ReferralStatus
  amount: number | null
}

interface FaqItem {
  q: string
  a: string
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const REFERRAL_CODE = 'LOOP-NETHAN'
const REFERRAL_LINK = 'https://rentloop.lk/ref/LOOP-NETHAN'

const MOCK_REFERRALS: Referral[] = [
  { id: 'r1', name: 'Kasun Fernando', date: '12 May 2026', status: 'Reward Paid', amount: 500 },
  { id: 'r2', name: 'Nithya Perera', date: '5 May 2026', status: 'Reward Paid', amount: 500 },
  { id: 'r3', name: 'Dinuka Wijesuriya', date: '28 Apr 2026', status: 'First Booking', amount: null },
  { id: 'r4', name: 'Amaya Siriwardena', date: '20 Apr 2026', status: 'Reward Paid', amount: 500 },
  { id: 'r5', name: 'Chamari Bandara', date: '14 Apr 2026', status: 'Reward Paid', amount: 500 },
  { id: 'r6', name: 'Roshan De Silva', date: '8 Apr 2026', status: 'First Booking', amount: null },
  { id: 'r7', name: 'Malith Rajapaksa', date: '2 Apr 2026', status: 'Reward Paid', amount: 500 },
  { id: 'r8', name: 'Thilini Jayawardena', date: '25 Mar 2026', status: 'Reward Paid', amount: 500 },
  { id: 'r9', name: 'Supun Bandara', date: '18 Mar 2026', status: 'Signed Up', amount: null },
  { id: 'r10', name: 'Lakmal Silva', date: '10 Mar 2026', status: 'Reward Paid', amount: 500 },
  { id: 'r11', name: 'Priya Subramaniam', date: '4 Mar 2026', status: 'Signed Up', amount: null },
  { id: 'r12', name: 'Ashan Karunaratne', date: '26 Feb 2026', status: 'Reward Paid', amount: 500 },
]

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'How do I earn my Rs. 500?',
    a: 'Share your referral code or link. When someone signs up using your code and completes their first rental booking, both you and your friend receive Rs. 500 in RentLoop wallet credit.',
  },
  {
    q: 'Is there a limit on how many people I can refer?',
    a: 'No limit! You can refer as many friends as you like. Each successful referral earns you Rs. 500, with no cap on total earnings.',
  },
  {
    q: 'When do I receive my reward?',
    a: 'Your Rs. 500 credit is added to your wallet within 24 hours after your referred friend completes their first booking. You\'ll receive a notification when it\'s credited.',
  },
  {
    q: 'Can I use my referral credit on any rental?',
    a: 'Yes, your credit can be applied to any rental booking on RentLoop. Credits never expire and can be combined with other promotions.',
  },
  {
    q: 'What happens if my friend cancels their first booking?',
    a: 'The reward is only triggered upon a completed booking (rental period ended without dispute). Cancelled bookings do not count toward referral rewards.',
  },
]

const TIMELINE_STEPS = [
  { id: 'referred', label: 'Referred', desc: 'Friend clicks your link' },
  { id: 'signup', label: 'Signed Up', desc: 'Account created' },
  { id: 'booking', label: 'First Booking', desc: 'Rental completed' },
  { id: 'reward', label: 'Reward Paid', desc: 'Rs. 500 credited to each' },
]

const STATUS_CHIP: Record<
  ReferralStatus,
  { className: string }
> = {
  'Signed Up': { className: 'bg-fog/10 text-fog border border-fog/30' },
  'First Booking': { className: 'bg-royal/10 text-royal border border-royal/30' },
  'Reward Paid': { className: 'bg-success/10 text-success border border-success/30' },
}

// ---------------------------------------------------------------------------
// Confetti — pure CSS/JS, no external library
// ---------------------------------------------------------------------------

const CONFETTI_COLORS = ['#C9973A', '#E8BC6A', '#1A3D8F', '#0A7855', '#B91C1C', '#4A7FD4']

interface ConfettiParticle {
  id: number
  color: string
  x: number    // px offset from center of button
  y: number
  rotate: number
  size: number
  duration: number
  shape: 'circle' | 'rect'
}

function spawnConfetti(): ConfettiParticle[] {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const distance = 40 + Math.random() * 50
    return {
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 10,
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 5,
      duration: 0.7 + Math.random() * 0.4,
      shape: i % 2 === 0 ? 'circle' : 'rect',
    }
  })
}

// ---------------------------------------------------------------------------
// CountUp — intersection-observer driven
// ---------------------------------------------------------------------------

function CountUp({
  to,
  prefix = '',
  suffix = '',
  duration = 1400,
}: {
  to: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased =
              progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress
            setValue(Math.round(eased * to))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [to, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString('en-LK')}
      {suffix}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Timeline connector line (GSAP scaleX on scroll)
// ---------------------------------------------------------------------------

function ConversionTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative max-w-3xl mx-auto px-4">
      {/* Connector line */}
      <div className="absolute left-0 right-0 top-[22px] px-[calc(100%/8)] hidden sm:block pointer-events-none">
        <div className="relative h-0.5 bg-border overflow-hidden rounded-full">
          <div
            ref={lineRef}
            className="absolute inset-0 bg-gradient-to-r from-gold via-royal to-success rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 relative">
        {TIMELINE_STEPS.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            {/* Node */}
            <div
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center mb-3 z-10 bg-white ${
                i === 3
                  ? 'border-gold bg-gold-pale'
                  : i === 0
                  ? 'border-fog bg-frost'
                  : 'border-royal bg-royal-light'
              }`}
            >
              <span className="font-mono text-xs font-semibold text-ink">
                0{i + 1}
              </span>
            </div>
            <p className="font-sans text-ink text-sm font-semibold leading-tight">
              {step.label}
            </p>
            <p className="font-sans text-fog text-xs mt-1 leading-snug">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FAQ Accordion
// ---------------------------------------------------------------------------

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="border border-border rounded-card overflow-hidden bg-white"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-frost transition-colors"
          >
            <span className="font-sans text-ink text-sm font-medium pr-4">
              {item.q}
            </span>
            <motion.span
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 text-fog"
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-4 font-sans text-fog text-sm leading-relaxed border-t border-border pt-3">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stats Row
// ---------------------------------------------------------------------------

function StatsRow() {
  const stats = [
    { label: 'Total Referrals', value: 12, prefix: '' },
    { label: 'Successful', value: 8, prefix: '' },
    { label: 'Earnings Earned', value: 4000, prefix: 'Rs. ' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-6">
      {stats.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-card border border-border shadow-card px-5 py-6 text-center"
        >
          <p className="font-mono text-ink text-3xl font-semibold leading-none">
            <CountUp to={s.value} prefix={s.prefix} />
          </p>
          <p className="font-sans text-fog text-xs mt-2">{s.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Referral table
// ---------------------------------------------------------------------------

function ReferralsTable() {
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full text-sm font-sans min-w-[480px]">
        <thead>
          <tr className="border-b border-border bg-frost">
            {['Name', 'Date', 'Status', 'Amount'].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-fog font-medium text-xs uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_REFERRALS.map((ref, i) => (
            <motion.tr
              key={ref.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="border-b border-border last:border-0 hover:bg-snow transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-frost flex items-center justify-center font-heading text-slate text-xs flex-shrink-0">
                    {ref.name[0]}
                  </div>
                  <span className="font-sans text-ink font-medium">
                    {ref.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-fog">{ref.date}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wide border ${STATUS_CHIP[ref.status].className}`}
                >
                  {ref.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-ink">
                {ref.amount !== null ? (
                  <span className="text-success font-semibold">
                    +Rs. {ref.amount.toLocaleString('en-LK')}
                  </span>
                ) : (
                  <span className="text-fog text-xs">—</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<
    ConfettiParticle[]
  >([])
  const copyBtnRef = useRef<HTMLButtonElement>(null)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(REFERRAL_CODE).catch(() => {
      // fallback for restricted environments
      const ta = document.createElement('textarea')
      ta.value = REFERRAL_CODE
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })

    setCopied(true)
    setConfettiParticles(spawnConfetti())
    toast.success('Copied! Share your code', {
      description: `${REFERRAL_CODE} is on your clipboard.`,
    })

    setTimeout(() => {
      setCopied(false)
      setConfettiParticles([])
    }, 1200)
  }, [])

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Use my RentLoop referral code *${REFERRAL_CODE}* and we both get Rs. 500! Sign up here: ${REFERRAL_LINK}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(REFERRAL_LINK)}`,
      '_blank'
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ------------------------------------------------------------------ */}
      {/* Hero */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 text-center">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(253,246,227,0.8) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-medium mb-8 bg-gold-pale text-gold border border-gold/20"
          >
            <Gift size={12} />
            Referral Program
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="font-display text-ink text-4xl sm:text-5xl lg:text-6xl mb-5 leading-tight"
            style={{ fontWeight: 300 }}
          >
            Give{' '}
            <span className="text-gold italic">Rs. 500,</span>
            <br />
            Get{' '}
            <span className="text-royal italic">Rs. 500</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.5 }}
            className="font-sans text-slate text-lg mb-10 leading-relaxed max-w-lg mx-auto"
          >
            Share your code with friends. When they complete their first rental
            booking, you both receive Rs. 500 wallet credit — instantly.
          </motion.p>

          {/* Referral code card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative max-w-md mx-auto"
          >
            <div className="bg-white border-2 border-gold/40 rounded-card shadow-gold/10 shadow-lg px-6 py-6">
              <p className="font-sans text-fog text-xs uppercase tracking-widest mb-2">
                Your referral code
              </p>
              <p className="font-mono text-ink text-3xl font-semibold tracking-wider mb-4">
                {REFERRAL_CODE}
              </p>

              {/* Copy button with confetti origin */}
              <div className="relative inline-block">
                <motion.button
                  ref={copyBtnRef}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-6 py-3 rounded-card font-sans font-medium text-sm transition-all ${
                    copied
                      ? 'bg-success text-white'
                      : 'bg-gold text-ink hover:bg-gold-dark'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={15} strokeWidth={2.5} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={15} strokeWidth={1.5} />
                      Copy Code
                    </>
                  )}
                </motion.button>

                {/* Confetti particles — positioned relative to button */}
                <AnimatePresence>
                  {confettiParticles.map((p) => (
                    <motion.div
                      key={p.id}
                      className="absolute top-1/2 left-1/2 pointer-events-none"
                      style={{
                        width: p.size,
                        height: p.shape === 'rect' ? p.size * 0.5 : p.size,
                        borderRadius: p.shape === 'circle' ? '50%' : '2px',
                        backgroundColor: p.color,
                        zIndex: 20,
                      }}
                      initial={{
                        x: '-50%',
                        y: '-50%',
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }}
                      animate={{
                        x: `calc(-50% + ${p.x}px)`,
                        y: `calc(-50% + ${p.y}px)`,
                        opacity: 0,
                        scale: 0,
                        rotate: p.rotate,
                      }}
                      transition={{
                        duration: p.duration,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Share buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4 }}
            className="flex items-center justify-center gap-3 mt-5 flex-wrap"
          >
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 rounded-card text-sm font-sans font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <Share2 size={14} />
              WhatsApp
            </button>
            <button
              onClick={shareFacebook}
              className="flex items-center gap-2 px-4 py-2.5 rounded-card text-sm font-sans font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1877F2' }}
            >
              <ExternalLink size={14} />
              Facebook
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(REFERRAL_LINK)
                toast.success('Link copied!')
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-card text-sm font-sans font-medium text-ink bg-frost border border-border hover:bg-mist transition-colors"
            >
              <Copy size={14} />
              Copy Link
            </button>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Stats row */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-14 px-6 bg-snow">
        <div className="max-w-2xl mx-auto">
          <StatsRow />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Conversion timeline */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-heading text-ink text-2xl text-center mb-10"
          >
            How the reward flows
          </motion.h2>
          <ConversionTimeline />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Recent referrals table */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-14 px-6 bg-snow">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="font-heading text-ink text-2xl">
              Recent Referrals
            </h2>
            <span className="font-mono text-fog text-xs">
              {MOCK_REFERRALS.length} total
            </span>
          </motion.div>
          <ReferralsTable />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Terms accordion */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-heading text-ink text-2xl mb-6"
          >
            Frequently Asked Questions
          </motion.h2>
          <FaqAccordion />

          <p className="font-sans text-fog text-xs mt-6 leading-relaxed">
            RentLoop reserves the right to modify or discontinue the referral program at any time. Rewards are subject to RentLoop's{' '}
            <span className="text-royal underline cursor-pointer">
              Terms of Service
            </span>
            . Abuse or gaming of the referral system will result in forfeiture of rewards and account suspension.
          </p>
        </div>
      </section>
    </div>
  )
}
