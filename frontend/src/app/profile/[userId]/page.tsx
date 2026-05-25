import { TextReveal } from '@/components/animations/TextReveal'
import { CountUp } from '@/components/animations/CountUp'
import { CardStagger } from '@/components/animations/CardStagger'
import { StarRating } from '@/components/ui/StarRating'
import { TopRatedBadge } from '@/components/badges/earned/TopRatedBadge'
import { VerifiedItemBadge } from '@/components/badges/earned/VerifiedItemBadge'
import { FastResponderBadge } from '@/components/badges/earned/FastResponderBadge'
import { FeaturedBadge } from '@/components/badges/paid/FeaturedBadge'
import { Shield, Calendar, Star, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const PROFILE = {
  id: 'user-1',
  name: 'Dinuka Perera',
  role: 'LISTER',
  memberSince: 'January 2022',
  avatarUrl: null,
  isVerified: true,
  rating: 4.9,
  reviewCount: 47,
  responseRate: 98,
  listings: [
    { id: '1', title: 'Sony A7III Camera', dailyRate: 3500, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop', rating: 4.9, reviews: 47 },
    { id: '2', title: 'DJI Mavic 3 Pro', dailyRate: 8500, imageUrl: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400&auto=format&fit=crop', rating: 4.7, reviews: 23 },
  ],
  reviews: [
    { id: 'r1', reviewer: 'Kasun F.', rating: 5, comment: 'Exceptional equipment, super professional.', date: '2 weeks ago' },
    { id: 'r2', reviewer: 'Nithya R.', rating: 5, comment: 'Dinuka was incredibly responsive and flexible.', date: '1 month ago' },
  ],
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const profile = PROFILE

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(to bottom, #F8F9FC, #FFFFFF)' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-display text-royal"
                style={{
                  background: 'linear-gradient(135deg, #EEF2FB, #FFFFFF)',
                  border: profile.isVerified ? '3px solid #C9973A' : '3px solid #DDE3F0',
                }}
              >
                {profile.name[0]}
              </div>
              {profile.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C9973A, #E8BC6A)', border: '2px solid white' }}
                >
                  <Shield size={14} strokeWidth={1.5} className="text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <TextReveal as="h1" className="font-heading text-ink text-3xl mb-1">
                {profile.name}
              </TextReveal>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={14} strokeWidth={1.5} className="text-fog" />
                <span className="font-sans text-fog text-sm">Member since {profile.memberSince}</span>
                {profile.isVerified && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-sans font-medium"
                    style={{ background: 'rgba(10,120,85,0.08)', color: '#0A7855' }}
                  >
                    ID Verified
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'Rating', value: profile.rating, suffix: '', format: (v: number) => v.toFixed(1) },
                  { label: 'Reviews', value: profile.reviewCount, suffix: '' },
                  { label: 'Response Rate', value: profile.responseRate, suffix: '%' },
                ].map(({ label, value, suffix, format }) => (
                  <div key={label}>
                    <p className="font-mono text-royal font-medium text-xl">
                      {format ? format(value) : <CountUp value={value} suffix={suffix} />}
                    </p>
                    <p className="font-sans text-fog text-xs">{label}</p>
                  </div>
                ))}
              </div>

              {/* Response rate meter */}
              <div className="mb-4">
                <p className="font-sans text-xs text-fog mb-1">Response rate</p>
                <div className="h-1.5 bg-mist rounded-full overflow-hidden w-48">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${profile.responseRate}%`, background: 'linear-gradient(90deg, #1A3D8F, #C9973A)' }}
                  />
                </div>
              </div>

              <StarRating value={profile.rating} size={16} className="mb-4" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* Earned Badges */}
            <div>
              <h2 className="font-heading text-ink text-xl mb-1">Earned Badges</h2>
              <p className="font-sans text-fog text-xs mb-4 uppercase tracking-widest">Based on performance</p>
              <div className="flex flex-wrap gap-3">
                <TopRatedBadge />
                <VerifiedItemBadge />
                <FastResponderBadge />
              </div>
            </div>

            {/* Promoted section — separate */}
            <div>
              <h2 className="font-heading text-ink text-xl mb-1">Active Promotions</h2>
              <p className="font-sans text-fog text-xs mb-4 uppercase tracking-widest">Paid placements</p>
              <div className="flex flex-wrap gap-3">
                <FeaturedBadge />
              </div>
            </div>

            {/* Listings */}
            <div>
              <h2 className="font-heading text-ink text-xl mb-6">Active Listings</h2>
              <CardStagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.listings.map((listing) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <div className="bg-white rounded-card border border-border overflow-hidden hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
                      <div className="relative aspect-[4/3]">
                        <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading text-ink text-base mb-2">{listing.title}</h3>
                        <div className="flex justify-between">
                          <span className="font-mono text-royal font-medium">LKR {listing.dailyRate.toLocaleString()}/day</span>
                          <div className="flex items-center gap-1">
                            <Star size={12} strokeWidth={1.5} style={{ fill: '#C9973A', color: '#C9973A' }} />
                            <span className="text-xs font-sans text-fog">{listing.rating} ({listing.reviews})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardStagger>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="font-heading text-ink text-xl mb-6">Reviews</h2>
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-card border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-frost flex items-center justify-center font-heading text-slate text-sm">
                          {review.reviewer[0]}
                        </div>
                        <div>
                          <p className="font-sans font-medium text-ink text-sm">{review.reviewer}</p>
                          <p className="font-sans text-fog text-xs">{review.date}</p>
                        </div>
                      </div>
                      <StarRating value={review.rating} size={14} />
                    </div>
                    <p className="font-sans text-slate text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-card border border-border p-5">
                <h3 className="font-heading text-ink text-lg mb-4">Contact</h3>
                <Link
                  href="/auth/signup"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-sans font-medium text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #1A3D8F, #122D6B)' }}
                >
                  <MessageSquare size={14} strokeWidth={1.5} />
                  Message Dinuka
                </Link>
                <p className="text-xs font-sans text-fog text-center mt-2">Sign in to send a message</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
