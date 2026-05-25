import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@rentloop/shared';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rule 6 — Contact Gating
   * Phone numbers are NEVER included in any listing response.
   * They are only revealed here, gated behind an ACTIVE booking.
   */
  async revealContact(
    renterId: string,
    bookingId: string,
  ): Promise<{ phone: string; name: string; whatsappUrl: string }> {
    // 1. Fetch the booking and verify ownership
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
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    if (booking.renterId !== renterId) {
      throw new ForbiddenException('You are not the renter of this booking');
    }

    // 2. Gate: booking must be ACTIVE
    if (booking.status !== BookingStatus.ACTIVE) {
      throw new ForbiddenException(
        'Contact details can only be revealed for an active booking. ' +
          `Current status: ${booking.status}`,
      );
    }

    const lister = booking.listing.owner;

    if (!lister.phone) {
      throw new NotFoundException('Lister has not provided a phone number');
    }

    // 3. Upsert ContactRevealed record for audit trail
    //    Schema has @@unique on bookingId, userId — we store the renter's userId
    await this.prisma.contactRevealed.upsert({
      where: { bookingId },
      create: {
        bookingId,
        userId: renterId,
        revealedAt: new Date(),
      },
      update: {
        revealedAt: new Date(),
      },
    });

    // 4. Audit log
    console.log(
      `[CONTACT_REVEAL] bookingId=${bookingId} renterId=${renterId} listerId=${lister.id} at=${new Date().toISOString()}`,
    );

    // 5. Build WhatsApp URL — normalise to last 9 digits, prefix with Sri Lanka country code
    const digits = lister.phone.replace(/\D/g, '').slice(-9);
    const whatsappUrl = `https://wa.me/94${digits}`;

    return {
      phone: lister.phone,
      name: lister.name,
      whatsappUrl,
    };
  }

  /**
   * Returns a history of all contact reveals made by this user, newest first.
   */
  async getRevealHistory(userId: string): Promise<
    Array<{
      bookingId: string;
      listingTitle: string;
      listerName: string;
      revealedAt: Date;
    }>
  > {
    const reveals = await this.prisma.contactRevealed.findMany({
      where: { userId },
      orderBy: { revealedAt: 'desc' },
      include: {
        booking: {
          include: {
            listing: {
              include: {
                owner: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return reveals.map((r) => ({
      bookingId: r.bookingId,
      listingTitle: r.booking.listing.title,
      listerName: r.booking.listing.owner.name,
      revealedAt: r.revealedAt,
    }));
  }
}
