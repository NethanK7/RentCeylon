'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { User, Building2, ArrowRight, Check, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

const EXPO = [0.16, 1, 0.3, 1] as const

export default function SignUpPage() {
  const router = useRouter()
  const [role, setRole] = useState<'RENTER' | 'LISTER' | null>(null)
  const [step, setStep] = useState<'role' | 'details' | 'otp'>('role')
  const [tosAccepted, setTosAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required'
    if (form.password.length < 8) errs.password = 'Minimum 8 characters'
    if (!tosAccepted) errs.tos = 'You must accept the Terms of Service'
    return errs
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep('otp')
  }

  const stepLabel = step === 'role' ? '01 — Choose role' : step === 'details' ? '02 — Your details' : '03 — Verify'

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — editorial brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col justify-between px-16 py-16 relative overflow-hidden">
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
        <motion.div
          className="absolute bottom-[28%] left-0 w-24 h-px bg-royal"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: EXPO, delay: 0.8 }}
          style={{ transformOrigin: 'left' }}
        />

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

        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6"
          >
            New Account
          </motion.p>
          <div className="overflow-hidden mb-2">
            <motion.h1
              className="font-display font-light text-white leading-none"
              style={{ fontSize: 'clamp(3.5rem, 5vw, 5.5rem)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EXPO, delay: 0.3 }}
            >
              Join
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              className="font-display font-light leading-none"
              style={{ fontSize: 'clamp(3.5rem, 5vw, 5.5rem)', color: '#C9973A' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EXPO, delay: 0.42 }}
            >
              RentLoop.
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EXPO, delay: 0.7 }}
            className="font-sans text-sm text-white/40 mt-6 leading-relaxed max-w-xs"
          >
            Sri Lanka's trusted peer-to-peer rental marketplace. List or rent anything — cameras, vehicles, villas, and more.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex items-center gap-8"
        >
          {[['Free', 'To Join'], ['24h', 'ID Review'], ['100%', 'Secure']].map(([val, label]) => (
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

          {/* Step indicator */}
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog mb-8">{stepLabel}</p>

          <AnimatePresence mode="wait">
            {/* Step: Role */}
            {step === 'role' && (
              <motion.div
                key="role"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: EXPO }}
              >
                <h2 className="font-display text-3xl text-ink font-light mb-8">How will you use RentLoop?</h2>

                <div className="grid grid-cols-2 gap-px bg-ink/[0.06] mb-6">
                  {[
                    { value: 'RENTER', label: 'I want to rent', sub: 'Browse & rent items', icon: User },
                    { value: 'LISTER', label: 'I want to list', sub: 'List items & earn', icon: Building2 },
                  ].map(({ value, label, sub, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setRole(value as 'RENTER' | 'LISTER')}
                      className="relative p-6 bg-white text-left transition-all duration-200 group"
                      style={{
                        background: role === value ? '#EEF2FB' : '#FFFFFF',
                        outline: role === value ? '2px solid #1A3D8F' : 'none',
                        outlineOffset: '-2px',
                      }}
                    >
                      <Icon size={16} strokeWidth={1.5} className="mb-4" style={{ color: role === value ? '#1A3D8F' : '#8A97B5' }} />
                      <p className="font-sans text-sm font-medium text-ink mb-0.5">{label}</p>
                      <p className="font-mono text-[10px] text-fog uppercase tracking-[0.08em]">{sub}</p>
                      {role === value && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-royal flex items-center justify-center">
                          <Check size={9} strokeWidth={2.5} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {role === 'LISTER' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-6"
                    >
                      <div className="p-4 border-l-2 border-gold bg-gold-pale text-sm font-sans text-slate">
                        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold mb-2">ID Verification Required</p>
                        <p className="text-xs leading-relaxed text-slate">Listers must complete ID verification (government-issued ID). Reviewed within 24 hours before listings go live.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  disabled={!role}
                  onClick={() => setStep('details')}
                  className="w-full py-3.5 border font-sans text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    borderColor: role ? '#1A3D8F' : '#DDE3F0',
                    color: role ? '#1A3D8F' : '#8A97B5',
                    cursor: role ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={(e) => { if (role) { (e.currentTarget as HTMLElement).style.background = '#1A3D8F'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF' } }}
                  onMouseLeave={(e) => { if (role) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#1A3D8F' } }}
                >
                  Continue as {role === 'RENTER' ? 'Renter' : role === 'LISTER' ? 'Lister' : '...'}
                  {role && <ArrowRight size={14} strokeWidth={1.5} />}
                </button>
              </motion.div>
            )}

            {/* Step: Details */}
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: EXPO }}
              >
                <h2 className="font-display text-3xl text-ink font-light mb-8">Your details</h2>
                <form onSubmit={handleDetailsSubmit} className="space-y-8">
                  <div className="border-b border-border pb-2 focus-within:border-royal transition-colors duration-200">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Kasun Perera"
                      className="w-full bg-transparent font-sans text-sm text-ink placeholder-fog/40 outline-none"
                    />
                    {errors.name && <p className="text-[11px] font-mono text-danger mt-1">{errors.name}</p>}
                  </div>

                  <div className="border-b border-border pb-2 focus-within:border-royal transition-colors duration-200">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full bg-transparent font-sans text-sm text-ink placeholder-fog/40 outline-none"
                    />
                    {errors.email && <p className="text-[11px] font-mono text-danger mt-1">{errors.email}</p>}
                  </div>

                  <div className="border-b border-border pb-2 focus-within:border-royal transition-colors duration-200">
                    <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-fog mb-2">Password (min 8 chars)</label>
                    <div className="flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        className="flex-1 bg-transparent font-sans text-sm text-ink placeholder-fog/40 outline-none"
                      />
                      <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-fog hover:text-ink transition-colors">
                        {showPassword ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] font-mono text-danger mt-1">{errors.password}</p>}
                  </div>

                  {/* ToS */}
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div
                        className="w-4 h-4 border shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                        style={{ borderColor: tosAccepted ? '#1A3D8F' : '#C4CEEA', background: tosAccepted ? '#1A3D8F' : 'transparent' }}
                        onClick={() => setTosAccepted((v) => !v)}
                      >
                        {tosAccepted && <Check size={9} strokeWidth={2.5} className="text-white" />}
                      </div>
                      <input type="checkbox" className="sr-only" checked={tosAccepted} onChange={(e) => setTosAccepted(e.target.checked)} />
                      <span className="font-sans text-xs text-slate leading-relaxed">
                        I agree to the{' '}
                        <Link href="/terms" className="text-royal">Terms of Service</Link> and{' '}
                        <Link href="/privacy" className="text-royal">Privacy Policy</Link>
                      </span>
                    </label>

                    <div className="border-l-2 border-gold pl-3 py-1">
                      <p className="font-sans text-[11px] text-slate leading-relaxed">
                        <span className="font-medium text-ink">Important:</span> All transactions must happen through RentLoop. Off-platform arrangements remove all deposit and dispute protections.
                      </p>
                    </div>
                    {errors.tos && <p className="text-[11px] font-mono text-danger">{errors.tos}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 border border-royal text-royal font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-royal hover:text-white transition-all duration-200"
                  >
                    Create Account <ArrowRight size={14} strokeWidth={1.5} />
                  </button>
                </form>

                <p className="font-mono text-[11px] text-fog mt-6">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-royal">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step: OTP */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: EXPO }}
              >
                <h2 className="font-display text-3xl text-ink font-light mb-2">Verify your number</h2>
                <p className="font-sans text-sm text-fog mb-8">Enter the 6-digit code sent to your mobile</p>

                <div className="flex gap-2 mb-8">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="flex-1 h-14 text-center font-mono text-xl text-ink border-b-2 bg-transparent outline-none transition-colors"
                      style={{
                        borderColor: digit ? '#1A3D8F' : '#DDE3F0',
                        color: digit ? '#1A3D8F' : '#0C1124',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-3.5 border border-royal text-royal font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-royal hover:text-white transition-all duration-200"
                >
                  Verify & Continue <ArrowRight size={14} strokeWidth={1.5} />
                </button>
                <button className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-fog hover:text-royal transition-colors block">
                  Resend code
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
