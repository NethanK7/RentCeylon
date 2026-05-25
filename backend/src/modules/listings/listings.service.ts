import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsArray, ArrayMinSize, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { ListingStatus } from '@rentloop/shared';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  categoryId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  dailyRate: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  depositAmount: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  /**
   * Array of photo URLs or R2 keys — minimum 3 required before DRAFT is created.
   * Each entry is: { r2Key: string; url: string; sortOrder?: number }
   */
  @IsArray()
  @ArrayMinSize(3, { message: 'A listing must have at least 3 photos.' })
  photos: Array<{ r2Key: string; url: string; sortOrder?: number }>;
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  dailyRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  depositAmount?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  /**
   * If provided, replaces all existing photos. Minimum 3 required.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(3, { message: 'A listing must have at least 3 photos.' })
  photos?: Array<{ r2Key: string; url: string; sortOrder?: number }>;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Search ───────────────────────────────────────────────────────────────

  async searchListings(params: {
    query?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ listings: any[]; total: number; page: number; pages: number }> {
    const { query, categoryId, minPrice, maxPrice, page = 1, limit = 20 } = params;

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;

    const where: Record<string, any> = {
      status: ListingStatus.ACTIVE,
      isDraft: false,
      // Only surface listings in categories that are enabled
      category: { isEnabled: true },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (query && query.trim().length > 0) {
      where.OR = [
        { title: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
        { location: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.dailyRate = {};
      if (minPrice !== undefined) where.dailyRate.gte = minPrice;
      if (maxPrice !== undefined) where.dailyRate.lte = maxPrice;
    }

    const [rawListings, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [{ averageRating: 'desc' }, { reviewCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          photos: { orderBy: { sortOrder: 'asc' }, take: 1 },
          badges: true,
          category: { select: { id: true, name: true, slug: true, icon: true } },
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              verificationStatus: true,
              // phone is intentionally omitted — Rule 6: contact gating
            },
          },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      listings: rawListings.map((l) => this.sanitizeListing(l)),
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    };
  }

  // ─── Get single listing ───────────────────────────────────────────────────

  /**
   * Fetches a single active listing.
   * Rule 6 — contact gating: phone is never included in the response.
   */
  async getListing(id: string): Promise<any> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        badges: true,
        category: { select: { id: true, name: true, slug: true, icon: true, isEnabled: true } },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            verificationStatus: true,
            createdAt: true,
            // phone intentionally excluded
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with id "${id}" not found.`);
    }

    if (!listing.category.isEnabled) {
      throw new NotFoundException(`Listing with id "${id}" not found.`);
    }

    // Increment view count in background — don't await
    this.prisma.listing
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {
        // Best-effort — safe to ignore
      });

    return this.sanitizeListing(listing);
  }

  // ─── Create listing ───────────────────────────────────────────────────────

  async createListing(userId: string, dto: CreateListingDto): Promise<any> {
    // 1. Validate minimum photo count
    if (!dto.photos || dto.photos.length < 3) {
      throw new BadRequestException('A listing must have at least 3 photos.');
    }

    // 2. Validate category exists and is enabled
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category "${dto.categoryId}" does not exist.`);
    }

    if (!category.isEnabled) {
      throw new UnprocessableEntityException(
        `The category "${category.name}" is not currently accepting new listings.`,
      );
    }

    // 3. Generate a URL-friendly slug from the title
    const slug = await this.generateUniqueSlug(dto.title);

    // 4. Create listing at DRAFT status with photos in a transaction
    const listing = await this.prisma.$transaction(async (tx) => {
      const created = await tx.listing.create({
        data: {
          title: dto.title,
          slug,
          description: dto.description,
          categoryId: dto.categoryId,
          ownerId: userId,
          dailyRate: dto.dailyRate,
          depositAmount: dto.depositAmount,
          location: dto.location,
          lat: dto.lat,
          lng: dto.lng,
          // New listings always start as DRAFT (not publicly visible)
          isDraft: true,
          status: ListingStatus.PENDING_REVIEW,
        },
      });

      await tx.listingPhoto.createMany({
        data: dto.photos.map((p, i) => ({
          listingId: created.id,
          r2Key: p.r2Key,
          url: p.url,
          sortOrder: p.sortOrder ?? i,
        })),
      });

      return tx.listing.findUnique({
        where: { id: created.id },
        include: {
          photos: { orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true, icon: true } },
        },
      });
    });

    return this.sanitizeListing(listing);
  }

  // ─── Update listing ───────────────────────────────────────────────────────

  async updateListing(userId: string, id: string, dto: UpdateListingDto): Promise<any> {
    // 1. Verify listing exists and caller owns it
    const existing = await this.prisma.listing.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Listing with id "${id}" not found.`);
    }

    if (existing.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this listing.');
    }

    // 2. If photos are being updated, enforce minimum 3
    if (dto.photos !== undefined && dto.photos.length < 3) {
      throw new BadRequestException('A listing must have at least 3 photos.');
    }

    // 3. If category is being changed, validate new category is enabled
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Category "${dto.categoryId}" does not exist.`);
      }
      if (!category.isEnabled) {
        throw new UnprocessableEntityException(
          `The category "${category.name}" is not currently accepting new listings.`,
        );
      }
    }

    // 4. Build slug if title changed
    let slug = existing.slug;
    if (dto.title && dto.title !== existing.title) {
      slug = await this.generateUniqueSlug(dto.title, id);
    }

    // 5. Perform update — replace photos atomically if provided
    const updated = await this.prisma.$transaction(async (tx) => {
      const { photos, ...listingFields } = dto;

      await tx.listing.update({
        where: { id },
        data: {
          ...listingFields,
          ...(dto.title ? { slug } : {}),
          updatedAt: new Date(),
        },
      });

      if (photos !== undefined) {
        await tx.listingPhoto.deleteMany({ where: { listingId: id } });
        await tx.listingPhoto.createMany({
          data: photos.map((p, i) => ({
            listingId: id,
            r2Key: p.r2Key,
            url: p.url,
            sortOrder: p.sortOrder ?? i,
          })),
        });
      }

      return tx.listing.findUnique({
        where: { id },
        include: {
          photos: { orderBy: { sortOrder: 'asc' } },
          badges: true,
          category: { select: { id: true, name: true, slug: true, icon: true } },
          owner: {
            select: { id: true, name: true, avatarUrl: true, verificationStatus: true },
          },
        },
      });
    });

    return this.sanitizeListing(updated);
  }

  // ─── Publish listing ──────────────────────────────────────────────────────

  /**
   * Transitions a listing from DRAFT → ACTIVE (PENDING_REVIEW → ACTIVE for admin-reviewed
   * listings, or directly to ACTIVE if category auto-approves).
   *
   * Validates all required fields and minimum photo count before publishing.
   */
  async publishListing(userId: string, id: string): Promise<any> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        photos: true,
        category: true,
      },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with id "${id}" not found.`);
    }

    if (listing.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to publish this listing.');
    }

    if (!listing.isDraft) {
      throw new BadRequestException('This listing has already been published.');
    }

    // Validate required fields
    const missingFields: string[] = [];
    if (!listing.title?.trim()) missingFields.push('title');
    if (!listing.description?.trim()) missingFields.push('description');
    if (!listing.location?.trim()) missingFields.push('location');
    if (!listing.dailyRate || listing.dailyRate < 1) missingFields.push('dailyRate');
    if (listing.depositAmount === null || listing.depositAmount === undefined) missingFields.push('depositAmount');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Cannot publish listing — missing required fields: ${missingFields.join(', ')}.`,
      );
    }

    // Validate minimum photos
    if (!listing.photos || listing.photos.length < 3) {
      throw new BadRequestException(
        'Cannot publish listing — a minimum of 3 photos is required.',
      );
    }

    // Validate category still enabled
    if (!listing.category.isEnabled) {
      throw new UnprocessableEntityException(
        `The category "${listing.category.name}" is not currently accepting active listings.`,
      );
    }

    const published = await this.prisma.listing.update({
      where: { id },
      data: {
        isDraft: false,
        status: ListingStatus.ACTIVE,
        updatedAt: new Date(),
      },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        badges: true,
        category: { select: { id: true, name: true, slug: true, icon: true } },
        owner: {
          select: { id: true, name: true, avatarUrl: true, verificationStatus: true },
        },
      },
    });

    return this.sanitizeListing(published);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Strips all sensitive owner fields from a listing response.
   * Rule 6 — contact gating: phone is never exposed on listing endpoints.
   */
  private sanitizeListing(listing: any): any {
    if (!listing) return listing;

    const sanitized = { ...listing };

    if (sanitized.owner) {
      // Destructure out any phone field that might have slipped through
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { phone, passwordHash, idDocumentFront, idDocumentBack, ...safeOwner } = sanitized.owner;
      sanitized.owner = safeOwner;
    }

    return sanitized;
  }

  /**
   * Generates a URL-safe slug from the given title, appending a numeric suffix
   * if the slug is already taken by another listing.
   */
  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);

    let slug = base;
    let suffix = 1;

    while (true) {
      const conflict = await this.prisma.listing.findUnique({ where: { slug } });
      if (!conflict || conflict.id === excludeId) break;
      slug = `${base}-${suffix}`;
      suffix++;
    }

    return slug;
  }
}
