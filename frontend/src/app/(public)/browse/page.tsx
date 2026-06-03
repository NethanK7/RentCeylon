'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react'
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
  const [_showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [loading] = useState(false)

  const removeFilter = (filter: string) => setActiveFilters((f) => f.filter((x) => x !== filter))

  const sponsored = MOCK_LISTINGS.filter((l) => l.isSponsored)
  const regular = MOCK_LISTINGS.filter((l) => !l.isSponsored)

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FB' }}>

      {/* ── Page hero ── */}
      <div className="bg-white border-b border-black/5 pt-[62px]">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="section-label mb-2">Marketplace</p>
              <h1 className="font-sans text-3xl md:text-4xl font-bold text-ink tracking-tight leading-tight">
                Find anything.<br className="md:hidden" /> Rent today.
              </h1>
            </div>
            <p className="font-sans text-sm text-fog max-w-xs leading-relaxed">
              {MOCK_LISTINGS.length} listings across Sri Lanka — cameras, cars, villas, gear & more.
            </p>
          </div>
        </div>

        {/* ── Sticky search + filter bar ── */}
        <div className="sticky top-[62px] z-40 bg-white/90 border-b border-black/5"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div className="max-w-[1200px] mx-auto px-6 py-3">

            <div className="flex gap-2 mb-3">
              {/* Search */}
              <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-black/08 bg-[#F8F9FB] focus-within:border-royal focus-within:ring-2 focus-within:ring-royal/10 transition-all">
                <Search size={14} strokeWidth={2} className="text-fog shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                  className="flex-1 bg-transparent font-sans text-sm text-ink placeholder:text-fog/60 outline-none"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className="w-4 h-4 rounded-full bg-fog/20 flex items-center justify-center hover:bg-fog/30 transition-colors"
                    >
                      <X size={9} strokeWidth={2.5} className="text-fog" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/08 bg-[#F8F9FB] hover:border-royal hover:bg-royal/5 text-slate text-xs font-medium transition-all"
              >
                <SlidersHorizontal size={13} strokeWidth={1.5} />
                Filters
                {activeFilters.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-royal text-white text-[9px] font-bold flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                  style={
                    activeCategory === cat
                      ? { background: '#1A3D8F', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(26,61,143,0.25)' }
                      : { background: 'transparent', color: '#8A97B5', border: '1px solid transparent' }
                  }
                  onMouseEnter={e => { if (activeCategory !== cat) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)' }}
                  onMouseLeave={e => { if (activeCategory !== cat) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Active filter chips */}
            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-2 mt-2.5 flex-wrap overflow-hidden"
                >
                  {activeFilters.map((f) => (
                    <button
                      key={f}
                      onClick={() => removeFilter(f)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal/10 text-royal text-xs font-medium hover:bg-royal/20 transition-colors"
                    >
                      {f} <X size={9} strokeWidth={2.5} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        {/* Sort row */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-sans text-sm font-semibold text-ink">
            {MOCK_LISTINGS.length} <span className="font-normal text-fog">listings</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs text-fog">Sort:</span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="font-sans text-xs font-medium text-ink bg-white border border-black/08 rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-black/15 transition-colors"
            >
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Sponsored */}
        {sponsored.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={12} strokeWidth={1.5} className="text-gold" />
              <p className="font-sans text-xs font-medium text-gold uppercase tracking-widest">Promoted</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sponsored.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          </div>
        )}

        {/* Main grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : regular.length === 0 ? (
          <EmptyState title="No listings found" description="Try adjusting your filters or search query" />
        ) : (
          <CardStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </CardStagger>
        )}
      </div>
    </div>
  )
}
