'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, ClipboardList, Wrench, FileText, ChevronDown,
  CheckCircle, AlertTriangle, Clock, X, Calendar, Loader2,
  GripVertical, MoreHorizontal, ChevronLeft, ChevronRight,
} from 'lucide-react'

// ─── Types & Mock Data ───────────────────────────────────────────────────────

type RentStatus = 'COLLECTED' | 'PENDING' | 'OVERDUE'
type MaintenancePriority = 'HIGH' | 'MEDIUM' | 'LOW'
type MaintenanceColumn = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED'
type PropertyStatus = 'OCCUPIED' | 'VACANT' | 'MAINTENANCE'

interface AssignedProperty {
  id: string
  name: string
  address: string
  owner: string
  status: PropertyStatus
  lastInspection: string
  rentDue: string
  rentStatus: RentStatus
  rentAmount: number
}

interface MaintenanceCard {
  id: string
  title: string
  property: string
  reportedDate: string
  priority: MaintenancePriority
  column: MaintenanceColumn
}

const ASSIGNED_PROPERTIES: AssignedProperty[] = [
  { id: 'ap1', name: 'Lotus Residencies 4A', address: '42 Galle Road, Colombo 3', owner: 'Suresh Perera', status: 'OCCUPIED', lastInspection: '15 Apr 2026', rentDue: '1 Jun', rentStatus: 'COLLECTED', rentAmount: 65000 },
  { id: 'ap2', name: 'Sunset View 12B', address: '18 Nawala Road, Rajagiriya', owner: 'Suresh Perera', status: 'OCCUPIED', lastInspection: '28 Mar 2026', rentDue: '1 May', rentStatus: 'OVERDUE', rentAmount: 45000 },
  { id: 'ap3', name: 'Highland Terrace 7', address: '5 Gregory Road, Colombo 7', owner: 'Suresh Perera', status: 'MAINTENANCE', lastInspection: '10 Feb 2026', rentDue: '1 Jun', rentStatus: 'PENDING', rentAmount: 120000 },
  { id: 'ap4', name: 'Greenfield Studio 2', address: '77 Havelock Town, Colombo 5', owner: 'Suresh Perera', status: 'VACANT', lastInspection: '5 Jan 2026', rentDue: '—', rentStatus: 'PENDING', rentAmount: 35000 },
  { id: 'ap5', name: 'Palm View Apartments 8C', address: '12 Duplication Road, Colombo 4', owner: 'Amara Silva', status: 'OCCUPIED', lastInspection: '20 Apr 2026', rentDue: '1 Jun', rentStatus: 'COLLECTED', rentAmount: 85000 },
  { id: 'ap6', name: 'Ocean Breeze Villa', address: 'Coastal Road, Mount Lavinia', owner: 'Amara Silva', status: 'OCCUPIED', lastInspection: '12 Apr 2026', rentDue: '1 Jun', rentStatus: 'PENDING', rentAmount: 95000 },
  { id: 'ap7', name: 'City Heights 3F', address: 'Beira Lake Drive, Colombo 2', owner: 'Nishan Cooray', status: 'OCCUPIED', lastInspection: '8 Apr 2026', rentDue: '1 Jun', rentStatus: 'COLLECTED', rentAmount: 75000 },
  { id: 'ap8', name: 'Garden Gate 11', address: '34 Wijerama Mawatha, Colombo 7', owner: 'Nishan Cooray', status: 'OCCUPIED', lastInspection: '2 May 2026', rentDue: '1 Jun', rentStatus: 'COLLECTED', rentAmount: 55000 },
  { id: 'ap9', name: 'Riverside Penthouse', address: 'Kelani River Road, Kelaniya', owner: 'Chamari Dias', status: 'OCCUPIED', lastInspection: '30 Apr 2026', rentDue: '1 Jun', rentStatus: 'COLLECTED', rentAmount: 145000 },
  { id: 'ap10', name: 'Sapphire Tower 15A', address: 'Union Place, Colombo 2', owner: 'Chamari Dias', status: 'MAINTENANCE', lastInspection: '18 Apr 2026', rentDue: '1 Jun', rentStatus: 'PENDING', rentAmount: 110000 },
  { id: 'ap11', name: 'Kandy Hill Retreat', address: 'Bahirawakanda, Kandy', owner: 'Rohan Bandara', status: 'OCCUPIED', lastInspection: '25 Apr 2026', rentDue: '1 Jun', rentStatus: 'COLLECTED', rentAmount: 55000 },
  { id: 'ap12', name: 'Nugegoda Nest 5', address: '9 High Level Road, Nugegoda', owner: 'Rohan Bandara', status: 'VACANT', lastInspection: '10 Mar 2026', rentDue: '—', rentStatus: 'PENDING', rentAmount: 40000 },
]

const INITIAL_MAINTENANCE: MaintenanceCard[] = [
  { id: 'm1', title: 'AC unit not cooling', property: 'Lotus Residencies 4A', reportedDate: '20 May 2026', priority: 'HIGH', column: 'REPORTED' },
  { id: 'm2', title: 'Leaking bathroom tap', property: 'Sunset View 12B', reportedDate: '18 May 2026', priority: 'MEDIUM', column: 'REPORTED' },
  { id: 'm3', title: 'Ceiling water stain', property: 'Highland Terrace 7', reportedDate: '5 Apr 2026', priority: 'HIGH', column: 'IN_PROGRESS' },
  { id: 'm4', title: 'Broken window latch', property: 'Sapphire Tower 15A', reportedDate: '22 Apr 2026', priority: 'LOW', column: 'IN_PROGRESS' },
  { id: 'm5', title: 'Main gate hinge damaged', property: 'Palm View 8C', reportedDate: '10 Apr 2026', priority: 'MEDIUM', column: 'IN_PROGRESS' },
  { id: 'm6', title: 'Light fitting replaced', property: 'City Heights 3F', reportedDate: '1 Mar 2026', priority: 'LOW', column: 'RESOLVED' },
  { id: 'm7', title: 'Water heater serviced', property: 'Kandy Hill Retreat', reportedDate: '15 Feb 2026', priority: 'MEDIUM', column: 'RESOLVED' },
]

const KANBAN_COLS: { key: MaintenanceColumn; label: string; color: string }[] = [
  { key: 'REPORTED',    label: 'Reported',    color: 'border-warning/40 bg-warning/5' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-royal/40 bg-royal/5' },
  { key: 'RESOLVED',    label: 'Resolved',    color: 'border-success/40 bg-success/5' },
]

const PRIORITY_META: Record<MaintenancePriority, { label: string; classes: string }> = {
  HIGH:   { label: 'High',   classes: 'bg-danger/10 text-danger border-danger/20' },
  MEDIUM: { label: 'Medium', classes: 'bg-warning/10 text-warning border-warning/20' },
  LOW:    { label: 'Low',    classes: 'bg-fog/20 text-fog border-fog/30' },
}

const STATUS_META: Record<PropertyStatus, { label: string; classes: string }> = {
  OCCUPIED:    { label: 'Occupied',    classes: 'bg-success/10 text-success' },
  VACANT:      { label: 'Vacant',      classes: 'bg-warning/10 text-warning' },
  MAINTENANCE: { label: 'Maintenance', classes: 'bg-danger/10 text-danger' },
}

const RENT_STATUS_META: Record<RentStatus, { dot: string; label: string }> = {
  COLLECTED: { dot: 'bg-success', label: 'Collected' },
  PENDING:   { dot: 'bg-warning', label: 'Pending' },
  OVERDUE:   { dot: 'bg-danger',  label: 'Overdue' },
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// ─── Modal Overlay ───────────────────────────────────────────────────────────

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="bg-white rounded-card shadow-xl w-full max-w-md overflow-hidden"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// ─── Record Rent Modal ───────────────────────────────────────────────────────

function RecordRentModal({ property, onClose }: { property: AssignedProperty; onClose: () => void }) {
  const [amount, setAmount] = useState(property.rentAmount.toString())
  const [period, setPeriod] = useState('May 2026')
  const [ref, setRef] = useState('')
  const [done, setDone] = useState(false)

  const currentMonthIdx = 4 // May 2026
  const periodOptions = MONTHS.slice(0, 6).map((m, i) => `${m} 2026`)

  const handleRecord = () => setDone(true)

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <h3 className="font-heading text-lg text-ink">Record Rent</h3>
        <button onClick={onClose} className="text-fog hover:text-ink transition-colors">
          <X size={18} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 py-5">
            <p className="font-sans text-xs text-fog mb-4">{property.name}</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-sans text-xs font-medium text-ink block mb-1.5">Amount (LKR)</label>
                <div className="flex items-center border border-border rounded-card overflow-hidden focus-within:border-gold transition-colors">
                  <span className="px-3 font-mono text-sm text-fog bg-frost border-r border-border py-3">Rs.</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="flex-1 px-3 py-3 font-mono text-sm text-ink outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-sans text-xs font-medium text-ink block mb-1.5">Period</label>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="w-full border border-border rounded-card px-3 py-3 font-sans text-sm text-ink outline-none focus:border-gold transition-colors bg-white"
                >
                  {periodOptions.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="font-sans text-xs font-medium text-ink block mb-1.5">Reference Number</label>
                <input
                  type="text"
                  value={ref}
                  onChange={e => setRef(e.target.value)}
                  placeholder="e.g. TXN-2026-00482"
                  className="w-full border border-border rounded-card px-3 py-3 font-sans text-sm text-ink outline-none focus:border-gold transition-colors placeholder:text-fog"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-card border border-border font-sans text-sm text-slate hover:border-danger/30 hover:text-danger transition-colors">
                Cancel
              </button>
              <button
                onClick={handleRecord}
                className="flex-1 py-2.5 rounded-card bg-royal text-white font-sans text-sm font-medium hover:bg-royal-dark transition-colors"
              >
                Record
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-10 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle size={24} className="text-success" />
            </div>
            <p className="font-heading text-lg text-ink mb-1">Rent Recorded</p>
            <p className="font-sans text-sm text-slate mb-1">Rs. {Number(amount).toLocaleString()} for {period}</p>
            {ref && <p className="font-mono text-xs text-fog">{ref}</p>}
            <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-card bg-royal/10 text-royal font-sans text-sm hover:bg-royal/20 transition-colors">
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Inspection Modal ─────────────────────────────────────────────────────────

function InspectionModal({ property, onClose }: { property: AssignedProperty; onClose: () => void }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [timeSlot, setTimeSlot] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const daysInMonth = 30
  const firstDay = 5 // June 2026 starts on Monday (0=Sun, skip to Mon)
  const TIME_SLOTS = ['Morning (8–12)', 'Afternoon (12–17)', 'Evening (17–20)']

  const handleSchedule = () => {
    if (selectedDay && timeSlot) setDone(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <h3 className="font-heading text-lg text-ink">Schedule Inspection</h3>
        <button onClick={onClose} className="text-fog hover:text-ink transition-colors"><X size={18} /></button>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 py-5">
            <p className="font-sans text-xs text-fog mb-5">{property.name}</p>

            {/* Calendar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-royal" />
                  <span className="font-sans text-sm font-medium text-ink">June 2026</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 rounded text-fog hover:text-ink transition-colors"><ChevronLeft size={14} /></button>
                  <button className="p-1 rounded text-fog hover:text-ink transition-colors"><ChevronRight size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-center font-mono text-[10px] text-fog py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`h-8 w-full rounded-card font-mono text-xs transition-colors ${
                      selectedDay === day
                        ? 'bg-royal text-white'
                        : day < 5
                        ? 'text-fog/40 cursor-not-allowed'
                        : 'text-ink hover:bg-frost'
                    }`}
                    disabled={day < 5}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="mb-6">
              <p className="font-sans text-xs font-medium text-ink mb-2">Time Slot</p>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={`px-3 py-1.5 rounded-full font-sans text-xs border transition-colors ${
                      timeSlot === slot
                        ? 'bg-royal text-white border-royal'
                        : 'border-border text-slate hover:border-royal/40'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-card border border-border font-sans text-sm text-slate hover:border-danger/30 hover:text-danger transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!selectedDay || !timeSlot}
                className="flex-1 py-2.5 rounded-card bg-royal text-white font-sans text-sm font-medium hover:bg-royal-dark transition-colors disabled:opacity-40"
              >
                Schedule
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-10 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-royal/10 flex items-center justify-center mb-4">
              <Calendar size={22} className="text-royal" />
            </div>
            <p className="font-heading text-lg text-ink mb-1">Inspection Scheduled</p>
            <p className="font-sans text-sm text-slate">June {selectedDay}, 2026</p>
            <p className="font-mono text-xs text-fog mt-1">{timeSlot}</p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 rounded-card bg-royal/10 text-royal font-sans text-sm hover:bg-royal/20 transition-colors">
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

function KanbanBoard({ cards }: { cards: MaintenanceCard[] }) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {KANBAN_COLS.map(col => {
        const colCards = cards.filter(c => c.column === col.key)
        return (
          <div key={col.key} className={`rounded-card border p-4 ${col.color}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-sm font-medium text-ink">{col.label}</span>
              <span className="font-mono text-xs text-fog bg-white border border-border rounded-full w-6 h-6 flex items-center justify-center">
                {colCards.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {colCards.map(card => {
                const pm = PRIORITY_META[card.priority]
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-card border border-border p-4 shadow-card relative group"
                    onMouseEnter={() => setShowTooltip(card.id)}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    {/* Drag hint */}
                    <AnimatePresence>
                      {showTooltip === card.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 bg-ink text-white font-sans text-[10px] px-2.5 py-1 rounded-card whitespace-nowrap z-10"
                        >
                          Drag to update
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-ink" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        <GripVertical size={14} className="text-fog mt-0.5 flex-shrink-0 cursor-grab" />
                        <p className="font-sans text-sm font-medium text-ink leading-snug">{card.title}</p>
                      </div>
                      <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-full flex-shrink-0 ${pm.classes}`}>
                        {pm.label}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-fog ml-5">{card.property}</p>
                    <p className="font-mono text-[10px] text-fog/70 ml-5 mt-1">{card.reportedDate}</p>
                  </div>
                )
              })}
              {colCards.length === 0 && (
                <div className="text-center py-8 text-fog font-sans text-xs border-2 border-dashed border-border/50 rounded-card">
                  No items
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'rent'; property: AssignedProperty }
  | { type: 'inspection'; property: AssignedProperty }
  | null

export default function ManagerPortalPage() {
  const [modal, setModal] = useState<ModalState>(null)
  const [reportMonth, setReportMonth] = useState('May 2026')
  const [reportState, setReportState] = useState<'idle' | 'loading' | 'done'>('idle')

  const maintenanceCards = INITIAL_MAINTENANCE

  const inspectionsDue = ASSIGNED_PROPERTIES.filter(p => {
    const d = new Date(p.lastInspection)
    const daysSince = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince > 30
  }).length

  const pendingRents = ASSIGNED_PROPERTIES.filter(p => p.rentStatus === 'PENDING' || p.rentStatus === 'OVERDUE').length
  const openMaintenance = maintenanceCards.filter(c => c.column !== 'RESOLVED').length

  const handleGenerateReport = async () => {
    setReportState('loading')
    await new Promise(r => setTimeout(r, 1800))
    setReportState('done')
    setTimeout(() => setReportState('idle'), 4000)
  }

  return (
    <div className="min-h-screen bg-snow font-sans">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 md:px-10 py-5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-heading text-xl text-ink">Manager Portal</h1>
                <span className="bg-royal text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full">
                  {ASSIGNED_PROPERTIES.length} properties
                </span>
              </div>
              <p className="font-sans text-xs text-fog">Chaminda Wickramasinghe · Senior Property Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-royal flex items-center justify-center">
              <span className="font-sans text-sm font-semibold text-white">C</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Assigned Properties', value: ASSIGNED_PROPERTIES.length, icon: Building2, color: 'text-royal', bg: 'bg-royal/10' },
            { label: 'Inspections Due', value: inspectionsDue, icon: ClipboardList, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Pending Rent Records', value: pendingRents, icon: FileText, color: 'text-danger', bg: 'bg-danger/10' },
            { label: 'Open Maintenance', value: openMaintenance, icon: Wrench, color: 'text-gold', bg: 'bg-gold/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-card border border-border p-5 shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-sans text-xs text-fog">{label}</p>
                <div className={`w-8 h-8 rounded-card ${bg} flex items-center justify-center`}>
                  <Icon size={14} className={color} />
                </div>
              </div>
              <p className={`font-mono text-2xl font-medium ${color}`}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Assigned Properties Table */}
        <div className="bg-white rounded-card border border-border shadow-card mb-10 overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-heading text-lg text-ink">Assigned Properties</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-frost border-b border-border">
                  {['Property', 'Owner', 'Status', 'Last Inspection', 'Rent Due', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-mono text-[10px] tracking-widest uppercase text-fog font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ASSIGNED_PROPERTIES.map((p, i) => {
                  const sm = STATUS_META[p.status]
                  const rm = RENT_STATUS_META[p.rentStatus]
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-snow transition-colors last:border-0"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-sans text-sm font-medium text-ink">{p.name}</p>
                        <p className="font-sans text-xs text-fog">{p.address}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-sans text-sm text-slate">{p.owner}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-mono text-[10px] px-2.5 py-1 rounded-full ${sm.classes}`}>{sm.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs text-slate">{p.lastInspection}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${rm.dot}`} />
                          <span className="font-mono text-xs text-slate">{p.rentDue}</span>
                          <span className="font-mono text-[10px] text-fog">({rm.label})</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setModal({ type: 'rent', property: p })}
                            className="px-2.5 py-1 rounded-card bg-royal/5 text-royal font-sans text-xs hover:bg-royal/10 transition-colors whitespace-nowrap"
                          >
                            Record Rent
                          </button>
                          <button
                            onClick={() => setModal({ type: 'inspection', property: p })}
                            className="px-2.5 py-1 rounded-card border border-border text-slate font-sans text-xs hover:border-royal/40 hover:text-royal transition-colors whitespace-nowrap"
                          >
                            Inspection
                          </button>
                          <button className="w-6 h-6 rounded-card border border-border text-fog flex items-center justify-center hover:border-gold/40 hover:text-gold transition-colors">
                            <Wrench size={11} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Kanban */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg text-ink">Maintenance Tracker</h2>
            <span className="font-sans text-xs text-fog italic">Drag cards between columns to update status</span>
          </div>
          <KanbanBoard cards={maintenanceCards} />
        </div>

        {/* Monthly Report Trigger */}
        <div className="bg-white rounded-card border border-border shadow-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg text-ink mb-1">Monthly Owner Reports</h2>
              <p className="font-sans text-sm text-slate">Generate and email income/expense summaries to all property owners.</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <select
                value={reportMonth}
                onChange={e => setReportMonth(e.target.value)}
                className="border border-border rounded-card px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-royal transition-colors bg-white"
              >
                {MONTHS.slice(0, 5).map(m => <option key={m}>{m} 2026</option>)}
              </select>
              <button
                onClick={handleGenerateReport}
                disabled={reportState === 'loading'}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-card font-sans text-sm font-medium transition-all ${
                  reportState === 'done'
                    ? 'bg-success text-white'
                    : 'bg-royal text-white hover:bg-royal-dark'
                } disabled:opacity-60`}
              >
                {reportState === 'loading' && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {reportState === 'done' && (
                  <CheckCircle size={15} />
                )}
                {reportState === 'idle' && `Generate Report for ${reportMonth}`}
                {reportState === 'loading' && 'Generating...'}
                {reportState === 'done' && 'Report sent to owner emails'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === 'rent' && (
          <ModalOverlay onClose={() => setModal(null)}>
            <RecordRentModal property={modal.property} onClose={() => setModal(null)} />
          </ModalOverlay>
        )}
        {modal?.type === 'inspection' && (
          <ModalOverlay onClose={() => setModal(null)}>
            <InspectionModal property={modal.property} onClose={() => setModal(null)} />
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  )
}
