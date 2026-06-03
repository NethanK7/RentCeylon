'use client'

import { useState } from 'react'
import { Bell, Package, Shield, Star, MessageSquare, DollarSign, AlertTriangle, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const ICON_MAP: Record<string, React.ElementType> = {
  BOOKING_REQUEST:          Package,
  BOOKING_APPROVED:         Check,
  DEPOSIT_RELEASED:         DollarSign,
  DISPUTE_RAISED:           AlertTriangle,
  REVIEW_REQUESTED:         Star,
  MESSAGE_RECEIVED:         MessageSquare,
  ID_VERIFICATION_APPROVED: Shield,
}

const COLOR_MAP: Record<string, { bg: string; icon: string }> = {
  BOOKING_REQUEST:          { bg: 'rgba(26,61,143,0.08)',  icon: '#1A3D8F' },
  BOOKING_APPROVED:         { bg: 'rgba(10,120,85,0.08)',  icon: '#0A7855' },
  DEPOSIT_RELEASED:         { bg: 'rgba(10,120,85,0.08)',  icon: '#0A7855' },
  DISPUTE_RAISED:           { bg: 'rgba(185,28,28,0.08)',  icon: '#B91C1C' },
  REVIEW_REQUESTED:         { bg: 'rgba(201,151,58,0.10)', icon: '#C9973A' },
  MESSAGE_RECEIVED:         { bg: 'rgba(26,61,143,0.08)',  icon: '#1A3D8F' },
  ID_VERIFICATION_APPROVED: { bg: 'rgba(10,120,85,0.08)',  icon: '#0A7855' },
}

const NOTIFICATIONS = [
  { id: 'n1', type: 'BOOKING_REQUEST',          title: 'New booking request',   body: 'Kasun Fernando wants to rent Sony A7III for Dec 20–22',             isRead: false, time: '2 min ago',  actionUrl: '/lister/bookings',   isFlagged: false },
  { id: 'n2', type: 'MESSAGE_RECEIVED',          title: 'Message from Nithya',   body: 'Hi, is the drone available for this weekend?',                       isRead: false, time: '15 min ago', actionUrl: '/notifications',     isFlagged: false },
  { id: 'n3', type: 'MESSAGE_RECEIVED',          title: 'Flagged message',       body: 'Call me on +94 77 XXX XXXX to arrange payment directly',             isRead: false, time: '1 hr ago',   actionUrl: '/notifications',     isFlagged: true  },
  { id: 'n4', type: 'DEPOSIT_RELEASED',          title: 'Deposit returned',      body: 'LKR 25,000 deposit from DJI Mavic rental has been released to you',  isRead: true,  time: '2 hrs ago',  actionUrl: '/dashboard',         isFlagged: false },
  { id: 'n5', type: 'ID_VERIFICATION_APPROVED',  title: 'Identity Verified ✓',  body: 'Your ID verification has been approved. Listings are now visible.',   isRead: true,  time: 'Yesterday',  actionUrl: '/lister/dashboard',  isFlagged: false },
  { id: 'n6', type: 'REVIEW_REQUESTED',          title: 'How was your rental?',  body: 'Leave a review for your Sony A7III rental from Dinuka',              isRead: true,  time: '2 days ago', actionUrl: '/reviews/booking-1', isFlagged: false },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))

  return (
    <div className="min-h-screen pt-[62px]" style={{ background: '#F8F9FB' }}>

      {/* Header */}
      <div className="bg-white border-b border-black/05">
        <div className="max-w-[680px] mx-auto px-6 py-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label mb-2">Activity</p>
              <div className="flex items-center gap-3">
                <h1 className="font-sans text-2xl font-bold text-ink tracking-tight">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full font-sans text-xs font-bold text-white"
                    style={{ background: '#1A3D8F' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="mt-1 text-xs font-medium text-royal hover:text-royal-dark transition-colors px-3 py-1.5 rounded-full hover:bg-royal/8">
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-[680px] mx-auto px-6 py-6 space-y-2.5">
        <AnimatePresence initial={false}>
          {notifications.map((notif) => {
            const Icon = ICON_MAP[notif.type] || Bell
            const colors = COLOR_MAP[notif.type] || { bg: 'rgba(0,0,0,0.04)', icon: '#8A97B5' }

            return (
              <motion.div key={notif.id} layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}>
                <Link href={notif.actionUrl} onClick={() => markRead(notif.id)} className="block">
                  <div className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-card-hover"
                    style={{
                      background: '#FFFFFF',
                      border: notif.isFlagged
                        ? '1px solid rgba(196,123,4,0.2)'
                        : notif.isRead
                        ? '1px solid rgba(0,0,0,0.06)'
                        : '1px solid rgba(26,61,143,0.14)',
                      boxShadow: notif.isRead
                        ? '0 1px 3px rgba(0,0,0,0.03)'
                        : '0 2px 12px rgba(26,61,143,0.07)',
                    }}>

                    {notif.isFlagged && (
                      <div className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium"
                        style={{ background: 'rgba(196,123,4,0.05)', color: '#C47B04', borderBottom: '1px solid rgba(196,123,4,0.1)' }}>
                        <AlertTriangle size={11} strokeWidth={2} />
                        Flagged — possible off-platform contact attempt
                      </div>
                    )}

                    <div className="flex items-start gap-4 p-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: notif.isRead ? 'rgba(0,0,0,0.04)' : colors.bg }}>
                        <Icon size={17} strokeWidth={1.5}
                          style={{ color: notif.isRead ? '#8A97B5' : colors.icon }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-sans text-sm leading-snug ${notif.isRead ? 'text-slate' : 'text-ink font-semibold'}`}>
                          {notif.title}
                        </p>
                        <p className="font-sans text-fog text-xs mt-1 leading-relaxed line-clamp-2">
                          {notif.isFlagged
                            ? notif.body.replace(/\+94\s?\d[\d\s]+/g, '+94 7X XXX XXXX')
                            : notif.body}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-mono text-[10px] text-fog/60 whitespace-nowrap">{notif.time}</span>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full" style={{ background: '#1A3D8F' }} />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {notifications.every((n) => n.isRead) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'rgba(10,120,85,0.08)' }}>
              <Check size={20} strokeWidth={1.5} className="text-success" />
            </div>
            <p className="font-sans text-sm font-semibold text-ink">You&apos;re all caught up</p>
            <p className="font-sans text-xs text-fog mt-1">No unread notifications</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
