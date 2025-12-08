import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.schema';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }])
  ],
  providers: [PaymentService],
  controllers: [PaymentController],      // <-- MUST BE HERE
  exports: [PaymentService],             // <-- For webhook
})
export class PaymentModule {}
