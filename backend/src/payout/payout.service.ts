import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payout } from './schemas/payout.schema';
import { ConnectedAccount } from './schemas/connected-account.schema';


@Injectable()
export class PayoutService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Payout.name) private payoutModel: Model<Payout>,
    @InjectModel(ConnectedAccount.name)  private connectedAccountModel: Model<ConnectedAccount>,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      { apiVersion: '2025-11-17.clover' }
    );
  }

  // ⭐ Store payout event from webhook
  async storePayoutEvent(data: any) {
    return await this.payoutModel.create({
      payoutId: data.payoutId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      type: data.type,
      failureCode: data.failureCode,
      failureMessage: data.failureMessage,
    });
  }

  // ⭐ 1. Create Express Connect Account
  async createExpressAccount(email: string) {
    return await this.stripe.accounts.create({
      type: 'express',
      email,
      country: 'US',
      capabilities: {
        transfers: { requested: true },
      },
    });
  }

  // ⭐ 2. Generate Express Onboarding Link
  async generateOnboardingLink(accountId: string) {
    return await this.stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: 'http://localhost:5173/admin',
      return_url: 'http://localhost:5173/admin',
    });
  }

  // ⭐ 3. Get Account Details (Missing earlier)
  async getAccountDetails(accountId: string) {
    return await this.stripe.accounts.retrieve(accountId);
  }

  async getAccountStatus(accountId: string) {
  const acc = await this.stripe.accounts.retrieve(accountId);

  // Extract verification info
  const detailsSubmitted = acc.details_submitted ?? false;
  const payoutsEnabled = acc.payouts_enabled ?? false;
  const chargesEnabled = acc.charges_enabled ?? false;

  const isVerified = detailsSubmitted && payoutsEnabled;

  // Update in DB
  await this.connectedAccountModel.updateOne(
    { accountId },
    {
      email: acc.email ?? "",
      detailsSubmitted,
      payoutsEnabled,
      chargesEnabled,
      isVerified,
    },
    { upsert: true }
  );

  return {
    accountId: acc.id,
    email: acc.email,
    detailsSubmitted,
    payoutsEnabled,
    chargesEnabled,
    isVerified,
  };
}


  // ⭐ 4. Transfer funds to connected account
  async transferToConnectedAccount(accountId: string, amount: number) {
    return await this.stripe.transfers.create({
      amount,
      currency: 'usd',
      destination: accountId,
    });
  }

  // ⭐ 5. Create payout to bank account
  async createPayout(accountId: string, amount: number) {
    return await this.stripe.payouts.create(
      { amount, currency: 'usd' },
      { stripeAccount: accountId }
    );
  }

  // ⭐ 6. Get payout by ID
  async getPayoutById(accountId: string, payoutId: string) {
    return await this.stripe.payouts.retrieve(payoutId, {
      stripeAccount: accountId,
    });
  }

  // ⭐ 7. Get connected account balance
  async getBalance(accountId: string) {
    return await this.stripe.balance.retrieve({
      stripeAccount: accountId,
    });
  }

  // ⭐ 8. Get all payouts for a connected account
async getAllPayouts(accountId: string) {
  return await this.stripe.payouts.list(
    {
      limit: 10,
    },
    {
      stripeAccount: accountId,
    },
  );
}

// for the weekly payoutschedule
async setPayoutSchedule(
  accountId: string,
  weeklyAnchor: Stripe.AccountCreateParams.Settings.Payouts.Schedule.WeeklyAnchor
) {
  return await this.stripe.accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: {
          interval: "weekly",
          weekly_anchor: weeklyAnchor,
        },
      },
    },
  });
}

async getPlatformBalance() {
  return await this.stripe.balance.retrieve();
}

async listAllConnectedAccounts() {
  return await this.stripe.accounts.list({
    limit: 20,
  });
}

// to disable connectedAccount
async disableConnectedAccount(accountId: string) {
  // 1️⃣ Check balance first
  const balance = await this.stripe.balance.retrieve({
    stripeAccount: accountId,
  });

  const available = balance.available.reduce((sum, b) => sum + b.amount, 0);
  const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0);

  if (available > 0 || pending > 0) {
    throw new Error("Account cannot be disabled — balance must be zero.");
  }

  // 2️⃣ Disable capabilities
  return await this.stripe.accounts.update(accountId, {
    capabilities: {
      card_payments: { requested: false },
      transfers: { requested: false }
    },
  });
}


}
