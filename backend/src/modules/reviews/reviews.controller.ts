import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReviewsService, CreateReviewDto } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ---------------------------------------------------------------------------
  // GET /reviews/listing/:listingId — get public reviews for a listing (public)
  // Declared before :bookingId routes to avoid route shadowing.
  // ---------------------------------------------------------------------------

  @Get('listing/:listingId')
  getReviewsForListing(@Param('listingId') listingId: string) {
    return this.reviewsService.getReviewsForListing(listingId);
  }

  // ---------------------------------------------------------------------------
  // GET /reviews/eligibility/:bookingId — check if user can review (auth)
  // ---------------------------------------------------------------------------

  @Get('eligibility/:bookingId')
  @UseGuards(JwtAuthGuard)
  checkReviewEligibility(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    return this.reviewsService.checkReviewEligibility(req.user.id, bookingId);
  }

  // ---------------------------------------------------------------------------
  // POST /reviews/:bookingId — submit a review for a closed booking (auth)
  // ---------------------------------------------------------------------------

  @Post(':bookingId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  submitReview(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.submitReview(req.user.id, bookingId, dto);
  }
}
