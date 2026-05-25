import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositAuditAction, DepositStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class DepositsService {
  constructor(private prisma: PrismaService) {}

  async holdDeposit(bookingId: string, amount: number, performedBy: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.depositAuditLog.create({
        data: { bookingId, action: DepositAuditAction.HELD, amount, performedBy },
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: { depositStatus: DepositStatus.HELD },
      });
    });
  }

  async releaseToRenter(bookingId: string, amount: number, performedBy: string, note?: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    if (booking.depositStatus !== DepositStatus.HELD && booking.depositStatus !== DepositStatus.DISPUTED) {
      throw new BadRequestException('Deposit is not in a releasable state');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.depositAuditLog.create({
        data: { bookingId, action: DepositAuditAction.RELEASED_TO_RENTER, amount, performedBy, note },
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: { depositStatus: DepositStatus.RELEASED_TO_RENTER },
      });
    });
  }

  async releaseToLister(bookingId: string, amount: number, performedBy: string, note?: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    if (booking.depositStatus !== DepositStatus.HELD && booking.depositStatus !== DepositStatus.DISPUTED) {
      throw new BadRequestException('Deposit is not in a releasable state');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.depositAuditLog.create({
        data: { bookingId, action: DepositAuditAction.RELEASED_TO_LISTER, amount, performedBy, note },
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: { depositStatus: DepositStatus.RELEASED_TO_LISTER },
      });
    });
  }

  async autoRelease(bookingId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { depositAuditLogs: true },
    });
    const alreadyActioned = booking.depositAuditLogs.some(
      (log) =>
        log.action === DepositAuditAction.RELEASED_TO_RENTER ||
        log.action === DepositAuditAction.RELEASED_TO_LISTER ||
        log.action === DepositAuditAction.SYSTEM_AUTO_RELEASED,
    );
    if (alreadyActioned) return null;

    return this.prisma.$transaction(async (tx) => {
      await tx.depositAuditLog.create({
        data: {
          bookingId,
          action: DepositAuditAction.SYSTEM_AUTO_RELEASED,
          amount: booking.depositAmount,
          performedBy: 'SYSTEM',
          note: '48hr SLA breach — auto-released to renter',
        },
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: { depositStatus: DepositStatus.RELEASED_TO_RENTER },
      });
    });
  }

  async getAuditLog(bookingId: string) {
    return this.prisma.depositAuditLog.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
