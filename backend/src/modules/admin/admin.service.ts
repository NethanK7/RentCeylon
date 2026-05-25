import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  VerificationStatus,
  DisputeStatus,
  DepositStatus,
  DepositAuditAction,
} from '@rentloop/shared';
import { NotificationsService } from '../notifications/notifications.service';

// SLA threshold in hours. Items within this window of breaching are flagged "at risk".
const DEPOSIT_SLA_HOURS = 48;
const DISPUTE_SLA_HOURS = 72;
const SLA_AT_RISK_BUFFER_HOURS = 6;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Returns high-level platform health metrics for the admin dashboard.
   *
   * slaAtRisk: combined count of deposits and disputes whose SLA deadline
   * falls within the next SLA_AT_RISK_BUFFER_HOURS hours (at risk of breaching).
   */
  async getDashboardStats() {
    const now = new Date();
    const atRiskCutoff = new Date(now.getTime() + SLA_AT_RISK_BUFFER_HOURS * 60 * 60 * 1000);

    const [
      pendingDeposits,
      pendingIdVerifications,
      openDisputes,
      depositsAtRisk,
      disputesAtRisk,
    ] = await this.prisma.$transaction([
      // Deposits currently held (awaiting release)
      this.prisma.booking.count({
        where: { depositStatus: DepositStatus.HELD },
      }),

      // Users with ID verification pending admin review
      this.prisma.user.count({
        where: { verificationStatus: VerificationStatus.PENDING },
      }),

      // Disputes not yet resolved
      this.prisma.dispute.count({
        where: {
          status: {
            in: [DisputeStatus.RAISED, DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
          },
        },
      }),

      // Deposits held where the 48hr SLA deadline is within the next 6 hours.
      // SLA clock starts from booking.updatedAt (when status became CLOSED / ACTIVE).
      // We approximate: createdAt + DEPOSIT_SLA_HOURS < now + buffer
      this.prisma.booking.count({
        where: {
          depositStatus: DepositStatus.HELD,
          createdAt: {
            lt: new Date(
              now.getTime() -
                (DEPOSIT_SLA_HOURS - SLA_AT_RISK_BUFFER_HOURS) * 60 * 60 * 1000,
            ),
          },
        },
      }),

      // Disputes where the 72hr SLA deadline is within the next 6 hours
      this.prisma.dispute.count({
        where: {
          status: {
            in: [DisputeStatus.RAISED, DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
          },
          slaDeadline: {
            lte: atRiskCutoff,
            gte: now,
          },
        },
      }),
    ]);

    return {
      pendingDeposits,
      pendingIdVerifications,
      openDisputes,
      slaAtRisk: depositsAtRisk + disputesAtRisk,
    };
  }

  /**
   * Returns paginated bookings where the deposit is currently HELD,
   * enriched with booking details, party names, and how long the deposit
   * has been held (heldDurationHours).
   */
  async getPendingDeposits(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [bookings, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where: { depositStatus: DepositStatus.HELD },
        include: {
          listing: { select: { id: true, title: true } },
          renter: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'asc' }, // oldest first — most urgent
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: { depositStatus: DepositStatus.HELD } }),
    ]);

    const enriched = bookings.map((booking) => ({
      ...booking,
      listerName: undefined as string | undefined, // populated below via listing.ownerId join if needed
      heldDurationHours: Math.floor(
        (now.getTime() - booking.createdAt.getTime()) / (1000 * 60 * 60),
      ),
      slaBreached:
        (now.getTime() - booking.createdAt.getTime()) / (1000 * 60 * 60) > DEPOSIT_SLA_HOURS,
    }));

    return { bookings: enriched, total, page, limit, hasMore: skip + bookings.length < total };
  }

  /**
   * Returns all DepositAuditLog entries for a given booking, ordered
   * chronologically (oldest first) to provide a full chain-of-custody trail.
   */
  async getDepositAuditLog(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    return this.prisma.depositAuditLog.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Manually release a deposit to either the renter or the lister.
   *
   * The audit log entry is written FIRST inside a $transaction so that if
   * the booking update fails, no audit record is left dangling — the entire
   * transaction rolls back atomically.
   *
   * @param adminId  - ID of the admin performing the action (from JWT)
   * @param bookingId
   * @param toParty  - 'renter' | 'lister'
   * @param note     - Mandatory reason note for audit trail
   */
  async manualReleaseDeposit(
    adminId: string,
    bookingId: string,
    toParty: 'renter' | 'lister',
    note: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, depositStatus: true, depositAmount: true },
    });

    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    if (
      booking.depositStatus !== DepositStatus.HELD &&
      booking.depositStatus !== DepositStatus.DISPUTED
    ) {
      throw new BadRequestException(
        `Cannot release deposit — current status is "${booking.depositStatus}". ` +
          `Deposit must be HELD or DISPUTED.`,
      );
    }

    const newDepositStatus =
      toParty === 'renter' ? DepositStatus.RELEASED_TO_RENTER : DepositStatus.RELEASED_TO_LISTER;

    // Audit log is created BEFORE the status update within a single transaction.
    const [, updatedBooking] = await this.prisma.$transaction([
      this.prisma.depositAuditLog.create({
        data: {
          bookingId,
          action: DepositAuditAction.ADMIN_MANUAL_RELEASE,
          amount: booking.depositAmount,
          performedBy: adminId,
          note: `Manual release to ${toParty} by admin ${adminId}. Reason: ${note}`,
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { depositStatus: newDepositStatus },
        include: {
          listing: { select: { title: true, ownerId: true } },
          renter: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Fire-and-forget deposit notification (non-blocking)
    this.notifications.notifyDepositReleased(bookingId, toParty).catch(() => {
      // Notification failure must never break the release flow
    });

    return updatedBooking;
  }

  /**
   * Returns paginated users whose ID verification is pending admin review,
   * ordered oldest-first (longest waiting first).
   */
  async getPendingVerifications(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { verificationStatus: VerificationStatus.PENDING },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          idDocumentFront: true,
          idDocumentBack: true,
          createdAt: true,
          verificationStatus: true,
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
    ]);

    return { users, total, page, limit, hasMore: skip + users.length < total };
  }

  /**
   * Approve a user's ID verification.
   * Sets verificationStatus to APPROVED and sends an in-app notification.
   */
  async approveVerification(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    if (user.verificationStatus !== VerificationStatus.PENDING) {
      throw new BadRequestException(
        `User verification is not in PENDING state (current: ${user.verificationStatus})`,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: VerificationStatus.APPROVED },
      select: { id: true, name: true, email: true, verificationStatus: true },
    });

    // Non-blocking notification
    this.notifications
      .sendNotification(
        userId,
        'ID_VERIFICATION_APPROVED' as any,
        'Identity Verified',
        'Your ID has been verified. You can now rent items on RentLoop.',
        { actionUrl: '/profile' },
      )
      .catch(() => {});

    return updatedUser;
  }

  /**
   * Reject a user's ID verification with a mandatory reason.
   * Sets verificationStatus to REJECTED and records the reason as a notification body.
   */
  async rejectVerification(adminId: string, userId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    if (user.verificationStatus !== VerificationStatus.PENDING) {
      throw new BadRequestException(
        `User verification is not in PENDING state (current: ${user.verificationStatus})`,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: VerificationStatus.REJECTED },
      select: { id: true, name: true, email: true, verificationStatus: true },
    });

    // Non-blocking notification with reason
    this.notifications
      .sendNotification(
        userId,
        'ID_VERIFICATION_REJECTED' as any,
        'Identity Verification Rejected',
        `Your ID verification was rejected. Reason: ${reason}. Please re-submit with a valid document.`,
        { actionUrl: '/profile/verification' },
      )
      .catch(() => {});

    return updatedUser;
  }

  /**
   * Returns paginated open disputes (RAISED, UNDER_REVIEW, ESCALATED),
   * enriched with an SLA countdown so admins can prioritise.
   */
  async getOpenDisputes(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [disputes, total] = await this.prisma.$transaction([
      this.prisma.dispute.findMany({
        where: {
          status: {
            in: [DisputeStatus.RAISED, DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
          },
        },
        include: {
          booking: {
            select: {
              id: true,
              depositAmount: true,
              depositStatus: true,
              startDate: true,
              endDate: true,
              listing: { select: { title: true } },
              renter: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { slaDeadline: 'asc' }, // most urgent first
        skip,
        take: limit,
      }),
      this.prisma.dispute.count({
        where: {
          status: {
            in: [DisputeStatus.RAISED, DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
          },
        },
      }),
    ]);

    const enriched = disputes.map((dispute) => {
      const slaRemainingMs = Math.max(0, dispute.slaDeadline.getTime() - now.getTime());
      const slaBreached = slaRemainingMs === 0;
      const slaRemainingHours = Math.floor(slaRemainingMs / (1000 * 60 * 60));

      return {
        ...dispute,
        sla: {
          deadline: dispute.slaDeadline,
          remainingMs: slaRemainingMs,
          remainingHours: slaRemainingHours,
          breached: slaBreached,
          atRisk: !slaBreached && slaRemainingHours <= SLA_AT_RISK_BUFFER_HOURS,
        },
      };
    });

    return { disputes: enriched, total, page, limit, hasMore: skip + disputes.length < total };
  }
}
