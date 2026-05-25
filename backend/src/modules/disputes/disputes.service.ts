import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DisputeStatus,
  DisputeOutcome,
  BookingStatus,
  DepositStatus,
  DepositAuditAction,
} from '@rentloop/shared';
import { IsString, IsEnum, MinLength, IsArray, IsOptional } from 'class-validator';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export enum DisputeType {
  DAMAGE = 'DAMAGE',
  MISSING = 'MISSING',
  NO_RETURN = 'NO_RETURN',
  OTHER = 'OTHER',
}

export class RaiseDisputeDto {
  @IsEnum(DisputeType)
  type: DisputeType;

  @IsString()
  @MinLength(20)
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidenceUrls: string[] = [];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DISPUTE_SLA_HOURS = 72;

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Raise a dispute against a booking.
   * The caller must be the renter or the lister for that booking.
   * Disputes can only be raised for ACTIVE or CLOSED bookings — not PENDING_APPROVAL.
   *
   * SLA note: The SLA job skips auto-releasing deposits for bookings that have an
   * OPEN (RAISED / UNDER_REVIEW) dispute. This service marks the deposit as DISPUTED
   * so the SLA worker can detect it efficiently.
   */
  async raiseDispute(raisedById: string, bookingId: string, dto: RaiseDisputeDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: { select: { ownerId: true, title: true } },
        renter: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    const listerId = booking.listing.ownerId;
    const isParty = booking.renterId === raisedById || listerId === raisedById;
    if (!isParty) {
      throw new ForbiddenException('You are not a party to this booking');
    }

    const allowedStatuses: string[] = [BookingStatus.ACTIVE, BookingStatus.CLOSED];
    if (!allowedStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Disputes cannot be raised for bookings with status "${booking.status}". ` +
          `The booking must be ACTIVE or CLOSED.`,
      );
    }

    // Check for an existing open dispute (RAISED or UNDER_REVIEW)
    const existingDispute = await this.prisma.dispute.findUnique({
      where: { bookingId },
    });
    if (
      existingDispute &&
      (existingDispute.status === DisputeStatus.RAISED ||
        existingDispute.status === DisputeStatus.UNDER_REVIEW)
    ) {
      throw new BadRequestException('An open dispute already exists for this booking');
    }

    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + DISPUTE_SLA_HOURS);

    // Create dispute and pause deposit release atomically.
    // Setting depositStatus=DISPUTED signals the SLA worker to skip auto-release.
    const [dispute] = await this.prisma.$transaction([
      this.prisma.dispute.create({
        data: {
          bookingId,
          raisedById,
          type: dto.type,
          description: dto.description,
          evidenceKeys: dto.evidenceUrls,
          status: DisputeStatus.RAISED,
          slaDeadline,
        },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
              depositAmount: true,
              depositStatus: true,
              startDate: true,
              endDate: true,
              listing: { select: { title: true } },
              renter: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { depositStatus: DepositStatus.DISPUTED },
      }),
      this.prisma.depositAuditLog.create({
        data: {
          bookingId,
          action: DepositAuditAction.DISPUTED,
          amount: booking.depositAmount,
          performedBy: raisedById,
          note: `Dispute raised by ${raisedById}: ${dto.type}`,
        },
      }),
    ]);

    return dispute;
  }

  /**
   * Submit additional evidence URLs for an open dispute.
   * Only parties to the dispute (renter or lister of the booking) may submit.
   */
  async submitEvidence(userId: string, disputeId: string, evidenceUrls: string[]) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: {
          select: {
            renterId: true,
            listing: { select: { ownerId: true } },
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute ${disputeId} not found`);
    }

    const listerId = dispute.booking.listing.ownerId;
    const isParty = dispute.booking.renterId === userId || listerId === userId;
    if (!isParty) {
      throw new ForbiddenException('You are not a party to this dispute');
    }

    if (
      dispute.status !== DisputeStatus.RAISED &&
      dispute.status !== DisputeStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        `Evidence can only be submitted for open disputes. Current status: ${dispute.status}`,
      );
    }

    const updatedKeys = [...dispute.evidenceKeys, ...evidenceUrls];

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { evidenceKeys: updatedKeys },
    });
  }

  /**
   * Resolve a dispute as an admin. The admin role must be enforced by the calling
   * controller via a role guard — this method trusts the adminId passed in.
   *
   * Outcome behaviour:
   *   FAVOUR_RENTER  → full deposit released to renter
   *   FAVOUR_LISTER  → full deposit released to lister
   *   SPLIT          → deposit split 50/50; depositStatus set to PARTIALLY_RELEASED
   *   NO_ACTION      → dispute closed, deposit released to renter by default
   */
  async resolveDispute(
    adminId: string,
    disputeId: string,
    outcome: DisputeOutcome,
    adminNote: string,
  ) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: {
          select: {
            id: true,
            depositAmount: true,
            depositStatus: true,
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute ${disputeId} not found`);
    }

    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.CLOSED) {
      throw new BadRequestException(`Dispute is already ${dispute.status}`);
    }

    const bookingId = dispute.bookingId;
    const depositAmount = dispute.booking.depositAmount;
    const now = new Date();

    let newDepositStatus: DepositStatus;
    let auditAction: DepositAuditAction;
    let auditNote: string;

    switch (outcome) {
      case DisputeOutcome.FAVOUR_RENTER:
        newDepositStatus = DepositStatus.RELEASED_TO_RENTER;
        auditAction = DepositAuditAction.RELEASED_TO_RENTER;
        auditNote = `Dispute resolved in favour of renter by admin ${adminId}. ${adminNote}`;
        break;

      case DisputeOutcome.FAVOUR_LISTER:
        newDepositStatus = DepositStatus.RELEASED_TO_LISTER;
        auditAction = DepositAuditAction.RELEASED_TO_LISTER;
        auditNote = `Dispute resolved in favour of lister by admin ${adminId}. ${adminNote}`;
        break;

      case DisputeOutcome.SPLIT:
        // 50/50 split: depositStatus reflects partial release; the actual payment
        // disbursement is handled by the payments module using the audit log.
        newDepositStatus = DepositStatus.PARTIALLY_RELEASED;
        auditAction = DepositAuditAction.PARTIALLY_RELEASED;
        auditNote = `Dispute resolved as 50/50 split by admin ${adminId}. Each party receives ${Math.floor(depositAmount / 2)} LKR. ${adminNote}`;
        break;

      case DisputeOutcome.NO_ACTION:
      default:
        // No fault found — return deposit to renter
        newDepositStatus = DepositStatus.RELEASED_TO_RENTER;
        auditAction = DepositAuditAction.RELEASED_TO_RENTER;
        auditNote = `Dispute closed with no action by admin ${adminId}. Deposit returned to renter. ${adminNote}`;
        break;
    }

    const [updatedDispute] = await this.prisma.$transaction([
      this.prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          outcome,
          adminNote,
          resolvedAt: now,
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
      }),
      this.prisma.depositAuditLog.create({
        data: {
          bookingId,
          action: auditAction,
          amount: outcome === DisputeOutcome.SPLIT ? Math.floor(depositAmount / 2) : depositAmount,
          performedBy: adminId,
          note: auditNote,
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { depositStatus: newDepositStatus },
      }),
    ]);

    return updatedDispute;
  }

  /**
   * Returns the full dispute record for a given disputeId, including:
   * - Current status
   * - Evidence keys
   * - SLA countdown (ms remaining from createdAt + 72hr)
   * - Resolved details if applicable
   *
   * Both parties to the booking and admins may call this.
   */
  async getDisputeStatus(disputeId: string, userId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: {
          select: {
            id: true,
            renterId: true,
            depositAmount: true,
            depositStatus: true,
            status: true,
            startDate: true,
            endDate: true,
            listing: {
              select: { title: true, ownerId: true },
            },
            renter: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute ${disputeId} not found`);
    }

    const listerId = dispute.booking.listing.ownerId;
    const isParty = dispute.booking.renterId === userId || listerId === userId;
    if (!isParty) {
      throw new ForbiddenException('You do not have access to this dispute');
    }

    // SLA countdown: 72hr from createdAt
    const slaDeadlineMs = dispute.slaDeadline.getTime();
    const nowMs = Date.now();
    const slaRemainingMs = Math.max(0, slaDeadlineMs - nowMs);
    const slaBreached = slaRemainingMs === 0;
    const slaRemainingHours = Math.floor(slaRemainingMs / (1000 * 60 * 60));
    const slaRemainingMinutes = Math.floor((slaRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      ...dispute,
      sla: {
        deadline: dispute.slaDeadline,
        remainingMs: slaRemainingMs,
        remainingHours: slaRemainingHours,
        remainingMinutes: slaRemainingMinutes,
        breached: slaBreached,
      },
    };
  }
}
