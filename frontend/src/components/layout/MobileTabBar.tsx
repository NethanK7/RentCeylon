'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, BookOpen, User } from 'lucide-react'
import { motion, LayoutGroup } from 'framer-motion'

const TABS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/browse', icon: Search, label: 'Browse' },
  { href: '/lister/listings/create', icon: Plus, label: 'Post' },
  { href: '/dashboard', icon: BookOpen, label: 'Bookings' },
  { href: '/profile/me', icon: User, label: 'Profile' },
]

export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-0 w-full md:hidden z-50 bg-white pb-safe"
      style={{ borderTop: '1px solid #F9F1E2' }}
    >
      <LayoutGroup>
        <div className="flex items-center justify-around h-14">
          {TABS.map((tab) => {
            const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] relative"
              >
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: '#C9973A' }}
                  />
                )}
                <tab.icon
                  size={20}
                  strokeWidth={1.5}
                  className="transition-colors"
                  style={{ color: active ? '#1A3D8F' : '#8A97B5' }}
                />
                {tab.label === 'Post' ? (
                  <span className="sr-only">Post</span>
                ) : (
                  <span
                    className="text-[10px] font-sans mt-0.5 transition-colors"
                    style={{ color: active ? '#1A3D8F' : '#8A97B5' }}
                  >
                    {tab.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}
