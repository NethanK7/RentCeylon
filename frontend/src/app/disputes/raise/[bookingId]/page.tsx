'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Shield, ChevronLeft, X } from 'lucide-react'
import Link from 'next/link'

const DISPUTE_TYPES = [
  { id: 'damage', label: 'Item Damage', sub: 'Item returned with damage not present at pickup' },
  { id: 'missing', label: 'Missing Items', sub: 'Parts or accessories missing from the listing' },
  { id: 'condition', label: 'Condition Misrepresented', sub: 'Item condition doesn\'t match the listing' },
  { id: 'deposit', label: 'Deposit Dispute', sub: 'Disagreement over deposit release amount' },
  { id: 'other', label: 'Other', sub: 'Other issue not listed above' },
]

export default function RaiseDisputePage({ params }: { params: { bookingId: string } }) {
  const [disputeType, setDisputeType] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleFileAdd = (file: File) => {
    setEvidenceFiles((prev) => [...prev, URL.createObjectURL(file)])
  }

  return (
    <div className="min-h-screen bg-snow pt-20 pb-24 px-4">
      <div className="max-w-[560px] mx-auto">
        <Link href={`/dashboard/active/${params.bookingId}`} className="flex items-center gap-2 text-sm font-sans text-fog hover:text-ink transition-colors mb-6">
          <ChevronLeft size={16} strokeWidth={1.5} />
          Back to rental
        </Link>

        {!submitted ? (
          <>
            <h1 className="font-heading text-ink text-2xl mb-2">Raise a Dispute</h1>
            <p className="font-sans text-fog text-sm mb-8">Our team will review and resolve within 72 hours</p>

            {/* Type selection */}
            <div className="space-y-3 mb-6">
              {DISPUTE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setDisputeType(type.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-card border-2 text-left transition-all"
                  style={{
                    borderColor: disputeType === type.id ? '#1A3D8F' : '#DDE3F0',
                    background: disputeType === type.id ? '#EEF2FB' : '#FFFFFF',
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 shrink-0 transition-all"
                    style={{
                      borderColor: disputeType === type.id ? '#1A3D8F' : '#C4CEEA',
                      background: disputeType === type.id ? '#1A3D8F' : 'transparent',
                    }}
                  />
                  <div>
                    <p className="font-sans font-medium text-ink text-sm">{type.label}</p>
                    <p className="font-sans text-fog text-xs mt-0.5">{type.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="text-sm font-sans font-medium text-ink block mb-2">Describe the issue</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible. Include when you noticed the issue, what exactly is wrong, and what resolution you're seeking..."
                rows={5}
                className="w-full p-4 rounded-card border border-border font-sans text-sm text-ink placeholder-fog outline-none focus:border-royal resize-none transition-colors"
                style={{ fontSize: 16 }}
              />
              <p className="text-xs font-sans text-fog mt-1">{description.length} characters</p>
            </div>

            {/* Evidence upload */}
            <div className="mb-6">
              <label className="text-sm font-sans font-medium text-ink block mb-2">Evidence Photos</label>
              <p className="text-xs font-sans text-fog mb-3">Condition photos from the booking are automatically linked</p>

              {/* Auto-linked condition photos preview */}
              <div className="flex gap-2 mb-3 p-3 rounded-card bg-royal-light border border-royal/20">
                <Shield size={14} strokeWidth={1.5} className="text-royal shrink-0 mt-0.5" />
                <p className="text-xs font-sans text-royal">4 condition photos automatically attached from your rental</p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {evidenceFiles.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-card overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setEvidenceFiles((f) => f.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center"
                    >
                      <X size={10} strokeWidth={2} className="text-ink" />
                    </button>
                  </div>
                ))}
                {evidenceFiles.length < 8 && (
                  <label className="aspect-square rounded-card border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-royal transition-colors bg-frost">
                    <Upload size={16} strokeWidth={1.5} className="text-fog" />
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileAdd(f) }} />
                  </label>
                )}
              </div>
            </div>

            {/* 72hr guarantee */}
            <div
              className="flex items-start gap-3 p-4 rounded-card mb-6"
              style={{ background: '#FDF7ED', border: '1px solid rgba(201,151,58,0.3)' }}
            >
              <Shield size={16} strokeWidth={1.5} className="text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-sans font-medium text-sm text-ink">72hr Resolution Guarantee</p>
                <p className="font-sans text-xs text-slate mt-0.5 leading-relaxed">
                  Our trust team will review your dispute and issue a resolution within 72 hours. If unresolved, the deposit defaults to the renter.
                </p>
              </div>
            </div>

            <button
              disabled={!disputeType || description.length < 20}
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 rounded-full font-sans font-medium text-sm transition-all"
              style={{
                background: disputeType && description.length >= 20 ? 'linear-gradient(135deg, #1A3D8F, #122D6B)' : '#E4EAF4',
                color: disputeType && description.length >= 20 ? '#FFFFFF' : '#8A97B5',
              }}
            >
              Submit Dispute
            </button>

            {/* Confirm modal */}
            <AnimatePresence>
              {showConfirm && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
                  <motion.div
                    className="relative bg-white rounded-card p-8 max-w-sm w-full text-center shadow-2xl"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-royal-light flex items-center justify-center mx-auto mb-4">
                      <Shield size={22} strokeWidth={1.5} className="text-royal" />
                    </div>
                    <h3 className="font-heading text-ink text-xl mb-2">Submit this dispute?</h3>
                    <p className="font-sans text-fog text-sm mb-6">Our team will review within 72 hours and contact both parties.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-full border border-border font-sans text-sm text-slate">Cancel</button>
                      <button
                        onClick={() => { setShowConfirm(false); setSubmitted(true) }}
                        className="flex-1 py-3 rounded-full font-sans font-medium text-sm text-white"
                        style={{ background: '#1A3D8F' }}
                      >
                        Confirm
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-royal-light flex items-center justify-center mx-auto mb-6">
              <Shield size={28} strokeWidth={1.5} className="text-royal" />
            </div>
            <h2 className="font-heading text-ink text-2xl mb-2">Dispute Submitted</h2>
            <p className="font-sans text-fog mb-2">Reference: <span className="font-mono text-royal font-medium">DSP-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span></p>
            <p className="font-sans text-fog text-sm mb-8 max-w-xs mx-auto">You'll receive updates via SMS and email. Resolution guaranteed within 72 hours.</p>
            <Link href="/disputes/DSP-001" className="inline-block px-8 py-3 rounded-full font-sans font-medium text-sm text-white" style={{ background: '#1A3D8F' }}>
              Track Dispute
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
