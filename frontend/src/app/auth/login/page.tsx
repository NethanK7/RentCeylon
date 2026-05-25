'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Mail } from 'lucide-react'

const EXPO = [0.16, 1, 0.3, 1] as const

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotExpanded, setForgotExpanded] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — editorial brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col justify-between px-16 py-16 relative overflow-hidden">
        {/* Architectural grid lines */}
        <motion.div
          className="absolute left-[38%] top-0 bottom-0 w-px bg-white/5"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.4, ease: EXPO, delay: 0.2 }}
          style={{ transformOrigin: 'top' }}
        />
        <motion.div
          className="absolute top-[42%] left-0 right-0 h-px bg-white/5"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, ease: EXPO, delay: 0.4 }}
          style={{ transformOrigin: 'left' }}
        />
        {/* Royal blue horizontal accent */}
        <motion.div
          className="absolute bottom-[28%] left-0 w-24 h-px bg-royal"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: EXPO, delay: 0.8 }}
          style={{ transformOrigin: 'left' }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EXPO }}
          className="flex items-center gap-2.5"
        >
          <div
            className="w-5 h-5 flex items-center justify-center"
            style={{ border: '1px solid rgba(201,151,58,0.6)' }}
          >
            <span className="font-mono text-[7px] text-gold tracking-tight">RL</span>
          </div>
          <span className="font-display text-xl text-white font-light tracking-tight">RentLoop</span>
        </motion.div>

        {/* Editorial headline */}
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6"
          >
            Member Portal
          </motion.p>
          <div className="overflow-hidden mb-2">
            <motion.h1
              className="font-display font-light text-white leading-none"
              style={{ fontSize: 'clamp(3.5rem, 5vw, 5.5rem)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EXPO, delay: 0.3 }}
            >
              Welcome
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              className="font-display font-light leading-none"
              style={{ fontSize: 'clamp(3.5rem, 5vw, 5.5rem)', color: '#1A3D8F' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EXPO, delay: 0.42 }}
            >
              back.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EXPO, delay: 0.7 }}
            className="font-sans text-sm text-white/40 mt-6 leading-relaxed max-w-xs"
          >
            Sri Lanka's trusted peer-to-peer rental marketplace. Sign in to manage your rentals and listings.
          </motion.p>
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex items-center gap-8"
        >
          {[['12K+', 'Listings'], ['4.9★', 'Avg Rating'], ['100%', 'Secure']].map(([val, label]) => (
            <div key={label}>
              <p className="font-mono text-sm text-white/70">{val}</p>
              <p className="font-mono text-[10px] text-white/25 uppercase tracking-[0.12em]">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-snow">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-5 h-5 flex items-center justify-center"
              style={{ border: '1px solid rgba(12,17,36,0.3)' }}
            >
              <span className="font-mono text-[7px] text-ink tracking-tight">RL</span>
            </div>
            <span className="font-display text-xl text-ink font-light tracking-tight">RentLoop</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EXPO }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog mb-3">Sign In</p>
            <h2 className="font-display text-3xl text-ink font-light mb-8">Your account</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email */}
              <div className="relative border-b border-border pb-2 focus-within:border-royal transition-colors duration-200">
                <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-transparent font-sans text-sm text-ink placeholder-fog/40 outline-none"
                />
              </div>

              {/* Password */}
              <div className="relative border-b border-border pb-2 focus-within:border-royal transition-colors duration-200">
                <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">
                  Password
                </label>
                <div className="flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="flex-1 bg-transparent font-sans text-sm text-ink placeholder-fog/40 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="shrink-0 text-fog hover:text-ink transition-colors"
                  >
                    {showPassword
                      ? <EyeOff size={14} strokeWidth={1.5} />
                      : <Eye size={14} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-royal text-royal py-3.5 font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-royal hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border border-current border-t-transparent animate-spin" />
                ) : (
                  <>Sign in <ArrowRight size={14} strokeWidth={1.5} /></>
                )}
              </button>
            </form>

            {/* Forgot password */}
            <div className="mt-6 border-t border-border pt-5">
              <button
                onClick={() => setForgotExpanded((v) => !v)}
                className="font-mono text-[11px] text-fog hover:text-royal transition-colors uppercase tracking-[0.1em]"
              >
                Forgot password?
              </button>

              <motion.div
                initial={false}
                animate={{ height: forgotExpanded ? 'auto' : 0, opacity: forgotExpanded ? 1 : 0 }}
                className="overflow-hidden"
              >
                {forgotSent ? (
                  <div className="pt-4 flex items-center gap-2 text-success">
                    <Mail size={13} strokeWidth={1.5} />
                    <p className="font-mono text-[11px]">Reset link sent to {forgotEmail}</p>
                  </div>
                ) : (
                  <div className="pt-4 flex gap-2">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 border-b border-border bg-transparent font-sans text-sm text-ink placeholder-fog/40 outline-none focus:border-royal pb-1 transition-colors"
                    />
                    <button
                      onClick={() => setForgotSent(true)}
                      className="font-mono text-[11px] text-royal border border-royal px-3 py-1 hover:bg-royal hover:text-white transition-all duration-200"
                    >
                      Send
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            <p className="font-mono text-[11px] text-fog mt-6">
              New here?{' '}
              <Link href="/auth/signup" className="text-royal hover:text-royal-dark transition-colors">
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
