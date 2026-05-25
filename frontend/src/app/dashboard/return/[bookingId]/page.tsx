'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Star, ArrowLeft, ChevronRight, Check } from 'lucide-react'
import { Stepper } from '@/components/ui/Stepper'

// ─── Types ────────────────────────────────────────────────────────────────────
type SlotKey = 'slot1' | 'slot2' | 'slot3' | 'slot4'
type PhotoSlots = Record<SlotKey, string | null>

const SLOT_LABELS: Record<SlotKey, string> = {
  slot1: 'Front view',
  slot2: 'Back view',
  slot3: 'Left side',
  slot4: 'Right side',
}

const STEPS = [
  { label: 'Photos' },
  { label: 'Review' },
  { label: 'Confirm' },
]

const REVIEW_MIN_CHARS = 30

// ─── Slide variants ───────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir * 100, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const } },
  exit: (dir: number) => ({ x: dir * -100, opacity: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } }),
}

// ─── Animated SVG checkmark ───────────────────────────────────────────────────
function AnimatedCheckmark() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto">
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="#0A7855"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <motion.path
        d="M24 40 L36 52 L56 30"
        stroke="#0A7855"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.4, ease: 'easeInOut' }}
      />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReturnFlowPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Step 1 state
  const [photos, setPhotos] = useState<PhotoSlots>({ slot1: null, slot2: null, slot3: null, slot4: null })
  const fileInputRefs = useRef<Record<SlotKey, HTMLInputElement | null>>({
    slot1: null, slot2: null, slot3: null, slot4: null,
  })

  // Step 2 state
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSkipped, setReviewSkipped] = useState(false)

  // Derived
  const filledSlots = (Object.values(photos) as (string | null)[]).filter(Boolean).length
  const submitOpacity = [0.25, 0.5, 0.75, 1.0][filledSlots - 1] ?? 0.25
  const allPhotosFilled = filledSlots === 4
  const reviewProgress = Math.min(reviewText.length, REVIEW_MIN_CHARS)

  const navigate = useCallback((nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }, [step])

  const handleFileUpload = (slotKey: SlotKey, file: File) => {
    const url = URL.createObjectURL(file)
    setPhotos((prev) => ({ ...prev, [slotKey]: url }))
  }

  return (
    <main className="min-h-screen bg-snow pb-24">

      {/* ── Header ── */}
      <div className="bg-white border-b border-frost px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <Link
            href={`/dashboard/active/${bookingId}`}
            className="p-2 rounded-full hover:bg-frost transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} strokeWidth={1.5} className="text-ink" />
          </Link>
          <h1 className="font-heading text-xl text-ink">Return Process</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8 space-y-8">

        {/* ── Stepper ── */}
        <Stepper steps={STEPS} currentStep={step} />

        {/* ── Step content ── */}
        <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
          <AnimatePresence mode="wait" custom={direction}>

            {/* ── Step 0: Photos ── */}
            {step === 0 && (
              <motion.div
                key="step-photos"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl text-ink">Return Photos</h2>
                  <p className="text-sm font-sans text-slate">
                    Upload all 4 condition photos before proceeding.
                  </p>
                </div>

                {/* Photo grid */}
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(SLOT_LABELS) as SlotKey[]).map((slotKey) => {
                    const filled = !!photos[slotKey]
                    return (
                      <div key={slotKey} className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => !filled && fileInputRefs.current[slotKey]?.click()}
                          className="relative aspect-square rounded-card border-2 overflow-hidden transition-all duration-300 flex flex-col items-center justify-center gap-2"
                          style={{
                            borderStyle: filled ? 'solid' : 'dashed',
                            borderColor: filled ? '#1A3D8F' : 'rgba(201,151,58,0.4)',
                            background: filled ? 'transparent' : '#FAFAF8',
                          }}
                        >
                          {filled ? (
                            <>
                              {/* Preview */}
                              <img
                                src={photos[slotKey]!}
                                alt={SLOT_LABELS[slotKey]}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-royal flex items-center justify-center">
                                <Check size={12} strokeWidth={2.5} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload size={22} strokeWidth={1.5} style={{ color: '#C9973A' }} />
                              <span className="text-xs font-sans text-slate">Upload Photo</span>
                            </>
                          )}
                        </button>
                        <p className="text-xs font-sans text-fog text-center">{SLOT_LABELS[slotKey]}</p>
                        <input
                          ref={(el) => { fileInputRefs.current[slotKey] = el }}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(slotKey, file)
                          }}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Progress indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-sans text-slate">
                    <span>{filledSlots} / 4 photos uploaded</span>
                    <span style={{ color: '#C9973A' }}>{Math.round(submitOpacity * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-frost overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#C9973A' }}
                      animate={{ width: `${submitOpacity * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => allPhotosFilled && navigate(1)}
                  animate={{ opacity: submitOpacity }}
                  transition={{ duration: 0.25 }}
                  disabled={!allPhotosFilled}
                  className="w-full py-4 rounded-card font-sans font-medium text-white text-sm flex items-center justify-center gap-2 transition-opacity"
                  style={{ background: '#C9973A', cursor: allPhotosFilled ? 'pointer' : 'not-allowed' }}
                >
                  Continue to Review
                  <ChevronRight size={16} strokeWidth={2} />
                </motion.button>
              </motion.div>
            )}

            {/* ── Step 1: Review ── */}
            {step === 1 && (
              <motion.div
                key="step-review"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl text-ink">Leave a Review</h2>
                  <p className="text-xs font-sans text-slate leading-relaxed">
                    Review unlocks after both parties submit (7-day window). This step is optional.
                  </p>
                </div>

                {/* Star rating */}
                <div className="space-y-3">
                  <label className="text-sm font-sans font-medium text-ink block">
                    Rate your experience
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          strokeWidth={1.5}
                          fill={(hoveredRating || rating) >= star ? '#C9973A' : 'transparent'}
                          color={(hoveredRating || rating) >= star ? '#C9973A' : '#D1CFC9'}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm font-sans text-slate">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review text */}
                <div className="space-y-2">
                  <label className="text-sm font-sans font-medium text-ink block">
                    Write a review
                    <span className="font-normal text-slate ml-1">(optional, min 30 chars)</span>
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe your rental experience..."
                    rows={4}
                    className="w-full rounded-card border border-frost bg-white px-4 py-3 text-sm font-sans text-ink placeholder:text-fog focus:outline-none focus:border-gold resize-none transition-colors"
                  />
                  {/* Character progress bar */}
                  <div className="space-y-1">
                    <div className="h-1 rounded-full bg-frost overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: reviewProgress >= REVIEW_MIN_CHARS ? '#0A7855' : '#C9973A' }}
                        animate={{ width: `${(reviewProgress / REVIEW_MIN_CHARS) * 100}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <p className="text-xs font-sans text-fog text-right">
                      {reviewText.length} / {REVIEW_MIN_CHARS} characters minimum
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setReviewSkipped(true); navigate(2) }}
                    className="flex-1 py-3.5 rounded-card border border-frost font-sans text-sm text-slate hover:bg-frost transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(2)}
                    className="flex-1 py-3.5 rounded-card font-sans font-medium text-white text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: '#C9973A' }}
                  >
                    Continue
                    <ChevronRight size={16} strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Confirm ── */}
            {step === 2 && (
              <motion.div
                key="step-confirm"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl text-ink">Confirm Return</h2>
                  <p className="text-sm font-sans text-slate">Review your return summary below.</p>
                </div>

                {/* Summary card */}
                <div className="bg-white border border-frost rounded-card overflow-hidden">
                  <div className="px-5 py-3 border-b border-frost">
                    <p className="text-sm font-sans font-medium text-ink">Return Summary</p>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-slate">Photos uploaded</span>
                      <span className="font-medium text-ink">{filledSlots} / 4</span>
                    </div>
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-slate">Review</span>
                      <span className="font-medium text-ink">
                        {reviewSkipped ? 'Skipped' : rating > 0 ? `${rating} ★` : 'Not submitted'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-slate">Booking</span>
                      <span className="font-mono text-xs font-medium text-ink">{bookingId}</span>
                    </div>
                  </div>
                </div>

                {/* Animated checkmark */}
                <div className="py-6">
                  <AnimatedCheckmark />
                  <p className="text-center font-sans text-sm text-slate mt-4">
                    Once confirmed, the lister will be notified to review the return photos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // TODO: submit return via API
                    alert('Return submitted successfully!')
                  }}
                  className="w-full py-4 rounded-card font-sans font-medium text-white text-sm hover:opacity-90 transition-opacity"
                  style={{ background: '#0A7855' }}
                >
                  Complete Return
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
