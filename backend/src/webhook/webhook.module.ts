import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { PaymentModule } from '../payment/payment.module';
import { PayoutModule } from '../payout/payout.module';
import { RefundModule } from 'src/refund/refund.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    ConfigModule,
    PaymentModule,       // gives PaymentService
    PayoutModule,        // gives PayoutService
    RefundModule,        // gives RefundService
    SubscriptionModule,  // gives SubscriptionService
  ],
  controllers: [WebhookController],
})
export class WebhookModule {}
