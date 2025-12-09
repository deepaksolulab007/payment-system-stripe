import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PaymentService } from '../payment/payment.service';
import { PayoutService } from '../payout/payout.service';
import { RefundService } from '../refund/refund.service';

@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly payoutService: PayoutService,
    private readonly refundService: RefundService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      { apiVersion: '2025-11-17.clover' }
    );
  }

  @Post('stripe')
  async handleStripeWebhook(@Req() req, @Res() res) {
    const signature = req.headers['stripe-signature'];
    const secret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature!,
        secret!
      );
    } catch (err: any) {
      console.log('❌ Invalid webhook signature:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`➡ Webhook Event: ${event.type}`);

    // ************************************************************
    // 🟢 1. PAYMENT EVENTS
    // ************************************************************
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;

      const chargeId = intent.latest_charge as string;
      const charge = await this.stripe.charges.retrieve(chargeId);

      await this.paymentService.saveSuccessfulPayment({
        paymentIntentId: intent.id,
        chargeId: charge.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        paymentMethodType: intent.payment_method_types[0],
        receiptEmail: intent.receipt_email ?? undefined,
        customerId: intent.customer?.toString() ?? undefined,
        description: intent.description ?? undefined,
      });

      console.log(`💾 Payment saved → ${intent.id}`);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(
        `❌ Payment failed → ${pi.id}`,
        pi.last_payment_error?.message,
      );
    }

    // ************************************************************
    // 🔵 2. REFUND EVENTS
    // ************************************************************
    if (event.type.startsWith('refund.')) {
      const refund = event.data.object as Stripe.Refund;

      await this.refundService.storeRefundEvent({
        refundId: refund.id,
        paymentIntentId: refund.payment_intent as string,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason ?? undefined,
      });

      console.log(`🔄 Refund Updated → ${refund.id}`);
    }

    // ************************************************************
    // 🟣 3. PAYOUT EVENTS (Connect)
    // ************************************************************
    if (event.type.startsWith('payout.')) {
      const payout = event.data.object as Stripe.Payout;

      await this.payoutService.storePayoutEvent({
        payoutId: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        type: event.type.replace('payout.', ''), // created / paid / failed / canceled / updated
        failureCode: payout.failure_code ?? null,
        failureMessage: payout.failure_message ?? null,
      });

      console.log(`💰 Payout Event (${event.type}) → ${payout.id}`);
    }

    // ************************************************************
    // 🟠 4. CONNECT ACCOUNT ONBOARDING EVENTS (Express)
    // ************************************************************
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;

      if (account.capabilities?.transfers === 'active') {
        console.log(`🟢 Payouts Enabled → ${account.id}`);
      } else {
        console.log(`⚠️ Payouts Not Enabled → ${account.id}`);
      }
    }

    return res.status(200).send('OK');
  }
}
