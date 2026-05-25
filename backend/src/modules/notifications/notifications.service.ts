import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@rentloop/shared';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persist a notification record for the given user.
   *
   * TODO: In production, also dispatch a push notification (FCM/APNs) and/or
   * a transactional email (SendGrid / Resend) based on the user's notification
   * preferences. The DB record is the source of truth for the in-app inbox.
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    meta?: Record<string, any>,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        // actionUrl is derived from meta.actionUrl when present
        actionUrl: meta?.actionUrl ?? null,
      },
    });
  }

  /**
   * Returns paginated notifications for a user, unread first then by date desc.
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      total,
      page,
      limit,
      hasMore: skip + notifications.length < total,
    };
  }

  /**
   * Mark a single notification as read. Only the owning user may do this.
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not own this notification');
    }

    if (notification.isRead) {
      return notification; // Already read — idempotent
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all unread notifications for a user as read in a single query.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { updated: result.count };
  }

  /**
   * Returns the count of unread notifications for a user.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // ─── Convenience helpers ───────────────────────────────────────────────────

  /**
   * Notify the renter that their booking has been approved by the lister.
   */
  async notifyBookingAccepted(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        renterId: true,
        listing: { select: { title: true } },
      },
    });

    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    return this.sendNotification(
      booking.renterId,
      NotificationType.BOOKING_APPROVED,
      'Booking Approved',
      `Your booking for "${booking.listing.title}" has been approved. Get ready!`,
      { actionUrl: `/bookings/${bookingId}` },
    );
  }

  /**
   * Notify the renter that their booking has been declined by the lister.
   */
  async notifyBookingDeclined(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        renterId: true,
        listing: { select: { title: true } },
      },
    });

    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    return this.sendNotification(
      booking.renterId,
      NotificationType.BOOKING_DECLINED,
      'Booking Declined',
      `Unfortunately your booking for "${booking.listing.title}" was declined. You can browse other listings.`,
      { actionUrl: `/bookings/${bookingId}` },
    );
  }

  /**
   * Notify the recipient party that their deposit has been released.
   * @param toParty - 'renter' or 'lister'
   */
  async notifyDepositReleased(bookingId: string, toParty: 'renter' | 'lister') {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        renterId: true,
        depositAmount: true,
        listing: { select: { title: true, ownerId: true } },
      },
    });

    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const recipientId =
      toParty === 'renter' ? booking.renterId : booking.listing.ownerId;

    const partyLabel = toParty === 'renter' ? 'you' : 'your account';

    return this.sendNotification(
      recipientId,
      NotificationType.DEPOSIT_RELEASED,
      'Deposit Released',
      `The deposit of LKR ${booking.depositAmount.toLocaleString()} for "${booking.listing.title}" has been released to ${partyLabel}.`,
      { actionUrl: `/bookings/${bookingId}` },
    );
  }

  /**
   * Notify both the renter and lister that a dispute has been raised,
   * and also notify all platform admins.
   */
  async notifyDisputeRaised(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        renterId: true,
        listing: { select: { title: true, ownerId: true } },
      },
    });

    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const listerId = booking.listing.ownerId;

    const renterNotif = this.sendNotification(
      booking.renterId,
      NotificationType.DISPUTE_RAISED,
      'Dispute Raised',
      `A dispute has been opened for your booking of "${booking.listing.title}". Our team will review it within 72 hours.`,
      { actionUrl: `/bookings/${bookingId}/dispute` },
    );

    const listerNotif = this.sendNotification(
      listerId,
      NotificationType.DISPUTE_RAISED,
      'Dispute Raised on Your Listing',
      `A dispute has been raised on a booking for "${booking.listing.title}". Our team will review it within 72 hours.`,
      { actionUrl: `/bookings/${bookingId}/dispute` },
    );

    // Notify all admin users about the new dispute
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const adminNotifs = admins.map((admin) =>
      this.sendNotification(
        admin.id,
        NotificationType.DISPUTE_RAISED,
        '[Admin] New Dispute',
        `A new dispute was raised on booking ${bookingId} for listing "${booking.listing.title}".`,
        { actionUrl: `/admin/disputes/${bookingId}` },
      ),
    );

    await Promise.all([renterNotif, listerNotif, ...adminNotifs]);
  }

  /**
   * Notify both parties when the review window opens — either because both
   * submitted reviews (blind reveal) or the 7-day window expires and reviews
   * are unblinded automatically.
   */
  async notifyReviewUnlocked(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        renterId: true,
        listing: { select: { title: true, ownerId: true } },
      },
    });

    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const listerId = booking.listing.ownerId;

    await Promise.all([
      this.sendNotification(
        booking.renterId,
        NotificationType.REVIEW_REQUESTED,
        'Reviews Are Now Visible',
        `Reviews for your rental of "${booking.listing.title}" are now visible to both parties.`,
        { actionUrl: `/bookings/${bookingId}/reviews` },
      ),
      this.sendNotification(
        listerId,
        NotificationType.REVIEW_REQUESTED,
        'Reviews Are Now Visible',
        `Reviews for the booking of "${booking.listing.title}" are now visible to both parties.`,
        { actionUrl: `/bookings/${bookingId}/reviews` },
      ),
    ]);
  }
}
