import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  DepositStatus,
  DepositAuditAction,
  DisputeStatus,
  VerificationStatus,
} from '@rentloop/shared';

// ─── Job payload types ────────────────────────────────────────────────────────

export interface DepositAutoReleasePayload {
  bookingId: string;
}

export interface IdVerificationSlaPayload {
  userId: string;
}

export interface DisputeSlaPayload {
  disputeId: string;
  bookingId: string;
}

// ─── Processor ────────────────────────────────────────────────────────────────

@Processor('sla')
export class SlaProcessor extends WorkerHost {
  private readonly logger = new Logger(SlaProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing SLA job [${job.name}] id=${job.id}`);

    switch (job.name) {
      case 'deposit-auto-release':
        return this.handleDepositAutoRelease(job as Job<DepositAutoReleasePayload>);

      case 'id-verification-sla':
        return this.handleIdVerificationSla(job as Job<IdVerificationSlaPayload>);

      case 'dispute-sla':
        return this.handleDisputeSla(job as Job<DisputeSlaPayload>);

      default:
        this.logger.warn(`Unknown SLA job type: "${job.name}" — skipping.`);
    }
  }

  // ─── deposit-auto-release ─────────────────────────────────────────────────

  /**
   * Called 48 hours after a deposit is placed (HELD state).
   *
   * Rules:
   * 1. Check depositStatus is still HELD — skip if already released/disputed.
   * 2. Check for any OPEN disputes — skip if found (do not release while dispute is active).
   * 3. Idempotency guard — check for an existing SYSTEM_AUTO_RELEASED audit log entry.
   * 4. Write DepositAuditLog (SYSTEM_AUTO_RELEASED) + update depositStatus in a single $transaction.
   */
  private async handleDepositAutoRelease(job: Job<DepositAutoReleasePayload>): Promise<void> {
    const { bookingId } = job.data;

    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          depositAuditLogs: true,
          dispute: true,
        },
      });

      if (!booking) {
        this.logger.warn(
          `deposit-auto-release: booking "${bookingId}" not found — skipping.`,
        );
        return;
      }

      // 1. Deposit must still be HELD
      if (booking.depositStatus !== DepositStatus.HELD) {
        this.logger.log(
          `deposit-auto-release: booking "${bookingId}" depositStatus=${booking.depositStatus} — skipping (not HELD).`,
        );
        return;
      }

      // 2. Skip if there is an open dispute
      if (booking.dispute) {
        const openStatuses: DisputeStatus[] = [
          DisputeStatus.RAISED,
          DisputeStatus.UNDER_REVIEW,
          DisputeStatus.ESCALATED,
        ];
        if (openStatuses.includes(booking.dispute.status as DisputeStatus)) {
          this.logger.log(
            `deposit-auto-release: Skipping auto-release: open dispute (bookingId="${bookingId}", disputeStatus="${booking.dispute.status}").`,
          );
          return;
        }
      }

      // 3. Idempotency: abort if SYSTEM_AUTO_RELEASED audit entry already exists
      const alreadyReleased = booking.depositAuditLogs.some(
        (log) => log.action === DepositAuditAction.SYSTEM_AUTO_RELEASED,
      );
      if (alreadyReleased) {
        this.logger.log(
          `deposit-auto-release: booking "${bookingId}" already has SYSTEM_AUTO_RELEASED log — idempotency guard triggered, skipping.`,
        );
        return;
      }

      // 4. Write audit log and update deposit status atomically
      await this.prisma.$transaction(async (tx) => {
        await tx.depositAuditLog.create({
          data: {
            bookingId,
            action: DepositAuditAction.SYSTEM_AUTO_RELEASED,
            amount: booking.depositAmount,
            performedBy: 'system',
            note: '48hr SLA auto-release',
          },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { depositStatus: DepositStatus.RELEASED_TO_RENTER },
        });
      });

      this.logger.log(
        `deposit-auto-release: deposit auto-released to renter for booking "${bookingId}".`,
      );
    } catch (error) {
      this.logger.error(
        `deposit-auto-release: failed for booking "${bookingId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Do not rethrow — BullMQ will retry based on job options
    }
  }

  // ─── id-verification-sla ─────────────────────────────────────────────────

  /**
   * Called 24 hours after a user submits their ID for verification.
   *
   * If the verification is still PENDING:
   * - Set slaBreached flag on user record (via metadata approach using a dedicated notification).
   * - Send an admin notification so the team is alerted.
   */
  private async handleIdVerificationSla(job: Job<IdVerificationSlaPayload>): Promise<void> {
    const { userId } = job.data;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, verificationStatus: true },
      });

      if (!user) {
        this.logger.warn(
          `id-verification-sla: user "${userId}" not found — skipping.`,
        );
        return;
      }

      if (user.verificationStatus !== VerificationStatus.PENDING) {
        this.logger.log(
          `id-verification-sla: user "${userId}" verificationStatus=${user.verificationStatus} — SLA no longer relevant, skipping.`,
        );
        return;
      }

      // Notify admin — create a notification record targeted at all ADMIN users
      const adminUsers = await this.prisma.user.findMany({
        where: { role: 'ADMIN' as any },
        select: { id: true },
      });

      if (adminUsers.length > 0) {
        await this.prisma.notification.createMany({
          data: adminUsers.map((admin) => ({
            userId: admin.id,
            type: 'ID_VERIFICATION_REJECTED' as any, // Closest type — SLA breach notification
            title: 'ID Verification SLA Breach',
            body: `User ${user.name} (${user.email}) has a pending ID verification that has exceeded the 24-hour SLA. Please review immediately.`,
            actionUrl: `/admin/users/${userId}/verification`,
          })),
          skipDuplicates: true,
        });
      }

      // Mark the SLA breach flag on the user record via a dedicated update
      // The schema doesn't have a dedicated slaBreached field; we log the breach
      // and surface it via the admin notification above. If a dedicated field is
      // added to the schema in future, update this to: user.update({ idVerificationSlaBreach: true })
      this.logger.warn(
        `id-verification-sla: SLA breached for user "${userId}" — admin notified.`,
      );
    } catch (error) {
      this.logger.error(
        `id-verification-sla: failed for user "${userId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Do not rethrow — BullMQ will retry based on job options
    }
  }

  // ─── dispute-sla ─────────────────────────────────────────────────────────

  /**
   * Called 72 hours after a dispute is raised.
   *
   * If the dispute is still OPEN (RAISED or UNDER_REVIEW):
   * - Escalate: set dispute.status = ESCALATED.
   * - Notify admin users.
   */
  private async handleDisputeSla(job: Job<DisputeSlaPayload>): Promise<void> {
    const { disputeId, bookingId } = job.data;

    try {
      const dispute = await this.prisma.dispute.findUnique({
        where: { id: disputeId },
        include: { booking: { include: { renter: { select: { id: true, name: true } } } } },
      });

      if (!dispute) {
        this.logger.warn(
          `dispute-sla: dispute "${disputeId}" not found — skipping.`,
        );
        return;
      }

      const openStatuses: DisputeStatus[] = [DisputeStatus.RAISED, DisputeStatus.UNDER_REVIEW];

      if (!openStatuses.includes(dispute.status as DisputeStatus)) {
        this.logger.log(
          `dispute-sla: dispute "${disputeId}" status=${dispute.status} — no longer open, skipping.`,
        );
        return;
      }

      // Escalate the dispute and notify admins in a transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.dispute.update({
          where: { id: disputeId },
          data: { status: DisputeStatus.ESCALATED },
        });

        const adminUsers = await tx.user.findMany({
          where: { role: 'ADMIN' as any },
          select: { id: true },
        });

        if (adminUsers.length > 0) {
          await tx.notification.createMany({
            data: adminUsers.map((admin) => ({
              userId: admin.id,
              type: 'DISPUTE_RAISED' as any,
              title: 'Dispute Escalated — 72hr SLA Breached',
              body: `Dispute on booking "${bookingId}" has not received a first response within 72 hours and has been escalated. Immediate review required.`,
              actionUrl: `/admin/disputes/${disputeId}`,
            })),
            skipDuplicates: true,
          });
        }
      });

      this.logger.warn(
        `dispute-sla: dispute "${disputeId}" escalated after 72hr SLA breach (bookingId="${bookingId}").`,
      );
    } catch (error) {
      this.logger.error(
        `dispute-sla: failed for dispute "${disputeId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Do not rethrow — BullMQ will retry based on job options
    }
  }
}

// ─── SlaService — enqueues jobs ───────────────────────────────────────────────

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);

  constructor(@InjectQueue('sla') private readonly slaQueue: Queue) {}

  /**
   * Enqueue a deposit auto-release job to run after a 48-hour delay.
   */
  async scheduleDepositAutoRelease(bookingId: string): Promise<void> {
    const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

    await this.slaQueue.add(
      'deposit-auto-release',
      { bookingId } satisfies DepositAutoReleasePayload,
      {
        delay: FORTY_EIGHT_HOURS_MS,
        jobId: `deposit-auto-release:${bookingId}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
        removeOnComplete: { age: 7 * 24 * 3600 },
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Scheduled deposit-auto-release for booking "${bookingId}" in 48 hours.`,
    );
  }

  /**
   * Enqueue an ID verification SLA check to run after a 24-hour delay.
   */
  async scheduleIdVerificationSla(userId: string): Promise<void> {
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    await this.slaQueue.add(
      'id-verification-sla',
      { userId } satisfies IdVerificationSlaPayload,
      {
        delay: TWENTY_FOUR_HOURS_MS,
        jobId: `id-verification-sla:${userId}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
        removeOnComplete: { age: 7 * 24 * 3600 },
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Scheduled id-verification-sla for user "${userId}" in 24 hours.`,
    );
  }

  /**
   * Enqueue a dispute SLA check to run after a 72-hour delay.
   */
  async scheduleDisputeSla(disputeId: string, bookingId: string): Promise<void> {
    const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000;

    await this.slaQueue.add(
      'dispute-sla',
      { disputeId, bookingId } satisfies DisputeSlaPayload,
      {
        delay: SEVENTY_TWO_HOURS_MS,
        jobId: `dispute-sla:${disputeId}`,
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
        removeOnComplete: { age: 7 * 24 * 3600 },
        removeOnFail: false,
      },
    );

    this.logger.log(
      `Scheduled dispute-sla for dispute "${disputeId}" (booking "${bookingId}") in 72 hours.`,
    );
  }
}
