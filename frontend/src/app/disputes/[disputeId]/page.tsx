'use client'

import { useEffect, useState } from 'react'
import { ScrollProgress } from '@/components/animations/ScrollProgress'
import { Shield, Clock, Check, AlertTriangle } from 'lucide-react'

const DISPUTE = {
  id: 'DSP-A1B2C3',
  type: 'Item Damage',
  status: 'UNDER_REVIEW',
  raisedAt: 'Dec 14, 2024 at 2:34 PM',
  slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
  listing: 'Sony A7III Camera',
  description: 'The camera lens mount has a crack that was not present in the pickup condition photos.',
  timeline: [
    { label: 'Dispute Raised', time: 'Dec 14, 2:34 PM', done: true },
    { label: 'Under Review', time: 'Dec 14, 3:00 PM', done: true, active: true },
    { label: 'Resolution', time: 'Within 72 hours', done: false },
  ],
}

function Countdown({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = deadline.getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('00:00:00'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  return <span>{timeLeft}</span>
}

export default function DisputeStatusPage({ params }: { params: { disputeId: string } }) {
  const dispute = DISPUTE

  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      <ScrollProgress />
      <div className="max-w-[600px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-mono text-fog text-sm mb-1">{dispute.id}</p>
            <h1 className="font-heading text-ink text-2xl">{dispute.type}</h1>
            <p className="font-sans text-fog text-sm mt-1">{dispute.listing}</p>
          </div>
          <span
            className="px-3 py-1.5 rounded-full text-xs font-sans font-medium"
            style={{ background: 'rgba(196,123,4,0.08)', color: '#C47B04' }}
          >
            Under Review
          </span>
        </div>

        {/* 72hr countdown */}
        <div
          className="p-6 rounded-card mb-8 text-center"
          style={{ background: '#EEF2FB', border: '1px solid rgba(26,61,143,0.15)' }}
        >
          <p className="font-sans text-fog text-xs mb-2 uppercase tracking-widest">Time to resolution</p>
          <p className="font-mono text-royal font-medium" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}>
            <Countdown deadline={dispute.slaDeadline} />
          </p>
          <p className="font-sans text-fog text-xs mt-2">Guaranteed within 72 hours</p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-card border border-border p-6 mb-6">
          <h2 className="font-heading text-ink text-lg mb-6">Resolution Timeline</h2>
          <div className="space-y-6">
            {dispute.timeline.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: step.done ? '#1A3D8F' : step.active ? '#EEF2FB' : '#F0F3F9',
                      border: step.active && !step.done ? '2px solid #1A3D8F' : 'none',
                    }}
                  >
                    {step.done ? (
                      <Check size={14} strokeWidth={2.5} className="text-white" />
                    ) : step.active ? (
                      <div className="w-2 h-2 rounded-full bg-royal" />
                    ) : (
                      <Clock size={14} strokeWidth={1.5} className="text-fog" />
                    )}
                  </div>
                  {i < dispute.timeline.length - 1 && (
                    <div className="w-px flex-1 mt-2" style={{ background: step.done ? '#1A3D8F' : '#DDE3F0' }} />
                  )}
                </div>
                <div className="pb-6 last:pb-0">
                  <p className="font-sans font-medium text-ink text-sm">{step.label}</p>
                  <p className="font-sans text-fog text-xs mt-0.5">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-card border border-border p-6 mb-6">
          <h3 className="font-heading text-ink text-lg mb-3">Your statement</h3>
          <p className="font-sans text-slate text-sm leading-relaxed">{dispute.description}</p>
        </div>

        {/* Appeal notice */}
        <div
          className="flex items-start gap-3 p-4 rounded-card"
          style={{ background: '#F8F9FC', border: '1px solid #DDE3F0' }}
        >
          <AlertTriangle size={16} strokeWidth={1.5} className="text-fog shrink-0 mt-0.5" />
          <p className="font-sans text-fog text-xs leading-relaxed">
            You may appeal the resolution once within 48 hours of it being issued. Appeals are final.
          </p>
        </div>
      </div>
    </div>
  )
}
