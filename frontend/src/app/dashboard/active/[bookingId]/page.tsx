'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Calendar, User, ArrowLeft, ChevronRight, Shield } from 'lucide-react'
import { ContactRevealed } from '@/components/contact/ContactRevealed'
import { ConditionPhotoSlots } from '@/components/listings/ConditionPhotoSlots'
import { formatLKR } from '@/lib/utils'

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_BOOKING = {
  id: 'bk_001',
  title: 'Canon EOS R6 Mark II + 24-105mm Kit',
  image: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=1200&q=80',
  startDate: '24 May 2026',
  endDate: '30 May 2026',
  listerName: 'Kavindu Perera',
  address: '42 Galle Road, Colombo 03',
  phone: '+94 77 123 4567',
  depositAmount: 25000,
  depositStatus: 'HELD',
}

const CONDITION_SLOTS = [
  { party: 'OWNER' as const, type: 'PICKUP' as const, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80' },
  { party: 'RENTER' as const, type: 'PICKUP' as const, imageUrl: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?w=400&q=80' },
  { party: 'OWNER' as const, type: 'RETURN' as const },
  { party: 'RENTER' as const, type: 'RETURN' as const },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function ActiveRentalPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const booking = MOCK_BOOKING

  return (
    <main className="min-h-screen bg-snow pb-24">

      {/* ── Hero ── */}
      <div className="relative h-[55vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={booking.image}
            alt={booking.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-sans hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            Dashboard
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-xs text-white/70 mb-1 uppercase tracking-widest">Active Rental</p>
            <h1 className="font-display text-3xl text-white leading-tight">{booking.title}</h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-8">

        {/* ── Booking Info ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border border-frost rounded-card overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-frost">
            <p className="text-sm font-sans font-medium text-ink">Booking Details</p>
          </div>
          <div className="divide-y divide-frost">
            <div className="flex items-center gap-3 px-5 py-4">
              <Calendar size={16} strokeWidth={1.5} className="text-gold shrink-0" />
              <div>
                <p className="text-xs font-sans text-slate">Rental Period</p>
                <p className="text-sm font-sans text-ink font-medium">
                  {booking.startDate} — {booking.endDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <User size={16} strokeWidth={1.5} className="text-gold shrink-0" />
              <div>
                <p className="text-xs font-sans text-slate">Listed by</p>
                <p className="text-sm font-sans text-ink font-medium">{booking.listerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <MapPin size={16} strokeWidth={1.5} className="text-gold shrink-0" />
              <div>
                <p className="text-xs font-sans text-slate">Pickup Address</p>
                <p className="text-sm font-sans text-ink font-medium">{booking.address}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Contact ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <h2 className="font-heading text-xl text-ink">Contact Lister</h2>
          <ContactRevealed phone={booking.phone} name={booking.listerName} />
        </motion.section>

        {/* ── Condition Photos ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <h2 className="font-heading text-xl text-ink">Condition Photos</h2>
          <ConditionPhotoSlots slots={CONDITION_SLOTS} editableParty="RENTER" />
        </motion.section>

        {/* ── Deposit Status ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-card overflow-hidden"
          style={{ background: '#FDF6E3', border: '1.5px solid rgba(201,151,58,0.3)' }}
        >
          <div className="px-5 py-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(201,151,58,0.15)' }}
              >
                <Shield size={18} strokeWidth={1.5} style={{ color: '#C9973A' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-sans font-medium text-ink">Deposit</p>
                  <span
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: '#C9973A', color: '#fff' }}
                  >
                    {booking.depositStatus}
                  </span>
                </div>
                <p className="text-xl font-mono" style={{ color: '#C9973A' }}>
                  {formatLKR(booking.depositAmount)}
                </p>
              </div>
            </div>
            <p className="text-xs font-sans text-slate text-right leading-relaxed max-w-[130px]">
              Protected by<br />
              <span className="font-medium text-ink">RentLoop</span>
            </p>
          </div>
        </motion.div>

        {/* ── Return CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={`/dashboard/return/${bookingId}`}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-card font-sans font-medium text-white text-sm transition-opacity hover:opacity-90"
            style={{ background: '#C9973A' }}
          >
            Start Return Process
            <ChevronRight size={16} strokeWidth={2} />
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
