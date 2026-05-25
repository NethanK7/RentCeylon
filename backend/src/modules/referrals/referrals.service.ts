import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // 1. createReferralCode
  // -------------------------------------------------------------------------

  async createReferralCode(userId: string): Promise<{ code: string; shareUrl: string }> {
    // Return existing code if one already exists for this user
    const existing = await (this.prisma as any).referralCode.findUnique({
      where: { userId },
    });

    if (existing) {
      return {
        code: existing.code,
        shareUrl: `https://rentloop.lk/signup?ref=${existing.code}`,
      };
    }

    const code = `LOOP-${userId.slice(0, 6).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    await (this.prisma as any).referralCode.create({
      data: {
        code,
        userId,
        usageCount: 0,
        totalEarned: 0,
      },
    });

    return {
      code,
      shareUrl: `https://rentloop.lk/signup?ref=${code}`,
    };
  }

  // -------------------------------------------------------------------------
  // 2. applyReferralCode
  // -------------------------------------------------------------------------

  async applyReferralCode(
    newUserId: string,
    code: string,
  ): Promise<{ success: boolean; message: string }> {
    // Find the referral code record
    const referralCode = await (this.prisma as any).referralCode.findUnique({
      where: { code },
    });

    if (!referralCode) {
      throw new BadRequestException('Invalid referral code.');
    }

    // Prevent self-referral
    if (referralCode.userId === newUserId) {
      throw new BadRequestException('You cannot use your own referral code.');
    }

    // Check if the new user has already applied a referral code
    const user = await (this.prisma as any).user.findUnique({
      where: { id: newUserId },
      select: { referredByCode: true },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.referredByCode) {
      throw new ConflictException('A referral code has already been applied to this account.');
    }

    // Apply the code to the user and increment usage count
    await (this.prisma as any).user.update({
      where: { id: newUserId },
      data: { referredByCode: code },
    });

    await (this.prisma as any).referralCode.update({
      where: { code },
      data: { usageCount: { increment: 1 } },
    });

    return { success: true, message: 'Referral code applied successfully.' };
  }

  // -------------------------------------------------------------------------
  // 3. processReferralReward
  // -------------------------------------------------------------------------

  async processReferralReward(newUserId: string): Promise<{ success: boolean; message: string }> {
    // Called after the new user's first booking completes
    const user = await (this.prisma as any).user.findUnique({
      where: { id: newUserId },
      select: { referredByCode: true },
    });

    if (!user || !user.referredByCode) {
      // No referral code applied — nothing to do
      return { success: false, message: 'No referral code found for this user.' };
    }

    const referralCode = await (this.prisma as any).referralCode.findUnique({
      where: { code: user.referredByCode },
      include: {
        referrals: {
          where: { userId: newUserId },
        },
      },
    });

    if (!referralCode) {
      return { success: false, message: 'Referral code record not found.' };
    }

    // Find the specific referral entry linking this user to the code
    const referral = referralCode.referrals?.[0];

    if (!referral) {
      return { success: false, message: 'Referral entry not found for this user.' };
    }

    if (referral.rewardPaid) {
      return { success: false, message: 'Reward has already been paid for this referral.' };
    }

    // Mock: log and record credit of Rs. 500 for both referrer and referee
    console.log(
      `[ReferralReward] Crediting Rs. 500 to referrer (userId: ${referralCode.userId}) — referral code: ${referralCode.code}`,
    );
    console.log(
      `[ReferralReward] Crediting Rs. 500 to referee (userId: ${newUserId})`,
    );

    // Mark reward as paid and update totalEarned on the code (+500 for referrer side)
    await (this.prisma as any).referral.update({
      where: { id: referral.id },
      data: {
        rewardPaid: true,
        firstBookingAt: new Date(),
      },
    });

    await (this.prisma as any).referralCode.update({
      where: { code: user.referredByCode },
      data: { totalEarned: { increment: 500 } },
    });

    return { success: true, message: 'Referral reward processed. Rs. 500 credited to both parties.' };
  }

  // -------------------------------------------------------------------------
  // 4. getReferralStats
  // -------------------------------------------------------------------------

  async getReferralStats(userId: string): Promise<{
    code: string;
    usageCount: number;
    totalEarned: number;
    shareUrl: string;
    referrals: Array<{
      userId: string;
      signedUpAt: Date;
      firstBookingAt: Date | null;
      rewardPaid: boolean;
    }>;
  }> {
    const referralCode = await (this.prisma as any).referralCode.findUnique({
      where: { userId },
      include: { referrals: true },
    });

    if (!referralCode) {
      throw new BadRequestException('No referral code found for this user. Generate one first.');
    }

    return {
      code: referralCode.code,
      usageCount: referralCode.usageCount,
      totalEarned: referralCode.totalEarned,
      shareUrl: `https://rentloop.lk/signup?ref=${referralCode.code}`,
      referrals: (referralCode.referrals ?? []).map((r: any) => ({
        userId: r.userId,
        signedUpAt: r.signedUpAt,
        firstBookingAt: r.firstBookingAt ?? null,
        rewardPaid: r.rewardPaid,
      })),
    };
  }
}
