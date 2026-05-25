import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionTier } from '@rentloop/shared';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns tier limits for a given SubscriptionTier. */
function tierLimits(tier: SubscriptionTier): {
  listingsLimit: number;
  featuredSlots: number;
  canUseAnalytics: boolean;
} {
  switch (tier) {
    case SubscriptionTier.BASIC:
      return { listingsLimit: 3, featuredSlots: 0, canUseAnalytics: false };
    case SubscriptionTier.PRO:
      return { listingsLimit: 10, featuredSlots: 2, canUseAnalytics: true };
    case SubscriptionTier.PREMIUM:
      return { listingsLimit: 999, featuredSlots: 5, canUseAnalytics: true };
    default:
      return { listingsLimit: 3, featuredSlots: 0, canUseAnalytics: false };
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // 1. getCurrentSubscription
  // -------------------------------------------------------------------------

  async getCurrentSubscription(userId: string): Promise<{
    tier: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    listingsLimit: number;
    featuredSlots: number;
  } | null> {
    const now = new Date();

    const subscription = await (this.prisma as any).subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gt: now },
      },
      orderBy: { startDate: 'desc' },
    });

    if (!subscription) return null;

    const limits = tierLimits(subscription.tier as SubscriptionTier);

    return {
      tier: subscription.tier,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      isActive: subscription.isActive,
      listingsLimit: limits.listingsLimit,
      featuredSlots: limits.featuredSlots,
    };
  }

  // -------------------------------------------------------------------------
  // 2. upgradeTier
  // -------------------------------------------------------------------------

  async upgradeTier(
    userId: string,
    newTier: SubscriptionTier,
  ): Promise<{
    tier: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    listingsLimit: number;
    featuredSlots: number;
  }> {
    const now = new Date();

    // Cancel any currently active subscription
    await (this.prisma as any).subscription.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        endDate: now,
      },
    });

    // New subscription runs for 30 days
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    const newSubscription = await (this.prisma as any).subscription.create({
      data: {
        userId,
        tier: newTier,
        startDate: now,
        endDate,
        isActive: true,
      },
    });

    const limits = tierLimits(newTier);

    return {
      tier: newSubscription.tier,
      startDate: newSubscription.startDate,
      endDate: newSubscription.endDate,
      isActive: newSubscription.isActive,
      listingsLimit: limits.listingsLimit,
      featuredSlots: limits.featuredSlots,
    };
  }

  // -------------------------------------------------------------------------
  // 3. cancelSubscription
  // -------------------------------------------------------------------------

  async cancelSubscription(
    userId: string,
    reason?: string,
  ): Promise<{ message: string; endDate: Date }> {
    const now = new Date();

    const activeSubscription = await (this.prisma as any).subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gt: now },
      },
    });

    if (!activeSubscription) {
      throw new BadRequestException('No active subscription found for this user.');
    }

    // Mock: set endDate to 30 days from now — user stays on paid tier until then
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    await (this.prisma as any).subscription.update({
      where: { id: activeSubscription.id },
      data: {
        endDate,
        cancelledAt: now,
        cancellationReason: reason ?? null,
      },
    });

    return {
      message: `Subscription cancelled. Active until ${endDate.toISOString().slice(0, 10)}`,
      endDate,
    };
  }

  // -------------------------------------------------------------------------
  // 4. getListingLimits
  // -------------------------------------------------------------------------

  getListingLimits(tier: SubscriptionTier): {
    listingsLimit: number;
    featuredSlots: number;
    canUseAnalytics: boolean;
  } {
    return tierLimits(tier);
  }

  // -------------------------------------------------------------------------
  // 5. checkListingLimitReached
  // -------------------------------------------------------------------------

  async checkListingLimitReached(userId: string): Promise<{
    limitReached: boolean;
    current: number;
    limit: number;
  }> {
    const now = new Date();

    // Determine current tier: check for an active paid subscription, else default to BASIC
    const activeSubscription = await (this.prisma as any).subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gt: now },
      },
      orderBy: { startDate: 'desc' },
    });

    const tier: SubscriptionTier =
      activeSubscription ? (activeSubscription.tier as SubscriptionTier) : SubscriptionTier.BASIC;

    const { listingsLimit } = tierLimits(tier);

    // Count user's currently active listings
    const activeListingCount = await (this.prisma as any).listing.count({
      where: {
        ownerId: userId,
        status: 'ACTIVE',
      },
    });

    return {
      limitReached: activeListingCount >= listingsLimit,
      current: activeListingCount,
      limit: listingsLimit,
    };
  }
}
