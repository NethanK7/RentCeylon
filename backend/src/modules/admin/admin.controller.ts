import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@rentloop/shared';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ---------------------------------------------------------------------------
  // GET /admin/stats — dashboard KPIs + SLA at-risk counts
  // ---------------------------------------------------------------------------

  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ---------------------------------------------------------------------------
  // GET /admin/deposits — paginated list of bookings with HELD deposits
  // ---------------------------------------------------------------------------

  @Get('deposits')
  getPendingDeposits(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingDeposits(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // ---------------------------------------------------------------------------
  // GET /admin/deposits/:bookingId/audit — full chain-of-custody audit log
  // ---------------------------------------------------------------------------

  @Get('deposits/:bookingId/audit')
  getDepositAuditLog(@Param('bookingId') bookingId: string) {
    return this.adminService.getDepositAuditLog(bookingId);
  }

  // ---------------------------------------------------------------------------
  // POST /admin/deposits/:bookingId/release — manually release a held deposit
  // ---------------------------------------------------------------------------

  @Post('deposits/:bookingId/release')
  @HttpCode(HttpStatus.OK)
  manualReleaseDeposit(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Body('toParty') toParty: 'renter' | 'lister',
    @Body('note') note: string,
  ) {
    return this.adminService.manualReleaseDeposit(req.user.id, bookingId, toParty, note);
  }

  // ---------------------------------------------------------------------------
  // GET /admin/verifications — paginated PENDING ID verifications
  // ---------------------------------------------------------------------------

  @Get('verifications')
  getPendingVerifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingVerifications(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // ---------------------------------------------------------------------------
  // POST /admin/verifications/:userId/approve — approve ID verification
  // ---------------------------------------------------------------------------

  @Post('verifications/:userId/approve')
  @HttpCode(HttpStatus.OK)
  approveVerification(@Req() req: any, @Param('userId') userId: string) {
    return this.adminService.approveVerification(req.user.id, userId);
  }

  // ---------------------------------------------------------------------------
  // POST /admin/verifications/:userId/reject — reject ID verification
  // ---------------------------------------------------------------------------

  @Post('verifications/:userId/reject')
  @HttpCode(HttpStatus.OK)
  rejectVerification(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectVerification(req.user.id, userId, reason);
  }

  // ---------------------------------------------------------------------------
  // GET /admin/disputes — paginated open disputes with SLA countdown
  // ---------------------------------------------------------------------------

  @Get('disputes')
  getOpenDisputes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getOpenDisputes(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
