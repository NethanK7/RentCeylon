'use client'

import { useState } from 'react'
import { Bell, Package, Shield, Star, MessageSquare, DollarSign, AlertTriangle, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const ICON_MAP: Record<string, React.ElementType> = {
  BOOKING_REQUEST: Package,
  BOOKING_APPROVED: Check,
  DEPOSIT_RELEASED: DollarSign,
  DISPUTE_RAISED: AlertTriangle,
  REVIEW_REQUESTED: Star,
  MESSAGE_RECEIVED: MessageSquare,
  ID_VERIFICATION_APPROVED: Shield,
}

const NOTIFICATIONS = [
  { id: 'n1', type: 'BOOKING_REQUEST', title: 'New booking request', body: 'Kasun Fernando wants to rent Sony A7III for Dec 20–22', isRead: false, time: '2 min ago', actionUrl: '/lister/bookings', isFlagged: false },
  { id: 'n2', type: 'MESSAGE_RECEIVED', title: 'Message from Nithya', body: 'Hi, is the drone available for this weekend?', isRead: false, time: '15 min ago', actionUrl: '/notifications', isFlagged: false },
  { id: 'n3', type: 'MESSAGE_RECEIVED', title: 'Flagged message', body: 'Call me on +94 77 XXX XXXX to arrange payment directly', isRead: false, time: '1 hr ago', actionUrl: '/notifications', isFlagged: true },
  { id: 'n4', type: 'DEPOSIT_RELEASED', title: 'Deposit returned', body: 'LKR 25,000 deposit from DJI Mavic rental has been released to you', isRead: true, time: '2 hrs ago', actionUrl: '/dashboard', isFlagged: false },
  { id: 'n5', type: 'ID_VERIFICATION_APPROVED', title: 'Identity Verified ✓', body: 'Your ID verification has been approved. Your listings are now visible.', isRead: true, time: 'Yesterday', actionUrl: '/lister/dashboard', isFlagged: false },
  { id: 'n6', type: 'REVIEW_REQUESTED', title: 'How was your rental?', body: 'Leave a review for your Sony A7III rental from Dinuka', isRead: true, time: '2 days ago', actionUrl: '/reviews/booking-1', isFlagged: false },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
  }

  return (
    <div className="min-h-screen bg-snow pt-20 pb-24 px-4">
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-ink text-3xl">Notifications</h1>
            {unreadCount > 0 && (
              <p className="font-sans text-fog text-sm mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm font-sans text-royal hover:text-navy transition-colors">
              Mark all read
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = ICON_MAP[notif.type] || Bell
            return (
              <motion.div key={notif.id} layout>
                <Link href={notif.actionUrl} onClick={() => markRead(notif.id)}>
                  <div
                    className="rounded-card overflow-hidden transition-all hover:shadow-card"
                    style={{
                      background: notif.isRead ? '#FFFFFF' : '#F8F9FC',
                      border: notif.isRead ? '1px solid #DDE3F0' : '1px solid rgba(26,61,143,0.2)',
                      borderLeft: notif.isRead ? '1px solid #DDE3F0' : '3px solid #1A3D8F',
                    }}
                  >
                    {/* Flagged message warning */}
                    {notif.isFlagged && (
                      <div
                        className="flex items-center gap-2 px-4 py-2 text-xs font-sans"
                        style={{ background: 'rgba(196,123,4,0.08)', color: '#C47B04' }}
                      >
                        <AlertTriangle size={12} strokeWidth={1.5} />
                        Flagged for review — possible off-platform contact
                      </div>
                    )}
                    <div className="flex items-start gap-4 p-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: notif.isRead ? '#F0F3F9' : '#EEF2FB' }}
                      >
                        <Icon size={18} strokeWidth={1.5} style={{ color: notif.isRead ? '#8A97B5' : '#1A3D8F' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-sans text-sm ${notif.isRead ? 'text-slate' : 'text-ink font-medium'}`}>
                          {notif.title}
                        </p>
                        <p className="font-sans text-fog text-xs mt-0.5 leading-relaxed line-clamp-2">
                          {notif.isFlagged ? notif.body.replace(/\+94\s?\d[\d\s]+/g, '+94 7X XXX XXXX') : notif.body}
                        </p>
                        <p className="font-sans text-fog text-xs mt-1">{notif.time}</p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-royal shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
