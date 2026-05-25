import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ListingsService, CreateListingDto, UpdateListingDto } from './listings.service';

// Extend Express Request to include the user populated by JwtStrategy
interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // ---------------------------------------------------------------------------
  // GET /listings — public search
  // Query params: q, categoryId, minPrice, maxPrice, page, limit
  // minPrice/maxPrice are parsed manually so they remain undefined when absent.
  // ---------------------------------------------------------------------------

  @Get()
  search(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPriceRaw?: string,
    @Query('maxPrice') maxPriceRaw?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    const minPrice = minPriceRaw !== undefined ? parseInt(minPriceRaw, 10) : undefined;
    const maxPrice = maxPriceRaw !== undefined ? parseInt(maxPriceRaw, 10) : undefined;

    return this.listingsService.searchListings({
      query: q,
      categoryId,
      minPrice: isNaN(minPrice as any) ? undefined : minPrice,
      maxPrice: isNaN(maxPrice as any) ? undefined : maxPrice,
      page,
      limit,
    });
  }

  // ---------------------------------------------------------------------------
  // GET /listings/:id — public single listing (phone sanitized in service)
  // ---------------------------------------------------------------------------

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.listingsService.getListing(id);
  }

  // ---------------------------------------------------------------------------
  // POST /listings — create listing (auth required)
  // ---------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateListingDto) {
    return this.listingsService.createListing(req.user.id, dto);
  }

  // ---------------------------------------------------------------------------
  // PATCH /listings/:id — update listing (auth required; ownership in service)
  // ---------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.updateListing(req.user.id, id, dto);
  }

  // ---------------------------------------------------------------------------
  // POST /listings/:id/publish — publish draft listing (auth required)
  // ---------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.publishListing(req.user.id, id);
  }
}
