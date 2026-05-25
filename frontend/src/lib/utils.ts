import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLKR(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculatePlatformFee(rentalAmount: number): {
  feePercent: number
  feeAmount: number
} {
  let feePercent: number
  if (rentalAmount <= 10000) {
    feePercent = 10
  } else if (rentalAmount <= 50000) {
    feePercent = 7
  } else {
    feePercent = 5
  }
  const feeAmount = Math.round(rentalAmount * (feePercent / 100))
  return { feePercent, feeAmount }
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
