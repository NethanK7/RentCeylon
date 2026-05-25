'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle, XCircle, Clock, RefreshCw, X, FileImage } from 'lucide-react'
import Link from 'next/link'

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error'
type VerifyStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'

interface FileSlot {
  label: string
  file: File | null
  preview: string | null
  status: UploadStatus
  error: string | null
}

export default function VerifyIdPage() {
  const [verifyStatus] = useState<VerifyStatus>('not_submitted')
  const [slots, setSlots] = useState<Record<string, FileSlot>>({
    front: { label: 'Front of ID / Passport', file: null, preview: null, status: 'idle', error: null },
    back: { label: 'Back of ID (if applicable)', file: null, preview: null, status: 'idle', error: null },
  })

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFileSelect = async (slotKey: string, file: File) => {
    const preview = URL.createObjectURL(file)
    setSlots((s) => ({
      ...s,
      [slotKey]: { ...s[slotKey], file, preview, status: 'uploading', error: null },
    }))

    // Simulated upload with retry
    for (let attempt = 0; attempt < 3; attempt++) {
      await new Promise((r) => setTimeout(r, 1000 + attempt * 500))
      // Simulate success on first attempt
      setSlots((s) => ({
        ...s,
        [slotKey]: { ...s[slotKey], status: 'uploaded' },
      }))
      return
    }
    setSlots((s) => ({
      ...s,
      [slotKey]: { ...s[slotKey], status: 'error', error: 'Upload failed. Please retry.' },
    }))
  }

  const removeFile = (slotKey: string) => {
    const slot = slots[slotKey]
    if (slot.preview) URL.revokeObjectURL(slot.preview)
    setSlots((s) => ({
      ...s,
      [slotKey]: { ...s[slotKey], file: null, preview: null, status: 'idle', error: null },
    }))
  }

  return (
    <div className="min-h-screen bg-snow pt-24 pb-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-sm" style={{ background: 'linear-gradient(135deg, #C9973A, #E8BC6A)' }} />
            <span className="text-2xl font-display text-ink" style={{ fontWeight: 400 }}>RentLoop</span>
          </Link>
          <h1 className="font-heading text-ink text-3xl mb-2">ID Verification</h1>
          <p className="font-sans text-fog text-sm max-w-sm mx-auto leading-relaxed">
            Upload a government-issued ID. Reviewed by our trust team within 24 hours.
          </p>
        </div>

        {/* Verification status card */}
        {verifyStatus !== 'not_submitted' && (
          <div
            className="rounded-card p-5 mb-6 flex items-start gap-4"
            style={{
              background: verifyStatus === 'approved' ? 'rgba(10,120,85,0.06)' : verifyStatus === 'rejected' ? 'rgba(185,28,28,0.06)' : '#FDF7ED',
              border: `1px solid ${verifyStatus === 'approved' ? 'rgba(10,120,85,0.2)' : verifyStatus === 'rejected' ? 'rgba(185,28,28,0.2)' : 'rgba(201,151,58,0.3)'}`,
            }}
          >
            {verifyStatus === 'pending' && <Clock size={20} strokeWidth={1.5} className="text-gold shrink-0 mt-0.5" />}
            {verifyStatus === 'approved' && <CheckCircle size={20} strokeWidth={1.5} className="text-success shrink-0 mt-0.5" />}
            {verifyStatus === 'rejected' && <XCircle size={20} strokeWidth={1.5} className="text-danger shrink-0 mt-0.5" />}
            <div>
              <p className="font-sans font-medium text-sm text-ink mb-1">
                {verifyStatus === 'pending' ? 'Verification in progress' : verifyStatus === 'approved' ? 'Identity Verified ✓' : 'Verification Rejected'}
              </p>
              <p className="font-sans text-xs text-slate leading-relaxed">
                {verifyStatus === 'pending' ? 'Our team is reviewing your documents. This takes up to 24 hours.' : verifyStatus === 'approved' ? 'Your identity has been verified. You can now list items.' : 'Your documents were unclear. Please re-upload a high-quality photo of your ID.'}
              </p>
            </div>
          </div>
        )}

        {/* Upload slots */}
        <div className="space-y-4 mb-6">
          {Object.entries(slots).map(([key, slot]) => (
            <div key={key}>
              <p className="text-sm font-sans font-medium text-ink mb-2">{slot.label}</p>
              {slot.preview ? (
                <div
                  className="relative rounded-card overflow-hidden aspect-[16/9] border-2"
                  style={{ borderColor: slot.status === 'uploaded' ? '#1A3D8F' : slot.status === 'error' ? '#B91C1C' : '#DDE3F0' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slot.preview} alt={slot.label} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(12,17,36,0.3)' }}
                  >
                    {slot.status === 'uploading' && (
                      <div className="flex items-center gap-2 text-white">
                        <RefreshCw size={18} strokeWidth={1.5} className="animate-spin" />
                        <span className="font-sans text-sm">Uploading…</span>
                      </div>
                    )}
                    {slot.status === 'uploaded' && (
                      <div className="w-10 h-10 rounded-full bg-royal flex items-center justify-center">
                        <CheckCircle size={20} strokeWidth={1.5} className="text-white" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(key)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                  >
                    <X size={12} strokeWidth={2} className="text-ink" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRefs.current[key]?.click()}
                  className="w-full aspect-[16/9] rounded-card border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all"
                  style={{ borderColor: '#DDE3F0', background: '#F8F9FC' }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#C9973A' }}
                  onDragLeave={(e) => { e.currentTarget.style.borderColor = '#DDE3F0' }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = '#DDE3F0'
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileSelect(key, file)
                  }}
                >
                  <FileImage size={28} strokeWidth={1.5} className="text-fog" />
                  <div className="text-center">
                    <p className="text-sm font-sans text-slate">Click to upload or drag & drop</p>
                    <p className="text-xs font-sans text-fog mt-0.5">JPG, PNG up to 10MB</p>
                  </div>
                </button>
              )}
              {slot.error && (
                <p className="text-xs text-danger font-sans mt-1 flex items-center gap-1">
                  <XCircle size={12} strokeWidth={1.5} />
                  {slot.error}
                </p>
              )}
              <input
                ref={(el) => { fileInputRefs.current[key] = el }}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(key, file)
                }}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          className="w-full py-4 rounded-full font-sans font-medium text-sm transition-all"
          style={{
            background: Object.values(slots).some((s) => s.status === 'uploaded') ? 'linear-gradient(135deg, #1A3D8F, #122D6B)' : '#E4EAF4',
            color: Object.values(slots).some((s) => s.status === 'uploaded') ? '#FFFFFF' : '#8A97B5',
          }}
        >
          Submit for Verification
        </button>

        <p className="text-center text-xs font-sans text-fog mt-4">
          Your documents are encrypted and only accessible to our trust team
        </p>
      </div>
    </div>
  )
}
