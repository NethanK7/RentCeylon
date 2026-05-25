import { TextReveal } from '@/components/animations/TextReveal'
import { CardStagger } from '@/components/animations/CardStagger'
import { FeaturedBadge } from '@/components/badges/paid/FeaturedBadge'
import { SponsoredBadge } from '@/components/badges/paid/SponsoredBadge'
import { Check, ArrowRight, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

const TIERS = [
  {
    name: 'Basic',
    price: 0,
    period: 'Free forever',
    description: 'For individuals just getting started',
    features: ['Up to 5 active listings', 'Standard search visibility', 'Email support', 'Basic analytics'],
    cta: 'Start Free',
    href: '/auth/signup',
    recommended: false,
  },
  {
    name: 'Pro',
    price: 1990,
    period: '/month',
    description: 'For serious listers who want more',
    features: ['Unlimited listings', 'Priority search ranking', '1 Featured badge/month', 'Chat support', 'Advanced analytics', 'Cancellation protection'],
    cta: 'Start Pro',
    href: '/auth/signup?tier=pro',
    recommended: true,
  },
  {
    name: 'Premium',
    price: 4990,
    period: '/month',
    description: 'For high-volume listers and businesses',
    features: ['Everything in Pro', '3 Featured badges/month', '2 Sponsored slots/month', 'Dedicated account manager', 'Priority ID verification', 'Dispute priority handling', 'Custom invoice reports'],
    cta: 'Start Premium',
    href: '/auth/signup?tier=premium',
    recommended: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="py-24 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-sans font-medium mb-8" style={{ background: '#EEF2FB', color: '#1A3D8F' }}>
            Simple, transparent pricing
          </div>
          <TextReveal as="h1" className="font-display text-ink mb-6 [font-size:clamp(3rem,7vw,5.5rem)] font-light leading-none">
            List once.<br />
            <em style={{ color: '#C9973A' }}>Earn endlessly.</em>
          </TextReveal>
          <div className="mx-auto h-px w-20 mb-6" style={{ background: 'linear-gradient(90deg, #C9973A, #E8BC6A)' }} />
          <p className="font-sans text-slate text-lg leading-relaxed">
            No hidden fees. Platform fee is deducted from rental earnings — you never pay it upfront.
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <section className="py-16 px-6 bg-snow">
        <div className="max-w-[1200px] mx-auto">
          <CardStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="relative bg-white rounded-card p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover"
                style={{
                  border: tier.recommended ? '2px solid #C9973A' : '1px solid #DDE3F0',
                  boxShadow: tier.recommended ? '0 8px 32px rgba(201,151,58,0.15)' : '0 2px 8px rgba(15,36,86,0.06)',
                }}
              >
                {tier.recommended && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-sans font-medium text-white"
                    style={{ background: 'linear-gradient(135deg, #C9973A, #E8BC6A)' }}
                  >
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading text-ink text-xl mb-1">{tier.name}</h3>
                <p className="font-sans text-fog text-sm mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-mono text-royal font-medium text-3xl">
                    {tier.price === 0 ? 'Free' : `LKR ${tier.price.toLocaleString()}`}
                  </span>
                  {tier.price > 0 && <span className="font-sans text-fog text-sm">{tier.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm font-sans text-slate">
                      <Check size={14} strokeWidth={2} className="text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className="w-full py-3 rounded-full font-sans font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: tier.recommended ? 'linear-gradient(135deg, #C9973A, #E8BC6A)' : '#EEF2FB',
                    color: tier.recommended ? '#0C1124' : '#1A3D8F',
                  }}
                >
                  {tier.cta} <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            ))}
          </CardStagger>
        </div>
      </section>

      {/* Promoted badges upsell */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <TextReveal as="h2" className="font-heading text-ink text-3xl mb-4">
              Boost your listings
            </TextReveal>
            <p className="font-sans text-fog">Two paid promotion options — clearly marked, always transparent</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { badge: <FeaturedBadge />, title: 'Featured Listing', desc: 'Gold shimmer highlight + priority placement in search results', price: 'LKR 990/listing/week' },
              { badge: <SponsoredBadge />, title: 'Sponsored Placement', desc: 'Appears at the top of browse results in a clearly labelled "Promoted" section', price: 'LKR 1,490/listing/week' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-card border border-border flex gap-4">
                <div>{item.badge}</div>
                <div>
                  <h4 className="font-heading text-ink text-lg mb-1">{item.title}</h4>
                  <p className="font-sans text-slate text-sm mb-3 leading-relaxed">{item.desc}</p>
                  <p className="font-mono text-royal text-sm font-medium">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust guarantees */}
      <section className="py-16 px-6 bg-snow">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: '24hr ID Verification', desc: 'All listers verified within 24 hours, guaranteed' },
              { icon: Clock, title: 'SLA-backed Support', desc: 'Every dispute resolved within 72 hours' },
              { icon: Check, title: 'No Hidden Fees', desc: 'Platform fee deducted from earnings only. Shown upfront at checkout.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-card bg-royal-light flex items-center justify-center shrink-0">
                  <Icon size={18} strokeWidth={1.5} className="text-royal" />
                </div>
                <div>
                  <h4 className="font-sans font-medium text-ink mb-1 text-sm">{title}</h4>
                  <p className="font-sans text-fog text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral CTA */}
      <section className="py-16 px-6">
        <div
          className="max-w-2xl mx-auto rounded-card p-10 text-center"
          style={{ background: '#FDF7ED', border: '1px solid rgba(201,151,58,0.3)' }}
        >
          <h3 className="font-heading text-ink text-2xl mb-3">Know a lister?</h3>
          <p className="font-sans text-slate text-base mb-6">Refer a lister who lists their first item — you both get 1 month Pro free.</p>
          <Link
            href="/referrals"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-medium text-sm text-ink"
            style={{ background: 'linear-gradient(135deg, #C9973A, #E8BC6A)' }}
          >
            Get your referral link <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  )
}
