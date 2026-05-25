'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const STEPS = ['Category', 'Details', 'Photos', 'Pricing', 'Preview']

const MOCK_CATEGORIES = [
  { id: '1', name: 'Electronics', icon: '💻', isEnabled: true },
  { id: '2', name: 'Vehicles', icon: '🚗', isEnabled: true },
  { id: '3', name: 'Tools & Equipment', icon: '🔧', isEnabled: true },
  { id: '4', name: 'Furniture', icon: '🛋️', isEnabled: true },
  { id: '5', name: 'Sports & Outdoors', icon: '⚽', isEnabled: true },
  { id: '6', name: 'Jewellery & Luxury', icon: '💎', isEnabled: false },
  { id: '7', name: 'Musical Instruments', icon: '🎸', isEnabled: false },
]

interface FormData {
  categoryId: string
  title: string
  description: string
  location: string
  condition: string
  photos: File[]
  pricePerDay: number
  depositAmount: number
  minDays: number
  maxDays: number
}

export default function CreateListingPage() {
  const [step, setStep] = useState(0)
  const [isPreview, setIsPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormData>({
    categoryId: '',
    title: '',
    description: '',
    location: '',
    condition: 'GOOD',
    photos: [],
    pricePerDay: 0,
    depositAmount: 0,
    minDays: 1,
    maxDays: 30,
  })

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const selectedCategory = MOCK_CATEGORIES.find(c => c.id === form.categoryId)

  function update(field: keyof FormData, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function canAdvance() {
    switch (step) {
      case 0: return !!form.categoryId
      case 1: return form.title.length >= 5 && form.description.length >= 20 && form.location.length >= 3
      case 2: return photoPreviews.length >= 3
      case 3: return form.pricePerDay > 0 && form.depositAmount > 0
      default: return true
    }
  }

  function handlePhotos(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 8 - form.photos.length)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...newFiles] }))
    setPhotoPreviews(prev => [...prev, ...newPreviews])
  }

  function removePhoto(index: number) {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1800))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-snow flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-card p-10 text-center max-w-md w-full shadow-card"
        >
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-ink mb-2">Listing Created</h2>
          <p className="text-ink/60 text-sm mb-8">Your listing has been saved as a draft. Publish it to make it visible to renters.</p>
          <div className="flex gap-3">
            <Link href="/lister/listings" className="flex-1 text-center py-3 border border-ink/20 rounded-card text-ink text-sm font-medium hover:bg-frost transition-colors">
              My Listings
            </Link>
            <button className="flex-1 py-3 bg-royal text-white rounded-card text-sm font-medium hover:bg-royal/90 transition-colors">
              Publish Now
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-snow">
      {/* Header */}
      <div className="bg-white border-b border-ink/8 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/lister/listings" className="text-ink/50 hover:text-ink text-sm">← Back</Link>
          <h1 className="font-heading text-lg text-ink">Create Listing</h1>
          {step === 4 && (
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="text-sm text-royal font-medium"
            >
              {isPreview ? 'Edit' : 'Preview'}
            </button>
          )}
          {step !== 4 && <div className="w-12" />}
        </div>

        {/* Step indicator */}
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  i < step ? 'bg-royal text-white' :
                  i === step ? 'bg-gold text-white' :
                  'bg-frost text-ink/40'
                }`}>
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-all ${i < step ? 'bg-royal' : 'bg-frost'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex mt-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 text-center">
                <span className={`text-[10px] ${i === step ? 'text-gold font-medium' : 'text-ink/40'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Category */}
          {step === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-heading text-2xl text-ink mb-2">What are you listing?</h2>
              <p className="text-ink/60 text-sm mb-6">Choose a category for your item.</p>
              <div className="grid grid-cols-2 gap-3">
                {MOCK_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => cat.isEnabled && update('categoryId', cat.id)}
                    disabled={!cat.isEnabled}
                    className={`p-4 rounded-card border-2 text-left transition-all relative ${
                      form.categoryId === cat.id
                        ? 'border-royal bg-royal/5'
                        : cat.isEnabled
                        ? 'border-ink/10 bg-white hover:border-ink/30'
                        : 'border-ink/5 bg-frost/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <div className={`text-sm font-medium ${cat.isEnabled ? 'text-ink' : 'text-ink/40'}`}>{cat.name}</div>
                    {!cat.isEnabled && (
                      <span className="absolute top-2 right-2 text-[9px] bg-fog text-ink/40 px-1.5 py-0.5 rounded-full">Soon</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div>
                <h2 className="font-heading text-2xl text-ink mb-2">Listing details</h2>
                <p className="text-ink/60 text-sm">Tell renters about your item.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide block mb-1.5">Title *</label>
                  <input
                    value={form.title}
                    onChange={e => update('title', e.target.value)}
                    placeholder="e.g. Sony A7 III Camera with 50mm Lens"
                    className="w-full border-b-2 border-ink/20 focus:border-royal bg-transparent pb-2 text-ink outline-none transition-colors placeholder:text-ink/30 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide block mb-1.5">Description * (min 20 chars)</label>
                  <textarea
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    rows={4}
                    placeholder="Describe the item, its condition, what's included..."
                    className="w-full border-2 border-ink/10 focus:border-royal bg-white rounded-card px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink/30 text-sm resize-none"
                  />
                  <div className="text-right text-xs text-ink/40 mt-1">{form.description.length} chars</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide block mb-1.5">Location *</label>
                  <input
                    value={form.location}
                    onChange={e => update('location', e.target.value)}
                    placeholder="e.g. Colombo 3, Western Province"
                    className="w-full border-b-2 border-ink/20 focus:border-royal bg-transparent pb-2 text-ink outline-none transition-colors placeholder:text-ink/30 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide block mb-1.5">Condition</label>
                  <div className="flex gap-2">
                    {['EXCELLENT', 'GOOD', 'FAIR'].map(c => (
                      <button
                        key={c}
                        onClick={() => update('condition', c)}
                        className={`px-4 py-2 rounded-card text-xs font-medium border transition-all ${
                          form.condition === c ? 'border-royal bg-royal/5 text-royal' : 'border-ink/15 text-ink/60 hover:border-ink/30'
                        }`}
                      >
                        {c.charAt(0) + c.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-heading text-2xl text-ink mb-2">Add photos</h2>
              <p className="text-ink/60 text-sm mb-2">Minimum 3 photos required. Clear photos get more bookings.</p>
              <div className={`text-xs font-medium mb-6 ${photoPreviews.length >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                {photoPreviews.length}/8 photos added {photoPreviews.length < 3 && `— ${3 - photoPreviews.length} more required`}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-card overflow-hidden bg-frost">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/70 text-white flex items-center justify-center text-xs hover:bg-ink"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-gold text-white px-1.5 py-0.5 rounded-full">Cover</span>
                    )}
                  </div>
                ))}
                {photoPreviews.length < 8 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-card border-2 border-dashed border-ink/20 hover:border-royal/50 flex flex-col items-center justify-center gap-2 text-ink/40 hover:text-royal transition-all bg-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs">Add photo</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handlePhotos(e.target.files)}
              />
            </motion.div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <motion.div key="step-3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl text-ink mb-2">Set your price</h2>
                <p className="text-ink/60 text-sm">Platform fee (10%) and deposit are added at checkout.</p>
              </div>

              <div className="bg-white rounded-card p-6 space-y-5 shadow-card">
                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide block mb-1.5">Daily Rate (Rs.) *</label>
                  <div className="flex items-center border-b-2 border-ink/20 focus-within:border-royal transition-colors">
                    <span className="text-ink/40 text-sm mr-2">Rs.</span>
                    <input
                      type="number"
                      value={form.pricePerDay || ''}
                      onChange={e => update('pricePerDay', Number(e.target.value))}
                      className="flex-1 bg-transparent pb-2 text-ink font-mono text-lg outline-none"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide block mb-1.5">Security Deposit (Rs.) *</label>
                  <div className="flex items-center border-b-2 border-ink/20 focus-within:border-royal transition-colors">
                    <span className="text-ink/40 text-sm mr-2">Rs.</span>
                    <input
                      type="number"
                      value={form.depositAmount || ''}
                      onChange={e => update('depositAmount', Number(e.target.value))}
                      className="flex-1 bg-transparent pb-2 text-ink font-mono text-lg outline-none"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-ink/40 mt-1">Suggested: 30% of daily rate × typical rental duration</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink/60 uppercase tracking-wide block mb-1.5">Min rental (days)</label>
                    <input
                      type="number"
                      value={form.minDays}
                      onChange={e => update('minDays', Number(e.target.value))}
                      className="w-full border-b-2 border-ink/20 focus:border-royal bg-transparent pb-2 text-ink font-mono outline-none transition-colors"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink/60 uppercase tracking-wide block mb-1.5">Max rental (days)</label>
                    <input
                      type="number"
                      value={form.maxDays}
                      onChange={e => update('maxDays', Number(e.target.value))}
                      className="w-full border-b-2 border-ink/20 focus:border-royal bg-transparent pb-2 text-ink font-mono outline-none transition-colors"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {form.pricePerDay > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gold-pale border border-gold/30 rounded-card p-4"
                >
                  <p className="text-xs font-medium text-ink/60 mb-2">Earnings preview (7-day rental)</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink/70">Rental (7 days)</span>
                      <span className="font-mono text-ink">Rs. {(form.pricePerDay * 7).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/70">Platform fee (10%)</span>
                      <span className="font-mono text-ink/50">− Rs. {(form.pricePerDay * 7 * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-gold/30 pt-1 mt-1">
                      <span className="font-medium text-ink">You receive</span>
                      <span className="font-mono font-semibold text-gold">Rs. {(form.pricePerDay * 7 * 0.9).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <motion.div key="step-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="font-heading text-2xl text-ink mb-2">Review your listing</h2>
              <p className="text-ink/60 text-sm mb-6">This is how renters will see your listing.</p>

              <div className="bg-white rounded-card overflow-hidden shadow-card mb-6">
                {photoPreviews.length > 0 ? (
                  <div className="aspect-video bg-frost">
                    <img src={photoPreviews[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-frost flex items-center justify-center text-ink/30 text-sm">No photos</div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading text-xl text-ink">{form.title || 'Untitled listing'}</h3>
                    <span className="text-xs bg-frost text-ink/60 px-2 py-1 rounded-full">{selectedCategory?.name}</span>
                  </div>
                  <p className="text-sm text-ink/60 mb-4 line-clamp-3">{form.description || 'No description added.'}</p>
                  <div className="flex items-center gap-1 text-ink/50 text-sm mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {form.location || 'Location not set'}
                  </div>
                  <div className="flex items-center justify-between border-t border-ink/8 pt-4">
                    <div>
                      <span className="font-mono text-xl font-semibold text-royal">Rs. {form.pricePerDay.toLocaleString()}</span>
                      <span className="text-ink/50 text-sm"> / day</span>
                    </div>
                    <span className="text-xs text-ink/50">+ Rs. {form.depositAmount.toLocaleString()} deposit</span>
                  </div>
                </div>
              </div>

              <div className="bg-gold-pale border border-gold/30 rounded-card p-4 mb-6">
                <p className="text-xs font-medium text-gold mb-1">Ready to publish?</p>
                <p className="text-xs text-ink/60">Your listing will be saved as a draft. You can publish it now or from My Listings.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3.5 border border-ink/20 rounded-card text-ink text-sm font-medium hover:bg-frost transition-colors"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className={`flex-1 py-3.5 rounded-card text-sm font-medium transition-all ${
                canAdvance()
                  ? 'bg-royal text-white hover:bg-royal/90'
                  : 'bg-frost text-ink/30 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-card text-sm font-medium bg-gold text-white hover:bg-gold/90 transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating listing...
                </span>
              ) : 'Save as Draft'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
