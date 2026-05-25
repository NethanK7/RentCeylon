'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Heart } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PriceTag } from '@/components/ui/PriceTag'
import { StarRating } from '@/components/ui/StarRating'
import { TopRatedBadge } from '@/components/badges/earned/TopRatedBadge'
import { VerifiedItemBadge } from '@/components/badges/earned/VerifiedItemBadge'
import { FastResponderBadge } from '@/components/badges/earned/FastResponderBadge'
import { FeaturedBadge } from '@/components/badges/paid/FeaturedBadge'
import { SponsoredBadge } from '@/components/badges/paid/SponsoredBadge'
import { cn } from '@/lib/utils'

export interface ListingCardData {
  id: string
  title: string
  location: string
  dailyRate: number
  coverImageUrl: string
  rating: number
  reviewCount: number
  isFeatured?: boolean
  isSponsored?: boolean
  earnedBadges?: ('TOP_RATED' | 'VERIFIED_ITEM' | 'FAST_RESPONDER')[]
}

interface ListingCardProps {
  listing: ListingCardData
  className?: string
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const [liked, setLiked] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div
        data-cursor="card"
        className={cn('bg-white relative overflow-hidden transition-all duration-300', className)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Blue left-border reveal on hover — the Ferrari stripe */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-royal z-10"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: hovered ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'top' }}
        />

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-frost">
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            data-cursor="image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Precision overlay — darker at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />

          {/* Wishlist */}
          <button
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.preventDefault(); setLiked((l) => !l) }}
            aria-label="Save listing"
          >
            <Heart
              size={13}
              strokeWidth={1.5}
              style={{ fill: liked ? '#B91C1C' : 'none', color: liked ? '#B91C1C' : '#0C1124' }}
            />
          </button>

          {/* Featured shimmer */}
          {listing.isFeatured && (
            <div className="absolute inset-0 gold-shimmer-bg pointer-events-none" />
          )}

          {/* Promoted badge zone — image lower-left */}
          {(listing.isFeatured || listing.isSponsored) && (
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
              {listing.isFeatured && <FeaturedBadge />}
              {listing.isSponsored && <SponsoredBadge />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 border-t border-ink/6">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              className="font-heading text-ink leading-snug line-clamp-1 flex-1 transition-colors duration-200 group-hover:text-royal"
              style={{ fontSize: '1.1rem' }}
            >
              {listing.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 mb-3">
            <MapPin size={11} strokeWidth={1.5} className="text-fog/70 shrink-0" />
            <span className="font-mono text-[11px] text-fog/70 uppercase tracking-[0.08em] truncate">{listing.location}</span>
          </div>

          {/* Earned badges — completely separate zone from promoted */}
          {listing.earnedBadges && listing.earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.earnedBadges.includes('TOP_RATED') && <TopRatedBadge />}
              {listing.earnedBadges.includes('VERIFIED_ITEM') && <VerifiedItemBadge />}
              {listing.earnedBadges.includes('FAST_RESPONDER') && <FastResponderBadge />}
            </div>
          )}

          {/* Price + Rating */}
          <div className="flex items-center justify-between pt-3 border-t border-ink/6">
            <PriceTag amount={listing.dailyRate} period="/day" />
            <div className="flex items-center gap-1.5">
              <StarRating value={listing.rating} size={11} />
              <span className="font-mono text-[11px] text-fog/70 tabular-nums">({listing.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
