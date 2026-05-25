import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@rentloop/shared';
import { IsString, MinLength, IsInt, Min, Max } from 'class-validator';

// ─── DTO ─────────────────────────────────────────────────────────────────────

export class CreateReviewDto {
  /** 1–5 star rating */
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  /** Rule 11: minimum 30 characters */
  @IsString()
  @MinLength(30)
  comment: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

/** 7-day window (ms) within which both parties must submit reviews */
const REVIEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rule 11 — Blind Reviews
   * Reviews are sealed (isBlinded=true) until BOTH parties submit
   * OR the 7-day window expires (handled by SLA scheduler).
   * Minimum 30 characters enforced here as a defence-in-depth guard
   * even if class-validator is not applied at the controller level.
   */
  async submitReview(
    reviewerId: string,
    bookingId: string,
    dto: CreateReviewDto,
  ) {
    // 1. Load booking with listing owner to resolve both party IDs
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: { select: { ownerId: true } },
        reviews: { select: { reviewerId: true, isBlinded: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    // 2. Booking must be CLOSED before reviews can be submitted
    if (booking.status !== BookingStatus.CLOSED) {
      throw new BadRequestException(
        `Reviews can only be submitted after the booking is closed. ` +
          `Current status: ${booking.status}`,
      );
    }

    const listerId = booking.listing.ownerId;

    // 3. Verify the reviewer is one of the two parties
    const isRenter = booking.renterId === reviewerId;
    const isLister = listerId === reviewerId;

    if (!isRenter && !isLister) {
      throw new ForbiddenException('You are not a party to this booking');
    }

    // 4. Determine the reviewee (opposite party)
    const revieweeId = isRenter ? listerId : booking.renterId;

    // 5. Enforce 7-day window using booking.updatedAt as the closure timestamp
    //    (booking.updatedAt reflects the last status change, i.e. when it moved to CLOSED)
    const closedAt = booking.updatedAt;
    const windowEndsAt = new Date(closedAt.getTime() + REVIEW_WINDOW_MS);
    const now = new Date();

    if (now > windowEndsAt) {
      throw new BadRequestException(
        `The 7-day review window closed on ${windowEndsAt.toISOString()}`,
      );
    }

    // 6. Rule 11: minimum 30-character comment (defence-in-depth)
    if (dto.comment.trim().length < 30) {
      throw new BadRequestException(
        'Review comment must be at least 30 characters (Rule 11)',
      );
    }

    // 7. Prevent duplicate review from the same reviewer for this booking
    const existing = booking.reviews.find((r) => r.reviewerId === reviewerId);
    if (existing) {
      throw new BadRequestException(
        'You have already submitted a review for this booking',
      );
    }

    // 8. Create the review — starts blinded (blind review system)
    const newReview = await this.prisma.review.create({
      data: {
        bookingId,
        reviewerId,
        revieweeId,
        rating: dto.rating,
        comment: dto.comment,
        isBlinded: true,
        windowEndsAt,
      },
    });

    // 9. Check if both parties have now submitted
    const allReviews = await this.prisma.review.findMany({
      where: { bookingId },
      select: { id: true, reviewerId: true },
    });

    const renterReview = allReviews.find((r) => r.reviewerId === booking.renterId);
    const listerReview = allReviews.find((r) => r.reviewerId === listerId);
    const bothSubmitted = !!renterReview && !!listerReview;

    if (bothSubmitted) {
      // Unseal both reviews simultaneously
      await this.prisma.review.updateMany({
        where: { bookingId },
        data: { isBlinded: false },
      });

      console.log(
        `[REVIEWS] Both parties submitted for bookingId=${bookingId}. Reviews unsealed.`,
      );

      return {
        ...newReview,
        isBlinded: false,
        bothSubmitted: true,
        message: 'Both reviews are now visible.',
      };
    }

    // Only one side submitted — keep sealed, SLA handles window expiry
    console.log(
      `[REVIEWS] Single review submitted for bookingId=${bookingId} by reviewerId=${reviewerId}. ` +
        `Awaiting counterpart or window expiry at ${windowEndsAt.toISOString()}.`,
    );

    return {
      ...newReview,
      isBlinded: true,
      bothSubmitted: false,
      message:
        'Your review has been recorded and will be revealed once the other party submits or the 7-day window expires.',
    };
  }

  /**
   * Returns only publicly visible (isBlinded=false) reviews for a given listing.
   */
  async getReviewsForListing(listingId: string) {
    return this.prisma.review.findMany({
      where: {
        booking: { listingId },
        isBlinded: false,
      },
      orderBy: { submittedAt: 'desc' },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  /**
   * Checks whether a user is eligible to submit a review for a given booking
   * and how much time remains in the review window.
   */
  async checkReviewEligibility(
    userId: string,
    bookingId: string,
  ): Promise<{
    canReview: boolean;
    reason?: string;
    daysRemaining: number;
    hasSubmitted: boolean;
  }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: { select: { ownerId: true } },
        reviews: { select: { reviewerId: true } },
      },
    });

    if (!booking) {
      return {
        canReview: false,
        reason: 'Booking not found',
        daysRemaining: 0,
        hasSubmitted: false,
      };
    }

    const listerId = booking.listing.ownerId;
    const isParty = booking.renterId === userId || listerId === userId;

    if (!isParty) {
      return {
        canReview: false,
        reason: 'You are not a party to this booking',
        daysRemaining: 0,
        hasSubmitted: false,
      };
    }

    if (booking.status !== BookingStatus.CLOSED) {
      return {
        canReview: false,
        reason: `Booking must be closed before reviewing. Current status: ${booking.status}`,
        daysRemaining: 0,
        hasSubmitted: false,
      };
    }

    const closedAt = booking.updatedAt;
    const windowEndsAt = new Date(closedAt.getTime() + REVIEW_WINDOW_MS);
    const now = new Date();
    const msRemaining = windowEndsAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

    const hasSubmitted = booking.reviews.some((r) => r.reviewerId === userId);

    if (now > windowEndsAt) {
      return {
        canReview: false,
        reason: `The 7-day review window closed on ${windowEndsAt.toISOString()}`,
        daysRemaining: 0,
        hasSubmitted,
      };
    }

    if (hasSubmitted) {
      return {
        canReview: false,
        reason: 'You have already submitted a review for this booking',
        daysRemaining,
        hasSubmitted: true,
      };
    }

    return { canReview: true, daysRemaining, hasSubmitted: false };
  }
}
