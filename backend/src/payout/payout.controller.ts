// // src/payout/payout.controller.ts
// import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
// import { PayoutService } from './payout.service';
// import { TransferDto } from './dto/transfer.dto';
// import { PayoutDto } from './dto/payout.dto';

// @Controller('payout')
// export class PayoutController {
//   constructor(private readonly payoutService: PayoutService) {}

//   // 1️⃣ Transfer money (platform → connected account)
//   @Post('transfer')
//   createTransfer(@Body() dto: TransferDto) {
//     return this.payoutService.createTransfer(dto);
//   }

//   // 2️⃣ Payout money (connected account → bank account)
//   @Post('create-payout')
//   createPayout(@Body() dto: PayoutDto) {
//     return this.payoutService.createPayout(dto);
//   }

//   // 3️⃣ Get all transfers
//   @Get('transfers')
//   getTransfers() {
//     return this.payoutService.getAllTransfers();
//   }

//   // 4️⃣ Get payout history for an account
//   @Get('payouts')
//   getPayouts(@Query('accountId') accountId: string) {
//     return this.payoutService.getPayouts(accountId);
//   }

// @Get('status/:accountId/:payoutId')
// getPayoutStatus(
//   @Param('accountId') accountId: string,
//   @Param('payoutId') payoutId: string,
// ) {
//   return this.payoutService.getPayoutStatus(payoutId, accountId);
// }

// // GET balance of a connected account
// @Get('balance/:accountId')
// getBalance(@Param('accountId') accountId: string) {
//   return this.payoutService.getConnectedAccountBalance(accountId);
// }

// @Post('onboard')
// async generateOnboardLink(@Body('accountId') accountId: string) {
//   return this.payoutService.generateOnboardLink(accountId);
// }
// }



import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { TransferDto } from './dto/transfer.dto';
import { PayoutDto } from './dto/payout.dto';
import Stripe from 'stripe';

@Controller('payout')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  // ⭐ Create Express Account
  @Post('create-account')
  async createAccount(@Body() dto: CreateAccountDto) {
    const account = await this.payoutService.createExpressAccount(dto.email);
    const link = await this.payoutService.generateOnboardingLink(
      account.id,
    );

    return {
      message: 'Express account created',
      accountId: account.id,
      onboardingUrl: link.url,
    };
  }
  
@Get("onboarding-link/:accountId")
async getOnboardingLink(@Param("accountId") accountId: string) {
  return await this.payoutService.generateOnboardingLink(accountId);
}

  // ⭐ Transfer
  @Post('transfer')
  async transfer(@Body() dto: TransferDto) {
    const transfer = await this.payoutService.transferToConnectedAccount(
      dto.accountId,
      dto.amount,
    );

    return {
      message: 'Transfer successful',
      transfer,
    };
  }

  // ⭐ Payout
  @Post('create-payout')
  async payout(@Body() dto: PayoutDto) {
    const result = await this.payoutService.createPayout(
      dto.accountId,
      dto.amount,
    );

    return {
      message: 'Payout initiated successfully',
      payout: result,
    };
  }

  // ⭐ Get account status
  @Get('account/:accountId')
  getAccount(@Param('accountId') id: string) {
    return this.payoutService.getAccountDetails(id);
  }

  // with limited fields
  @Get("account-status/:accountId")
async getAccountStatus(@Param("accountId") accountId: string) {
  return await this.payoutService.getAccountStatus(accountId);
}

  // ⭐ Get payout by ID
  @Get('payout-status/:accountId/:payoutId')
  getPayoutStatus(@Param('accountId') accountId: string, @Param('payoutId') payoutId: string) {
    return this.payoutService.getPayoutById(accountId, payoutId);
  }

  // ⭐ Get connected account balance
  @Get('balance/:accountId')
  getBalance(@Param('accountId') accountId: string) {
    return this.payoutService.getBalance(accountId);
  }

  // ⭐ Get all payouts for an account
@Get('all-payouts/:accountId')
async getAllPayouts(@Param('accountId') accountId: string) {
  return this.payoutService.getAllPayouts(accountId);
}
 // set schedule for the 7 day schedule payout
  @Post("set-schedule")
  async setSchedule(
    @Body() body: { accountId: string; day: string }
  ) {
    const validDays: Stripe.AccountCreateParams.Settings.Payouts.Schedule.WeeklyAnchor[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    if (!validDays.includes(body.day as any)) {
      throw new BadRequestException(
        "Invalid day. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday."
      );
    }

    return await this.payoutService.setPayoutSchedule(
      body.accountId,
      body.day as Stripe.AccountCreateParams.Settings.Payouts.Schedule.WeeklyAnchor
    );
  }

  @Get("platform-balance")
async getPlatformBalance() {
  return await this.payoutService.getPlatformBalance();
}

@Get("all-accounts")
async getAllConnectedAccounts() {
  return await this.payoutService.listAllConnectedAccounts();
}

@Post("balance")
async getConnectedAccountBalance(@Body() body: { accountId: string }) {
  return await this.payoutService.getBalance(body.accountId);
}

// Api to disable the connected account
@Post("disable-account")
async disableAccount(@Body() body: { accountId: string }) {
  return await this.payoutService.disableConnectedAccount(body.accountId);
}

}
