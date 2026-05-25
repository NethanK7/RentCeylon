import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from './modules/redis/redis.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { DepositsModule } from './modules/deposits/deposits.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ChatModule } from './modules/chat/chat.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { ContactModule } from './modules/contact/contact.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { SmsModule } from './modules/sms/sms.module';
import { AdminModule } from './modules/admin/admin.module';
import { SlaModule } from './modules/sla/sla.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PropertyModule } from './modules/property/property.module';
import { CancellationsModule } from './modules/cancellations/cancellations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    RedisModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get<string>('REDIS_URL', 'redis://localhost:6379') },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    BookingsModule,
    DepositsModule,
    PaymentsModule,
    ChatModule,
    ReviewsModule,
    DisputesModule,
    ContactModule,
    NotificationsModule,
    EmailModule,
    SmsModule,
    AdminModule,
    SlaModule,
    ReferralsModule,
    SubscriptionsModule,
    PropertyModule,
    CancellationsModule,
  ],
})
export class AppModule {}
