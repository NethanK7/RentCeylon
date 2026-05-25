import { ScrollProgress } from '@/components/animations/ScrollProgress'
import { TextReveal } from '@/components/animations/TextReveal'
import { DepositProtection } from '@/components/ui/DepositProtection'
import { FeeTierBreakdown } from '@/components/ui/FeeTierBreakdown'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { TopRatedBadge } from '@/components/badges/earned/TopRatedBadge'
import { VerifiedItemBadge } from '@/components/badges/earned/VerifiedItemBadge'
import { FeaturedBadge } from '@/components/badges/paid/FeaturedBadge'
import { ListingGallery } from './ListingGallery'
import { BookingBar } from './BookingBar'
import { MapPin, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const MOCK_LISTING = {
  id: '1',
  title: 'Sony A7III Mirrorless Camera — Full Kit',
  location: 'Colombo 3, Western Province',
  dailyRate: 3500,
  depositAmount: 15000,
  description: `The Sony A7III is a full-frame mirrorless camera delivering exceptional image quality for photo and video work. This listing includes the camera body, 24-70mm f/2.8 G Master lens, two batteries, charger, SD cards, and a carrying case.

Perfect for weddings, commercial shoots, travel photography, and videography. The camera is in excellent condition, serviced monthly, and kept in a protective Pelican case when not in use.`,
  photos: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1452780212461-8c7fc93c7cc2?w=1200&auto=format&fit=crop',
  ],
  owner: { name: 'Dinuka Perera', avatarUrl: null, rating: 4.9, reviewCount: 47, responseRate: 98, memberSince: '2022' },
  rating: 4.9,
  reviewCount: 47,
  isFeatured: true,
  reviews: [
    { id: '1', reviewer: 'Kasun F.', rating: 5, comment: 'Incredible camera, pristine condition. Dinuka was very professional and flexible with pickup.', date: '2 weeks ago' },
    { id: '2', reviewer: 'Nithya R.', rating: 5, comment: 'Used for our wedding shoot. Absolutely worth it. The lens is sharp and the case is very well organized.', date: '1 month ago' },
    { id: '3', reviewer: 'Ashan K.', rating: 4, comment: "Great equipment. Minor scratch on the battery grip but it doesn't affect function. Would rent again.", date: '2 months ago' },
  ],
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = MOCK_LISTING

  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />

      {/* Gallery */}
      <div className="pt-16">
        <ListingGallery photos={listing.photos} title={listing.title} />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title + badges */}
            <div>
              {/* Promoted section */}
              {listing.isFeatured && (
                <div className="mb-3">
                  <p className="text-xs font-sans text-fog uppercase tracking-widest mb-2">Promoted</p>
                  <FeaturedBadge />
                </div>
              )}

              <TextReveal as="h1" className="font-heading text-ink text-3xl md:text-4xl mb-3 leading-tight">
                {listing.title}
              </TextReveal>

              <div className="flex items-center gap-3 flex-wrap mb-4">
                <div className="flex items-center gap-1 text-fog">
                  <MapPin size={14} strokeWidth={1.5} />
                  <span className="text-sm font-sans">{listing.location}</span>
                </div>
                <StarRating value={listing.rating} size={14} />
                <span className="text-sm font-sans text-fog">({listing.reviewCount} reviews)</span>
              </div>

              {/* Earned badges section — separate from promoted */}
              <div>
                <p className="text-xs font-sans text-fog uppercase tracking-widest mb-2">Earned Badges</p>
                <div className="flex flex-wrap gap-2">
                  <TopRatedBadge />
                  <VerifiedItemBadge />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-ink text-xl mb-4">About this listing</h2>
              <div className="font-sans text-slate text-base leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
            </div>

            {/* Owner */}
            <div className="p-6 rounded-card border border-border">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-heading text-royal"
                  style={{ background: '#EEF2FB', border: '2px solid #DDE3F0' }}
                >
                  {listing.owner.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading text-ink text-lg">{listing.owner.name}</h3>
                    <span className="text-xs font-sans text-fog">Member since {listing.owner.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-sans">
                    <div className="flex items-center gap-1">
                      <StarRating value={listing.owner.rating} size={12} />
                      <span className="text-fog">{listing.owner.rating}</span>
                    </div>
                    <span className="text-fog">{listing.owner.reviewCount} reviews</span>
                    <span className="text-fog">{listing.owner.responseRate}% response rate</span>
                  </div>
                </div>
                <Link
                  href="/profile/owner-id"
                  className="flex items-center gap-1 text-sm font-sans text-royal"
                >
                  View profile <ChevronRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            {/* Fee breakdown — shown inline before Book Now */}
            <FeeTierBreakdown rentalAmount={listing.dailyRate * 3} depositAmount={listing.depositAmount} />
            <DepositProtection amount={listing.depositAmount} />

            {/* Reviews */}
            <div>
              <h2 className="font-heading text-ink text-xl mb-6">
                Reviews <span className="text-fog text-base font-sans font-normal">({listing.reviewCount})</span>
              </h2>
              <div className="space-y-5">
                {listing.reviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-card border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-frost flex items-center justify-center text-sm font-heading text-slate">
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

          {/* Right: Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-card border border-border shadow-card-hover p-6">
                <PriceTag amount={listing.dailyRate} period="/day" size="lg" className="mb-6" />

                <div className="space-y-3 mb-6">
                  <div
                    data-hero-cta
                    className="flex items-center gap-3 p-3 rounded-card border border-border cursor-pointer hover:border-royal-light transition-colors"
                  >
                    <Calendar size={16} strokeWidth={1.5} className="text-fog" />
                    <span className="text-sm font-sans text-fog">Select dates</span>
                  </div>
                </div>

                <Link
                  href={`/bookings/new/${listing.id}`}
                  className="w-full py-4 rounded-full font-sans font-medium text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1A3D8F, #122D6B)' }}
                >
                  Book Now — LKR {listing.dailyRate.toLocaleString()}/day
                </Link>

                <p className="text-center text-xs font-sans text-fog mt-3">
                  Free cancellation 7+ days before pickup
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <BookingBar dailyRate={listing.dailyRate} listingId={listing.id} />
    </div>
  )
}
