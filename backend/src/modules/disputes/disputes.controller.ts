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
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@rentloop/shared';
import { DisputesService, RaiseDisputeDto } from './disputes.service';
import { DisputeOutcome } from '@rentloop/shared';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  // ---------------------------------------------------------------------------
  // POST /disputes — raise a dispute against a booking
  // ---------------------------------------------------------------------------

  @Post()
  @HttpCode(HttpStatus.CREATED)
  raiseDispute(
    @Req() req: any,
    @Body('bookingId') bookingId: string,
    @Body() dto: RaiseDisputeDto,
  ) {
    return this.disputesService.raiseDispute(req.user.id, bookingId, dto);
  }

  // ---------------------------------------------------------------------------
  // POST /disputes/:id/evidence — submit additional evidence URLs
  // ---------------------------------------------------------------------------

  @Post(':id/evidence')
  @HttpCode(HttpStatus.OK)
  submitEvidence(
    @Req() req: any,
    @Param('id') id: string,
    @Body('evidenceUrls') evidenceUrls: string[],
  ) {
    return this.disputesService.submitEvidence(req.user.id, id, evidenceUrls);
  }

  // ---------------------------------------------------------------------------
  // GET /disputes/:id — get full dispute status (parties only)
  // ---------------------------------------------------------------------------

  @Get(':id')
  getDisputeStatus(@Req() req: any, @Param('id') id: string) {
    return this.disputesService.getDisputeStatus(id, req.user.id);
  }

  // ---------------------------------------------------------------------------
  // POST /disputes/:id/resolve — resolve a dispute (admin only)
  // ---------------------------------------------------------------------------

  @Post(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  resolveDispute(
    @Req() req: any,
    @Param('id') id: string,
    @Body('outcome') outcome: DisputeOutcome,
    @Body('adminNote') adminNote: string,
  ) {
    return this.disputesService.resolveDispute(req.user.id, id, outcome, adminNote);
  }
}
