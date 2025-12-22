import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { PaymentSchema } from '../payment/payment.schema';
import { RefundSchema } from '../refund/schemas/refund.schema';
import { PayoutSchema } from '../payout/schemas/payout.schema';
import { SubscriptionSchema } from '../subscription/schemas/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Payment', schema: PaymentSchema },
      { name: 'Refund', schema: RefundSchema },
      { name: 'Payout', schema: PayoutSchema },
      { name: 'Subscription', schema: SubscriptionSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
