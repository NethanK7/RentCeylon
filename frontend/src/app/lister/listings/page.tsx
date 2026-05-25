'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import {
  Plus,
  Edit,
  Pause,
  Play,
  Trash2,
  Share2,
  Zap,
  X,
  ChevronRight,
  Star,
  Package,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ListingStatus = 'active' | 'draft' | 'paused'
type TabKey = 'all' | ListingStatus

interface Listing {
  id: string
  title: string
  coverImage: string
  dailyRate: number
  status: ListingStatus
  bookings: number
  rating: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Canon EOS R5 Camera Kit',
    coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80',
    dailyRate: 4500,
    status: 'active',
    bookings: 12,
    rating: 4.8,
  },
  {
    id: 'l2',
    title: 'DJI Mavic 3 Drone',
    coverImage: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=200&q=80',
    dailyRate: 8000,
    status: 'active',
    bookings: 7,
    rating: 4.6,
  },
  {
    id: 'l3',
    title: 'Sony A7 IV + 50mm Lens',
    coverImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&q=80',
    dailyRate: 3500,
    status: 'paused',
    bookings: 4,
    rating: 4.9,
  },
  {
    id: 'l4',
    title: 'GoPro Hero 12 Black',
    coverImage: 'https://images.unsplash.com/photo-1551818255-e9c03e92f2e8?w=200&q=80',
    dailyRate: 1800,
    status: 'draft',
    bookings: 0,
    rating: 0,
  },
]

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'paused', label: 'Paused' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return `Rs. ${n.toLocaleString('en-LK')}`
}

function statusColor(s: ListingStatus) {
  if (s === 'active') return 'bg-emerald-50 text-emerald-700'
  if (s === 'paused') return 'bg-amber-50 text-amber-700'
  return 'bg-[#F0F3F9] text-[#8A97B5]'
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
}

function ConfettiCanvas({ origin }: { origin: { x: number; y: number } }) {
  const colors = ['#C9973A', '#1A3D8F', '#E8BC6A', '#0C1124', '#FDF7ED', '#4A7FD4']
  const particles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: origin.x,
    y: origin.y,
    color: colors[i % colors.length],
    rotation: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => {
        const angle = (p.id / 12) * 360
        const rad = (angle * Math.PI) / 180
        const dist = 80 + Math.random() * 80
        const tx = Math.cos(rad) * dist
        const ty = Math.sin(rad) * dist - 60

        return (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1, rotate: 0 }}
            animate={{
              x: p.x + tx,
              y: p.y + ty,
              opacity: 0,
              scale: 0.4,
              rotate: p.rotation,
            }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: p.id * 0.02 }}
            className="absolute w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: p.color }}
          />
        )
      })}
    </div>
  )
}

// ─── Promote Bottom Sheet ──────────────────────────────────────────────────────

function PromoteBottomSheet({
  listing,
  onClose,
}: {
  listing: Listing
  onClose: () => void
}) {
  const [selectedPlan, setSelectedPlan] = useState<'featured' | 'sponsored' | null>(null)
  const [activated, setActivated] = useState(false)
  const dragY = useMotionValue(0)
  const sheetOpacity = useTransform(dragY, [0, 120], [1, 0])

  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y > 100) onClose()
  }

  const handleActivate = () => {
    if (!selectedPlan) return
    setActivated(true)
    setTimeout(onClose, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0C1124]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y: dragY, opacity: sheetOpacity }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl pb-8 overflow-hidden"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 bg-[#DDE3F0] rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#F0F3F9] text-[#8A97B5] hover:text-[#0C1124] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="px-6">
          <p className="text-xs font-sans text-[#8A97B5] uppercase tracking-widest mb-1">Promote listing</p>
          <h3 className="font-heading text-2xl text-[#0C1124] mb-1">{listing.title}</h3>
          <p className="text-sm font-sans text-[#8A97B5] mb-6">
            Boost your listing&apos;s visibility and get more bookings.
          </p>

          {/* Plans */}
          <div className="space-y-3 mb-6">
            {/* Featured Plan */}
            <button
              onClick={() => setSelectedPlan('featured')}
              className={`w-full text-left p-4 rounded-card border-2 transition-all ${
                selectedPlan === 'featured'
                  ? 'border-[#E8BC6A] bg-[#FDF7ED]'
                  : 'border-[#DDE3F0] bg-white hover:border-[#E8BC6A]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                {/* FeaturedBadge preview */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #E8BC6A, #C9973A, #E8BC6A)',
                    backgroundSize: '200% 200%',
                    color: '#fff',
                    border: '1px solid #E8BC6A',
                    boxShadow: '0 2px 8px rgba(201,151,58,0.35)',
                  }}
                >
                  <Star size={10} fill="white" />
                  Featured
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === 'featured' ? 'border-[#C9973A] bg-[#C9973A]' : 'border-[#DDE3F0]'}`}>
                  {selectedPlan === 'featured' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-sm font-sans text-[#0C1124]">Appear at the top of search results</p>
              <p className="text-xs font-sans text-[#8A97B5] mt-0.5">Gold shine border highlight in listings</p>
              <p className="text-lg font-mono font-semibold text-[#C9973A] mt-2">Rs. 500 / week</p>
            </button>

            {/* Sponsored Plan */}
            <button
              onClick={() => setSelectedPlan('sponsored')}
              className={`w-full text-left p-4 rounded-card border-2 transition-all relative overflow-hidden ${
                selectedPlan === 'sponsored'
                  ? 'border-[#C9973A] bg-[#FDF7ED]'
                  : 'border-[#DDE3F0] bg-white hover:border-[#C9973A]/50'
              }`}
            >
              {/* Ribbon */}
              <div
                className="absolute top-0 right-0 px-4 py-0.5 text-[10px] font-sans font-bold text-white"
                style={{
                  background: '#C9973A',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 12px 100%)',
                }}
              >
                BEST VALUE
              </div>

              <div className="flex items-start justify-between mb-2">
                {/* SponsoredBadge preview */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold"
                  style={{
                    background: '#0A1628',
                    color: '#C9973A',
                    border: '1px solid #C9973A',
                    boxShadow: '0 2px 8px rgba(10,22,40,0.3)',
                  }}
                >
                  <Zap size={10} fill="#C9973A" />
                  Sponsored
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${selectedPlan === 'sponsored' ? 'border-[#C9973A] bg-[#C9973A]' : 'border-[#DDE3F0]'}`}>
                  {selectedPlan === 'sponsored' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-sm font-sans text-[#0C1124]">Maximum visibility across the platform</p>
              <p className="text-xs font-sans text-[#8A97B5] mt-0.5">Sponsored label + priority placement + ribbon</p>
              <p className="text-lg font-mono font-semibold text-[#C9973A] mt-2">Rs. 1,200 / week</p>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={handleActivate}
            disabled={!selectedPlan || activated}
            className={`w-full py-3.5 rounded-card font-sans font-semibold text-sm transition-all ${
              selectedPlan && !activated
                ? 'bg-[#C9973A] text-white hover:bg-[#A67928] shadow-gold'
                : 'bg-[#F0F3F9] text-[#8A97B5] cursor-not-allowed'
            }`}
          >
            {activated ? '✓ Promotion Activated!' : selectedPlan ? 'Activate Promotion' : 'Select a plan to continue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Listing Row ───────────────────────────────────────────────────────────────

function ListingRow({
  listing,
  onPromote,
  onShare,
  onToggleStatus,
  onDelete,
}: {
  listing: Listing
  onPromote: (listing: Listing) => void
  onShare: (e: React.MouseEvent, id: string) => void
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 p-4 bg-white border border-[#DDE3F0] rounded-card hover:shadow-card-hover transition-shadow duration-300"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-card overflow-hidden shrink-0 bg-[#F0F3F9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.coverImage}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans font-semibold text-[#0C1124] truncate">{listing.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs font-mono text-[#C9973A] font-medium">
            {formatCurrency(listing.dailyRate)}/day
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${statusColor(listing.status)}`}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </span>
          {listing.rating > 0 && (
            <span className="text-xs font-sans text-[#8A97B5] flex items-center gap-0.5">
              <Star size={10} className="fill-[#C9973A] text-[#C9973A]" />
              {listing.rating}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onPromote(listing)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FDF7ED] border border-[#C9973A]/30 text-[#C9973A] text-xs font-sans font-medium rounded-card hover:bg-[#C9973A] hover:text-white transition-colors"
        >
          <Zap size={11} />
          Promote
        </button>
        <button
          onClick={(e) => onShare(e, listing.id)}
          className="w-8 h-8 flex items-center justify-center rounded-card border border-[#DDE3F0] text-[#8A97B5] hover:text-[#1A3D8F] hover:border-[#1A3D8F] transition-colors"
          title="Share"
        >
          <Share2 size={13} />
        </button>
        <Link
          href={`/lister/listings/${listing.id}/edit`}
          className="w-8 h-8 flex items-center justify-center rounded-card border border-[#DDE3F0] text-[#8A97B5] hover:text-[#1A3D8F] hover:border-[#1A3D8F] transition-colors"
          title="Edit"
        >
          <Edit size={13} />
        </Link>
        <button
          onClick={() => onToggleStatus(listing.id)}
          className="w-8 h-8 flex items-center justify-center rounded-card border border-[#DDE3F0] text-[#8A97B5] hover:text-[#1A3D8F] hover:border-[#1A3D8F] transition-colors"
          title={listing.status === 'paused' ? 'Activate' : 'Pause'}
        >
          {listing.status === 'paused' ? <Play size={13} /> : <Pause size={13} />}
        </button>
        <button
          onClick={() => onDelete(listing.id)}
          className="w-8 h-8 flex items-center justify-center rounded-card border border-[#DDE3F0] text-[#8A97B5] hover:text-red-500 hover:border-red-200 transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS)
  const [promoteTarget, setPromoteTarget] = useState<Listing | null>(null)
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
  }, [])

  const filtered = activeTab === 'all' ? listings : listings.filter((l) => l.status === activeTab)

  const handleToggleStatus = (id: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: l.status === 'paused' ? 'active' : 'paused' } : l
      )
    )
  }

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id))
  }

  const handleShare = useCallback((e: React.MouseEvent, _id: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setConfettiOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1200)
  }, [])

  const tabCounts: Record<TabKey, number> = {
    all: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    draft: listings.filter((l) => l.status === 'draft').length,
    paused: listings.filter((l) => l.status === 'paused').length,
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-24">
      {/* Header */}
      <div ref={headerRef} className="bg-white border-b border-[#DDE3F0] px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm font-sans text-[#8A97B5] mb-1">Manage</p>
            <h1 className="font-heading text-3xl text-[#0C1124]">My Listings</h1>
          </div>
          <Link
            href="/lister/listings/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A3D8F] text-white text-sm font-sans font-medium rounded-card hover:bg-[#122D6B] transition-colors"
          >
            <Plus size={16} />
            New Listing
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        {/* Tab Bar */}
        <LayoutGroup>
          <div className="flex gap-1 bg-white border border-[#DDE3F0] rounded-card p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-card text-sm font-sans font-medium transition-colors z-10 ${
                  activeTab === tab.key ? 'text-[#0C1124]' : 'text-[#8A97B5] hover:text-[#3D4F73]'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-[#F0F3F9] rounded-card"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={`relative z-10 text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    activeTab === tab.key ? 'bg-[#1A3D8F] text-white' : 'bg-[#F0F3F9] text-[#8A97B5]'
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        {/* Listing Rows */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  onPromote={setPromoteTarget}
                  onShare={handleShare}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 bg-white border border-[#DDE3F0] rounded-card"
              >
                <div className="w-16 h-16 rounded-card bg-[#F0F3F9] flex items-center justify-center mb-4">
                  <Package size={28} className="text-[#8A97B5]" />
                </div>
                <p className="font-heading text-xl text-[#0C1124] mb-2">No listings here yet</p>
                <p className="text-sm font-sans text-[#8A97B5] mb-6 text-center max-w-xs">
                  {activeTab === 'all'
                    ? 'Start by creating your first listing to reach renters across Sri Lanka.'
                    : `You have no ${activeTab} listings right now.`}
                </p>
                {activeTab === 'all' && (
                  <Link
                    href="/lister/listings/create"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1A3D8F] text-white text-sm font-sans font-medium rounded-card hover:bg-[#122D6B] transition-colors"
                  >
                    <Plus size={16} />
                    Create your first listing
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Promote Bottom Sheet */}
      <AnimatePresence>
        {promoteTarget && (
          <PromoteBottomSheet listing={promoteTarget} onClose={() => setPromoteTarget(null)} />
        )}
      </AnimatePresence>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && confettiOrigin && <ConfettiCanvas origin={confettiOrigin} />}
      </AnimatePresence>

      {/* FAB */}
      <Link href="/lister/listings/create" className="fixed bottom-8 right-8 z-50" aria-label="Create listing">
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
