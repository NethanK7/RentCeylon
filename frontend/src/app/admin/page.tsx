'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  Swords,
  Users,
  Tag,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DepositStatus = 'HELD' | 'RELEASED_TO_RENTER' | 'RELEASED_TO_LISTER' | 'FORFEITED'

interface AuditEntry {
  id: string
  action: string
  actor: string
  timestamp: string
  note: string
}

interface Deposit {
  id: string
  user: string
  email: string
  amount: number
  booking: string
  heldSince: string
  status: DepositStatus
  auditLog: AuditEntry[]
}

interface IdVerification {
  id: string
  name: string
  email: string
  submittedAt: string
  docType: string
}

interface Dispute {
  id: string
  parties: string
  raisedAt: string
  summary: string
}

type NavSection =
  | 'dashboard'
  | 'deposits'
  | 'id-verification'
  | 'disputes'
  | 'users'
  | 'categories'
  | 'settings'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const NOW = new Date('2026-05-25T10:00:00Z')

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3_600_000).toISOString()
}

const MOCK_DEPOSITS: Deposit[] = [
  {
    id: 'd1',
    user: 'Kasun Fernando',
    email: 'kasun@example.com',
    amount: 25000,
    booking: 'BK-1041',
    heldSince: hoursAgo(36),
    status: 'HELD',
    auditLog: [
      {
        id: 'a1',
        action: 'DEPOSIT_HELD',
        actor: 'system',
        timestamp: hoursAgo(36),
        note: 'Deposit captured at booking confirmation.',
      },
    ],
  },
  {
    id: 'd2',
    user: 'Nithya Perera',
    email: 'nithya@example.com',
    amount: 8500,
    booking: 'BK-1039',
    heldSince: hoursAgo(52),
    status: 'HELD',
    auditLog: [
      {
        id: 'a2',
        action: 'DEPOSIT_HELD',
        actor: 'system',
        timestamp: hoursAgo(52),
        note: 'Deposit captured at booking confirmation.',
      },
      {
        id: 'a3',
        action: 'DISPUTE_RAISED',
        actor: 'nithya@example.com',
        timestamp: hoursAgo(10),
        note: 'Renter claims item was damaged on receipt.',
      },
    ],
  },
  {
    id: 'd3',
    user: 'Dinuka Wijesuriya',
    email: 'dinuka@example.com',
    amount: 15000,
    booking: 'BK-1035',
    heldSince: hoursAgo(120),
    status: 'RELEASED_TO_RENTER',
    auditLog: [
      {
        id: 'a4',
        action: 'DEPOSIT_HELD',
        actor: 'system',
        timestamp: hoursAgo(120),
        note: 'Deposit captured.',
      },
      {
        id: 'a5',
        action: 'RELEASED_TO_RENTER',
        actor: 'admin@rentloop.lk',
        timestamp: hoursAgo(2),
        note: 'Item returned in good condition.',
      },
    ],
  },
  {
    id: 'd4',
    user: 'Amaya Siriwardena',
    email: 'amaya@example.com',
    amount: 45000,
    booking: 'BK-1028',
    heldSince: hoursAgo(200),
    status: 'RELEASED_TO_LISTER',
    auditLog: [
      {
        id: 'a6',
        action: 'DEPOSIT_HELD',
        actor: 'system',
        timestamp: hoursAgo(200),
        note: 'Deposit captured.',
      },
      {
        id: 'a7',
        action: 'RELEASED_TO_LISTER',
        actor: 'admin@rentloop.lk',
        timestamp: hoursAgo(4),
        note: 'Confirmed damage per photo evidence.',
      },
    ],
  },
  {
    id: 'd5',
    user: 'Malith Rajapaksa',
    email: 'malith@example.com',
    amount: 5000,
    booking: 'BK-1022',
    heldSince: hoursAgo(300),
    status: 'FORFEITED',
    auditLog: [
      {
        id: 'a8',
        action: 'DEPOSIT_HELD',
        actor: 'system',
        timestamp: hoursAgo(300),
        note: 'Deposit captured.',
      },
      {
        id: 'a9',
        action: 'FORFEITED',
        actor: 'admin@rentloop.lk',
        timestamp: hoursAgo(1),
        note: 'Policy violation — item not returned.',
      },
    ],
  },
]

const MOCK_VERIFICATIONS: IdVerification[] = [
  {
    id: 'v1',
    name: 'Chamari Bandara',
    email: 'chamari@example.com',
    submittedAt: hoursAgo(5),
    docType: 'National ID',
  },
  {
    id: 'v2',
    name: 'Roshan De Silva',
    email: 'roshan@example.com',
    submittedAt: hoursAgo(18),
    docType: 'Passport',
  },
  {
    id: 'v3',
    name: 'Thilini Jayawardena',
    email: 'thilini@example.com',
    submittedAt: hoursAgo(22),
    docType: 'Driving Licence',
  },
]

const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'dp1',
    parties: 'Nithya P. vs Kasun F.',
    raisedAt: hoursAgo(10),
    summary: 'Renter claims camera returned with scratch.',
  },
  {
    id: 'dp2',
    parties: 'Amaya S. vs Dinuka W.',
    raisedAt: hoursAgo(60),
    summary: 'Late return dispute — 2 days overdue.',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hoursElapsed(iso: string): number {
  return (NOW.getTime() - new Date(iso).getTime()) / 3_600_000
}

function hoursUntilSla(iso: string, slaDuration: number): number {
  return slaDuration - hoursElapsed(iso)
}

function formatHrs(h: number): string {
  if (h <= 0) return 'Overdue'
  const hh = Math.floor(h)
  const mm = Math.floor((h - hh) * 60)
  return `${hh}h ${mm}m`
}

function slaColorClass(remaining: number): string {
  if (remaining <= 0) return 'text-danger'
  if (remaining < 6) return 'text-danger'
  if (remaining < 24) return 'text-warning'
  return 'text-success'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAmount(n: number): string {
  return `Rs. ${n.toLocaleString('en-LK')}`
}

const STATUS_CHIP: Record<DepositStatus, { label: string; className: string }> = {
  HELD: {
    label: 'HELD',
    className: 'bg-gold/10 text-gold border border-gold/30',
  },
  RELEASED_TO_RENTER: {
    label: 'RELEASED → RENTER',
    className: 'bg-success/10 text-success border border-success/30',
  },
  RELEASED_TO_LISTER: {
    label: 'RELEASED → LISTER',
    className: 'bg-royal/10 text-royal border border-royal/30',
  },
  FORFEITED: {
    label: 'FORFEITED',
    className: 'bg-danger/10 text-danger border border-danger/30',
  },
}

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'deposits', label: 'Deposits', icon: Wallet },
  { id: 'id-verification', label: 'ID Verification', icon: ShieldCheck },
  { id: 'disputes', label: 'Disputes', icon: Swords },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// ---------------------------------------------------------------------------
// SLA Chip
// ---------------------------------------------------------------------------

function SlaChip({ remaining }: { remaining: number }) {
  const cls = slaColorClass(remaining)
  return (
    <span className={`font-mono text-xs font-medium ${cls} flex items-center gap-1`}>
      <Clock size={11} />
      {formatHrs(remaining)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Status Chip
// ---------------------------------------------------------------------------

function StatusChip({ status }: { status: DepositStatus }) {
  const { label, className } = STATUS_CHIP[status]
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wide ${className}`}
    >
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Release Modal
// ---------------------------------------------------------------------------

interface ReleaseModalProps {
  deposit: Deposit
  target: 'renter' | 'lister'
  onConfirm: () => void
  onClose: () => void
}

function ReleaseModal({ deposit, target, onConfirm, onClose }: ReleaseModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-card shadow-card-hover w-full max-w-md p-8 z-10"
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-fog hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="font-heading text-ink text-2xl mb-1">Release Deposit</h2>
        <p className="font-sans text-fog text-sm mb-6">
          This action is irreversible. The deposit will be released to the{' '}
          <strong className="text-ink">
            {target === 'renter' ? 'renter' : 'lister'}
          </strong>
          .
        </p>

        <div className="bg-snow rounded-card p-4 mb-6 space-y-1.5 text-sm font-sans">
          <div className="flex justify-between">
            <span className="text-fog">User</span>
            <span className="text-ink font-medium">{deposit.user}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fog">Booking</span>
            <span className="font-mono text-ink">{deposit.booking}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fog">Amount</span>
            <span className="font-mono text-ink font-semibold">
              {formatAmount(deposit.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-fog">Release to</span>
            <span
              className={`font-medium capitalize ${
                target === 'renter' ? 'text-success' : 'text-royal'
              }`}
            >
              {target}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-card border border-border font-sans text-sm text-ink hover:bg-frost transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-11 rounded-card font-sans text-sm font-medium text-white transition-colors ${
              target === 'renter'
                ? 'bg-success hover:bg-success/90'
                : 'bg-royal hover:bg-royal-dark'
            }`}
          >
            Confirm Release
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Deposit Table
// ---------------------------------------------------------------------------

function DepositTable() {
  const [deposits, setDeposits] = useState<Deposit[]>(MOCK_DEPOSITS)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [modal, setModal] = useState<{
    depositId: string
    target: 'renter' | 'lister'
  } | null>(null)

  const toggleRow = (id: string) =>
    setExpandedRow((prev) => (prev === id ? null : id))

  const handleRelease = useCallback(() => {
    if (!modal) return
    const { depositId, target } = modal
    setDeposits((prev) =>
      prev.map((d) => {
        if (d.id !== depositId) return d
        const newStatus: DepositStatus =
          target === 'renter' ? 'RELEASED_TO_RENTER' : 'RELEASED_TO_LISTER'
        return {
          ...d,
          status: newStatus,
          auditLog: [
            ...d.auditLog,
            {
              id: `a-${Date.now()}`,
              action: newStatus,
              actor: 'admin@rentloop.lk',
              timestamp: new Date().toISOString(),
              note: 'Manually released by admin.',
            },
          ],
        }
      })
    )
    setModal(null)
  }, [modal])

  const activeDeposit = modal
    ? deposits.find((d) => d.id === modal.depositId) ?? null
    : null

  return (
    <>
      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full text-sm font-sans min-w-[760px]">
          <thead>
            <tr className="border-b border-border bg-frost">
              {['User', 'Amount', 'Booking', 'Held Since', 'Status', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-fog font-medium text-xs uppercase tracking-wide"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {deposits.map((dep) => {
              const remaining = hoursUntilSla(dep.heldSince, 48)
              const isExpanded = expandedRow === dep.id

              return (
                <>
                  <tr
                    key={dep.id}
                    className="border-b border-border hover:bg-snow transition-colors cursor-pointer"
                    onClick={() => toggleRow(dep.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{dep.user}</div>
                      <div className="text-fog text-xs">{dep.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-ink font-semibold">
                      {formatAmount(dep.amount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-fog">{dep.booking}</td>
                    <td className="px-4 py-3">
                      <div className="text-ink text-xs">
                        {formatDate(dep.heldSince)}
                      </div>
                      {dep.status === 'HELD' && (
                        <SlaChip remaining={remaining} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={dep.status} />
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {dep.status === 'HELD' ? (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              setModal({ depositId: dep.id, target: 'renter' })
                            }
                            className="px-3 py-1.5 rounded-card bg-success/10 text-success border border-success/30 text-xs font-medium hover:bg-success/20 transition-colors whitespace-nowrap"
                          >
                            Release → Renter
                          </button>
                          <button
                            onClick={() =>
                              setModal({ depositId: dep.id, target: 'lister' })
                            }
                            className="px-3 py-1.5 rounded-card bg-royal/10 text-royal border border-royal/30 text-xs font-medium hover:bg-royal/20 transition-colors whitespace-nowrap"
                          >
                            Release → Lister
                          </button>
                        </div>
                      ) : (
                        <span className="text-fog text-xs italic">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>

                  <AnimatePresence>
                    {isExpanded && (
                      <tr key={`${dep.id}-expand`}>
                        <td
                          colSpan={6}
                          className="px-0 py-0 border-b border-border bg-gold-pale/50"
                        >
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 py-4">
                              <p className="text-xs font-mono text-gold uppercase tracking-widest mb-3">
                                Deposit Audit Log
                              </p>
                              <div className="space-y-2">
                                {dep.auditLog.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-start gap-4 text-xs font-sans bg-white rounded-card px-4 py-2.5 border border-border"
                                  >
                                    <span className="font-mono text-royal whitespace-nowrap shrink-0">
                                      {entry.action}
                                    </span>
                                    <span className="text-fog whitespace-nowrap shrink-0">
                                      {entry.actor}
                                    </span>
                                    <span className="text-fog whitespace-nowrap shrink-0">
                                      {formatDate(entry.timestamp)}
                                    </span>
                                    <span className="text-ink flex-1">
                                      {entry.note}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modal && activeDeposit && (
          <ReleaseModal
            deposit={activeDeposit}
            target={modal.target}
            onConfirm={handleRelease}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ---------------------------------------------------------------------------
// ID Verification Queue
// ---------------------------------------------------------------------------

function IdVerificationQueue() {
  const [acted, setActed] = useState<
    Record<string, 'approved' | 'rejected'>
  >({})

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setActed((prev) => ({ ...prev, [id]: action }))
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MOCK_VERIFICATIONS.map((v) => {
        const slaRemaining = hoursUntilSla(v.submittedAt, 24)
        const result = acted[v.id]

        return (
          <motion.div
            key={v.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: result ? 0.5 : 1, y: 0 }}
            className="bg-white rounded-card border border-border p-5 shadow-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-sans text-ink font-medium">{v.name}</p>
                <p className="text-fog text-xs">{v.email}</p>
              </div>
              <span className="text-xs font-mono text-fog bg-frost px-2 py-0.5 rounded-full">
                {v.docType}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-fog font-sans">
                Submitted {formatDate(v.submittedAt)}
              </div>
              <SlaChip remaining={slaRemaining} />
            </div>

            {result ? (
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  result === 'approved' ? 'text-success' : 'text-danger'
                }`}
              >
                {result === 'approved' ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <XCircle size={15} />
                )}
                {result === 'approved' ? 'Approved' : 'Rejected'}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(v.id, 'approved')}
                  className="flex-1 h-9 rounded-card bg-royal text-white text-xs font-sans font-medium hover:bg-royal-dark transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(v.id, 'rejected')}
                  className="flex-1 h-9 rounded-card bg-danger/10 text-danger border border-danger/30 text-xs font-sans font-medium hover:bg-danger/20 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SLA Overview Cards
// ---------------------------------------------------------------------------

function SlaOverview() {
  const pendingDeposits = MOCK_DEPOSITS.filter(
    (d) => d.status === 'HELD'
  ).length
  const pendingVerifications = MOCK_VERIFICATIONS.length
  const openDisputes = MOCK_DISPUTES.length

  const cards = [
    {
      label: 'Pending Deposits',
      count: pendingDeposits,
      sla: '48hr SLA',
      dot: 'bg-gold',
      textColor: 'text-gold',
    },
    {
      label: 'ID Verifications',
      count: pendingVerifications,
      sla: '24hr SLA',
      dot: 'bg-royal',
      textColor: 'text-royal',
    },
    {
      label: 'Open Disputes',
      count: openDisputes,
      sla: '72hr SLA',
      dot: 'bg-danger',
      textColor: 'text-danger',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4 }}
          className="bg-white rounded-card border border-border shadow-card px-6 py-5 flex items-center gap-5"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${card.dot}`}
          />
          <div>
            <div
              className={`font-mono text-4xl font-semibold leading-none ${card.textColor}`}
            >
              {card.count}
            </div>
            <div className="font-sans text-ink text-sm font-medium mt-1">
              {card.label}
            </div>
            <div className="font-mono text-fog text-xs mt-0.5">{card.sla}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar component (shared between desktop + mobile)
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  activeSection: NavSection
  onNavigate: (s: NavSection) => void
  onClose?: () => void
}

function SidebarContent({
  activeSection,
  onNavigate,
  onClose,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="font-display text-2xl text-white tracking-tight">
            Rent<span className="text-gold">Loop</span>
          </span>
          <p className="font-mono text-white/40 text-[10px] mt-0.5 uppercase tracking-widest">
            Admin Console
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-sans transition-all relative ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-indicator"
                  className="absolute left-0 top-1 bottom-1 w-0.5 bg-gold rounded-full"
                />
              )}
              <Icon size={16} className={isActive ? 'text-gold' : ''} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <button className="flex items-center gap-2 text-white/50 hover:text-white text-xs font-sans transition-colors">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = (section: NavSection) => {
    setActiveSection(section)
    setSidebarOpen(false)
  }

  const sectionLabel =
    NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-snow flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy text-white min-h-screen flex-shrink-0 fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent
          activeSection={activeSection}
          onNavigate={navigate}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-navy/60 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 bg-navy text-white z-50 flex flex-col lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            >
              <SidebarContent
                activeSection={activeSection}
                onNavigate={navigate}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-border h-16 flex items-center px-6 gap-4">
          <button
            className="lg:hidden text-ink hover:text-royal transition-colors mr-1"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <h1 className="font-heading text-ink text-xl flex-1">Admin Panel</h1>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-sans text-ink text-sm font-medium leading-none">
                Admin
              </p>
              <p className="font-sans text-fog text-xs mt-0.5">
                admin@rentloop.lk
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white font-mono text-sm font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-mono text-fog mb-6">
                <span>Admin</span>
                <ChevronRight size={12} />
                <span className="text-ink">{sectionLabel}</span>
              </div>

              {/* ---- Dashboard ---- */}
              {activeSection === 'dashboard' && (
                <div>
                  <h2 className="font-heading text-ink text-3xl mb-6">
                    Overview
                  </h2>
                  <SlaOverview />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Platform stats */}
                    <div className="bg-white rounded-card border border-border shadow-card p-6">
                      <p className="font-sans text-fog text-xs uppercase tracking-widest mb-4">
                        Platform Stats
                      </p>
                      <div className="space-y-0">
                        {[
                          { label: 'Total Users', value: '1,847' },
                          { label: 'Active Listings', value: '324' },
                          { label: 'Bookings this month', value: '89' },
                          { label: 'Total deposits held', value: 'Rs. 98,500' },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between py-3 border-b border-frost last:border-0"
                          >
                            <span className="font-sans text-fog text-sm">
                              {label}
                            </span>
                            <span className="font-mono text-ink font-semibold text-sm">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Open disputes */}
                    <div className="bg-white rounded-card border border-border shadow-card p-6">
                      <p className="font-sans text-fog text-xs uppercase tracking-widest mb-4">
                        Open Disputes
                      </p>
                      <div className="space-y-0">
                        {MOCK_DISPUTES.map((d) => {
                          const r = hoursUntilSla(d.raisedAt, 72)
                          return (
                            <div
                              key={d.id}
                              className="flex items-start justify-between gap-4 py-3 border-b border-frost last:border-0"
                            >
                              <div>
                                <p className="font-sans text-ink text-sm font-medium">
                                  {d.parties}
                                </p>
                                <p className="font-sans text-fog text-xs mt-0.5">
                                  {d.summary}
                                </p>
                              </div>
                              <SlaChip remaining={r} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Deposits ---- */}
              {activeSection === 'deposits' && (
                <div>
                  <h2 className="font-heading text-ink text-3xl mb-6">
                    Deposit Management
                  </h2>
                  <SlaOverview />
                  <p className="font-sans text-fog text-sm mb-4">
                    Click a row to expand the deposit audit log. Use the action
                    buttons to manually release held deposits.
                  </p>
                  <DepositTable />
                </div>
              )}

              {/* ---- ID Verification ---- */}
              {activeSection === 'id-verification' && (
                <div>
                  <h2 className="font-heading text-ink text-3xl mb-2">
                    ID Verification Queue
                  </h2>
                  <p className="font-sans text-fog text-sm mb-6">
                    {MOCK_VERIFICATIONS.length} pending verification
                    {MOCK_VERIFICATIONS.length !== 1 ? 's' : ''} — 24hr SLA
                    applies.
                  </p>
                  <IdVerificationQueue />
                </div>
              )}

              {/* ---- Disputes ---- */}
              {activeSection === 'disputes' && (
                <div>
                  <h2 className="font-heading text-ink text-3xl mb-6">
                    Disputes
                  </h2>
                  <div className="space-y-4">
                    {MOCK_DISPUTES.map((d) => {
                      const r = hoursUntilSla(d.raisedAt, 72)
                      return (
                        <div
                          key={d.id}
                          className="bg-white rounded-card border border-border shadow-card p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-sans text-ink font-semibold">
                                {d.parties}
                              </p>
                              <p className="font-sans text-fog text-sm mt-1">
                                {d.summary}
                              </p>
                              <p className="font-mono text-fog text-xs mt-2">
                                Raised: {formatDate(d.raisedAt)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 border border-danger/30 text-danger text-xs font-mono">
                                <AlertTriangle size={10} /> OPEN
                              </span>
                              <SlaChip remaining={r} />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button className="px-4 h-9 rounded-card bg-royal text-white text-xs font-sans font-medium hover:bg-royal-dark transition-colors">
                              Review
                            </button>
                            <button className="px-4 h-9 rounded-card border border-border text-ink text-xs font-sans hover:bg-frost transition-colors">
                              View Messages
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ---- Users ---- */}
              {activeSection === 'users' && (
                <div>
                  <h2 className="font-heading text-ink text-3xl mb-6">Users</h2>
                  <div className="bg-white rounded-card border border-border shadow-card p-10 text-center">
                    <Users size={32} className="text-fog mx-auto mb-3" />
                    <p className="font-sans text-fog">
                      User management coming soon.
                    </p>
                  </div>
                </div>
              )}

              {/* ---- Categories ---- */}
              {activeSection === 'categories' && (
                <div>
                  <h2 className="font-heading text-ink text-3xl mb-6">
                    Categories
                  </h2>
                  <div className="bg-white rounded-card border border-border shadow-card p-10 text-center">
                    <Tag size={32} className="text-fog mx-auto mb-3" />
                    <p className="font-sans text-fog">
                      Category management coming soon.
                    </p>
                  </div>
                </div>
              )}

              {/* ---- Settings ---- */}
              {activeSection === 'settings' && (
                <div>
                  <h2 className="font-heading text-ink text-3xl mb-6">
                    Settings
                  </h2>
                  <div className="bg-white rounded-card border border-border shadow-card p-10 text-center">
                    <Settings size={32} className="text-fog mx-auto mb-3" />
                    <p className="font-sans text-fog">
                      Platform settings coming soon.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
