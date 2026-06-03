'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, CheckCircle, Shield, FileText, Clock, Star, MapPin, Users, TrendingUp } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// ─── Mock Data ──────────────────────────────────────────────────────────────

const OWNER_FEATURES = [
  { icon: Users, label: 'Verified Renters', desc: 'Every tenant is ID-verified and credit-checked before placement.' },
  { icon: Shield, label: 'Deposit Protection', desc: 'Escrow-backed deposits with instant dispute resolution.' },
  { icon: FileText, label: 'Monthly Statements', desc: 'Detailed income and expense reports delivered on the 1st.' },
  { icon: Clock, label: '24/7 Support', desc: 'Round-the-clock assistance for owners and tenants alike.' },
]

const STATS = [
  { value: 200, prefix: '', suffix: '+', label: 'Properties Managed' },
  { value: 98, prefix: '', suffix: '%', label: 'Occupancy Rate' },
  { value: 15, prefix: 'Rs. ', suffix: 'M+', label: 'Collected Monthly' },
  { value: 4.9, prefix: '', suffix: '★', label: 'Average Rating' },
]

const TESTIMONIALS = [
  {
    quote: "RentCeylon handles everything — tenants, payments, repairs. I just check my bank statement each month.",
    author: 'Priya Jayawardena',
    role: 'Owner of 3 properties, Colombo 7',
    rating: 5,
  },
  {
    quote: "The occupancy rate shot up from 72% to 97% in six months. The team knows the Colombo market inside out.",
    author: 'Rohan de Silva',
    role: 'Owner of 6 properties, Nugegoda',
    rating: 5,
  },
  {
    quote: "Finally a property manager that treats my assets like their own. Transparent, professional, reliable.",
    author: 'Fathima Nizar',
    role: 'Owner of 2 apartments, Battaramulla',
    rating: 5,
  },
]

// ─── Confetti Component ──────────────────────────────────────────────────────

function Confetti() {
  const particles = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#C9973A', '#1A3D8F', '#0A1628', '#FDF6E3'][i % 4],
    delay: Math.random() * 0.5,
    duration: 1.2 + Math.random() * 0.8,
  }))
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{ left: `${p.x}%`, top: '-8px', backgroundColor: p.color }}
          animate={{ y: ['0%', '110%'], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)], opacity: [1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

// ─── Horizontal Panels ───────────────────────────────────────────────────────

function HorizontalScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const mmRef = useRef<gsap.MatchMedia | null>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mmRef.current = mm

    mm.add('(min-width: 768px)', () => {
      const section = sectionRef.current
      const track = trackRef.current
      if (!section || !track) return

      const ctx = gsap.context(() => {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      }, section)
      return () => ctx.revert()
    })

    return () => {
      mm.revert()
    }
  }, [])

  return (
    <div ref={sectionRef} className="relative overflow-hidden" style={{ height: '100svh' }}>
      {/* Desktop: horizontal track */}
      <div
        ref={trackRef}
        className="flex md:flex-row flex-col md:h-full md:w-[300vw]"
      >
        {/* Panel 1 — For Property Owners */}
        <div className="md:w-screen md:flex-shrink-0 w-full bg-white flex flex-col justify-center px-8 md:px-24 py-20 md:py-0">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-gold mb-4">For Property Owners</p>
          <h2 className="font-display text-section font-light text-ink mb-12 leading-tight">
            Everything taken<br />care of, for you.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {OWNER_FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="group flex gap-4 p-5 rounded-card border border-border hover:border-gold/40 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-gold-light flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  <Icon size={18} className="text-gold" />
                </div>
                <div>
                  <p className="font-sans font-semibold text-ink text-sm mb-1">{label}</p>
                  <p className="font-sans text-xs text-slate leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2 — Stats */}
        <div className="md:w-screen md:flex-shrink-0 w-full bg-gold-pale flex flex-col justify-center px-8 md:px-24 py-20 md:py-0">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-gold mb-4">Managed by Professionals</p>
          <h2 className="font-display text-section font-light text-ink mb-16 leading-tight">
            Numbers that<br />speak for themselves.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl">
            {STATS.map(({ value, prefix, suffix, label }) => (
              <div key={label} className="text-center md:text-left">
                <StatCounter value={value} prefix={prefix} suffix={suffix} />
                <p className="font-sans text-sm text-slate mt-2">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 max-w-md">
            <div className="h-px bg-gold/30 mb-6" />
            <p className="font-sans text-sm text-slate italic leading-relaxed">
              "Trusted by property owners across Colombo, Kandy, and Galle — delivering results month after month."
            </p>
          </div>
        </div>

        {/* Panel 3 — Start in 48 Hours */}
        <div className="md:w-screen md:flex-shrink-0 w-full bg-navy flex flex-col justify-center px-8 md:px-24 py-20 md:py-0">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-gold mb-4">Start in 48 Hours</p>
          <h2 className="font-display text-section font-light text-white mb-16 leading-tight">
            From listing to<br />first payment, fast.
          </h2>
          <div className="flex flex-col md:flex-row items-start gap-0 max-w-3xl">
            {[
              { step: '01', title: 'List', desc: 'Submit your property details — photos, location, preferred rent. Takes 10 minutes.' },
              { step: '02', title: 'Verify', desc: 'Our team visits, documents the property, and begins tenant sourcing within 24 hours.' },
              { step: '03', title: 'Earn', desc: 'Rent is collected, your cut deposited directly, and you receive monthly statements.' },
            ].map((s, i) => (
              <div key={s.step} className="flex md:flex-col flex-row items-start md:flex-1 relative">
                {/* Connector line (desktop) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+1.5rem)] w-[calc(100%-3rem)] h-px">
                    <div
                      className="h-full bg-gold/30 origin-left"
                      style={{ animation: `drawLine 1s ${i * 0.3}s ease forwards`, transform: 'scaleX(0)' }}
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gold/50" />
                  </div>
                )}
                <div className="flex items-center gap-4 md:flex-col md:items-start mb-4 md:mb-0">
                  <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-xs text-gold">{s.step}</span>
                  </div>
                  {/* Connector (mobile) */}
                  {i < 2 && (
                    <div className="md:hidden w-px h-8 bg-gold/30 mx-6" />
                  )}
                </div>
                <div className="md:mt-6 ml-4 md:ml-0">
                  <p className="font-heading text-lg text-white mb-2">{s.title}</p>
                  <p className="font-sans text-sm text-white/60 leading-relaxed max-w-[180px]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCounter({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [displayed, setDisplayed] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          const isFloat = value % 1 !== 0
          const start = performance.now()
          const duration = 2000
          const step = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            const cur = isFloat ? Math.round(eased * value * 10) / 10 : Math.round(eased * value)
            setDisplayed(cur)
            if (t < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, started])

  return (
    <div ref={ref}>
      <span className="font-display text-5xl md:text-6xl font-light text-ink">
        {prefix}{displayed}{suffix}
      </span>
    </div>
  )
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Split heading into lines for reveal
      const heading = headingRef.current
      if (!heading) return

      // Wrap each line in a clip container
      const lines = heading.querySelectorAll('.reveal-line')
      gsap.fromTo(
        lines,
        { clipPath: 'inset(0 0 100% 0)', y: 30 },
        {
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.08,
          delay: 0.2,
        }
      )

      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.6 }
      )

      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: 'power2.out', delay: 0.9, transformOrigin: 'left center' }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-navy overflow-hidden px-8 md:px-24 pt-28 pb-20">
      {/* Background grain overlay handled by body::after in globals.css */}
      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-royal/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gold/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs tracking-[0.25em] uppercase text-gold mb-8"
        >
          Property Management · RentCeylon
        </motion.p>

        <h1 ref={headingRef} className="font-display font-light text-white leading-[1.05] mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}>
          <span className="block overflow-hidden">
            <span className="reveal-line block">Your Properties,</span>
          </span>
          <span className="block overflow-hidden">
            <span className="reveal-line block text-gold">Professionally</span>
          </span>
          <span className="block overflow-hidden">
            <span className="reveal-line block">Managed.</span>
          </span>
        </h1>

        {/* Gold accent line */}
        <div ref={lineRef} className="w-24 h-0.5 bg-gold mb-8" style={{ transformOrigin: 'left center' }} />

        <p
          ref={subRef}
          className="font-sans text-lg md:text-xl text-white/70 max-w-xl leading-relaxed"
          style={{ opacity: 0 }}
        >
          Hands-free property management for Colombo landlords. We find tenants, collect rent, and handle everything in between.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 bg-gold text-white px-8 py-3.5 rounded-full font-sans text-sm font-medium hover:bg-gold-dark transition-colors shadow-gold"
          >
            Join the Waitlist <ArrowRight size={16} />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-full font-sans text-sm hover:border-white/40 transition-colors"
          >
            How It Works
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"
        />
        <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">Scroll</span>
      </div>
    </section>
  )
}

// ─── Waitlist Section ────────────────────────────────────────────────────────

function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section id="waitlist" className="bg-snow py-28 px-8 md:px-24">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-gold mb-4">Early Access</p>
        <h2 className="font-display text-section font-light text-ink mb-4 leading-tight">
          Be first to experience<br />stress-free ownership.
        </h2>
        <p className="font-sans text-slate mb-12 leading-relaxed">
          We're launching in selected Colombo districts. Join the waitlist and get priority onboarding plus a free first-month management fee.
        </p>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-white border border-border rounded-full px-5 py-3.5 font-sans text-sm text-ink outline-none transition-all duration-200 placeholder:text-fog"
                    style={{
                      boxShadow: focused ? '0 0 0 2px rgba(201,151,58,0.35)' : 'none',
                      borderColor: focused ? '#C9973A' : undefined,
                      borderBottomColor: focused ? '#C9973A' : undefined,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gold text-white px-7 py-3.5 rounded-full font-sans text-sm font-medium hover:bg-gold-dark transition-colors shadow-gold disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                      </svg>
                      Joining...
                    </>
                  ) : 'Join Waitlist'}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-gold-pale border border-gold/30 rounded-card px-8 py-7 max-w-md mx-auto"
              >
                <Confetti />
                <CheckCircle className="text-gold mx-auto mb-3" size={28} />
                <p className="font-heading text-ink text-xl mb-1">You're in!</p>
                <p className="font-mono text-sm text-gold font-medium">You're #247 on the waitlist</p>
                <p className="font-sans text-xs text-slate mt-3">We'll reach out to {email} when your district opens.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="font-sans text-xs text-fog mt-6">No spam. Unsubscribe anytime. 🔒 Your data stays private.</p>
      </div>
    </section>
  )
}

// ─── Testimonials ────────────────────────────────────────────────────────────

function TestimonialsSection() {
  return (
    <section className="bg-white py-28 px-8 md:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-gold mb-3">What Owners Say</p>
            <h2 className="font-display text-section font-light text-ink leading-tight">
              Trusted by landlords<br />across Sri Lanka.
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="#C9973A" className="text-gold" />
            ))}
            <span className="font-mono text-sm text-slate ml-2">4.9 / 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="bg-snow border border-border rounded-card p-7 hover:border-gold/30 transition-colors duration-300"
            >
              <div className="flex gap-0.5 mb-5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={13} fill="#C9973A" className="text-gold" />
                ))}
              </div>
              <p className="font-sans text-sm text-ink leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-royal/10 flex items-center justify-center">
                  <span className="font-sans text-xs font-semibold text-royal">{t.author[0]}</span>
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-ink">{t.author}</p>
                  <p className="font-sans text-xs text-slate">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PropertyManagementPage() {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <HorizontalScrollSection />
      <WaitlistSection />
      <TestimonialsSection />

      {/* Footer-adjacent CTA */}
      <section className="bg-frost border-t border-border py-12 px-8 md:px-24">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-sm text-slate">Already managing properties?</p>
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 font-sans text-sm font-medium text-royal hover:text-royal-dark transition-colors"
          >
            Sign in to your portal <ArrowRight size={14} />
          </a>
        </div>
      </section>
    </main>
  )
}
