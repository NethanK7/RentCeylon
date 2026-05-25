import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IsDateString, IsUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookingStatus,
  DepositStatus,
  CancellationTier,
  ListingStatus,
  PaymentStatus,
} from '@rentloop/shared';

// ---------------------------------------------------------------------------
// DTO
// ---------------------------------------------------------------------------

export class CreateBookingDto {
  @IsUUID()
  listingId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Days between two dates (positive integer, start inclusive). */
function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Days from now until a future date (may be negative if in the past). */
function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // 1. createBooking
  // -------------------------------------------------------------------------

  async createBooking(renterId: string, dto: CreateBookingDto) {
    const { listingId, startDate: startStr, endDate: endStr } = dto;

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    // Validate listing exists and is ACTIVE
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        dailyRate: true,
        depositAmount: true,
        status: true,
        ownerId: true,
        photos: {
          select: { url: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      throw new BadRequestException('Listing is not available for booking');
    }

    // Check for overlapping confirmed bookings
    const overlap = await this.prisma.booking.findFirst({
      where: {
        listingId,
        status: {
          in: [
            BookingStatus.APPROVED,
            BookingStatus.ACTIVE,
          ] as any[],
        },
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gt: startDate } },
        ],
      },
    });

    if (overlap) {
      throw new BadRequestException(
        'Listing is already booked for the selected dates',
      );
    }

    const totalDays = daysBetween(startDate, endDate);
    const rentalAmount = listing.dailyRate * totalDays;

    // Calculate platform fee server-side (same logic as PaymentsService.calculateFee)
    const feePercent = rentalAmount <= 10_000 ? 10 : rentalAmount <= 50_000 ? 7 : 5;
    const platformFeeAmount = Math.round(rentalAmount * (feePercent / 100));
    const totalCharged = rentalAmount + platformFeeAmount + listing.depositAmount;

    const booking = await this.prisma.booking.create({
      data: {
        listingId,
        renterId,
        startDate,
        endDate,
        totalDays,
        rentalAmount,
        platformFeePercent: feePercent,
        platformFeeAmount,
        depositAmount: listing.depositAmount,
        totalCharged,
        status: BookingStatus.PENDING_APPROVAL as any,
        depositStatus: DepositStatus.HELD as any,
      },
    });

    // Return booking with listing summary — no phone field
    return {
      ...booking,
      listing: {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        location: listing.location,
        dailyRate: listing.dailyRate,
        depositAmount: listing.depositAmount,
        thumbnailUrl: listing.photos[0]?.url ?? null,
      },
    };
  }

  // -------------------------------------------------------------------------
  // 2. acceptBooking
  // -------------------------------------------------------------------------

  async acceptBooking(listerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.listing.ownerId !== listerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    if (booking.status !== (BookingStatus.PENDING_APPROVAL as any)) {
      throw new BadRequestException(
        `Booking cannot be accepted in status: ${booking.status}`,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.APPROVED as any },
    });

    // BullMQ job hint — actual queue lives in the SLA module
    console.log(
      `[QUEUE HINT] Enqueue SLA reminder job for booking ${bookingId}`,
      {
        queue: 'sla-reminders',
        job: 'booking-confirmed',
        payload: {
          bookingId,
          renterId: booking.renterId,
          listerId,
          startDate: booking.startDate,
        },
      },
    );

    return updated;
  }

  // -------------------------------------------------------------------------
  // 3. declineBooking
  // -------------------------------------------------------------------------

  async declineBooking(
    listerId: string,
    bookingId: string,
    reason?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: { select: { ownerId: true } } },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.listing.ownerId !== listerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    if (booking.status !== (BookingStatus.PENDING_APPROVAL as any)) {
      throw new BadRequestException(
        `Booking cannot be declined in status: ${booking.status}`,
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED as any,
        // Store decline reason in the cancellationTier field as a note
        // (a dedicated declineReason column can be added via migration)
        cancellationTier: reason ? `DECLINED: ${reason}` : 'DECLINED',
      },
    });
  }

  // -------------------------------------------------------------------------
  // 4. getBookingContact  (Rule 6 — contact gating)
  // -------------------------------------------------------------------------

  async getBookingContact(renterId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          include: {
            owner: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.renterId !== renterId) {
      throw new ForbiddenException('Access denied');
    }

    if (booking.status !== (BookingStatus.ACTIVE as any)) {
      throw new ForbiddenException(
        'Contact details only available during active rental',
      );
    }

    // Record contact reveal — upsert by bookingId (unique in schema)
    await this.prisma.contactRevealed.upsert({
      where: { bookingId },
      create: {
        bookingId,
        userId: renterId,
      },
      update: {
        revealedAt: new Date(),
      },
    });

    return {
      listerName: booking.listing.owner.name,
      listerPhone: booking.listing.owner.phone,
    };
  }

  // -------------------------------------------------------------------------
  // 5. getCancellationPreview
  // -------------------------------------------------------------------------

  getCancellationPreview(booking: {
    startDate: Date;
    rentalAmount: number;
    depositAmount: number;
  }): { tier: CancellationTier; refundAmount: number } {
    const days = daysUntil(booking.startDate);
    const total = booking.rentalAmount + booking.depositAmount;

    if (days < 0) {
      // Past start date → no-show
      return { tier: CancellationTier.NO_SHOW, refundAmount: 0 };
    }

    if (days >= 7) {
      return { tier: CancellationTier.FULL_REFUND, refundAmount: total };
    }

    if (days >= 3) {
      return {
        tier: CancellationTier.PARTIAL_REFUND,
        refundAmount: Math.round(total * 0.5),
      };
    }

    return { tier: CancellationTier.NO_REFUND, refundAmount: 0 };
  }

  async getCancellationPreviewById(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        startDate: true,
        rentalAmount: true,
        depositAmount: true,
        totalCharged: true,
        status: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.status === (BookingStatus.CANCELLED as any) ||
      booking.status === (BookingStatus.COMPLETED as any)
    ) {
      throw new BadRequestException(
        `Cannot cancel a booking in status: ${booking.status}`,
      );
    }

    const preview = this.getCancellationPreview(booking);

    return {
      bookingId: booking.id,
      ...preview,
    };
  }

  // -------------------------------------------------------------------------
  // 6. cancelBooking
  // -------------------------------------------------------------------------

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: { select: { ownerId: true } },
        payments: {
          where: { status: PaymentStatus.COMPLETED as any },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const isRenter = booking.renterId === userId;
    const isLister = booking.listing.ownerId === userId;

    if (!isRenter && !isLister) {
      throw new ForbiddenException('Access denied');
    }

    if (
      booking.status === (BookingStatus.CANCELLED as any) ||
      booking.status === (BookingStatus.COMPLETED as any)
    ) {
      throw new BadRequestException(
        `Booking is already ${booking.status.toLowerCase()}`,
      );
    }

    const { tier, refundAmount } = this.getCancellationPreview(booking);

    // Update booking — record tier and refund amount
    const [updatedBooking] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED as any,
          cancellationTier: tier,
          refundAmount,
        },
      }),

      // Mock refund record: update the most recent completed payment to REFUNDED
      ...(booking.payments.length > 0
        ? [
            this.prisma.payment.update({
              where: { id: booking.payments[0].id },
              data: {
                status: (
                  refundAmount > 0
                    ? refundAmount < booking.payments[0].amount
                      ? PaymentStatus.PARTIALLY_REFUNDED
                      : PaymentStatus.REFUNDED
                    : PaymentStatus.COMPLETED
                ) as any,
                metadata: {
                  refundAmount,
                  refundTier: tier,
                  refundedAt: new Date().toISOString(),
                },
              },
            }),
          ]
        : []),
    ]);

    return {
      booking: updatedBooking,
      cancellation: {
        tier,
        refundAmount,
      },
    };
  }

  // -------------------------------------------------------------------------
  // 7. getMyBookings
  // Returns all bookings where the user is either the renter or the lister.
  // -------------------------------------------------------------------------

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        OR: [
          { renterId: userId },
          { listing: { ownerId: userId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            dailyRate: true,
            depositAmount: true,
            photos: {
              select: { url: true, sortOrder: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
    });
  }
}
