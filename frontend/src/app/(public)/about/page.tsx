'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Wallet,
  Shield,
  Camera,
  CheckCircle,
  Clock,
  Scale,
  Timer,
  Star,
  Zap,
  BadgeCheck,
  TrendingUp,
  Crown,
  AlertTriangle,
} from 'lucide-react'
import { TextReveal } from '@/components/animations/TextReveal'
import { AnimatedText } from '@/components/animations/AnimatedText'
import { FadeIn } from '@/components/animations/FadeIn'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DepositStep {
  icon: React.ReactNode
  label: string
  description: string
}

interface SlaCard {
  icon: React.ReactNode
  number: string
  label: string
  detail: string
}

interface EarnedBadge {
  icon: React.ReactNode
  name: string
  description: string
}

interface PaidBadge {
  icon: React.ReactNode
  name: string
  description: string
}

interface TeamMember {
  name: string
  role: string
  initials: string
}

// ─── StatCounter: counts from 0 → 2.4, renders "Rs. 2.4B" ───────────────────
function StatCounter() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState('0.0')

  useEffect(() => {
    if (!isInView) return
    const target = 2.4
    const durationMs = 2500
    const startTime = performance.now()
    const step = (ts: number) => {
      const elapsed = (ts - startTime) / durationMs
      const progress = Math.min(elapsed, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay((eased * target).toFixed(1))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView])

  return (
    <div
      ref={ref}
      className="font-display font-light leading-none mb-3"
      style={{ color: '#1A3D8F', fontSize: 'clamp(3rem,8vw,5.5rem)' }}
    >
      Rs.&nbsp;{display}B
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEPOSIT_STEPS: DepositStep[] = [
  {
    icon: <Wallet size={28} strokeWidth={1.5} />,
    label: 'Renter pays deposit',
    description: 'Collected securely at booking confirmation via PayHere or iPay.',
  },
  {
    icon: <Shield size={28} strokeWidth={1.5} />,
    label: 'Held by RentLoop',
    description: 'Funds sit in a ring-fenced escrow account — neither party can touch them.',
  },
  {
    icon: <Camera size={28} strokeWidth={1.5} />,
    label: 'Return verified with photos',
    description: 'Both parties submit condition photos at pickup and return.',
  },
  {
    icon: <CheckCircle size={28} strokeWidth={1.5} />,
    label: 'Released within 48 hrs',
    description: 'Auto-released to renter on schedule, or to lister if damage is confirmed.',
  },
]

const SLA_CARDS: SlaCard[] = [
  {
    icon: <Clock size={24} strokeWidth={1.5} />,
    number: '24h',
    label: 'ID Verification',
    detail: 'Identity checks completed within 24 hours of submission — or we escalate automatically.',
  },
  {
    icon: <Scale size={24} strokeWidth={1.5} />,
    number: '72h',
    label: 'Dispute First Response',
    detail: 'A human reviews every dispute within 72 hours of it being raised.',
  },
  {
    icon: <Timer size={24} strokeWidth={1.5} />,
    number: '48h',
    label: 'Deposit Release',
    detail: 'Deposits are released within 48 hours of return confirmation — or auto-released by system.',
  },
]

const EARNED_BADGES: EarnedBadge[] = [
  {
    icon: <Star size={18} strokeWidth={1.5} />,
    name: 'Top Rated',
    description: 'Awarded for maintaining a 4.8★ rating across 10 or more verified reviews.',
  },
  {
    icon: <BadgeCheck size={18} strokeWidth={1.5} />,
    name: 'Verified Item',
    description: 'Item condition independently verified by RentLoop before listing goes live.',
  },
  {
    icon: <Zap size={18} strokeWidth={1.5} />,
    name: 'Fast Responder',
    description: 'Consistently replies to booking requests within 2 hours.',
  },
]

const PAID_BADGES: PaidBadge[] = [
  {
    icon: <TrendingUp size={18} strokeWidth={1.5} />,
    name: 'Featured',
    description: 'Paid weekly promotion that boosts listing placement in category search results.',
  },
  {
    icon: <Crown size={18} strokeWidth={1.5} />,
    name: 'Sponsored',
    description: 'Premium placement at the top of browse pages and category feeds.',
  },
]

const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Nethanka Palihakkara', role: 'Founder & CEO', initials: 'NP' },
  { name: 'Product Team', role: 'Design & Engineering', initials: 'PT' },
  { name: 'Operations', role: 'Trust & Safety', initials: 'OP' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function DepositStepCard({
  step,
  index,
  isLast,
}: {
  step: DepositStep
  index: number
  isLast: boolean
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <div className="flex flex-col items-center text-center gap-4 px-4">
        <div
          className="relative flex items-center justify-center w-16 h-16 rounded-card"
          style={{ background: 'linear-gradient(135deg, #1A3D8F15, #C9973A15)', border: '1px solid #DDE3F0' }}
        >
          <span
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center font-mono text-[10px] font-bold text-white"
            style={{ background: '#C9973A' }}
          >
            {index + 1}
          </span>
          <span style={{ color: '#1A3D8F' }}>{step.icon}</span>
        </div>
        <div>
          <p className="font-heading text-ink text-base mb-1">{step.label}</p>
          <p className="font-sans text-fog text-sm leading-relaxed">{step.description}</p>
        </div>
      </div>
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-gold/30" />
      )}
    </div>
  )
}

function SlaGuaranteeCard({ card }: { card: SlaCard }) {
  return (
    <div
      className="bg-white rounded-card p-8 flex flex-col gap-3"
      style={{ borderTop: '3px solid #C9973A', boxShadow: '0 2px 8px rgba(15,36,86,0.06)' }}
    >
      <span style={{ color: '#C9973A' }}>{card.icon}</span>
      <div className="font-display text-ink leading-none" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)' }}>
        {card.number}
      </div>
      <p className="font-heading text-ink text-lg">{card.label}</p>
      <p className="font-sans text-fog text-sm leading-relaxed">{card.detail}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {

  return (
    <main className="overflow-x-hidden">
      {/* ─── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 text-center"
        style={{ background: '#0A1628' }}
      >
        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Label pill */}
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-sans font-medium mb-8"
            style={{ background: 'rgba(201,151,58,0.15)', color: '#E8BC6A' }}
          >
            Our Promise
          </div>

          {/* Headline */}
          <h1
            className="font-display text-white font-light leading-none mb-4"
            style={{ fontSize: 'clamp(3rem,9vw,5rem)' }}
          >
            Built on Trust
          </h1>

          {/* Gold animated underline */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="h-[3px] w-48 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #C9973A, #E8BC6A)',
                transformOrigin: 'left',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Subtitle */}
          <p
            className="font-sans font-light leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(1rem,2.5vw,1.25rem)' }}
          >
            Sri Lanka's first peer-to-peer rental marketplace with institutional-grade protections.
          </p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <span className="font-sans text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Scroll
          </span>
          <motion.div
            className="w-px h-8 rounded-full"
            style={{ background: 'rgba(201,151,58,0.5)' }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ─── 2. MISSION ──────────────────────────────────────────────────────── */}
      <section className="py-section px-6" style={{ background: '#F8F7F5' }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div>
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-sans font-medium mb-6"
              style={{ background: '#EEF2FB', color: '#1A3D8F' }}
            >
              Why RentLoop exists
            </div>

            <TextReveal
              as="h2"
              className="font-display text-ink font-light leading-tight mb-6 [font-size:clamp(2rem,5vw,3.5rem)]"
            >
              A formal economy for informal rentals
            </TextReveal>

            <div className="space-y-4 font-sans text-slate leading-relaxed">
              <AnimatedText
                text="Sri Lanka has a vibrant but fragmented rental culture. From photography gear to luxury vehicles, billions of rupees change hands every year — largely through WhatsApp messages, verbal agreements, and handshake deposits."
                className="leading-relaxed"
              />
              <FadeIn y={16} delay={0.1}>
                <p>
                  When something goes wrong, neither party has recourse. RentLoop was built to change that:
                  to give every transaction a paper trail, every deposit an escrow, and every renter and
                  lister a fair process they can trust.
                </p>
              </FadeIn>
              <FadeIn y={16} delay={0.2}>
                <p>
                  We are not just a marketplace. We are the institutional infrastructure that the informal
                  rental economy has always needed.
                </p>
              </FadeIn>
            </div>
          </div>

          {/* Stat side */}
          <div className="flex flex-col items-center lg:items-end gap-4">
            <div
              className="rounded-card p-12 text-center w-full max-w-sm"
              style={{
                background: 'white',
                border: '1px solid #DDE3F0',
                boxShadow: '0 8px 32px rgba(15,36,86,0.06)',
              }}
            >
              <StatCounter />
              <p className="font-sans text-fog text-sm leading-relaxed">
                Estimated annual value of informal rentals in Sri Lanka — currently unprotected by any
                structured system.
              </p>
              <div
                className="mt-6 pt-6 font-sans text-xs tracking-widest uppercase"
                style={{ borderTop: '1px solid #DDE3F0', color: '#8A97B5' }}
              >
                Market Opportunity
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. DEPOSIT EXPLAINER ────────────────────────────────────────────── */}
      <section className="py-section px-6" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-sans font-medium mb-6"
              style={{ background: '#EEF2FB', color: '#1A3D8F' }}
            >
              How deposits work
            </div>
            <TextReveal
              as="h2"
              className="font-display text-ink font-light leading-tight [font-size:clamp(2rem,5vw,3.5rem)]"
            >
              Protected from payment to return
            </TextReveal>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-4 items-start">
            {DEPOSIT_STEPS.map((step, i) => (
              <DepositStepCard
                key={step.label}
                step={step}
                index={i}
                isLast={i === DEPOSIT_STEPS.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. SLA GUARANTEES ───────────────────────────────────────────────── */}
      <section className="py-section px-6" style={{ background: '#FDF6E3' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-sans font-medium mb-6"
              style={{ background: 'rgba(201,151,58,0.15)', color: '#A67928' }}
            >
              Service-Level Agreements
            </div>
            <TextReveal
              as="h2"
              className="font-display text-ink font-light leading-tight [font-size:clamp(2rem,5vw,3.5rem)]"
            >
              We hold ourselves accountable
            </TextReveal>
            <p className="font-sans text-slate mt-4 max-w-xl mx-auto leading-relaxed">
              These are not aspirational targets — they are written commitments backed by automated
              enforcement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SLA_CARDS.map((card) => (
              <SlaGuaranteeCard key={card.label} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. BADGE SYSTEM EXPLAINER ───────────────────────────────────────── */}
      <section className="py-section px-6" style={{ background: '#F0EEE9' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-sans font-medium mb-6"
              style={{ background: '#EEF2FB', color: '#1A3D8F' }}
            >
              Badge System
            </div>
            <TextReveal
              as="h2"
              className="font-display text-ink font-light leading-tight [font-size:clamp(2rem,5vw,3.5rem)]"
            >
              Not all badges are equal
            </TextReveal>
            <p className="font-sans text-slate mt-4 max-w-xl mx-auto leading-relaxed">
              We separate merit from money. Earned badges cannot be bought, and paid badges are never
              disguised as merit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earned Badges */}
            <div
              className="rounded-card p-8"
              style={{
                background: 'white',
                border: '1px solid #DDE3F0',
                boxShadow: '0 2px 8px rgba(15,36,86,0.06)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#0A7855' }}
                />
                <span
                  className="font-sans text-xs font-semibold tracking-widest uppercase"
                  style={{ color: '#0A7855' }}
                >
                  Earned through merit
                </span>
              </div>
              <h3 className="font-heading text-ink text-xl mb-6">Earned Badges</h3>

              <div className="space-y-5">
                {EARNED_BADGES.map((badge) => (
                  <div key={badge.name} className="flex items-start gap-4">
                    <div
                      className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-card flex items-center justify-center"
                      style={{ background: '#F0FDF8', color: '#0A7855' }}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-ink text-sm">{badge.name}</p>
                      <p className="font-sans text-fog text-sm leading-relaxed mt-0.5">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-8 p-4 rounded-card"
                style={{ background: '#F0FDF8', border: '1px solid #BBF7D0' }}
              >
                <p className="font-sans text-xs leading-relaxed" style={{ color: '#065F46' }}>
                  Earned badges are awarded automatically by our system based on verifiable activity data.
                  They cannot be purchased, requested, or transferred.
                </p>
              </div>
            </div>

            {/* Paid Badges */}
            <div
              className="rounded-card p-8"
              style={{
                background: 'white',
                border: '1px solid #DDE3F0',
                boxShadow: '0 2px 8px rgba(15,36,86,0.06)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#C9973A' }}
                />
                <span
                  className="font-sans text-xs font-semibold tracking-widest uppercase"
                  style={{ color: '#A67928' }}
                >
                  Paid promotion
                </span>
              </div>
              <h3 className="font-heading text-ink text-xl mb-6">Promoted Badges</h3>

              <div className="space-y-5">
                {PAID_BADGES.map((badge) => (
                  <div key={badge.name} className="flex items-start gap-4">
                    <div
                      className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-card flex items-center justify-center"
                      style={{ background: '#FDF7ED', color: '#C9973A' }}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-ink text-sm">{badge.name}</p>
                      <p className="font-sans text-fog text-sm leading-relaxed mt-0.5">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-8 p-4 rounded-card"
                style={{ background: '#FDF7ED', border: '1px solid #F9D98A' }}
              >
                <p className="font-sans text-xs leading-relaxed" style={{ color: '#92400E' }}>
                  Promoted badges are clearly labelled as paid on all listing cards and search results.
                  They improve visibility only — they do not imply quality endorsement by RentLoop.
                </p>
              </div>
            </div>
          </div>

          {/* Visual separator note */}
          <div
            className="mt-6 flex items-center justify-center gap-3 py-4 px-6 rounded-card"
            style={{ background: 'white', border: '1px solid #DDE3F0' }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: '#0A7855' }} />
            <span className="font-sans text-fog text-sm">Green = earned</span>
            <div className="w-px h-4" style={{ background: '#DDE3F0' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#C9973A' }} />
            <span className="font-sans text-fog text-sm">Gold = paid</span>
            <div className="w-px h-4" style={{ background: '#DDE3F0' }} />
            <span className="font-sans text-fog text-sm">Always labelled. Always transparent.</span>
          </div>
        </div>
      </section>

      {/* ─── 6. OFF-PLATFORM WARNING ─────────────────────────────────────────── */}
      <section className="py-section px-6" style={{ background: '#0C1124' }}>
        <div className="max-w-[800px] mx-auto text-center">
          <TextReveal
            as="h2"
            className="font-display text-white font-light leading-tight mb-10 [font-size:clamp(2rem,5vw,3.5rem)]"
          >
            Stay on platform. Stay protected.
          </TextReveal>

          {/* Warning card */}
          <div
            className="rounded-card p-8 text-left"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderLeft: '4px solid #F59E0B',
              border: '1px solid rgba(245,158,11,0.25)',
              borderLeftWidth: '4px',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="mt-1 flex-shrink-0 w-10 h-10 rounded-card flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
              >
                <AlertTriangle size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-sans font-semibold text-white mb-2">Off-Platform Payments</p>
                <p className="font-sans leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  All transactions must go through RentLoop. Off-platform payments are not protected
                  by our deposit system.
                </p>
                <p className="font-sans text-sm mt-3" style={{ color: 'rgba(245,158,11,0.8)' }}>
                  This is the same policy you agreed to in our Terms of Service at signup. If anyone
                  asks you to pay or collect outside the platform, report it immediately.
                </p>
              </div>
            </div>
          </div>

          <p className="font-sans text-sm mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Off-platform requests can be reported via Settings → Report a Safety Issue.
          </p>
        </div>
      </section>

      {/* ─── 7. TEAM / SRI LANKA ─────────────────────────────────────────────── */}
      <section className="py-section px-6" style={{ background: '#0A1628' }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-sans font-medium mb-6"
            style={{ background: 'rgba(201,151,58,0.15)', color: '#E8BC6A' }}
          >
            The team
          </div>

          <TextReveal
            as="h2"
            className="font-display text-white font-light leading-tight mb-12 [font-size:clamp(2rem,5vw,3.5rem)]"
          >
            People behind the platform
          </TextReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {TEAM_MEMBERS.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                className="rounded-card p-8 flex flex-col items-center gap-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Avatar placeholder */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-heading text-xl"
                  style={{
                    background: 'linear-gradient(135deg, #1A3D8F, #0A1628)',
                    border: '2px solid rgba(201,151,58,0.4)',
                    color: '#E8BC6A',
                  }}
                >
                  {member.initials}
                </div>
                <div>
                  <p className="font-heading text-white text-base">{member.name}</p>
                  <p className="font-sans text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Made in Sri Lanka footer */}
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-sans text-sm"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            Made in Sri Lanka 🇱🇰
          </div>
        </div>
      </section>
    </main>
  )
}
