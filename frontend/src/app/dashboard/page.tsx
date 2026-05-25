'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Bell, ChevronRight, LayoutGrid, Clock, AlertCircle, ArrowUpRight } from 'lucide-react'
import { formatLKR } from '@/lib/utils'

const USER_NAME = 'Nethank'
const GREETING_HOUR = new Date().getHours()
const GREETING =
  GREETING_HOUR < 12 ? 'Good morning' : GREETING_HOUR < 17 ? 'Good afternoon' : 'Good evening'

const EXPO = [0.16, 1, 0.3, 1] as const

const STATS = [
  { label: 'Active Rentals', value: '2', accent: false },
  { label: 'Total Spent', value: formatLKR(48500), accent: true },
  { label: 'Total Bookings', value: '7', accent: false },
]

const ACTIVE_BOOKINGS = [
  {
    id: 'bk_001',
    title: 'Canon EOS R6 Mark II + 24-105mm Kit',
    thumbnail: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=400&q=80',
    startDate: '24 May 2026',
    endDate: '30 May 2026',
  },
  {
    id: 'bk_002',
    title: 'DJI Mavic 3 Pro Cine Premium Combo',
    thumbnail: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400&q=80',
    startDate: '26 May 2026',
    endDate: '28 May 2026',
  },
]

const NOTIFICATIONS = [
  { id: 1, message: 'Your return for Canon EOS R6 was accepted.', timeAgo: '2 h ago' },
  { id: 2, message: 'Lister confirmed your booking for DJI Mavic 3.', timeAgo: '5 h ago' },
  { id: 3, message: 'Deposit of Rs. 12,000 is now protected.', timeAgo: 'Yesterday' },
]

const QUICK_ACTIONS = [
  { label: 'Browse Listings', icon: LayoutGrid, href: '/browse' },
  { label: 'My History', icon: Clock, href: '/dashboard/history' },
  { label: 'Raise Dispute', icon: AlertCircle, href: '/dashboard/disputes/new' },
]

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Top bar */}
      <div className="bg-white border-b border-ink/[0.06] px-6 py-5 sticky top-[60px] z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            href="/notifications"
            className="relative p-2 hover:bg-frost transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.5} className="text-ink" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold" />
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EXPO }}
          className="pt-12 pb-10 border-b border-ink/[0.06]"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog mb-3">{GREETING}</p>
          <h1 className="font-display font-light text-ink leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
            {USER_NAME}.
          </h1>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EXPO, delay: 0.15 }}
          className="grid grid-cols-3 divide-x divide-ink/[0.06] border-b border-ink/[0.06]"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EXPO, delay: 0.2 + i * 0.07 }}
              className="py-8 px-4 first:pl-0 last:pr-0"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fog mb-3">{stat.label}</p>
              <p
                className="font-mono text-xl tabular-nums"
                style={{ color: stat.accent ? '#C9973A' : '#0C1124' }}
              >
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Bookings */}
        <section className="pt-10 pb-10 border-b border-ink/[0.06]">
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">Active Rentals</p>
            <Link
              href="/dashboard/history"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-royal hover:text-royal-dark transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={10} strokeWidth={2} />
            </Link>
          </div>

          <div className="space-y-px bg-ink/[0.04]">
            {ACTIVE_BOOKINGS.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: EXPO, delay: 0.3 + i * 0.1 }}
                className="bg-white group relative"
              >
                {/* Ferrari stripe */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-royal scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />
                <div className="flex gap-4 p-4 pl-5">
                  <div className="relative w-16 h-16 overflow-hidden shrink-0 bg-frost">
                    <Image
                      src={booking.thumbnail}
                      alt={booking.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                    <p className="font-sans text-sm text-ink leading-snug line-clamp-1">{booking.title}</p>
                    <p className="font-mono text-[11px] text-fog uppercase tracking-[0.06em]">
                      {booking.startDate} — {booking.endDate}
                    </p>
                    <Link
                      href={`/dashboard/active/${booking.id}`}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-royal uppercase tracking-[0.1em] hover:text-royal-dark transition-colors"
                    >
                      Details <ArrowUpRight size={10} strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="pt-10 pb-10 border-b border-ink/[0.06]">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog mb-6">Quick Actions</p>
          <div className="grid grid-cols-3 gap-px bg-ink/[0.04]">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EXPO, delay: 0.4 + i * 0.07 }}
              >
                <Link
                  href={action.href}
                  className="flex flex-col items-center gap-3 bg-white px-3 py-8 hover:bg-frost transition-colors group"
                >
                  <action.icon size={16} strokeWidth={1.5} className="text-fog group-hover:text-royal transition-colors" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-fog group-hover:text-ink transition-colors text-center leading-snug">
                    {action.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="pt-10 pb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog mb-6">Recent</p>
          <div className="space-y-px bg-ink/[0.04]">
            {NOTIFICATIONS.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EXPO, delay: 0.5 + i * 0.06 }}
                className="bg-white px-5 py-4 flex items-start justify-between gap-4"
              >
                <p className="font-sans text-sm text-ink leading-relaxed">{n.message}</p>
                <span className="font-mono text-[10px] text-fog shrink-0 mt-0.5">{n.timeAgo}</span>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
