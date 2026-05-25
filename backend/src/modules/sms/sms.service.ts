import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private config: ConfigService) {}

  async sendOtp(phone: string, otp: string) {
    this.logger.log(`[SMS] OTP ${otp} → ${phone}`);
    // TODO: integrate Dialog / Mobitel SMS gateway using this.config.get('SMS_API_KEY')
  }

  async sendBookingAlert(phone: string, message: string) {
    this.logger.log(`[SMS] Booking alert → ${phone}`);
  }

  async sendDepositAlert(phone: string, amount: number, action: string) {
    this.logger.log(`[SMS] Deposit ${action} Rs.${amount} → ${phone}`);
  }
}
