'use client'

import { useState, useRef } from 'react'
import { Camera, Check, Upload, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface PhotoSlot {
  party: 'OWNER' | 'RENTER'
  type: 'PICKUP' | 'RETURN'
  imageUrl?: string
  uploadedAt?: string
}

interface ConditionPhotoSlotsProps {
  slots: PhotoSlot[]
  editableParty?: 'OWNER' | 'RENTER'
  onUpload?: (party: 'OWNER' | 'RENTER', type: 'PICKUP' | 'RETURN', file: File) => Promise<void>
}

const SLOT_LABELS = {
  OWNER_PICKUP: 'Owner — Before',
  RENTER_PICKUP: 'Renter — Before',
  OWNER_RETURN: 'Owner — After',
  RENTER_RETURN: 'Renter — After',
}

export function ConditionPhotoSlots({ slots, editableParty, onUpload }: ConditionPhotoSlotsProps) {
  const [uploading, setUploading] = useState<string | null>(null)
  const [retrying, setRetrying] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFileChange = async (party: 'OWNER' | 'RENTER', type: 'PICKUP' | 'RETURN', file: File) => {
    const key = `${party}_${type}`
    setUploading(key)
    try {
      await onUpload?.(party, type, file)
    } catch {
      setRetrying(key)
      // Exponential backoff retry
      for (let i = 0; i < 3; i++) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000))
        try {
          await onUpload?.(party, type, file)
          setRetrying(null)
          break
        } catch {
          if (i === 2) setRetrying(null)
        }
      }
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {slots.map((slot) => {
        const key = `${slot.party}_${slot.type}`
        const label = SLOT_LABELS[key as keyof typeof SLOT_LABELS]
        const isEditable = editableParty === slot.party
        const isUploading = uploading === key
        const isRetrying = retrying === key

        return (
          <div key={key} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'w-full aspect-square rounded-2xl border-2 relative overflow-hidden transition-all duration-300',
                slot.imageUrl
                  ? 'border-royal'
                  : isEditable
                  ? 'border-dashed border-border hover:border-gold cursor-pointer'
                  : 'border-dashed border-mist',
              )}
              onClick={() => isEditable && !slot.imageUrl && inputRefs.current[key]?.click()}
            >
              {slot.imageUrl ? (
                <>
                  <Image src={slot.imageUrl} alt={label} fill className="object-cover" />
                  <div className="absolute top-2 right-2 w-6 h-6 bg-royal rounded-full flex items-center justify-center">
                    <Check size={12} strokeWidth={2.5} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {isUploading || isRetrying ? (
                    <>
                      <RefreshCw size={20} strokeWidth={1.5} className="text-royal animate-spin" />
                      <span className="text-xs text-fog font-sans">
                        {isRetrying ? 'Retrying…' : 'Uploading…'}
                      </span>
                    </>
                  ) : isEditable ? (
                    <>
                      <Upload size={20} strokeWidth={1.5} className="text-fog" />
                      <span className="text-xs text-fog font-sans">Upload</span>
                    </>
                  ) : (
                    <Camera size={20} strokeWidth={1.5} className="text-mist" />
                  )}
                </div>
              )}
            </div>
            <span className="text-xs font-sans text-fog text-center">{label}</span>
            {isEditable && !slot.imageUrl && (
              <input
                ref={(el) => { inputRefs.current[key] = el }}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileChange(slot.party, slot.type, file)
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
