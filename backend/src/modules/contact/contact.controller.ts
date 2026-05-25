import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ContactService } from './contact.service';

@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // ---------------------------------------------------------------------------
  // GET /contact/history — reveal history for the authenticated user
  // Declared before :bookingId routes to avoid "history" being parsed as an ID.
  // ---------------------------------------------------------------------------

  @Get('history')
  getRevealHistory(@Req() req: any) {
    return this.contactService.getRevealHistory(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // GET /contact/booking/:bookingId — reveal lister contact (Rule 6)
  // Only succeeds when booking.status === ACTIVE.
  // ---------------------------------------------------------------------------

  @Get('booking/:bookingId')
  revealContact(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    return this.contactService.revealContact(req.user.id, bookingId);
  }
}
