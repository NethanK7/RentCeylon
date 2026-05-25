'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { StarRating } from '@/components/ui/StarRating'
import { Lock, Check } from 'lucide-react'
import Link from 'next/link'

const BOOKING = {
  id: 'booking-1',
  listing: 'Sony A7III Camera',
  owner: 'Dinuka Perera',
  dates: 'Dec 14–16, 2024',
  imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop',
}

export default function ReviewPage({ params }: { params: { bookingId: string } }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const canSubmit = rating > 0 && text.length >= 30

  return (
    <div className="min-h-screen bg-snow pt-20 pb-24 px-4">
      <div className="max-w-[500px] mx-auto">
        {!submitted ? (
          <>
            {/* Booking summary */}
            <div className="flex items-center gap-4 bg-white rounded-card border border-border p-4 mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BOOKING.imageUrl} alt={BOOKING.listing} className="w-16 h-16 rounded-card object-cover" />
              <div>
                <p className="font-sans font-medium text-ink">{BOOKING.listing}</p>
                <p className="font-sans text-fog text-xs mt-0.5">from {BOOKING.owner} · {BOOKING.dates}</p>
              </div>
            </div>

            <h1 className="font-heading text-ink text-2xl mb-2 text-center">How was your rental?</h1>

            {/* Blind review notice */}
            <div
              className="flex items-center gap-3 p-4 rounded-card mb-8"
              style={{ background: '#FDF7ED', border: '1px solid rgba(201,151,58,0.3)' }}
            >
              <Lock size={16} strokeWidth={1.5} className="text-gold shrink-0" />
              <p className="font-sans text-sm text-slate leading-relaxed">
                Your review is sealed until both parties submit, or 7 days pass. Neither party sees the other's review until then.
              </p>
            </div>

            {/* Stars — animated one by one */}
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star, i) => (
                <motion.button
                  key={star}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1"
                >
                  <svg width="36" height="36" viewBox="0 0 24 24">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      stroke="#C9973A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={star <= (hoveredStar || rating) ? '#C9973A' : 'none'}
                      style={{ transition: 'fill 0.15s ease' }}
                    />
                  </svg>
                </motion.button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center font-display text-ink text-lg mb-6" style={{ fontWeight: 400 }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
              </p>
            )}

            {/* Text */}
            <div className="mb-6">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience — condition of the item, owner communication, ease of pickup..."
                rows={5}
                className="w-full p-4 rounded-card border border-border font-sans text-sm text-ink placeholder-fog outline-none focus:border-royal resize-none transition-colors"
                style={{ fontSize: 16 }}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs font-sans text-fog">Minimum 30 characters</span>
                <span className={`text-xs font-sans font-mono ${text.length >= 30 ? 'text-success' : 'text-fog'}`}>
                  {text.length}
                </span>
              </div>
              <div className="mt-1 h-1 bg-mist rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${Math.min(100, (text.length / 30) * 100)}%` }}
                  style={{ background: text.length >= 30 ? '#0A7855' : '#C9973A' }}
                />
              </div>
            </div>

            <button
              disabled={!canSubmit}
              onClick={() => setSubmitted(true)}
              className="w-full py-4 rounded-full font-sans font-medium text-sm transition-all"
              style={{
                background: canSubmit ? 'linear-gradient(135deg, #C9973A, #E8BC6A)' : '#E4EAF4',
                color: canSubmit ? '#0C1124' : '#8A97B5',
              }}
            >
              Submit Review
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="text-center py-12"
          >
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #FDF7ED, #F9F1E2)' }}
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Check size={32} strokeWidth={1.5} className="text-gold" />
            </motion.div>
            <h2 className="font-heading text-ink text-2xl mb-2">Review locked in</h2>
            <p className="font-sans text-fog text-sm mb-6 max-w-xs mx-auto">
              Your review is sealed. It will be revealed once both parties submit or after 7 days.
            </p>
            <div className="flex items-center justify-center gap-1 mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.div
                  key={s}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: s * 0.06, type: 'spring', stiffness: 400 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={s <= rating ? '#C9973A' : '#DDE3F0'} stroke={s <= rating ? '#C9973A' : '#DDE3F0'} strokeWidth="1" />
                  </svg>
                </motion.div>
              ))}
            </div>
            <Link href="/dashboard" className="inline-block px-8 py-3 rounded-full font-sans font-medium text-sm text-white" style={{ background: '#1A3D8F' }}>
              Back to Dashboard
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
