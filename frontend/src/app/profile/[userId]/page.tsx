import { FadeIn } from '@/components/animations/FadeIn'
import { CountUp } from '@/components/animations/CountUp'
import { StarRating } from '@/components/ui/StarRating'
import { TopRatedBadge } from '@/components/badges/earned/TopRatedBadge'
import { VerifiedItemBadge } from '@/components/badges/earned/VerifiedItemBadge'
import { FastResponderBadge } from '@/components/badges/earned/FastResponderBadge'
import { Shield, Calendar, MessageSquare, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const PROFILE = {
  id: 'user-1',
  name: 'Dinuka Perera',
  role: 'LISTER',
  memberSince: 'January 2022',
  avatarUrl: null as string | null,
  isVerified: true,
  rating: 4.9,
  reviewCount: 47,
  responseRate: 98,
  listings: [
    { id: '1', title: 'Sony A7III Camera', dailyRate: 3500, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop', rating: 4.9, reviews: 47 },
    { id: '2', title: 'DJI Mavic 3 Pro',   dailyRate: 8500, imageUrl: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400&auto=format&fit=crop', rating: 4.7, reviews: 23 },
  ],
  reviews: [
    { id: 'r1', reviewer: 'Kasun F.',  rating: 5, comment: 'Exceptional equipment, super professional.', date: '2 weeks ago' },
    { id: 'r2', reviewer: 'Nithya R.', rating: 5, comment: 'Dinuka was incredibly responsive and flexible.', date: '1 month ago' },
  ],
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const profile = PROFILE

  return (
    <div className="min-h-screen bg-white pt-[62px]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0C1124 0%, #1A3D8F 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] orb-gold opacity-25" />
        </div>

        <div className="relative max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-start gap-8">

            {/* Avatar */}
            <FadeIn delay={0} y={0} x={-20}>
              <div className="relative shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center font-sans font-bold text-white"
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                    border: '2px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                  }}>
                  {profile.name[0]}
                </div>
                {profile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #C9973A, #E8BC6A)', border: '2px solid rgba(255,255,255,0.15)' }}>
                    <Shield size={13} strokeWidth={2} className="text-white" />
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Info */}
            <div className="flex-1">
              <FadeIn delay={0.1} y={16}>
                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                  <h1 className="font-sans text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {profile.name}
                  </h1>
                  {profile.isVerified && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: 'rgba(201,151,58,0.18)', color: '#E8BC6A', border: '1px solid rgba(201,151,58,0.25)' }}>
                      ID Verified
                    </span>
                  )}
                </div>
              </FadeIn>
              <FadeIn delay={0.15} y={12}>
                <div className="flex items-center gap-2 mb-7">
                  <Calendar size={12} strokeWidth={1.5} className="text-white/35" />
                  <span className="font-sans text-sm text-white/45">Member since {profile.memberSince}</span>
                </div>
              </FadeIn>

              <FadeIn delay={0.2} y={12}>
                <div className="flex flex-wrap gap-8">
                  {[
                    { value: profile.rating,       label: 'Rating',        suffix: '★' },
                    { value: profile.reviewCount,   label: 'Reviews',       suffix: ''  },
                    { value: profile.responseRate,  label: 'Response rate', suffix: '%' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="font-sans font-bold text-white text-xl">
                        <CountUp value={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="font-sans text-xs text-white/40 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Message CTA */}
            <FadeIn delay={0.25} y={0} x={20}>
              <Link href={`/messages/${profile.id}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-sans text-sm font-semibold transition-all duration-200 hover:bg-white/20"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(10px)',
                }}>
                <MessageSquare size={15} strokeWidth={1.5} />
                Message
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Badges strip */}
      <div className="bg-white border-b border-black/05">
        <div className="max-w-[1100px] mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans text-xs text-fog mr-1">Earned badges</span>
            <TopRatedBadge />
            <VerifiedItemBadge />
            <FastResponderBadge />
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-12 space-y-14">

        {/* ── Listings ── */}
        <section>
          <FadeIn y={16}>
            <div className="flex items-center gap-3 mb-7">
              <p className="section-label">Listings</p>
              <div className="h-px flex-1 bg-black/05" />
              <span className="font-mono text-[10px] text-fog">{profile.listings.length} active</span>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.listings.map((listing, i) => (
              <FadeIn key={listing.id} delay={i * 0.08} y={20}>
                <Link href={`/listings/${listing.id}`} className="block group">
                  <div className="rounded-2xl overflow-hidden border border-black/06 bg-white shadow-card hover:shadow-card-hover transition-all duration-300">
                    <div className="relative h-44 overflow-hidden">
                      <Image src={listing.imageUrl} alt={listing.title} fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-sans font-semibold text-ink text-sm leading-snug mb-1">{listing.title}</p>
                          <div className="flex items-center gap-1">
                            <Star size={11} strokeWidth={0} style={{ fill: '#C9973A' }} />
                            <span className="font-mono text-xs font-semibold" style={{ color: '#C9973A' }}>{listing.rating}</span>
                            <span className="font-sans text-xs text-fog">({listing.reviews})</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono text-sm font-bold text-ink">LKR {listing.dailyRate.toLocaleString()}</p>
                          <p className="font-sans text-[10px] text-fog">/day</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── Reviews ── */}
        <section>
          <FadeIn y={16}>
            <div className="flex items-center gap-3 mb-7">
              <p className="section-label">Reviews</p>
              <div className="h-px flex-1 bg-black/05" />
              <div className="flex items-center gap-1.5">
                <Star size={11} strokeWidth={0} style={{ fill: '#C9973A' }} />
                <span className="font-mono text-xs font-bold" style={{ color: '#C9973A' }}>{profile.rating}</span>
                <span className="font-sans text-xs text-fog">({profile.reviewCount})</span>
              </div>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {profile.reviews.map((review, i) => (
              <FadeIn key={review.id} delay={i * 0.06} y={16}>
                <div className="p-5 rounded-2xl border border-black/06 bg-white shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-sans font-bold text-sm text-royal"
                        style={{ background: 'rgba(26,61,143,0.07)' }}>
                        {review.reviewer[0]}
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-ink text-sm">{review.reviewer}</p>
                        <p className="font-mono text-fog text-[10px]">{review.date}</p>
                      </div>
                    </div>
                    <StarRating value={review.rating} size={13} />
                  </div>
                  <p className="font-sans text-slate text-sm leading-relaxed">{review.comment}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
