import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PaymentService } from '../payment/payment.service';
import { PayoutService } from '../payout/payout.service';
import { RefundService } from '../refund/refund.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly payoutService: PayoutService,
    private readonly refundService: RefundService,
    private readonly subscriptionService: SubscriptionService,
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

    // ************************************************************
    // 🔴 5. SUBSCRIPTION EVENTS
    // ************************************************************

    // Subscription created (new subscription)
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      await this.subscriptionService.syncSubscription(subscription);
      console.log(`🆕 Subscription Created → ${subscription.id}`);
    }

    // Subscription updated (plan change, status change, etc.)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      await this.subscriptionService.syncSubscription(subscription);
      
      // Check for specific status changes
      if (subscription.cancel_at_period_end) {
        console.log(`⚠️ Subscription set to cancel at period end → ${subscription.id}`);
      } else {
        console.log(`🔄 Subscription Updated → ${subscription.id} (Status: ${subscription.status})`);
      }
    }

    // Subscription deleted/canceled
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      await this.subscriptionService.syncSubscription(subscription);
      console.log(`❌ Subscription Canceled/Deleted → ${subscription.id}`);
    }

    // Subscription trial will end (3 days before trial ends)
    if (event.type === 'customer.subscription.trial_will_end') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`⏰ Trial ending soon → ${subscription.id}`);
      // You can send email notifications here
    }

    // Subscription paused
    if (event.type === 'customer.subscription.paused') {
      const subscription = event.data.object as Stripe.Subscription;
      await this.subscriptionService.syncSubscription(subscription);
      console.log(`⏸️ Subscription Paused → ${subscription.id}`);
    }

    // Subscription resumed
    if (event.type === 'customer.subscription.resumed') {
      const subscription = event.data.object as Stripe.Subscription;
      await this.subscriptionService.syncSubscription(subscription);
      console.log(`▶️ Subscription Resumed → ${subscription.id}`);
    }

    // ************************************************************
    // 💳 6. INVOICE EVENTS (for subscription renewals)
    // ************************************************************

    // Invoice paid (successful renewal)
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceData = invoice as any; // Type assertion for subscription property
      
      if (invoiceData.subscription) {
        console.log(`✅ Invoice Paid (Renewal Success) → Invoice: ${invoice.id}, Subscription: ${invoiceData.subscription}`);
        
        // Fetch and sync the subscription
        const subscription = await this.stripe.subscriptions.retrieve(invoiceData.subscription as string);
        await this.subscriptionService.syncSubscription(subscription);
      }
    }

    // Invoice payment failed (renewal failed)
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceData = invoice as any; // Type assertion for subscription property
      
      if (invoiceData.subscription) {
        console.log(`❌ Invoice Payment Failed → Invoice: ${invoice.id}, Subscription: ${invoiceData.subscription}`);
        
        // Fetch and sync the subscription (status might change to past_due)
        const subscription = await this.stripe.subscriptions.retrieve(invoiceData.subscription as string);
        await this.subscriptionService.syncSubscription(subscription);
      }
    }

    // Invoice upcoming (sent ~3 days before next payment)
    if (event.type === 'invoice.upcoming') {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceData = invoice as any;
      console.log(`📅 Upcoming Invoice → Customer: ${invoice.customer}, Amount: ${invoiceData.amount_due}`);
      // You can send reminder emails here
    }

    // Invoice finalized
    if (event.type === 'invoice.finalized') {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`📄 Invoice Finalized → ${invoice.id}`);
    }

    // ************************************************************
    // 🛒 7. CHECKOUT SESSION EVENTS
    // ************************************************************

    // Checkout session completed (subscription created via checkout)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.mode === 'subscription' && session.subscription) {
        console.log(`🛒 Checkout Completed → Session: ${session.id}, Subscription: ${session.subscription}`);
        
        // Fetch the subscription
        const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
        
        // Check if this is a one-time subscription (from metadata)
        const oneTime = session.metadata?.oneTime === 'true';
        if (oneTime) {
          // Update subscription to cancel at period end
          await this.stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
          });
          console.log(`🔄 One-time subscription set to cancel at period end → ${subscription.id}`);
          
          // Fetch updated subscription
          const updatedSubscription = await this.stripe.subscriptions.retrieve(subscription.id);
          await this.subscriptionService.syncSubscription(updatedSubscription);
        } else {
          await this.subscriptionService.syncSubscription(subscription);
        }
      }
    }

    return res.status(200).send('OK');
  }
}
