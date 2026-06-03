'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Menu, ArrowUpRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { href: '/browse',               label: 'Browse' },
  { href: '/pricing',              label: 'For Listers' },
  { href: '/about',                label: 'How It Works' },
  { href: '/property-management',  label: 'Property Management' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(0,0,0,0.04)',
          boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.06)' : '0 1px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-[62px] flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group" aria-label="RentLoop home">
            <div
              className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0 rounded-sm"
              style={{ background: '#0C1124' }}
            >
              <span className="font-mono text-[7px] text-white font-semibold tracking-tight select-none">RL</span>
            </div>
            <span className="font-sans text-[1.05rem] font-semibold tracking-tight text-ink">
              RentLoop
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-2 text-[0.8rem] font-medium rounded-full transition-all duration-200"
                style={{
                  color: isActive(link.href) ? '#1A3D8F' : '#3D4F73',
                  background: isActive(link.href) ? 'rgba(26,61,143,0.07)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'
                }}
                onMouseLeave={e => {
                  if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-[0.8rem] font-medium text-slate/70 hover:text-ink transition-colors duration-200 px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-white px-4 py-2 rounded-full transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #1A3D8F 0%, #2952B8 100%)',
                boxShadow: '0 2px 8px rgba(26,61,143,0.3)',
              }}
            >
              List your item
              <ArrowUpRight size={12} strokeWidth={2} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2 text-ink rounded-full hover:bg-black/5 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="h-[62px] flex-shrink-0" />

            <nav className="flex-1 flex flex-col justify-center px-8 pb-4">
              <ul className="space-y-0">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.22, ease: 'easeOut' }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between py-5 border-b border-black/5 group"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-[10px] text-fog/40 w-5 shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="font-sans text-3xl font-semibold text-ink group-hover:text-royal transition-colors duration-200"
                        >
                          {link.label}
                        </span>
                      </div>
                      <ArrowUpRight size={18} strokeWidth={1.5} className="text-fog/40 group-hover:text-royal transition-colors duration-200" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              className="px-8 pb-10 flex flex-col gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.05 + 0.05, duration: 0.2 }}
            >
              <Link
                href="/auth/login"
                className="w-full text-center py-3.5 rounded-full border border-black/10 text-ink text-sm font-medium hover:bg-black/4 transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="w-full text-center py-3.5 rounded-full text-white text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #1A3D8F 0%, #2952B8 100%)', boxShadow: '0 2px 12px rgba(26,61,143,0.3)' }}
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
