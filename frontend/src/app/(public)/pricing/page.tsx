import { FadeIn } from '@/components/animations/FadeIn'
import { FeaturedBadge } from '@/components/badges/paid/FeaturedBadge'
import { SponsoredBadge } from '@/components/badges/paid/SponsoredBadge'
import { Check, ArrowRight, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

const TIERS = [
  {
    name: 'Basic',
    price: 0,
    period: 'Free forever',
    description: 'For individuals just getting started with rentals.',
    features: ['Up to 5 active listings', 'Standard search visibility', 'Email support', 'Basic analytics'],
    cta: 'Get started free',
    href: '/auth/signup',
    recommended: false,
  },
  {
    name: 'Pro',
    price: 1990,
    period: '/month',
    description: 'For serious listers who want maximum reach and tools.',
    features: ['Unlimited listings', 'Priority search ranking', '1 Featured badge/month', 'Chat support', 'Advanced analytics', 'Cancellation protection'],
    cta: 'Start Pro',
    href: '/auth/signup?tier=pro',
    recommended: true,
  },
  {
    name: 'Premium',
    price: 4990,
    period: '/month',
    description: 'For high-volume listers and rental businesses.',
    features: ['Everything in Pro', '3 Featured badges/month', '2 Sponsored slots/month', 'Dedicated account manager', 'Priority ID verification', 'Dispute priority handling', 'Custom invoice reports'],
    cta: 'Start Premium',
    href: '/auth/signup?tier=premium',
    recommended: false,
  },
]

const COMPARISON = [
  { feature: 'Active listings',      basic: '5',        pro: 'Unlimited', premium: 'Unlimited' },
  { feature: 'Search visibility',    basic: 'Standard', pro: 'Priority',  premium: 'Priority'  },
  { feature: 'Featured badges',      basic: '—',        pro: '1/month',   premium: '3/month'   },
  { feature: 'Sponsored placements', basic: '—',        pro: '—',         premium: '2/month'   },
  { feature: 'Analytics',            basic: 'Basic',    pro: 'Advanced',  premium: 'Advanced'  },
  { feature: 'Support',              basic: 'Email',    pro: 'Chat',      premium: 'Dedicated' },
  { feature: 'Dispute priority',     basic: '—',        pro: '—',         premium: '✓'         },
  { feature: 'Invoice reports',      basic: '—',        pro: '—',         premium: '✓'         },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-[62px]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] orb-blue opacity-50" />
        </div>
        <div className="relative max-w-[860px] mx-auto px-6 py-24 text-center">
          <FadeIn delay={0} y={20}>
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-fog mb-6">Pricing</p>
          </FadeIn>
          <FadeIn delay={0.1} y={24}>
            <h1 className="font-sans font-bold text-ink tracking-tight leading-[1.05] mb-5"
              style={{ fontSize: 'clamp(2.75rem, 7vw, 5rem)' }}>
              List once.{' '}
              <span className="hero-heading-gold">Earn endlessly.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2} y={16}>
            <p className="font-sans text-lg text-fog leading-relaxed max-w-xl mx-auto">
              No hidden fees. Our platform fee comes only from earnings — you never pay upfront.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Tier cards ── */}
      <section className="pb-24 px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((tier, i) => (
            <FadeIn key={tier.name} delay={i * 0.08} y={24}>
              <div
                className="relative flex flex-col h-full p-7 rounded-2xl transition-all duration-300"
                style={{
                  background: tier.recommended ? '#0C1124' : '#FFFFFF',
                  border: tier.recommended ? 'none' : '1px solid rgba(0,0,0,0.07)',
                  boxShadow: tier.recommended
                    ? '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.04)'
                    : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {tier.recommended && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #C9973A, #E8BC6A)', color: '#0C1124' }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <p className="font-sans text-[11px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: tier.recommended ? 'rgba(255,255,255,0.35)' : '#8A97B5' }}>
                    {tier.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="font-sans font-bold"
                      style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', color: tier.recommended ? '#FFFFFF' : '#0C1124' }}>
                      {tier.price === 0 ? 'Free' : `LKR ${tier.price.toLocaleString()}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="font-sans text-sm" style={{ color: tier.recommended ? 'rgba(255,255,255,0.4)' : '#8A97B5' }}>
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-sm leading-relaxed"
                    style={{ color: tier.recommended ? 'rgba(255,255,255,0.5)' : '#8A97B5' }}>
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm font-sans">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: tier.recommended ? 'rgba(232,188,106,0.15)' : 'rgba(26,61,143,0.07)' }}>
                        <Check size={9} strokeWidth={3} style={{ color: tier.recommended ? '#E8BC6A' : '#1A3D8F' }} />
                      </div>
                      <span style={{ color: tier.recommended ? 'rgba(255,255,255,0.7)' : '#3D4F73' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className="w-full py-3.5 rounded-xl font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
                  style={
                    tier.recommended
                      ? { background: 'linear-gradient(135deg, #C9973A, #E8BC6A)', color: '#0C1124', boxShadow: '0 4px 16px rgba(201,151,58,0.3)' }
                      : { background: 'rgba(26,61,143,0.07)', color: '#1A3D8F' }
                  }
                >
                  {tier.cta} <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="py-20 px-6" style={{ background: '#F8F9FB' }}>
        <div className="max-w-[860px] mx-auto">
          <FadeIn y={20}>
            <h2 className="font-sans text-2xl font-bold text-ink text-center mb-10 tracking-tight">Full comparison</h2>
          </FadeIn>
          <div className="rounded-2xl overflow-hidden border border-black/06 bg-white shadow-card">
            <div className="grid grid-cols-4 bg-[#F8F9FB] border-b border-black/06">
              <div className="px-5 py-4" />
              {TIERS.map((t) => (
                <div key={t.name} className="px-5 py-4 text-center">
                  <p className="font-sans text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: t.recommended ? '#1A3D8F' : '#8A97B5' }}>
                    {t.name}
                  </p>
                </div>
              ))}
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} className="grid grid-cols-4 border-b border-black/04 last:border-0"
                style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFBFC' }}>
                <div className="px-5 py-3.5">
                  <p className="font-sans text-sm text-ink font-medium">{row.feature}</p>
                </div>
                {[row.basic, row.pro, row.premium].map((val, j) => (
                  <div key={j} className="px-5 py-3.5 text-center">
                    <p className="font-sans text-sm"
                      style={{ color: val === '—' ? '#DDE3F0' : j === 1 ? '#1A3D8F' : '#3D4F73', fontWeight: j === 1 ? 600 : 400 }}>
                      {val}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Badge upsell ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[860px] mx-auto">
          <FadeIn y={20}>
            <div className="text-center mb-12">
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-fog mb-4">Promotions</p>
              <h2 className="font-sans text-2xl font-bold text-ink tracking-tight">Stand out in the crowd</h2>
              <p className="font-sans text-fog mt-2 text-sm">Two paid promotion options — clearly marked, always transparent.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { badge: <FeaturedBadge />, title: 'Featured Listing', desc: 'Gold shimmer highlight + priority placement in category search results', price: 'LKR 990 / listing / week' },
              { badge: <SponsoredBadge />, title: 'Sponsored Placement', desc: 'Appears at the top of browse results in a clearly labelled "Promoted" section', price: 'LKR 1,490 / listing / week' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08} y={16}>
                <div className="p-6 rounded-2xl border border-black/06 bg-white shadow-card hover:shadow-card-hover transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div>{item.badge}</div>
                    <div className="flex-1">
                      <h4 className="font-sans font-semibold text-ink text-base mb-1">{item.title}</h4>
                      <p className="font-sans text-fog text-sm mb-3 leading-relaxed">{item.desc}</p>
                      <p className="font-mono text-royal text-sm font-semibold">{item.price}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust guarantees ── */}
      <section className="py-16 px-6" style={{ background: '#F8F9FB' }}>
        <div className="max-w-[860px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: '24hr ID Verification', desc: 'All listers verified within 24 hours, guaranteed.' },
            { icon: Clock,  title: 'SLA-backed Support',   desc: 'Every dispute resolved within 72 hours.' },
            { icon: Check,  title: 'No Hidden Fees',       desc: 'Platform fee from earnings only. Always shown upfront.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.06} y={16}>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(26,61,143,0.07)' }}>
                  <Icon size={17} strokeWidth={1.5} className="text-royal" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-ink mb-1 text-sm">{title}</h4>
                  <p className="font-sans text-fog text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Referral CTA ── */}
      <section className="py-16 px-6 bg-white">
        <FadeIn y={20}>
          <div className="max-w-2xl mx-auto rounded-2xl p-10 text-center"
            style={{ background: 'linear-gradient(135deg, #0C1124 0%, #1A3D8F 100%)', boxShadow: '0 24px 64px rgba(26,61,143,0.2)' }}>
            <h3 className="font-sans text-white text-2xl font-bold mb-3 tracking-tight">Know a lister?</h3>
            <p className="font-sans text-white/55 text-base mb-7 leading-relaxed">
              Refer a lister who publishes their first item — you both get 1 month Pro free.
            </p>
            <Link href="/referrals"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-sans font-semibold text-sm transition-all duration-200 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C9973A, #E8BC6A)', color: '#0C1124', boxShadow: '0 4px 16px rgba(201,151,58,0.3)' }}>
              Get your referral link <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
