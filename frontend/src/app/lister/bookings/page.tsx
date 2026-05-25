'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import Link from 'next/link'
import { ConditionPhotoSlots } from '@/components/listings/ConditionPhotoSlots'
import {
  Calendar,
  ChevronRight,
  Star,
  Package,
  Clock,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface PhotoSlot {
  party: 'OWNER' | 'RENTER'
  type: 'PICKUP' | 'RETURN'
  imageUrl?: string
  uploadedAt?: string
}

interface Booking {
  id: string
  renterName: string
  renterAvatar: string
  listingName: string
  listingThumb: string
  startDate: string
  endDate: string
  totalPrice: number
  status: BookingStatus
  requestedAt: Date
  photoSlots?: PhotoSlot[]
}

type TabKey = BookingStatus

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk1',
    renterName: 'Amali Perera',
    renterAvatar: 'AP',
    listingName: 'Canon EOS R5 Camera Kit',
    listingThumb: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&q=80',
    startDate: 'Jun 2',
    endDate: 'Jun 5',
    totalPrice: 13500,
    status: 'pending',
    requestedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25hr ago
  },
  {
    id: 'bk2',
    renterName: 'Kasun Fernando',
    renterAvatar: 'KF',
    listingName: 'DJI Mavic 3 Drone',
    listingThumb: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=120&q=80',
    startDate: 'Jun 7',
    endDate: 'Jun 8',
    totalPrice: 8000,
    status: 'pending',
    requestedAt: new Date(Date.now() - 13 * 60 * 60 * 1000), // 13hr ago
  },
  {
    id: 'bk3',
    renterName: 'Dilani Silva',
    renterAvatar: 'DS',
    listingName: 'Sony A7 IV + 50mm Lens',
    listingThumb: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=120&q=80',
    startDate: 'Jun 10',
    endDate: 'Jun 12',
    totalPrice: 7000,
    status: 'confirmed',
    requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    photoSlots: [
      { party: 'OWNER', type: 'PICKUP', imageUrl: undefined },
      { party: 'RENTER', type: 'PICKUP', imageUrl: undefined },
      { party: 'OWNER', type: 'RETURN', imageUrl: undefined },
      { party: 'RENTER', type: 'RETURN', imageUrl: undefined },
    ],
  },
  {
    id: 'bk4',
    renterName: 'Nuwan Jayawardena',
    renterAvatar: 'NJ',
    listingName: 'Canon EOS R5 Camera Kit',
    listingThumb: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&q=80',
    startDate: 'May 20',
    endDate: 'May 22',
    totalPrice: 9000,
    status: 'completed',
    requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'bk5',
    renterName: 'Thilini Rajapaksa',
    renterAvatar: 'TR',
    listingName: 'GoPro Hero 12 Black',
    listingThumb: 'https://images.unsplash.com/photo-1551818255-e9c03e92f2e8?w=120&q=80',
    startDate: 'May 15',
    endDate: 'May 16',
    totalPrice: 1800,
    status: 'cancelled',
    requestedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
]

const TABS: { key: TabKey; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return `Rs. ${n.toLocaleString('en-LK')}`
}

function hoursAgo(date: Date) {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60)
}

function statusBadge(status: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-[#EEF2FB] text-[#1A3D8F]',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
  }
  return map[status]
}

// ─── Warning Dot ──────────────────────────────────────────────────────────────

function WarningDot({ requestedAt }: { requestedAt: Date }) {
  const hours = hoursAgo(requestedAt)
  if (hours < 12) return null

  const isRed = hours >= 23
  return (
    <motion.span
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ repeat: Infinity, duration: isRed ? 0.8 : 1.4, ease: 'easeInOut' }}
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${isRed ? 'bg-red-500' : 'bg-amber-400'}`}
      title={isRed ? 'Expires soon — respond now!' : 'Request over 12 hours old'}
    />
  )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onAccept,
  onDecline,
}: {
  booking: Booking
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}) {
  const isPending = booking.status === 'pending'
  const isConfirmed = booking.status === 'confirmed'
  const isCompleted = booking.status === 'completed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="bg-white border border-[#DDE3F0] rounded-card overflow-hidden shadow-card"
    >
      {/* Card top row */}
      <div className="flex items-start gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-card overflow-hidden shrink-0 bg-[#F0F3F9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={booking.listingThumb}
            alt={booking.listingName}
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {/* Renter avatar + name */}
            <div className="w-6 h-6 rounded-full bg-[#EEF2FB] flex items-center justify-center shrink-0">
              <span className="text-[9px] font-sans font-bold text-[#1A3D8F]">{booking.renterAvatar}</span>
            </div>
            <span className="text-sm font-sans font-semibold text-[#0C1124]">{booking.renterName}</span>
            {isPending && <WarningDot requestedAt={booking.requestedAt} />}
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-sans ${statusBadge(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <p className="text-xs font-sans text-[#8A97B5] truncate mb-2">{booking.listingName}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-sans text-[#3D4F73] flex items-center gap-1">
              <Calendar size={11} />
              {booking.startDate} – {booking.endDate}
            </span>
            <span className="text-sm font-mono font-semibold text-[#C9973A]">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Pending: Accept / Decline */}
      {isPending && (
        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={() => onAccept(booking.id)}
            className="flex-1 py-2 bg-[#1A3D8F] text-white text-xs font-sans font-medium rounded-card hover:bg-[#122D6B] transition-colors"
          >
            Accept Booking
          </button>
          <button
            onClick={() => onDecline(booking.id)}
            className="flex-1 py-2 border border-[#DDE3F0] text-[#3D4F73] text-xs font-sans font-medium rounded-card hover:bg-[#F0F3F9] transition-colors"
          >
            Decline
          </button>
        </div>
      )}

      {/* Confirmed: Condition Photos */}
      {isConfirmed && booking.photoSlots && (
        <div className="px-4 pb-4 border-t border-[#F0F3F9] pt-4">
          <p className="text-xs font-sans font-semibold text-[#3D4F73] uppercase tracking-wider mb-3">
            Condition Photos
          </p>
          <ConditionPhotoSlots
            slots={booking.photoSlots}
            editableParty="OWNER"
            onUpload={async (party, type, _file) => {
              // Mock upload handler
              console.log('Upload:', party, type)
            }}
          />
        </div>
      )}

      {/* Completed: Leave Review */}
      {isCompleted && (
        <div className="px-4 pb-4 border-t border-[#F0F3F9] pt-3 flex items-center justify-between">
          <p className="text-xs font-sans text-[#8A97B5]">Booking complete</p>
          <Link
            href={`/reviews/write?booking=${booking.id}`}
            className="flex items-center gap-1 text-xs font-sans font-medium text-[#1A3D8F] hover:underline"
          >
            <Star size={11} className="fill-[#C9973A] text-[#C9973A]" />
            Leave a Review
            <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IncomingBookingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS)
  const headerRef = useRef<HTMLDivElement>(null)


  const filtered = bookings.filter((b) => b.status === activeTab)

  const handleAccept = (id: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: 'confirmed' as BookingStatus,
              photoSlots: [
                { party: 'OWNER' as const, type: 'PICKUP' as const },
                { party: 'RENTER' as const, type: 'PICKUP' as const },
                { party: 'OWNER' as const, type: 'RETURN' as const },
                { party: 'RENTER' as const, type: 'RETURN' as const },
              ],
            }
          : b
      )
    )
    // Switch to confirmed tab
    setActiveTab('confirmed')
  }

  const handleDecline = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b))
    )
  }

  const tabCounts: Record<TabKey, number> = {
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

  const emptyMessages: Record<TabKey, { title: string; body: string }> = {
    pending: {
      title: 'No pending requests',
      body: 'When renters request your listings, they will appear here for you to accept or decline.',
    },
    confirmed: {
      title: 'No confirmed bookings',
      body: 'Accepted bookings will show here along with condition photo upload slots.',
    },
    completed: {
      title: 'No completed bookings yet',
      body: 'Once bookings are finished, you can leave reviews and see your history here.',
    },
    cancelled: {
      title: 'No cancelled bookings',
      body: 'Declined or cancelled bookings will appear in this tab.',
    },
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-16">
      {/* Header */}
      <div ref={headerRef} className="bg-white border-b border-[#DDE3F0] px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-sans text-[#8A97B5] mb-1">Manage</p>
          <h1 className="font-heading text-3xl text-[#0C1124]">Incoming Bookings</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-6 space-y-6">
        {/* Filter Tabs */}
        <LayoutGroup>
          <div className="flex gap-1 bg-white border border-[#DDE3F0] rounded-card p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-card text-sm font-sans font-medium transition-colors z-10 ${
                  activeTab === tab.key ? 'text-[#0C1124]' : 'text-[#8A97B5] hover:text-[#3D4F73]'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="booking-tab-pill"
                    className="absolute inset-0 bg-[#F0F3F9] rounded-card"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10 truncate">{tab.label}</span>
                {tabCounts[tab.key] > 0 && (
                  <span
                    className={`relative z-10 text-xs px-1.5 py-0.5 rounded-full font-mono ${
                      activeTab === tab.key
                        ? tab.key === 'pending'
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#1A3D8F] text-white'
                        : 'bg-[#F0F3F9] text-[#8A97B5]'
                    }`}
                  >
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </LayoutGroup>

        {/* Pending notice */}
        <AnimatePresence>
          {activeTab === 'pending' && tabCounts.pending > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-card"
            >
              <Clock size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs font-sans text-amber-700">
                Respond within 24 hours to maintain your response rate. Requests older than 24hrs are flagged
                with a{' '}
                <span className="inline-flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  <strong>red dot</strong>
                </span>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bookings List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))
            ) : (
              <motion.div
                key={`empty-${activeTab}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 bg-white border border-[#DDE3F0] rounded-card"
              >
                <div className="w-16 h-16 rounded-card bg-[#F0F3F9] flex items-center justify-center mb-4">
                  <Package size={28} className="text-[#8A97B5]" />
                </div>
                <p className="font-heading text-xl text-[#0C1124] mb-2">
                  {emptyMessages[activeTab].title}
                </p>
                <p className="text-sm font-sans text-[#8A97B5] text-center max-w-xs leading-relaxed">
                  {emptyMessages[activeTab].body}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
