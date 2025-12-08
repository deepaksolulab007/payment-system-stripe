import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { RefundSchema } from './schemas/refund.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Refund', schema: RefundSchema }])
  ],
  controllers: [RefundController],
  providers: [RefundService],
  exports: [RefundService],
})
export class RefundModule {}
