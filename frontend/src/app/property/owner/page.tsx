'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, BarChart2, ClipboardList, Wrench, FileText, Settings,
  MapPin, CheckCircle, AlertCircle, Clock, ChevronDown, ChevronRight,
  Download, X, TrendingUp, Users,
} from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────

type PropertyStatus = 'ACTIVE' | 'VACANT' | 'MAINTENANCE'

interface Property {
  id: string
  name: string
  address: string
  status: PropertyStatus
  tenant: string | null
  rent: number
  rentStatus: 'PAID' | 'OVERDUE' | 'UPCOMING'
  dueDate: string
}

const PROPERTIES: Property[] = [
  {
    id: 'p1',
    name: 'Lotus Residencies 4A',
    address: '42 Galle Road, Colombo 3',
    status: 'ACTIVE',
    tenant: 'Nimali Perera',
    rent: 65000,
    rentStatus: 'PAID',
    dueDate: '1 Jun 2026',
  },
  {
    id: 'p2',
    name: 'Sunset View 12B',
    address: '18 Nawala Road, Rajagiriya',
    status: 'ACTIVE',
    tenant: 'Kasun Fernando',
    rent: 45000,
    rentStatus: 'OVERDUE',
    dueDate: '1 May 2026',
  },
  {
    id: 'p3',
    name: 'Highland Terrace 7',
    address: '5 Gregory Road, Colombo 7',
    status: 'MAINTENANCE',
    tenant: 'Dilshan Jayawardena',
    rent: 120000,
    rentStatus: 'UPCOMING',
    dueDate: '1 Jun 2026',
  },
  {
    id: 'p4',
    name: 'Greenfield Studio 2',
    address: '77 Havelock Town, Colombo 5',
    status: 'VACANT',
    tenant: null,
    rent: 35000,
    rentStatus: 'UPCOMING',
    dueDate: '—',
  },
]

const INSPECTIONS = [
  { id: 'i1', property: 'Lotus Residencies 4A', date: '15 Apr 2026', inspector: 'Ravi Kumara', score: 8.5, notes: 'Minor scuff on kitchen tiles. AC serviced. Overall excellent condition.' },
  { id: 'i2', property: 'Sunset View 12B', date: '28 Mar 2026', inspector: 'Sanduni Wickrama', score: 7.0, notes: 'Bathroom tap dripping — raised maintenance request. Walls clean.' },
  { id: 'i3', property: 'Highland Terrace 7', date: '10 Feb 2026', inspector: 'Ravi Kumara', score: 6.2, notes: 'Water stain on ceiling — plumbing investigation underway.' },
]

const BAR_DATA = [
  { month: 'Dec', value: 198000 },
  { month: 'Jan', value: 230000 },
  { month: 'Feb', value: 210000 },
  { month: 'Mar', value: 245000 },
  { month: 'Apr', value: 265000 },
  { month: 'May', value: 230000 },
]

const NAV_ITEMS = [
  { icon: Home, label: 'Properties', active: true },
  { icon: BarChart2, label: 'Rentals' },
  { icon: ClipboardList, label: 'Inspections' },
  { icon: Wrench, label: 'Maintenance' },
  { icon: FileText, label: 'Statements' },
  { icon: Settings, label: 'Settings' },
]

const STATUS_META: Record<PropertyStatus, { label: string; classes: string }> = {
  ACTIVE:      { label: 'Active',      classes: 'bg-success/10 text-success border-success/20' },
  VACANT:      { label: 'Vacant',      classes: 'bg-warning/10 text-warning border-warning/20' },
  MAINTENANCE: { label: 'Maintenance', classes: 'bg-danger/10 text-danger border-danger/20' },
}

const RENT_STATUS_META = {
  PAID:     { dot: 'bg-success', label: 'Paid', icon: CheckCircle, iconClass: 'text-success' },
  OVERDUE:  { dot: 'bg-danger',  label: 'Overdue', icon: AlertCircle, iconClass: 'text-danger' },
  UPCOMING: { dot: 'bg-warning', label: 'Upcoming', icon: Clock, iconClass: 'text-warning' },
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PropertyCard({ property }: { property: Property }) {
  const statusMeta = STATUS_META[property.status]
  const rentMeta = RENT_STATUS_META[property.rentStatus]
  const RentIcon = rentMeta.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-card border border-border shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
    >
      {/* Map thumbnail placeholder */}
      <div className="relative h-36 bg-frost flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-royal/5 to-navy/10" />
        {/* Simulated map grid */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-20">
          {[20,40,60,80].map(y => <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#1A3D8F" strokeWidth="0.5" />)}
          {[20,40,60,80].map(x => <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#1A3D8F" strokeWidth="0.5" />)}
        </svg>
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-royal flex items-center justify-center shadow-md">
            <MapPin size={14} className="text-white" />
          </div>
          <div className="w-1 h-3 bg-royal/40 rounded-b" />
        </div>
        {/* Status chip */}
        <span className={`absolute top-3 right-3 text-[10px] font-mono font-medium px-2.5 py-1 rounded-full border ${statusMeta.classes}`}>
          {statusMeta.label.toUpperCase()}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-base text-ink mb-0.5">{property.name}</h3>
        <div className="flex items-center gap-1 mb-4">
          <MapPin size={11} className="text-fog" />
          <p className="font-sans text-xs text-fog">{property.address}</p>
        </div>

        {property.tenant && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
            <div className="w-6 h-6 rounded-full bg-royal/10 flex items-center justify-center">
              <span className="font-sans text-[10px] font-semibold text-royal">{property.tenant[0]}</span>
            </div>
            <span className="font-sans text-xs text-slate">{property.tenant}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-xs text-fog mb-0.5">Monthly Rent</p>
            <p className="font-mono text-base font-medium text-ink">
              Rs. {property.rent.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${rentMeta.dot}`} />
            <RentIcon size={13} className={rentMeta.iconClass} />
            <span className="font-sans text-xs text-slate">{rentMeta.label}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-card bg-royal/5 text-royal font-sans text-xs font-medium hover:bg-royal/10 transition-colors">
            View Details
          </button>
          <button className="flex-1 py-2 rounded-card border border-border text-slate font-sans text-xs font-medium hover:border-gold/40 hover:text-gold transition-colors">
            Inspections
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function InspectionRow({ inspection }: { inspection: typeof INSPECTIONS[0] }) {
  const [expanded, setExpanded] = useState(false)
  const scoreColor = inspection.score >= 8 ? 'text-success' : inspection.score >= 6 ? 'text-warning' : 'text-danger'

  return (
    <div className="border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-frost transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full bg-frost flex items-center justify-center font-mono text-sm font-semibold ${scoreColor}`}>
            {inspection.score}
          </div>
          <div className="text-left">
            <p className="font-sans text-sm font-medium text-ink">{inspection.property}</p>
            <p className="font-sans text-xs text-fog">{inspection.date} · {inspection.inspector}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-fog hidden sm:block">View Report</span>
          {expanded ? <ChevronDown size={16} className="text-fog" /> : <ChevronRight size={16} className="text-fog" />}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-border">
              <p className="font-sans text-sm text-slate leading-relaxed mt-3">{inspection.notes}</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-1.5 bg-frost rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${inspection.score * 10}%`,
                      background: inspection.score >= 8 ? '#0A7855' : inspection.score >= 6 ? '#C47B04' : '#B91C1C',
                    }}
                  />
                </div>
                <span className={`font-mono text-xs ${scoreColor}`}>{inspection.score}/10</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RevenueChart() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([])
  const [animated, setAnimated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const maxValue = Math.max(...BAR_DATA.map(d => d.value))

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) setAnimated(true)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [animated])

  return (
    <div ref={containerRef} className="flex items-end gap-3 h-40 pt-4">
      {BAR_DATA.map((d, i) => {
        const pct = (d.value / maxValue) * 100
        return (
          <div key={d.month} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="relative w-full flex justify-center">
              {animated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="font-mono text-[9px] text-fog mb-1 absolute -top-5 whitespace-nowrap"
                >
                  {(d.value / 1000).toFixed(0)}k
                </motion.div>
              )}
            </div>
            <div className="w-full rounded-t-md overflow-hidden bg-frost" style={{ height: '120px' }}>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={animated ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: `${pct}%`, transformOrigin: 'bottom' }}
                className="w-full bg-royal rounded-t-md"
              />
            </div>
            <span className="font-mono text-[10px] text-fog">{d.month}</span>
          </div>
        )
      })}
    </div>
  )
}

function StatementToast({ show, onClose }: { show: boolean; onClose: () => void }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 3500)
      return () => clearTimeout(t)
    }
  }, [show, onClose])
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 bg-ink text-white px-5 py-3.5 rounded-card shadow-xl"
        >
          <CheckCircle size={16} className="text-gold" />
          <span className="font-sans text-sm">Statement downloaded</span>
          <button onClick={onClose} className="ml-2 text-white/50 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OwnerDashboardPage() {
  const [activeNav, setActiveNav] = useState('Properties')
  const [toastVisible, setToastVisible] = useState(false)

  const totalRevenue = PROPERTIES.reduce((s, p) => s + (p.status !== 'VACANT' ? p.rent : 0), 0)
  const occupied = PROPERTIES.filter(p => p.status === 'ACTIVE').length
  const vacancyRate = Math.round(((PROPERTIES.length - occupied) / PROPERTIES.length) * 100)

  return (
    <div className="flex min-h-screen bg-snow font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-border px-4 py-8 fixed top-0 bottom-0 left-0 z-10">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-royal flex items-center justify-center">
              <Home size={12} className="text-white" />
            </div>
            <span className="font-heading text-sm text-ink">RentCeylon</span>
          </div>
          <span className="font-mono text-[10px] text-fog tracking-widest uppercase">Owner Portal</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-card text-left transition-colors ${
                activeNav === label
                  ? 'bg-royal text-white'
                  : 'text-slate hover:bg-frost hover:text-ink'
              }`}
            >
              <Icon size={15} />
              <span className="font-sans text-sm">{label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto px-2">
          <div className="flex items-center gap-3 p-3 rounded-card bg-frost">
            <div className="w-8 h-8 rounded-full bg-royal/20 flex items-center justify-center">
              <span className="font-sans text-xs font-semibold text-royal">S</span>
            </div>
            <div>
              <p className="font-sans text-xs font-medium text-ink">Suresh Perera</p>
              <p className="font-mono text-[10px] text-fog">4 properties</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60 px-6 md:px-10 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-fog mb-1">Property Owner</p>
            <h1 className="font-display text-4xl font-light text-ink leading-tight">My Portfolio</h1>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-0.5">
            <p className="font-sans text-xs text-fog">Monthly Revenue</p>
            <p className="font-mono text-2xl font-medium text-ink">Rs. {totalRevenue.toLocaleString()}/mo</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Properties', value: PROPERTIES.length, icon: Home },
            { label: 'Occupied', value: occupied, icon: Users },
            { label: 'Monthly Revenue', value: `Rs. ${(totalRevenue / 1000).toFixed(0)}k`, icon: TrendingUp },
            { label: 'Vacancy Rate', value: `${vacancyRate}%`, icon: AlertCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-card border border-border p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <p className="font-sans text-xs text-fog">{label}</p>
                <Icon size={14} className="text-fog" />
              </div>
              <p className="font-mono text-xl font-medium text-ink">{value}</p>
            </div>
          ))}
        </div>

        {/* Properties Grid */}
        <div className="mb-10">
          <h2 className="font-heading text-lg text-ink mb-4">Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {PROPERTIES.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>

        {/* Rent Status Cards */}
        <div className="mb-10">
          <h2 className="font-heading text-lg text-ink mb-4">Rent Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROPERTIES.map(p => {
              const meta = RENT_STATUS_META[p.rentStatus]
              const Icon = meta.icon
              return (
                <div key={p.id} className="bg-white rounded-card border border-border p-4 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${meta.dot} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs font-medium text-ink truncate">{p.name}</p>
                    <p className="font-mono text-[10px] text-fog">Due {p.dueDate}</p>
                  </div>
                  <Icon size={15} className={meta.iconClass} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Two-column: Inspections + Revenue chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Inspection Reports */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg text-ink">Recent Inspections</h2>
              <span className="font-mono text-xs text-fog">{INSPECTIONS.length} reports</span>
            </div>
            <div className="flex flex-col gap-3">
              {INSPECTIONS.map(i => <InspectionRow key={i.id} inspection={i} />)}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-lg text-ink">Revenue — Last 6 Months</h2>
              <button
                onClick={() => setToastVisible(true)}
                className="flex items-center gap-1.5 border border-border rounded-card px-3 py-1.5 font-sans text-xs text-slate hover:border-gold/40 hover:text-gold transition-colors"
              >
                <Download size={12} />
                PDF
              </button>
            </div>
            <p className="font-mono text-xs text-fog mb-6">All values in LKR</p>
            <RevenueChart />
          </div>
        </div>
      </main>

      <StatementToast show={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  )
}
