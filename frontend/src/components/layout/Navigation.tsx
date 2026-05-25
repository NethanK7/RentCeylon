'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/pricing', label: 'For Listers' },
  { href: '/about', label: 'How It Works' },
  { href: '/property-management', label: 'Property' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <nav
        className={[
          'fixed top-0 left-0 w-full z-50 transition-all duration-200',
          scrolled
            ? 'bg-white border-b border-ink/[0.08]'
            : 'bg-transparent border-b border-transparent',
        ].join(' ')}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-[60px] flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 no-underline group"
            aria-label="RentLoop — home"
          >
            {/* Geometric RL monogram */}
            <div
              className="w-[20px] h-[20px] flex items-center justify-center flex-shrink-0"
              style={{ border: '1px solid #0C1124' }}
            >
              <span
                className="font-mono text-[7px] leading-none tracking-tight text-ink select-none"
                style={{ fontWeight: 500, letterSpacing: '0.02em' }}
              >
                RL
              </span>
            </div>
            {/* Wordmark */}
            <span
              className="font-display text-xl font-light tracking-tight text-ink"
              style={{ letterSpacing: '-0.01em' }}
            >
              RentLoop
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-underline text-xs uppercase tracking-[0.12em] font-sans font-medium text-slate/70 hover:text-ink transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-sans text-slate/60 hover:text-ink transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="border border-royal text-royal text-xs tracking-wide uppercase px-5 py-2.5 hover:bg-royal hover:text-white transition-all duration-200 rounded-none font-sans font-medium"
            >
              List your item&nbsp;↗
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2 text-ink"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen
              ? <X size={20} strokeWidth={1.5} />
              : <Menu size={20} strokeWidth={1.5} />
            }
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Top bar spacer matching nav height */}
            <div className="h-[60px] flex-shrink-0" />

            {/* Links */}
            <nav className="flex-1 flex flex-col justify-center px-8 pb-4">
              <ul className="space-y-0">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.25,
                      ease: 'easeOut',
                    }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-baseline gap-4 py-5 border-b border-border group"
                    >
                      {/* Numbered label */}
                      <span className="font-mono text-xs text-fog/50 w-5 flex-shrink-0 select-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {/* Link text */}
                      <span className="font-heading text-4xl text-ink group-hover:text-royal transition-colors duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Bottom CTA buttons */}
            <motion.div
              className="px-8 pb-10 flex flex-col gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.05 + 0.05, duration: 0.2 }}
            >
              <Link
                href="/auth/login"
                className="w-full text-center py-3.5 border border-ink text-ink text-sm font-sans font-medium uppercase tracking-wide rounded-none hover:bg-ink hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="w-full text-center py-3.5 bg-royal text-white text-sm font-sans font-medium uppercase tracking-wide rounded-none hover:bg-royal-dark transition-all duration-200"
              >
                List your item
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
