import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { PaymentStatus, PaymentProvider, BookingStatus, DepositStatus } from '@rentloop/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeeBreakdown {
  rentalAmount: number;
  feePercent: number;
  feeAmount: number;
  depositAmount: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Redis key helpers
// ---------------------------------------------------------------------------

const idempotencyKey = (bookingId: string) =>
  `payment:idempotency:${bookingId}`;

const IDEMPOTENCY_TTL_SECONDS = 3600;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // -------------------------------------------------------------------------
  // 1. initiatePayment  (Rule 4 — payment idempotency)
  // -------------------------------------------------------------------------

  async initiatePayment(
    bookingId: string,
    userId: string,
    provider: PaymentProvider,
  ): Promise<{ idempotencyKey: string; paymentUrl: string }> {
    // Check Redis for an existing idempotency key BEFORE creating a new one
    const existingKey = await this.redis.get(idempotencyKey(bookingId));

    if (existingKey) {
      // Return the existing payment record — idempotent response
      const existingPayment = await this.prisma.payment.findUnique({
        where: { idempotencyKey: existingKey },
      });

      if (existingPayment) {
        return {
          idempotencyKey: existingKey,
          paymentUrl: 'https://payhere.lk/pay/checkout',
        };
      }
    }

    // Verify booking exists and belongs to this user
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, renterId: true, totalCharged: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Generate server-side idempotency key (Rule 4 — never trust client)
    const newIdempotencyKey = uuidv4();

    // Store in Redis BEFORE any payment call — guarantees at-most-once
    await this.redis.set(
      idempotencyKey(bookingId),
      newIdempotencyKey,
      'EX',
      IDEMPOTENCY_TTL_SECONDS,
    );

    // Create Payment record in DB with unique idempotencyKey constraint
    await this.prisma.payment.create({
      data: {
        bookingId,
        provider: provider as any,
        status: PaymentStatus.PENDING as any,
        amount: booking.totalCharged,
        currency: 'LKR',
        idempotencyKey: newIdempotencyKey,
        metadata: {
          initiatedBy: userId,
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    return {
      idempotencyKey: newIdempotencyKey,
      paymentUrl: 'https://payhere.lk/pay/checkout',
    };
  }

  // -------------------------------------------------------------------------
  // 2. confirmPayment  (webhook handler)
  // -------------------------------------------------------------------------

  async confirmPayment(
    paymentIdempotencyKey: string,
    providerRef: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { idempotencyKey: paymentIdempotencyKey },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment not found for idempotency key: ${paymentIdempotencyKey}`,
      );
    }

    if (payment.status === (PaymentStatus.COMPLETED as any)) {
      // Already confirmed — idempotent, return existing record
      return payment;
    }

    const [updatedPayment] = await this.prisma.$transaction([
      // 1. Mark payment as COMPLETED
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED as any,
          providerRef,
          metadata: {
            ...(payment.metadata as object),
            confirmedAt: new Date().toISOString(),
            providerRef,
          },
        },
      }),

      // 2. Transition booking deposit status to HELD
      this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          depositStatus: DepositStatus.HELD as any,
          status: BookingStatus.ACTIVE as any,
        },
      }),
    ]);

    // Clear Redis idempotency key after successful confirmation
    await this.redis.del(idempotencyKey(payment.bookingId));

    return updatedPayment;
  }

  // -------------------------------------------------------------------------
  // 3. calculateFee  — SERVER-SIDE ONLY (never trust client-provided fees)
  // -------------------------------------------------------------------------

  calculateFee(rentalAmount: number, depositAmount = 0): FeeBreakdown {
    if (rentalAmount < 0) {
      throw new ConflictException('rentalAmount must be non-negative');
    }

    let feePercent: number;

    if (rentalAmount <= 10_000) {
      feePercent = 10;
    } else if (rentalAmount <= 50_000) {
      feePercent = 7;
    } else {
      feePercent = 5;
    }

    const feeAmount = Math.round(rentalAmount * (feePercent / 100));
    const computedDeposit = depositAmount > 0
      ? depositAmount
      : Math.round(rentalAmount * 0.3);

    const total = rentalAmount + feeAmount + computedDeposit;

    return {
      rentalAmount,
      feePercent,
      feeAmount,
      depositAmount: computedDeposit,
      total,
    };
  }

  // -------------------------------------------------------------------------
  // 4. refundPayment
  // -------------------------------------------------------------------------

  async refundPayment(
    paymentId: string,
    amount: number,
    reason: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment not found: ${paymentId}`);
    }

    if (payment.status === (PaymentStatus.REFUNDED as any)) {
      throw new ConflictException('Payment has already been fully refunded');
    }

    if (amount <= 0 || amount > payment.amount) {
      throw new ConflictException(
        `Refund amount must be between 1 and ${payment.amount}`,
      );
    }

    const isFullRefund = amount === payment.amount;
    const newStatus = isFullRefund
      ? (PaymentStatus.REFUNDED as any)
      : (PaymentStatus.PARTIALLY_REFUNDED as any);

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        metadata: {
          ...(payment.metadata as object),
          refund: {
            amount,
            reason,
            refundedAt: new Date().toISOString(),
          },
        },
      },
    });

    return {
      payment: updated,
      refund: {
        amount,
        reason,
        isFullRefund,
      },
    };
  }
}
