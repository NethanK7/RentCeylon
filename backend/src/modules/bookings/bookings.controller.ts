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
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BookingsService, CreateBookingDto } from './bookings.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ---------------------------------------------------------------------------
  // GET /bookings/my — list all bookings for the authenticated user
  // Must be declared BEFORE :id routes to avoid "my" being parsed as an ID.
  // ---------------------------------------------------------------------------

  @Get('my')
  getMyBookings(@Req() req: AuthenticatedRequest) {
    // Delegate to service — returns bookings where user is renter or listing owner
    return this.bookingsService.getMyBookings(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // POST /bookings — create a booking (renter)
  // ---------------------------------------------------------------------------

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.id, dto);
  }

  // ---------------------------------------------------------------------------
  // POST /bookings/:id/accept — accept booking (lister)
  // ---------------------------------------------------------------------------

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  accept(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bookingsService.acceptBooking(req.user.id, id);
  }

  // ---------------------------------------------------------------------------
  // POST /bookings/:id/decline — decline booking (lister)
  // ---------------------------------------------------------------------------

  @Post(':id/decline')
  @HttpCode(HttpStatus.OK)
  decline(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingsService.declineBooking(req.user.id, id, reason);
  }

  // ---------------------------------------------------------------------------
  // GET /bookings/:id/contact — reveal lister contact (renter, Rule 6)
  // Only available when booking is ACTIVE.
  // ---------------------------------------------------------------------------

  @Get(':id/contact')
  getContact(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bookingsService.getBookingContact(req.user.id, id);
  }

  // ---------------------------------------------------------------------------
  // GET /bookings/:id/cancellation-preview — tier + refund amount preview
  // ---------------------------------------------------------------------------

  @Get(':id/cancellation-preview')
  cancellationPreview(@Param('id') id: string) {
    return this.bookingsService.getCancellationPreviewById(id);
  }

  // ---------------------------------------------------------------------------
  // POST /bookings/:id/cancel — cancel booking (renter or lister)
  // ---------------------------------------------------------------------------

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bookingsService.cancelBooking(req.user.id, id);
  }
}
