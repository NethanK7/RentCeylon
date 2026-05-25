import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { containsFlaggedContent } from '@rentloop/shared';

// Rule 7: Messages are PERMANENT. The isDeleted flag hides a message from
// query results, but the record is NEVER physically removed from the database.
// This ensures a full audit trail for dispute resolution and moderation.

const MESSAGES_PER_PAGE = 30;
const FLAG_WARNING_MESSAGE =
  'This message may contain off-platform contact details and has been flagged for review.';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send a message within a booking thread.
   *
   * - Sender must be the renter or the lister for the booking.
   * - Content is checked against Sri Lankan phone patterns, WhatsApp links,
   *   and payment URLs via `containsFlaggedContent`. Flagged messages are
   *   still saved (Rule 7) but marked isFlagged=true with a system note.
   * - isDeleted is always false on creation — messages are permanent records.
   */
  async sendMessage(senderId: string, bookingId: string, content: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        renterId: true,
        listing: { select: { ownerId: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    const listerId = booking.listing.ownerId;
    const isParty = booking.renterId === senderId || listerId === senderId;
    if (!isParty) {
      throw new ForbiddenException('You are not a party to this booking');
    }

    const flagged = containsFlaggedContent(content);

    // Rule 7: isDeleted is explicitly set to false — records are immutable at
    // the DB level; only the flag is toggled for soft-hiding.
    const message = await this.prisma.message.create({
      data: {
        bookingId,
        senderId,
        content,
        isDeleted: false,
        isFlagged: flagged,
        flagReason: flagged ? FLAG_WARNING_MESSAGE : null,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return message;
  }

  /**
   * Retrieve paginated messages for a booking thread.
   *
   * - Only parties to the booking may read the thread.
   * - Soft-deleted messages (isDeleted=true) are excluded from results per
   *   Rule 7 — the record remains in the DB but is hidden from the UI.
   * - Flagged messages are returned with a `flagWarning: true` field so the
   *   client can render a visual indicator.
   */
  async getMessages(userId: string, bookingId: string, page = 1) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        renterId: true,
        listing: { select: { ownerId: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    const listerId = booking.listing.ownerId;
    const isParty = booking.renterId === userId || listerId === userId;
    if (!isParty) {
      throw new ForbiddenException('You do not have access to this thread');
    }

    const skip = (page - 1) * MESSAGES_PER_PAGE;

    const [messages, total] = await this.prisma.$transaction([
      // Rule 7: query filters isDeleted=false — soft-deleted messages are hidden
      // but their records exist permanently in the database.
      this.prisma.message.findMany({
        where: { bookingId, isDeleted: false },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: MESSAGES_PER_PAGE,
      }),
      this.prisma.message.count({ where: { bookingId, isDeleted: false } }),
    ]);

    // Attach flagWarning field to flagged messages for client rendering
    const enriched = messages.map((msg) => ({
      ...msg,
      flagWarning: msg.isFlagged,
    }));

    return {
      messages: enriched,
      total,
      page,
      limit: MESSAGES_PER_PAGE,
      hasMore: skip + messages.length < total,
    };
  }

  /**
   * Soft-delete a message (Rule 7).
   *
   * The message record is NEVER physically deleted from the database.
   * Setting isDeleted=true hides it from getMessages results but preserves
   * the full record for dispute resolution, audits, and moderation reviews.
   *
   * Only the original sender may soft-delete their own message.
   */
  async softDeleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    // Rule 7: Set isDeleted=true only. DO NOT use prisma.message.delete() —
    // physical deletion is strictly prohibited to maintain the audit trail.
    await this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return { success: true, message: 'Message hidden' };
  }

  /**
   * Returns all active booking threads for a user (as renter or lister),
   * each with the latest visible message preview and the count of unread
   * messages (messages sent by the other party that the user hasn't seen yet).
   *
   * Threads are ordered by the latest message timestamp, most recent first.
   */
  async getThreads(userId: string) {
    // Find all bookings where the user is renter or lister that have messages
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { renterId: userId },
          { listing: { ownerId: userId } },
        ],
        messages: { some: { isDeleted: false } },
      },
      select: {
        id: true,
        status: true,
        renterId: true,
        listing: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            photos: {
              select: { url: true },
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
        renter: { select: { id: true, name: true, avatarUrl: true } },
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            isFlagged: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            // Count unread messages from other party (messages not sent by userId)
            // Prisma doesn't support filtered _count directly; we approximate below.
            messages: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Enrich each thread with unread count via separate query
    const threads = await Promise.all(
      bookings.map(async (booking) => {
        // Unread = messages not sent by userId and not deleted
        // (In a production app, a MessageRead junction table would replace this count)
        const unreadCount = await this.prisma.message.count({
          where: {
            bookingId: booking.id,
            isDeleted: false,
            senderId: { not: userId },
          },
        });

        const latestMessage = booking.messages[0] ?? null;
        const listerId = booking.listing.ownerId;
        const otherPartyId = booking.renterId === userId ? listerId : booking.renterId;

        return {
          bookingId: booking.id,
          bookingStatus: booking.status,
          listing: {
            id: booking.listing.id,
            title: booking.listing.title,
            coverImageUrl: booking.listing.photos[0]?.url ?? null,
          },
          renter: booking.renter,
          listerId,
          otherPartyId,
          latestMessage: latestMessage
            ? {
                id: latestMessage.id,
                preview:
                  latestMessage.isFlagged
                    ? '[Flagged message]'
                    : latestMessage.content.length > 80
                      ? `${latestMessage.content.substring(0, 80)}…`
                      : latestMessage.content,
                senderId: latestMessage.senderId,
                isFlagged: latestMessage.isFlagged,
                createdAt: latestMessage.createdAt,
              }
            : null,
          unreadCount,
        };
      }),
    );

    // Sort by latest message timestamp (most recent first)
    return threads.sort((a, b) => {
      const aTime = a.latestMessage?.createdAt.getTime() ?? 0;
      const bTime = b.latestMessage?.createdAt.getTime() ?? 0;
      return bTime - aTime;
    });
  }
}
