'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, CheckCircle2, Clock3, XCircle, AlertTriangle } from 'lucide-react'
import { formatLKR } from '@/lib/utils'

// ─── Types & mock data ────────────────────────────────────────────────────────
type BookingStatus = 'active' | 'completed' | 'cancelled'
type FilterTab = 'all' | BookingStatus

interface HistoryEntry {
  id: string
  title: string
  startDate: string
  endDate: string
  amount: number
  status: BookingStatus
  depositStatus: 'HELD' | 'RELEASED' | 'FORFEITED'
  reviewGiven?: string
  dispute?: string
}

const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: 'bk_001',
    title: 'Canon EOS R6 Mark II + 24-105mm Kit',
    startDate: '24 May 2026',
    endDate: '30 May 2026',
    amount: 18500,
    status: 'active',
    depositStatus: 'HELD',
  },
  {
    id: 'bk_002',
    title: 'DJI Mavic 3 Pro Cine Premium Combo',
    startDate: '26 May 2026',
    endDate: '28 May 2026',
    amount: 9000,
    status: 'active',
    depositStatus: 'HELD',
  },
  {
    id: 'bk_003',
    title: 'Sony FX3 Full-Frame Cinema Camera',
    startDate: '10 Apr 2026',
    endDate: '15 Apr 2026',
    amount: 30000,
    status: 'completed',
    depositStatus: 'RELEASED',
    reviewGiven: '5 stars — Excellent condition, owner was very responsive.',
  },
  {
    id: 'bk_004',
    title: 'Rode NT1 Condenser Microphone Bundle',
    startDate: '3 Mar 2026',
    endDate: '5 Mar 2026',
    amount: 3500,
    status: 'completed',
    depositStatus: 'RELEASED',
    reviewGiven: '4 stars — Good condition, minor delay on pickup.',
  },
  {
    id: 'bk_005',
    title: 'Aputure 600D Pro LED Light',
    startDate: '12 Feb 2026',
    endDate: '14 Feb 2026',
    amount: 6500,
    status: 'cancelled',
    depositStatus: 'RELEASED',
  },
  {
    id: 'bk_006',
    title: 'Blackmagic Pocket Cinema 6K G2',
    startDate: '5 Jan 2026',
    endDate: '10 Jan 2026',
    amount: 22000,
    status: 'completed',
    depositStatus: 'RELEASED',
    dispute: "Minor damage dispute raised — resolved in renter's favour.",
    reviewGiven: '3 stars — Camera was functional but had a sensor issue.',
  },
  {
    id: 'bk_007',
    title: 'Nikon Z6 III Body Only',
    startDate: '20 Dec 2025',
    endDate: '22 Dec 2025',
    amount: 11000,
    status: 'cancelled',
    depositStatus: 'RELEASED',
  },
]

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  active: {
    label: 'Active',
    color: '#1A3D8F',
    bg: 'rgba(26,61,143,0.1)',
    icon: <Clock3 size={12} strokeWidth={2} />,
  },
  completed: {
    label: 'Completed',
    color: '#0A7855',
    bg: 'rgba(10,120,85,0.1)',
    icon: <CheckCircle2 size={12} strokeWidth={2} />,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#9B1C1C',
    bg: 'rgba(155,28,28,0.1)',
    icon: <XCircle size={12} strokeWidth={2} />,
  },
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

// ─── Individual history entry ─────────────────────────────────────────────────
function HistoryEntryCard({ entry, index }: { entry: HistoryEntry; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const statusCfg = STATUS_CONFIG[entry.status]

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="relative pl-8"
    >
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-5 w-3.5 h-3.5 rounded-full border-2 border-white z-10 shrink-0"
        style={{ background: statusCfg.color }}
      />

      <div className="bg-white border border-frost rounded-card overflow-hidden">
        {/* Main row */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-snow transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-medium text-ink leading-snug line-clamp-2">
              {entry.title}
            </p>
            <p className="text-xs font-sans text-slate mt-1">
              {entry.startDate} — {entry.endDate}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <p className="font-mono text-sm font-medium" style={{ color: '#C9973A' }}>
              {formatLKR(entry.amount)}
            </p>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-full"
              style={{ color: statusCfg.color, background: statusCfg.bg }}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="self-center ml-1 shrink-0"
          >
            <ChevronDown size={16} strokeWidth={1.5} className="text-fog" />
          </motion.div>
        </button>

        {/* Expanded panel */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-frost px-5 py-4 space-y-3">
                {/* Deposit status */}
                <div className="flex items-center justify-between text-sm font-sans">
                  <span className="text-slate">Deposit</span>
                  <span
                    className="font-medium"
                    style={{
                      color:
                        entry.depositStatus === 'HELD'
                          ? '#C9973A'
                          : entry.depositStatus === 'RELEASED'
                          ? '#0A7855'
                          : '#9B1C1C',
                    }}
                  >
                    {entry.depositStatus}
                  </span>
                </div>

                {/* Review */}
                {entry.reviewGiven ? (
                  <div className="space-y-1">
                    <p className="text-xs font-sans text-slate font-medium">Your Review</p>
                    <p className="text-sm font-sans text-ink leading-relaxed">{entry.reviewGiven}</p>
                  </div>
                ) : (
                  <p className="text-xs font-sans text-fog italic">No review submitted.</p>
                )}

                {/* Dispute */}
                {entry.dispute && (
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-card"
                    style={{ background: 'rgba(155,28,28,0.06)' }}
                  >
                    <AlertTriangle size={14} strokeWidth={1.5} className="text-red-700 mt-0.5 shrink-0" />
                    <p className="text-xs font-sans text-red-700 leading-relaxed">{entry.dispute}</p>
                  </div>
                )}

                {/* Link to active page */}
                {entry.status === 'active' && (
                  <Link
                    href={`/dashboard/active/${entry.id}`}
                    className="inline-flex items-center gap-1 text-xs font-sans font-medium text-royal hover:underline mt-1"
                  >
                    View active rental <ChevronRight size={12} strokeWidth={2} />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterTab>('all')

  const filtered = MOCK_HISTORY.filter((e) => filter === 'all' || e.status === filter)

  return (
    <main className="min-h-screen bg-snow pb-24">
      {/* Header */}
      <div className="bg-white border-b border-frost px-6 py-5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-full hover:bg-frost transition-colors"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 14 L6 9 L11 4" stroke="#0C1124" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="font-heading text-xl text-ink">Rental History</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-6">

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className="relative shrink-0 px-4 py-2 rounded-full text-sm font-sans transition-all duration-200"
              style={{
                color: filter === tab.key ? '#ffffff' : '#6B6A67',
                background: filter === tab.key ? '#C9973A' : '#F0EEE9',
              }}
            >
              {tab.label}
              {filter === tab.key && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-full"
                  style={{ background: '#C9973A', zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#FDF6E3' }}
            >
              <Clock3 size={28} strokeWidth={1.5} style={{ color: '#C9973A' }} />
            </div>
            <div>
              <p className="font-heading text-xl text-ink mb-1">No rentals yet</p>
              <p className="text-sm font-sans text-slate mb-4">Start exploring available listings.</p>
              <Link
                href="/listings"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-sans font-medium text-white"
                style={{ background: '#1A3D8F' }}
              >
                Browse Listings
                <ChevronRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="relative space-y-4">
            {/* Gold dotted vertical line */}
            <div
              className="absolute left-[6px] top-6 bottom-6 w-px"
              style={{
                background: 'repeating-linear-gradient(to bottom, #C9973A 0px, #C9973A 6px, transparent 6px, transparent 12px)',
              }}
            />

            <AnimatePresence mode="popLayout">
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <HistoryEntryCard entry={entry} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}
