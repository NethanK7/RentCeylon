import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyStatus, UserRole } from '@rentloop/shared';

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export class CreatePropertyDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  propertyType: string;

  @IsNumber()
  monthlyRent: number;
}

export class RecordRentDto {
  @IsNumber()
  amount: number;

  /** Format: "YYYY-MM" */
  @IsString()
  period: string;

  @IsString()
  referenceNumber: string;
}

export class ScheduleInspectionDto {
  /** ISO date string */
  @IsString()
  scheduledDate: string;

  @IsString()
  inspectorName: string;

  @IsString()
  inspectionType: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // 1. createProperty
  // -------------------------------------------------------------------------

  async createProperty(ownerId: string, dto: CreatePropertyDto) {
    const property = await (this.prisma as any).property.create({
      data: {
        ownerId,
        name: dto.name,
        address: dto.address,
        propertyType: dto.propertyType,
        monthlyRent: dto.monthlyRent,
        status: PropertyStatus.VACANT,
      },
    });

    return property;
  }

  // -------------------------------------------------------------------------
  // 2. getOwnerProperties
  // -------------------------------------------------------------------------

  async getOwnerProperties(ownerId: string) {
    const properties = await (this.prisma as any).property.findMany({
      where: { ownerId },
      include: {
        rentRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        inspections: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
        },
      },
    });

    // Aggregate monthly revenue from all RentRecords per property
    const enriched = await Promise.all(
      properties.map(async (property: any) => {
        const revenueAgg = await (this.prisma as any).rentRecord.aggregate({
          where: { propertyId: property.id },
          _sum: { amount: true },
        });

        return {
          ...property,
          latestRentRecord: property.rentRecords?.[0] ?? null,
          latestInspection: property.inspections?.[0] ?? null,
          totalRevenue: revenueAgg._sum.amount ?? 0,
          // Remove raw arrays to keep response clean
          rentRecords: undefined,
          inspections: undefined,
        };
      }),
    );

    return enriched;
  }

  // -------------------------------------------------------------------------
  // 3. recordRent
  // -------------------------------------------------------------------------

  async recordRent(managerId: string, propertyId: string, dto: RecordRentDto) {
    await this.assertManagerAccess(managerId, propertyId);

    const record = await (this.prisma as any).rentRecord.create({
      data: {
        propertyId,
        recordedById: managerId,
        amount: dto.amount,
        period: dto.period,
        referenceNumber: dto.referenceNumber,
        recordedAt: new Date(),
      },
    });

    return record;
  }

  // -------------------------------------------------------------------------
  // 4. scheduleInspection
  // -------------------------------------------------------------------------

  async scheduleInspection(managerId: string, propertyId: string, dto: ScheduleInspectionDto) {
    await this.assertManagerAccess(managerId, propertyId);

    const inspection = await (this.prisma as any).propertyInspection.create({
      data: {
        propertyId,
        scheduledById: managerId,
        scheduledDate: new Date(dto.scheduledDate),
        inspectorName: dto.inspectorName,
        inspectionType: dto.inspectionType,
        completedAt: null,
      },
    });

    return inspection;
  }

  // -------------------------------------------------------------------------
  // 5. recordInspectionResult
  // -------------------------------------------------------------------------

  async recordInspectionResult(
    managerId: string,
    inspectionId: string,
    conditionScore: number,
    notes: string,
    photoUrls: string[],
  ) {
    const inspection = await (this.prisma as any).propertyInspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException(`Inspection ${inspectionId} not found.`);
    }

    await this.assertManagerAccess(managerId, inspection.propertyId);

    const updated = await (this.prisma as any).propertyInspection.update({
      where: { id: inspectionId },
      data: {
        conditionScore,
        notes,
        photoUrls,
        completedAt: new Date(),
      },
    });

    return updated;
  }

  // -------------------------------------------------------------------------
  // 6. getManagerPortfolio
  // -------------------------------------------------------------------------

  async getManagerPortfolio(managerId: string) {
    const properties = await (this.prisma as any).property.findMany({
      where: { managerId },
    });

    const now = new Date();

    const portfolio = await Promise.all(
      properties.map(async (property: any) => {
        // Pending (unfinished) inspections
        const pendingInspections = await (this.prisma as any).propertyInspection.findMany({
          where: {
            propertyId: property.id,
            completedAt: null,
            scheduledDate: { gte: now },
          },
          orderBy: { scheduledDate: 'asc' },
        });

        // 5 most recent rent records
        const recentRentRecords = await (this.prisma as any).rentRecord.findMany({
          where: { propertyId: property.id },
          orderBy: { recordedAt: 'desc' },
          take: 5,
        });

        // Open (unresolved) maintenance requests
        const openMaintenanceCount = await (this.prisma as any).maintenanceRequest.count({
          where: {
            propertyId: property.id,
            status: { notIn: ['RESOLVED', 'CLOSED'] },
          },
        });

        return {
          ...property,
          pendingInspections,
          recentRentRecords,
          openMaintenanceCount,
        };
      }),
    );

    return portfolio;
  }

  // -------------------------------------------------------------------------
  // 7. generateMonthlyReport
  // -------------------------------------------------------------------------

  async generateMonthlyReport(
    managerId: string,
    propertyId: string,
    month: number,
    year: number,
  ): Promise<{
    property: any;
    period: { month: number; year: number; label: string };
    totalRent: number;
    inspections: any[];
    maintenanceCount: number;
  }> {
    await this.assertManagerAccess(managerId, propertyId);

    const property = await (this.prisma as any).property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property ${propertyId} not found.`);
    }

    // Build date range for the requested month
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59, 999); // last millisecond of the month

    // Rent records in period
    const rentRecords = await (this.prisma as any).rentRecord.findMany({
      where: {
        propertyId,
        recordedAt: { gte: periodStart, lte: periodEnd },
      },
    });

    const totalRent: number = rentRecords.reduce(
      (sum: number, r: any) => sum + (r.amount ?? 0),
      0,
    );

    // Inspections scheduled or completed in the period
    const inspections = await (this.prisma as any).propertyInspection.findMany({
      where: {
        propertyId,
        scheduledDate: { gte: periodStart, lte: periodEnd },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Maintenance requests raised in the period
    const maintenanceCount = await (this.prisma as any).maintenanceRequest.count({
      where: {
        propertyId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    });

    const monthLabel = periodStart.toLocaleString('default', { month: 'long', year: 'numeric' });

    // In a real implementation this data would be used to generate a PDF.
    // Here we return the structured data directly.
    return {
      property,
      period: { month, year, label: monthLabel },
      totalRent,
      inspections,
      maintenanceCount,
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Asserts that managerId is either the property owner or the assigned manager.
   * Throws ForbiddenException if the check fails.
   */
  private async assertManagerAccess(managerId: string, propertyId: string): Promise<void> {
    const property = await (this.prisma as any).property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true, managerId: true },
    });

    if (!property) {
      throw new NotFoundException(`Property ${propertyId} not found.`);
    }

    const isOwner = property.ownerId === managerId;
    const isAssignedManager = property.managerId === managerId;

    if (!isOwner && !isAssignedManager) {
      throw new ForbiddenException('You do not have access to this property.');
    }
  }
}
