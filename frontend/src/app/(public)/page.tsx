'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { CountUp } from '@/components/animations/CountUp'
import { CardStagger } from '@/components/animations/CardStagger'
import { FadeIn } from '@/components/animations/FadeIn'
import { Magnet } from '@/components/animations/Magnet'
import { ListingCard } from '@/components/listings/ListingCard'
import { ProductArrivesSection } from '@/components/sections/ProductArrivesSection'
import { TrustScrollSection } from '@/components/sections/TrustScrollSection'
import { CategoryWorldSection } from '@/components/sections/CategoryWorldSection'
import { ScrollProgress } from '@/components/animations/ScrollProgress'

// ─── easing curves ────────────────────────────────────────────────────────────
const EXPO = [0.16, 1, 0.3, 1] as const

// ─── sample data ─────────────────────────────────────────────────────────────
const LISTINGS = [
  { id: '1', title: 'Sony A7III + 50mm', location: 'Colombo 3', dailyRate: 3500,
    coverImageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop',
    rating: 4.9, reviewCount: 47, isFeatured: true, earnedBadges: ['TOP_RATED', 'VERIFIED_ITEM'] as any[] },
  { id: '2', title: 'DJI Mavic 3 Pro Drone', location: 'Nugegoda', dailyRate: 8500,
    coverImageUrl: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&auto=format&fit=crop',
    rating: 4.7, reviewCount: 23, earnedBadges: ['FAST_RESPONDER'] as any[] },
  { id: '3', title: 'Luxury Villa — Galle Fort', location: 'Galle', dailyRate: 45000,
    coverImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop',
    rating: 5.0, reviewCount: 12, earnedBadges: ['TOP_RATED'] as any[] },
  { id: '4', title: 'Honda Civic — Self Drive', location: 'Kandy', dailyRate: 6500,
    coverImageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop',
    rating: 4.6, reviewCount: 89, earnedBadges: ['VERIFIED_ITEM'] as any[] },
  { id: '5', title: 'Canon EOS R5 + 24-70mm', location: 'Colombo 7', dailyRate: 5000,
    coverImageUrl: 'https://images.unsplash.com/photo-1590842949046-d9e8d39beaaa?w=600&auto=format&fit=crop',
    rating: 4.8, reviewCount: 31, isFeatured: true, earnedBadges: ['TOP_RATED', 'FAST_RESPONDER'] as any[] },
  { id: '6', title: 'Industrial Generator 5KVA', location: 'Gampaha', dailyRate: 4200,
    coverImageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop',
    rating: 4.5, reviewCount: 15, earnedBadges: [] as any[] },
]

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ index, title, subtitle }: { index: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-16">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-xs text-fog/50 tracking-[0.15em]">{index}</span>
        <div className="h-px bg-royal/30 flex-1" />
      </div>
      <h2
        className="font-display text-ink"
        style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans text-fog text-sm mt-3 max-w-md">{subtitle}</p>
      )}
    </div>
  )
}

// ─── Hero word-by-word reveal ─────────────────────────────────────────────────
function HeroWord({ word, delay, italic, color }: { word: string; delay: number; italic?: boolean; color?: string }) {
  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, y: '60%', clipPath: 'inset(0 0 100% 0)' }}
      animate={{ opacity: 1, y: '0%', clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: 0.7, ease: EXPO, delay }}
      style={{ color, fontStyle: italic ? 'italic' : undefined, display: 'inline-block', marginRight: '0.25em' }}
    >
      {word}
    </motion.span>
  )
}

export default function HomePage() {
  return (
    <>
      <ScrollProgress />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-24 pt-32 overflow-hidden bg-white">

        {/* Background: large editorial grid lines */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Vertical guide line — right side */}
          <motion.div
            className="absolute top-0 bottom-0 w-px bg-royal/6"
            style={{ left: '72%' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.2, ease: EXPO, delay: 0.2 }}
          />
          {/* Horizontal horizon line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-ink/5"
            style={{ top: '60%' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, ease: EXPO, delay: 0.4 }}
          />
          {/* Blue corner accent */}
          <motion.div
            className="absolute top-32 right-0 w-[45vw] h-px bg-royal"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: EXPO, delay: 0.6 }}
            style={{ transformOrigin: 'right' }}
          />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-8 md:px-16 w-full">

          {/* Section marker */}
          <motion.div
            className="flex items-center gap-3 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-fog/60">Sri Lanka</span>
            <div className="w-6 h-px bg-fog/40" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-fog/60">Peer-to-Peer Rentals</span>
            <div className="w-6 h-px bg-fog/40" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-royal/70">Est. 2025</span>
          </motion.div>

          {/* Headline — left-aligned, editorial, massive */}
          <div className="mb-10">
            <h1
              className="font-sans text-ink block"
              style={{ fontSize: 'clamp(4rem, 11vw, 10rem)', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.04em' }}
            >
              <span className="block overflow-hidden">
                <HeroWord word="Rent" delay={0.5} />
                <HeroWord word="anything." delay={0.62} />
              </span>
              <span className="block overflow-hidden">
                <HeroWord word="From" delay={0.74} />
                <HeroWord word="anyone." delay={0.86} italic color="#1A3D8F" />
              </span>
            </h1>
          </div>

          {/* Rule + descriptor row */}
          <div className="flex flex-col md:flex-row md:items-end gap-8 mb-16">
            <div className="flex-1 max-w-lg">
              <motion.div
                className="h-px bg-royal mb-6 origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, ease: EXPO, delay: 1.0 }}
              />
              <motion.p
                className="font-sans text-slate/80 leading-relaxed"
                style={{ fontSize: '1.0625rem' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EXPO, delay: 1.1 }}
              >
                Cameras, drones, vehicles, villas, tools — verified owners,
                protected deposits, seamless rentals across Sri Lanka.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              className="flex items-center gap-4 shrink-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EXPO, delay: 1.2 }}
            >
              <Magnet padding={40} strength={4}>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white font-sans font-semibold text-sm transition-all duration-200 hover:opacity-90 group"
                  style={{ background: 'linear-gradient(135deg, #1A3D8F 0%, #2952B8 100%)', boxShadow: '0 4px 16px rgba(26,61,143,0.3)' }}
                >
                  Browse listings
                  <ArrowUpRight size={14} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnet>
              <Magnet padding={40} strength={4}>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-sans font-semibold text-sm transition-all duration-200"
                  style={{ border: '1.5px solid rgba(12,17,36,0.15)', color: '#0C1124' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  List your item
                </Link>
              </Magnet>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div
            className="border-t border-b border-ink/8 py-6 grid grid-cols-3 md:grid-cols-3 divide-x divide-ink/8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EXPO, delay: 1.35 }}
          >
            {[
              { value: 2400, label: 'Items listed', suffix: '+' },
              { value: 1200, label: 'Verified owners', suffix: '+' },
              { value: 98,   label: 'Trust score',   suffix: '%' },
            ].map((s) => (
              <div key={s.label} className="px-8 first:pl-0 last:pr-0 flex flex-col gap-1">
                <span className="font-mono text-2xl md:text-3xl text-ink font-light tabular-nums">
                  <CountUp value={s.value} suffix={s.suffix} />
                </span>
                <span className="font-sans text-xs text-fog/70 uppercase tracking-[0.12em]">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────────────────────────────── */}
      <section className="py-28 bg-white border-t border-ink/6">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16">
          <FadeIn y={24} className="flex items-end justify-between mb-0">
            <SectionHeader
              index="02"
              title="Featured this week"
              subtitle="Hand-picked by our curation team"
            />
            <div className="hidden md:block mb-16">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 text-sm font-sans text-royal border-b border-royal/30 pb-0.5 hover:border-royal transition-colors"
              >
                View all <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </FadeIn>

          <CardStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/8 border border-ink/8">
            {LISTINGS.map((listing) => (
              <div key={listing.id} className="bg-white">
                <ListingCard listing={listing} />
              </div>
            ))}
          </CardStagger>
        </div>
      </section>

      {/* ── CINEMATIC SEQUENCES ──────────────────────────────────────────── */}
      <ProductArrivesSection />
      <TrustScrollSection />
      <CategoryWorldSection />

      {/* ── PROPERTY MANAGEMENT ──────────────────────────────────────────── */}
      <PropertyTeaser />

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <FinalCta />
    </>
  )
}

// ─── Property teaser ─────────────────────────────────────────────────────────
function PropertyTeaser() {
  return (
    <section className="py-28 bg-snow border-t border-ink/6">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-fog/50">05</span>
              <div className="w-8 h-px bg-gold" />
              <span className="font-sans text-xs text-gold tracking-wide">For Sri Lankans Abroad</span>
            </motion.div>

            <motion.h2
              className="font-display text-ink mb-6"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.025em' }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EXPO, delay: 0.1 }}
            >
              Your property.<br />
              <em style={{ color: '#C9973A' }}>Managed.</em>
            </motion.h2>

            <motion.div
              className="h-px bg-gold/40 mb-6 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: EXPO, delay: 0.2 }}
            />

            <motion.p
              className="font-sans text-slate/80 text-base leading-relaxed mb-8 max-w-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EXPO, delay: 0.3 }}
            >
              Tenant vetting, condition inspections, rent collection, and monthly
              reporting — so you can relax in London, Melbourne, or Dubai.
            </motion.p>

            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EXPO, delay: 0.4 }}
            >
              <Link href="/property-management" className="inline-flex items-center gap-2.5 px-6 py-3 bg-ink text-white font-sans text-sm tracking-wide hover:bg-navy transition-colors">
                Learn more <ArrowUpRight size={13} strokeWidth={1.5} />
              </Link>
              <Link href="/property-management#waitlist" className="inline-flex items-center gap-2 px-6 py-3 border border-ink/20 text-ink font-sans text-sm tracking-wide hover:border-gold hover:text-gold transition-colors">
                Join waitlist
              </Link>
            </motion.div>
          </div>

          {/* Image panel */}
          <motion.div
            className="relative aspect-[4/3] overflow-hidden bg-frost"
            initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 0.9, ease: EXPO, delay: 0.15 }}
          >
            <Image
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop"
              alt="Property management"
              fill
              className="object-cover"
            />
            {/* Blue stripe overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-royal" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCta() {
  return (
    <section className="bg-royal overflow-hidden relative">
      {/* Architectural grid line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: EXPO }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 50%, rgba(26,61,143,0.6) 0%, transparent 60%)' }}
      />

      <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-28 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.p
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              06 — Start earning
            </motion.p>
            <motion.h2
              className="font-display text-white"
              style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.025em' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EXPO, delay: 0.15 }}
            >
              Know a lister?<br />
              <em style={{ color: '#E8BC6A' }}>You earn too.</em>
            </motion.h2>
          </div>

          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EXPO, delay: 0.3 }}
          >
            <p className="font-sans text-white/70 leading-relaxed text-base max-w-sm">
              Share RentLoop and earn Rs. 500 when your referral makes their first booking.
            </p>
            <div className="flex gap-4 mt-2">
              <Link
                href="/referrals"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-royal font-sans font-medium text-sm tracking-wide hover:bg-snow transition-colors"
              >
                Share & Earn <ArrowUpRight size={13} strokeWidth={1.5} />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white font-sans text-sm tracking-wide hover:border-white/60 transition-colors"
              >
                Get started
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
