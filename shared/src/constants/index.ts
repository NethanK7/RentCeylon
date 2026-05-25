export const PLATFORM_FEE_TIERS = [
  { maxAmount: 10000, feePercent: 10 },
  { maxAmount: 50000, feePercent: 7 },
  { maxAmount: Infinity, feePercent: 5 },
] as const;

export const PROPERTY_MANAGEMENT_FEE = { min: 8, max: 12 } as const;

export const SLA_HOURS = {
  ID_VERIFICATION: 24,
  ID_VERIFICATION_ALERT: 20,
  DISPUTE_RESOLUTION: 72,
  DISPUTE_ALERT: 60,
  DEPOSIT_HOLD: 48,
  DEPOSIT_ALERT: 36,
} as const;

export const CANCELLATION_POLICY = {
  FULL_REFUND_DAYS: 7,
  PARTIAL_REFUND_DAYS: 3,
  PARTIAL_REFUND_PERCENT: 50,
  LATE_CANCEL_LISTER_PERCENT: 25,
} as const;

export const REVIEW_WINDOW_HOURS = 168; // 7 days

export const REVIEW_MIN_CHARS = 30;

export const PRESIGNED_URL_TTL = {
  UPLOAD: 15 * 60,
  READ: 60 * 60,
} as const;

export const CONDITION_PHOTO_SLOTS = [
  { party: 'OWNER', type: 'PICKUP' },
  { party: 'RENTER', type: 'PICKUP' },
  { party: 'OWNER', type: 'RETURN' },
  { party: 'RENTER', type: 'RETURN' },
] as const;
