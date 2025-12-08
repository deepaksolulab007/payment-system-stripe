// import { Module } from '@nestjs/common';
// import { PayoutController } from './payout.controller';
// import { PayoutService } from './payout.service';
// import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Payout, PayoutSchema } from './schemas/payout.schema';

// @Module({
//   imports: [
//     ConfigModule,
//     MongooseModule.forFeature([
//       { name: Payout.name, schema: PayoutSchema },
//     ]),
//   ],
//   controllers: [PayoutController],
//   providers: [PayoutService],
//   exports: [PayoutService],
// })
// export class PayoutModule {}


import { Module } from '@nestjs/common';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { Payout, PayoutSchema } from './schemas/payout.schema';
import { ConnectedAccount, ConnectedAccountSchema } from './schemas/connected-account.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Payout.name, schema: PayoutSchema },
      { name: ConnectedAccount.name, schema: ConnectedAccountSchema },
    ]),
  ],
  controllers: [PayoutController],
  providers: [PayoutService],
  exports: [PayoutService],
})
export class PayoutModule {}
