import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {}

  async sendBookingConfirmation(to: string, data: { bookingId: string; listingTitle: string; startDate: Date; endDate: Date }) {
    this.logger.log(`[EMAIL] Booking confirmation → ${to} for booking ${data.bookingId}`);
    // TODO: integrate SendGrid / Mailgun using this.config.get('SENDGRID_API_KEY')
  }

  async sendDepositRelease(to: string, data: { amount: number; toParty: 'renter' | 'lister'; bookingId: string }) {
    this.logger.log(`[EMAIL] Deposit release → ${to} amount=${data.amount}`);
  }

  async sendIdVerificationResult(to: string, approved: boolean, reason?: string) {
    this.logger.log(`[EMAIL] ID verification ${approved ? 'approved' : 'rejected'} → ${to}`);
  }

  async sendDisputeUpdate(to: string, data: { disputeId: string; status: string }) {
    this.logger.log(`[EMAIL] Dispute update → ${to} dispute=${data.disputeId}`);
  }

  async sendWelcome(to: string, name: string) {
    this.logger.log(`[EMAIL] Welcome → ${to} (${name})`);
  }
}
