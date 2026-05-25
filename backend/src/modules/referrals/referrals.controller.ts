import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  // ---------------------------------------------------------------------------
  // POST /referrals/code — create (or retrieve existing) referral code
  // ---------------------------------------------------------------------------

  @Post('code')
  @HttpCode(HttpStatus.OK)
  createReferralCode(@Req() req: any) {
    return this.referralsService.createReferralCode(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // POST /referrals/apply — apply a referral code to the authenticated user
  // ---------------------------------------------------------------------------

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  applyReferralCode(
    @Req() req: any,
    @Body('code') code: string,
  ) {
    return this.referralsService.applyReferralCode(req.user.id, code);
  }

  // ---------------------------------------------------------------------------
  // GET /referrals/stats — referral stats for the authenticated user
  // ---------------------------------------------------------------------------

  @Get('stats')
  getReferralStats(@Req() req: any) {
    return this.referralsService.getReferralStats(req.user.id);
  }
}
