'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListingCard } from '@/components/listings/ListingCard'
import { CardStagger } from '@/components/animations/CardStagger'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

const CATEGORIES = ['All', 'Vehicles', 'Electronics', 'Properties', 'Tools', 'Furniture']
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated']

const MOCK_LISTINGS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  title: ['Sony A7III Camera', 'Honda Civic Self-Drive', 'DJI Mavic 3', 'Luxury Villa Galle', 'Makita Drill Set', 'Canon 5D Mark IV', 'Toyota Prius', 'Gaming PC Setup', 'Pressure Washer', 'Electric Scooter', 'Studio Lights Kit', 'SUV — Defender'][i],
  location: ['Colombo 3', 'Kandy', 'Nugegoda', 'Galle', 'Gampaha', 'Colombo 7', 'Negombo', 'Rajagiriya', 'Moratuwa', 'Dehiwala', 'Colombo 5', 'Matara'][i],
  dailyRate: [3500, 6500, 8500, 45000, 1200, 5000, 5500, 4000, 2500, 1800, 3000, 12000][i],
  coverImageUrl: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618047-f4e90abd5d24?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop',
  ][i],
  rating: [4.9, 4.6, 4.7, 5.0, 4.3, 4.8, 4.5, 4.4, 4.2, 4.6, 4.7, 4.9][i],
  reviewCount: [47, 89, 23, 12, 34, 31, 67, 18, 22, 41, 28, 9][i],
  isFeatured: [true, false, false, true, false, false, false, false, false, false, true, false][i],
  isSponsored: [false, false, true, false, false, false, false, false, false, false, false, false][i],
  earnedBadges: [
    ['TOP_RATED', 'VERIFIED_ITEM'],
    ['VERIFIED_ITEM'],
    ['FAST_RESPONDER'],
    ['TOP_RATED'],
    [],
    ['TOP_RATED', 'FAST_RESPONDER'],
    ['VERIFIED_ITEM'],
    [],
    [],
    ['FAST_RESPONDER'],
    ['TOP_RATED'],
    ['VERIFIED_ITEM'],
  ][i] as ('TOP_RATED' | 'VERIFIED_ITEM' | 'FAST_RESPONDER')[],
}))

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSort, setActiveSort] = useState('Newest')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [loading] = useState(false)

  const removeFilter = (filter: string) => {
    setActiveFilters((f) => f.filter((x) => x !== filter))
  }

  const sponsored = MOCK_LISTINGS.filter((l) => l.isSponsored)
  const regular = MOCK_LISTINGS.filter((l) => !l.isSponsored)

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky filter bar */}
      <div className="sticky top-[60px] z-40 bg-white border-b border-ink/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          {/* Search row */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 border border-border bg-snow focus-within:border-royal transition-colors duration-200">
              <Search size={14} strokeWidth={1.5} className="text-fog shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings..."
                className="flex-1 bg-transparent font-sans text-sm text-ink placeholder-fog/50 outline-none"
                style={{ fontSize: 16 }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={12} strokeWidth={1.5} className="text-fog hover:text-ink transition-colors" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 px-4 py-3 border border-border font-mono text-[11px] uppercase tracking-[0.1em] text-slate hover:border-royal hover:text-royal transition-colors"
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filters
              {activeFilters.length > 0 && (
                <span className="w-4 h-4 bg-royal text-white text-[10px] font-mono flex items-center justify-center">{activeFilters.length}</span>
              )}
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-all border"
                style={{
                  background: activeCategory === cat ? '#1A3D8F' : 'transparent',
                  color: activeCategory === cat ? '#FFFFFF' : '#8A97B5',
                  borderColor: activeCategory === cat ? '#1A3D8F' : 'transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {activeFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => removeFilter(f)}
                  className="flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white"
                  style={{ background: '#1A3D8F' }}
                >
                  {f} <X size={9} strokeWidth={2} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Sort + count row */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-fog">
            {MOCK_LISTINGS.length} listings
          </p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-fog">Sort:</span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="font-mono text-[11px] text-ink bg-transparent border-none outline-none cursor-pointer uppercase tracking-[0.06em]"
            >
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Sponsored section */}
        {sponsored.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-sans text-fog uppercase tracking-widest mb-4">Promoted Listings</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsored.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="my-8 h-px" style={{ background: 'rgba(201,151,58,0.2)' }} />
          </div>
        )}

        {/* Main grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : regular.length === 0 ? (
          <EmptyState
            title="No listings found"
            description="Try adjusting your filters or search query"
          />
        ) : (
          <CardStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regular.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </CardStagger>
        )}
      </div>
    </div>
  )
}
