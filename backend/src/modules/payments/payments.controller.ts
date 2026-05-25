import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { PaymentProvider } from '@rentloop/shared';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ---------------------------------------------------------------------------
  // POST /payments/initiate — start a payment for a booking (auth required)
  // Body: { bookingId: string; provider: PaymentProvider }
  // ---------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  initiate(
    @Req() req: AuthenticatedRequest,
    @Body('bookingId') bookingId: string,
    @Body('provider') provider: PaymentProvider,
  ) {
    return this.paymentsService.initiatePayment(bookingId, req.user.id, provider);
  }

  // ---------------------------------------------------------------------------
  // POST /payments/webhook — payment provider callback (no auth — external call)
  // Body: { idempotencyKey: string; providerRef: string }
  // ---------------------------------------------------------------------------

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(
    @Body('idempotencyKey') idempotencyKey: string,
    @Body('providerRef') providerRef: string,
  ) {
    return this.paymentsService.confirmPayment(idempotencyKey, providerRef);
  }

  // ---------------------------------------------------------------------------
  // GET /payments/fee-preview — public fee breakdown for a given rental amount
  // Query: ?amount=<number>
  // ---------------------------------------------------------------------------

  @Get('fee-preview')
  feePreview(
    @Query('amount', new DefaultValuePipe(0), ParseIntPipe) amount: number,
    @Query('deposit', new DefaultValuePipe(0), ParseIntPipe) deposit: number,
  ) {
    return this.paymentsService.calculateFee(amount, deposit);
  }
}
