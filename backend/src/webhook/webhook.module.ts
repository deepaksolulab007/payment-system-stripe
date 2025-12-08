import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { PaymentModule } from '../payment/payment.module';
import { PayoutModule } from '../payout/payout.module';
import { RefundModule } from 'src/refund/refund.module';

@Module({
  imports: [
    ConfigModule,
    PaymentModule,  // gives PaymentService
    PayoutModule,   // gives PayoutService  (REQUIRED)
    RefundModule,
  ],
  controllers: [WebhookController],
})
export class WebhookModule {}
