import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, CancellationTier, DepositStatus, PaymentStatus } from '@rentloop/shared';

// ─── Tier thresholds (days until booking start) ──────────────────────────────
// Rule 9: 7+ days → full refund | 3–6 days → 50% | <3 days → no refund

const TIER_FULL_REFUND_DAYS = 7;
const TIER_PARTIAL_REFUND_DAYS = 3;

// Statuses from which cancellation is permitted
const CANCELLABLE_STATUSES: BookingStatus[] = [
  BookingStatus.APPROVED,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(date: Date): number {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

function resolveTier(daysUntilBooking: number): CancellationTier {
  if (daysUntilBooking >= TIER_FULL_REFUND_DAYS) return CancellationTier.FULL_REFUND;
  if (daysUntilBooking >= TIER_PARTIAL_REFUND_DAYS) return CancellationTier.PARTIAL_REFUND;
  return CancellationTier.NO_REFUND;
}

function refundPercent(tier: CancellationTier): number {
  switch (tier) {
    case CancellationTier.FULL_REFUND:
      return 100;
    case CancellationTier.PARTIAL_REFUND:
      return 50;
    case CancellationTier.NO_REFUND:
    case CancellationTier.NO_SHOW:
      return 0;
    default:
      return 0;
  }
}

function tierMessage(tier: CancellationTier, daysUntilBooking: number): string {
  switch (tier) {
    case CancellationTier.FULL_REFUND:
      return `You are cancelling ${daysUntilBooking} day(s) before the booking — full refund applies.`;
    case CancellationTier.PARTIAL_REFUND:
      return `You are cancelling ${daysUntilBooking} day(s) before the booking — 50% refund applies.`;
    case CancellationTier.NO_REFUND:
      return `You are cancelling less than ${TIER_PARTIAL_REFUND_DAYS} days before the booking — no refund applies.`;
    case CancellationTier.NO_SHOW:
      return 'No-show: deposit forfeited to lister, no rental refund.';
    default:
      return 'Cancellation policy applies.';
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class CancellationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rule 9 — Cancellation Tiers
   * Returns a preview of what the renter would receive if they cancel now,
   * without actually performing the cancellation.
   */
  async getCancellationPreview(
    bookingId: string,
    userId: string,
  ): Promise<{
    tier: CancellationTier;
    daysUntilBooking: number;
    refundPercent: number;
    refundAmount: number;
    depositForfeited: boolean;
    message: string;
  }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    if (booking.renterId !== userId) {
      throw new ForbiddenException('You are not the renter of this booking');
    }

    if (!CANCELLABLE_STATUSES.includes(booking.status as BookingStatus)) {
      throw new BadRequestException(
        `Only bookings with status APPROVED can be cancelled. ` +
          `Current status: ${booking.status}`,
      );
    }

    const days = daysUntil(booking.startDate);
    const tier = resolveTier(days);
    const pct = refundPercent(tier);
    const refundAmount = Math.floor((booking.rentalAmount * pct) / 100);

    return {
      tier,
      daysUntilBooking: days,
      refundPercent: pct,
      refundAmount,
      depositForfeited: false, // deposit always returned to renter on voluntary cancellation
      message: tierMessage(tier, days),
    };
  }

  /**
   * Executes the cancellation atomically:
   * - Updates booking status to CANCELLED
   * - Sets payment status to REFUNDED / PARTIALLY_REFUNDED / unchanged
   * - Releases deposit to renter (all tiers except NO_SHOW)
   * - Writes a DepositAuditLog entry
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
  ): Promise<{
    bookingId: string;
    tier: CancellationTier;
    refundAmount: number;
    refundPercent: number;
    depositStatus: DepositStatus;
    message: string;
  }> {
    // Re-validate eligibility before committing
    const preview = await this.getCancellationPreview(bookingId, userId);

    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { payments: true },
    });

    const listerId = await this.prisma.listing
      .findUniqueOrThrow({ where: { id: booking.listingId }, select: { ownerId: true } })
      .then((l) => l.ownerId);

    // Determine payment and deposit outcomes
    const depositStatusAfter = DepositStatus.RELEASED_TO_RENTER;

    let paymentStatusAfter: PaymentStatus;
    switch (preview.tier) {
      case CancellationTier.FULL_REFUND:
        paymentStatusAfter = PaymentStatus.REFUNDED;
        break;
      case CancellationTier.PARTIAL_REFUND:
        paymentStatusAfter = PaymentStatus.PARTIALLY_REFUNDED;
        break;
      case CancellationTier.NO_REFUND:
      default:
        paymentStatusAfter = PaymentStatus.REFUNDED; // refund amount is 0 but mark as processed
        break;
    }

    // Find the rental payment (most recent COMPLETED payment for this booking)
    const rentalPayment = booking.payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    await this.prisma.$transaction(async (tx) => {
      // 1. Cancel the booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          depositStatus: depositStatusAfter,
          cancellationTier: preview.tier,
          refundAmount: preview.refundAmount,
        },
      });

      // 2. Update rental payment status
      if (rentalPayment) {
        await tx.payment.update({
          where: { id: rentalPayment.id },
          data: { status: paymentStatusAfter },
        });
      }

      // 3. Write DepositAuditLog for the deposit release
      await tx.depositAuditLog.create({
        data: {
          bookingId,
          action: 'RELEASED_TO_RENTER',
          amount: booking.depositAmount,
          performedBy: userId,
          note: reason
            ? `Cancellation (${preview.tier}). Reason: ${reason}`
            : `Cancellation (${preview.tier})`,
        },
      });
    });

    console.log(
      `[CANCELLATION] bookingId=${bookingId} userId=${userId} tier=${preview.tier} ` +
        `refund=${preview.refundAmount} depositTo=RENTER reason=${reason ?? 'none'}`,
    );

    return {
      bookingId,
      tier: preview.tier,
      refundAmount: preview.refundAmount,
      refundPercent: preview.refundPercent,
      depositStatus: depositStatusAfter,
      message: preview.message,
    };
  }

  /**
   * Called by the SLA scheduler when a booking's startDate has passed
   * without the booking transitioning to ACTIVE (no-show scenario).
   * Rule 9: deposit is forfeited to the lister.
   */
  async processNoShow(bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      console.warn(`[NO_SHOW] bookingId=${bookingId} not found — skipping`);
      return;
    }

    // Guard: only process if the booking is still in APPROVED state
    // (if it already transitioned to ACTIVE, CANCELLED, etc., do nothing)
    if (booking.status !== BookingStatus.APPROVED) {
      console.warn(
        `[NO_SHOW] bookingId=${bookingId} is in status=${booking.status} — no-show not applicable`,
      );
      return;
    }

    // Guard: only process if startDate has genuinely passed
    if (new Date() <= booking.startDate) {
      console.warn(
        `[NO_SHOW] bookingId=${bookingId} startDate has not yet passed — skipping`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Mark the booking cancelled with NO_SHOW tier, deposit forfeited to lister
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          depositStatus: DepositStatus.RELEASED_TO_LISTER,
          cancellationTier: CancellationTier.NO_SHOW,
          refundAmount: 0,
        },
      });

      // 2. Audit log — deposit forfeited (recorded as RELEASED_TO_LISTER with system actor)
      await tx.depositAuditLog.create({
        data: {
          bookingId,
          action: 'RELEASED_TO_LISTER',
          amount: booking.depositAmount,
          performedBy: 'system',
          note: 'No-show: renter did not initiate rental before startDate. Deposit forfeited to lister.',
        },
      });

      // 3. No rental refund — payment remains COMPLETED (zero refund owed)
    });

    console.log(
      `[NO_SHOW] bookingId=${bookingId} processed at=${new Date().toISOString()} ` +
        `deposit=${booking.depositAmount} FORFEITED → lister`,
    );
  }
}
