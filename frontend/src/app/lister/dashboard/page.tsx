'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import {
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  Home,
  Plus,
  ChevronRight,
  Edit,
  Settings,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingBooking {
  id: string
  renterName: string
  renterAvatar: string
  listingName: string
  startDate: string
  endDate: string
  price: number
  requestedAt: Date
}

interface ActiveListing {
  id: string
  title: string
  coverImage: string
  dailyRate: number
  status: 'active' | 'draft' | 'paused'
  bookings: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_BOOKINGS: PendingBooking[] = [
  {
    id: 'bk1',
    renterName: 'Amali Perera',
    renterAvatar: 'AP',
    listingName: 'Canon EOS R5 Camera Kit',
    startDate: 'Jun 2',
    endDate: 'Jun 5',
    price: 12500,
    requestedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
  },
  {
    id: 'bk2',
    renterName: 'Kasun Fernando',
    renterAvatar: 'KF',
    listingName: 'DJI Mavic 3 Drone',
    startDate: 'Jun 7',
    endDate: 'Jun 8',
    price: 8000,
    requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 'bk3',
    renterName: 'Dilani Silva',
    renterAvatar: 'DS',
    listingName: 'Sony A7 IV + 50mm',
    startDate: 'Jun 10',
    endDate: 'Jun 12',
    price: 9500,
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
]

const MOCK_LISTINGS: ActiveListing[] = [
  {
    id: 'l1',
    title: 'Canon EOS R5 Camera Kit',
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80',
    dailyRate: 4500,
    status: 'active',
    bookings: 12,
  },
  {
    id: 'l2',
    title: 'DJI Mavic 3 Drone',
    coverImage: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=200&q=80',
    dailyRate: 8000,
    status: 'active',
    bookings: 7,
  },
  {
    id: 'l3',
    title: 'Sony A7 IV + 50mm Lens',
    coverImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&q=80',
    dailyRate: 3500,
    status: 'paused',
    bookings: 4,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hoursAgo(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60)
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-LK')}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  mono,
  gold,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  mono?: boolean
  gold?: boolean
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-[#DDE3F0] rounded-card p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-card bg-[#EEF2FB] flex items-center justify-center text-[#1A3D8F]">
          {icon}
        </div>
        {sub && (
          <span className="text-xs font-sans text-[#8A97B5] bg-[#F0F3F9] px-2 py-1 rounded-full">
            {sub}
          </span>
        )}
      </div>
      <p className="text-sm font-sans text-[#8A97B5] mb-1">{label}</p>
      <p
        className={`text-2xl font-semibold tracking-tight ${
          mono ? 'font-mono text-[#C9973A]' : gold ? 'font-sans text-[#0C1124]' : 'font-sans text-[#0C1124]'
        }`}
      >
        {value}
      </p>
    </motion.div>
  )
}

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(rating) ? 'fill-[#C9973A] text-[#C9973A]' : 'text-[#DDE3F0] fill-[#DDE3F0]'}
        />
      ))}
    </div>
  )
}

function PendingBookingItem({
  booking,
  onAccept,
  onDecline,
}: {
  booking: PendingBooking
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}) {
  const hours = hoursAgo(booking.requestedAt)
  const isWarning = hours >= 24

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="flex items-center gap-4 p-4 bg-white border border-[#DDE3F0] rounded-card"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#EEF2FB] flex items-center justify-center shrink-0">
        <span className="text-sm font-sans font-semibold text-[#1A3D8F]">{booking.renterAvatar}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-sans font-semibold text-[#0C1124] truncate">{booking.renterName}</p>
          {isWarning && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="w-2 h-2 rounded-full bg-red-500 shrink-0"
            />
          )}
        </div>
        <p className="text-xs font-sans text-[#8A97B5] truncate">{booking.listingName}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs font-sans text-[#3D4F73]">
            {booking.startDate} – {booking.endDate}
          </span>
          <span className="text-xs font-mono font-semibold text-[#C9973A]">
            {formatCurrency(booking.price)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onAccept(booking.id)}
          className="px-4 py-1.5 bg-[#1A3D8F] text-white text-xs font-sans font-medium rounded-card hover:bg-[#122D6B] transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(booking.id)}
          className="px-4 py-1.5 border border-[#DDE3F0] text-[#3D4F73] text-xs font-sans font-medium rounded-card hover:bg-[#F0F3F9] transition-colors"
        >
          Decline
        </button>
      </div>
    </motion.div>
  )
}

function ActiveListingCard({ listing }: { listing: ActiveListing }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-[#DDE3F0] rounded-card hover:shadow-card-hover transition-shadow duration-300">
      <div className="w-16 h-16 rounded-card overflow-hidden shrink-0 bg-[#F0F3F9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.coverImage}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNGMEYzRjkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjBGM0Y5Ii8+PC9zdmc+'
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans font-semibold text-[#0C1124] truncate mb-1">{listing.title}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#C9973A] font-medium">
            {formatCurrency(listing.dailyRate)}/day
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-sans ${
              listing.status === 'active'
                ? 'bg-emerald-50 text-emerald-700'
                : listing.status === 'paused'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-[#F0F3F9] text-[#8A97B5]'
            }`}
          >
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </span>
        </div>
        <p className="text-xs font-sans text-[#8A97B5] mt-0.5">{listing.bookings} bookings total</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/lister/listings/${listing.id}/edit`}
          className="w-8 h-8 flex items-center justify-center rounded-card border border-[#DDE3F0] text-[#8A97B5] hover:text-[#1A3D8F] hover:border-[#1A3D8F] transition-colors"
        >
          <Edit size={14} />
        </Link>
        <Link
          href={`/lister/listings/${listing.id}`}
          className="w-8 h-8 flex items-center justify-center rounded-card border border-[#DDE3F0] text-[#8A97B5] hover:text-[#1A3D8F] hover:border-[#1A3D8F] transition-colors"
        >
          <Settings size={14} />
        </Link>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ListerDashboardPage() {
  const isVerified = false // mock: toggle to test banner
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>(MOCK_BOOKINGS)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
    )
  }, [])

  const handleAccept = (id: string) => {
    // Optimistic: remove from pending (would call API in real app)
    setPendingBookings((prev) => prev.filter((b) => b.id !== id))
  }

  const handleDecline = (id: string) => {
    setPendingBookings((prev) => prev.filter((b) => b.id !== id))
  }

  const avgRating = 4.7
  const monthRevenue = 87500

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Header */}
      <div ref={headerRef} className="bg-white border-b border-[#DDE3F0] px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-sans text-[#8A97B5] mb-1">Welcome back</p>
          <h1 className="font-heading text-3xl text-[#0C1124]">Lister Dashboard</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8 space-y-8">
        {/* ID Verification Banner */}
        <AnimatePresence>
          {!isVerified && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between gap-4 bg-[#FDF7ED] border border-[#C9973A]/30 rounded-card px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-card bg-[#C9973A]/15 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-[#C9973A]" />
                </div>
                <div>
                  <p className="text-sm font-sans font-semibold text-[#0C1124]">
                    Complete ID verification to start listing
                  </p>
                  <p className="text-xs font-sans text-[#8A97B5] mt-0.5">
                    Verify your identity to unlock all lister features and accept bookings.
                  </p>
                </div>
              </div>
              <Link
                href="/auth/verify-id"
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#C9973A] text-white text-sm font-sans font-medium rounded-card hover:bg-[#A67928] transition-colors whitespace-nowrap"
              >
                Verify Now
                <ChevronRight size={14} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Home size={18} />}
            label="Active Listings"
            value="3"
            sub="+1 this week"
            delay={0.1}
          />
          <StatCard
            icon={<Calendar size={18} />}
            label="Total Bookings"
            value="23"
            sub="All time"
            delay={0.2}
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="This Month Revenue"
            value={formatCurrency(monthRevenue)}
            mono
            delay={0.3}
          />
          <StatCard
            icon={
              <div className="flex">
                <StarRatingDisplay rating={avgRating} />
              </div>
            }
            label="Average Rating"
            value={`${avgRating} / 5`}
            sub="18 reviews"
            delay={0.4}
          />
        </div>

        {/* Pending Bookings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl text-[#0C1124]">Pending Requests</h2>
            <Link
              href="/lister/bookings"
              className="text-sm font-sans text-[#1A3D8F] flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {pendingBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white border border-[#DDE3F0] rounded-card"
            >
              <CheckCircle size={32} className="mx-auto text-emerald-400 mb-3" />
              <p className="font-sans text-sm text-[#8A97B5]">All caught up — no pending requests</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {pendingBookings.map((booking) => (
                  <PendingBookingItem
                    key={booking.id}
                    booking={booking}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Active Listings Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl text-[#0C1124]">Your Listings</h2>
            <Link
              href="/lister/listings"
              className="text-sm font-sans text-[#1A3D8F] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Manage all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_LISTINGS.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
              >
                <ActiveListingCard listing={listing} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Gold FAB */}
      <Link
        href="/lister/listings/create"
        className="fixed bottom-8 right-8 z-50"
        aria-label="Create new listing"
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-14 h-14 rounded-full bg-[#C9973A] flex items-center justify-center shadow-gold text-white"
        >
          <Plus size={24} strokeWidth={2.5} />
        </motion.div>
      </Link>
    </div>
  )
}
