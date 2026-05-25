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
import { CancellationsService } from './cancellations.service';

@Controller('cancellations')
@UseGuards(JwtAuthGuard)
export class CancellationsController {
  constructor(private readonly cancellationsService: CancellationsService) {}

  // ---------------------------------------------------------------------------
  // GET /cancellations/preview/:bookingId — preview tier + refund without committing
  // ---------------------------------------------------------------------------

  @Get('preview/:bookingId')
  getCancellationPreview(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    return this.cancellationsService.getCancellationPreview(bookingId, req.user.id);
  }

  // ---------------------------------------------------------------------------
  // POST /cancellations/:bookingId — cancel booking (Rule 9 tiered refund)
  // ---------------------------------------------------------------------------

  @Post(':bookingId')
  @HttpCode(HttpStatus.OK)
  cancelBooking(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Body('reason') reason?: string,
  ) {
    return this.cancellationsService.cancelBooking(bookingId, req.user.id, reason);
  }
}
