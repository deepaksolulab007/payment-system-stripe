import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';


import { StripeModule } from './stripe/stripe.module';
import { WebhookModule } from './webhook/webhook.module';
import { PaymentModule } from './payment/payment.module';
import { PayoutModule } from './payout/payout.module';
import { AdminModule } from './admin/admin.module';
import { RefundModule } from './refund/refund.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',  // change to '.env.live' when using live mode
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    StripeModule,
    WebhookModule,
    PaymentModule,
    PayoutModule,
    AdminModule,
    RefundModule,
    SubscriptionModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
