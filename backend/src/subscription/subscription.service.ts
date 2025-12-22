import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      { apiVersion: '2025-11-17.clover' }
    );
  }

  // ============================================
  // PRODUCT & PRICE MANAGEMENT
  // ============================================

  // Create a product (e.g., "Premium Plan", "Basic Plan")
  async createProduct(name: string, description?: string) {
    return await this.stripe.products.create({
      name,
      description,
    });
  }

  // Create a recurring price for a product
  async createPrice(
    productId: string,
    amount: number,
    currency: string = 'usd',
    interval: 'day' | 'week' | 'month' | 'year' = 'month',
    intervalCount: number = 1
  ) {
    return await this.stripe.prices.create({
      product: productId,
      unit_amount: amount, // in cents
      currency,
      recurring: {
        interval,
        interval_count: intervalCount,
      },
    });
  }

  // List all products
  async listProducts(limit: number = 10) {
    return await this.stripe.products.list({ limit, active: true });
  }

  // List all prices
  async listPrices(productId?: string, limit: number = 10) {
    const params: Stripe.PriceListParams = { limit, active: true };
    if (productId) {
      params.product = productId;
    }
    return await this.stripe.prices.list(params);
  }

  // Archive/Deactivate a product (cannot be deleted in Stripe, only archived)
  async archiveProduct(productId: string) {
    return await this.stripe.products.update(productId, {
      active: false,
    });
  }

  // Archive/Deactivate a price (cannot be deleted in Stripe, only archived)
  async archivePrice(priceId: string) {
    return await this.stripe.prices.update(priceId, {
      active: false,
    });
  }

  // ============================================
  // CUSTOMER MANAGEMENT
  // ============================================

  // Find or create a customer by email
  async findOrCreateCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    const existingCustomers = await this.stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    return await this.stripe.customers.create({
      email,
      name,
    });
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  // Create a subscription checkout session (Stripe hosted page)
  async createSubscriptionCheckout(
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    trialDays?: number,
    oneTime?: boolean
  ) {
    const customer = await this.findOrCreateCustomer(email);

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    // Initialize subscription_data if needed
    if (trialDays && trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
      };
    }

    // Store oneTime flag in metadata (since cancel_at_period_end is not supported in checkout sessions)
    // We'll handle this in the webhook after checkout completes
    sessionParams.metadata = {
      oneTime: oneTime ? 'true' : 'false',
    };

    return await this.stripe.checkout.sessions.create(sessionParams);
  }

  // Create a subscription directly (requires payment method attached to customer)
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId?: string,
    trialDays?: number,
    oneTime?: boolean
  ) {
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    };

    if (paymentMethodId) {
      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    if (trialDays && trialDays > 0) {
      subscriptionParams.trial_period_days = trialDays;
    }

    // Set cancel_at_period_end for one-time subscriptions
    if (oneTime) {
      subscriptionParams.cancel_at_period_end = true;
    }

    return await this.stripe.subscriptions.create(subscriptionParams);
  }

  // Get subscription by ID from Stripe
  async getSubscription(subscriptionId: string) {
    return await this.stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'default_payment_method'],
    });
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelImmediately: boolean = false) {
    if (cancelImmediately) {
      // Cancel immediately
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end (user keeps access until billing period ends)
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  // Resume a subscription that was set to cancel at period end
  async resumeSubscription(subscriptionId: string) {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription.cancel_at_period_end) {
      throw new BadRequestException('Subscription is not set to cancel');
    }

    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  // Update subscription (change plan/price)
  async updateSubscription(subscriptionId: string, newPriceId: string) {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    return await this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  // List customer subscriptions
  async listCustomerSubscriptions(customerId: string) {
    return await this.stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
  }

  // ============================================
  // DATABASE OPERATIONS (Webhook Sync)
  // ============================================

  // Helper function to calculate period dates based on created/updated date and interval
  private calculatePeriodDates(startDate: Date, interval: string, intervalCount: number = 1): { start: Date; end: Date } {
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch (interval) {
      case 'day':
        end.setDate(end.getDate() + intervalCount);
        break;
      case 'week':
        end.setDate(end.getDate() + (intervalCount * 7));
        break;
      case 'month':
        end.setMonth(end.getMonth() + intervalCount);
        break;
      case 'year':
        end.setFullYear(end.getFullYear() + intervalCount);
        break;
      default:
        end.setMonth(end.getMonth() + intervalCount); // Default to months
    }
    
    return { start, end };
  }

  // Store/update subscription from webhook event
  async syncSubscription(stripeSubscription: Stripe.Subscription) {
    const customer = stripeSubscription.customer as Stripe.Customer | string;
    const customerId = typeof customer === 'string' ? customer : customer.id;
    
    let customerEmail = '';
    if (typeof customer !== 'string' && customer.email) {
      customerEmail = customer.email;
    } else {
      // Fetch customer to get email
      const fetchedCustomer = await this.stripe.customers.retrieve(customerId);
      if (fetchedCustomer && !fetchedCustomer.deleted) {
        customerEmail = (fetchedCustomer as Stripe.Customer).email || '';
      }
    }

    const priceItem = stripeSubscription.items.data[0];
    const price = priceItem.price;
    const productId = typeof price.product === 'string' ? price.product : price.product.id;

    // Get product name
    let productName = '';
    try {
      const product = await this.stripe.products.retrieve(productId);
      productName = product.name;
    } catch (e) {
      productName = productId;
    }

    // Use type assertion to access subscription properties (Stripe SDK type compatibility)
    const sub = stripeSubscription as any;
    
    // Get period dates - Stripe uses snake_case in API responses
    let periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000) : null;
    let periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
    
    // If period dates are missing, calculate them from existing subscription or created date
    if (!periodStart || !periodEnd) {
      // Try to get existing subscription from DB to use its dates
      const existingSub = await this.subscriptionModel.findOne({ subscriptionId: stripeSubscription.id });
      let baseDate = new Date();
      
      if (existingSub) {
        const existingSubObj = existingSub.toObject() as any;
        baseDate = existingSubObj.updatedAt || existingSubObj.createdAt || new Date();
      }
      
      const interval = price.recurring?.interval || 'month';
      const intervalCount = price.recurring?.interval_count || 1;
      
      const calculated = this.calculatePeriodDates(baseDate, interval, intervalCount);
      periodStart = periodStart || calculated.start;
      periodEnd = periodEnd || calculated.end;
      
      console.log(`📅 Calculated period dates for ${stripeSubscription.id}:`, {
        start: periodStart,
        end: periodEnd,
        interval,
        intervalCount,
        baseDate
      });
    }
    
    const subscriptionData = {
      subscriptionId: stripeSubscription.id,
      customerId,
      customerEmail,
      priceId: price.id,
      productId,
      productName,
      status: stripeSubscription.status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at 
        ? new Date(stripeSubscription.canceled_at * 1000) 
        : null,
      endedAt: stripeSubscription.ended_at 
        ? new Date(stripeSubscription.ended_at * 1000) 
        : null,
      trialStart: stripeSubscription.trial_start 
        ? new Date(stripeSubscription.trial_start * 1000) 
        : null,
      trialEnd: stripeSubscription.trial_end 
        ? new Date(stripeSubscription.trial_end * 1000) 
        : null,
      interval: price.recurring?.interval,
      intervalCount: price.recurring?.interval_count,
      amount: price.unit_amount,
      currency: price.currency,
    };

    // Upsert subscription
    return await this.subscriptionModel.findOneAndUpdate(
      { subscriptionId: stripeSubscription.id },
      subscriptionData,
      { upsert: true, new: true }
    );
  }

  // Get all subscriptions from database
  async getAllSubscriptions() {
    const subscriptions = await this.subscriptionModel.find().sort({ createdAt: -1 });
    
    // For subscriptions missing period start or end, fetch fresh data from Stripe
    const subscriptionsToSync = subscriptions.filter(
      sub => !sub.currentPeriodStart || !sub.currentPeriodEnd
    );
    
    // Sync missing data in parallel
    await Promise.all(
      subscriptionsToSync.map(async (sub) => {
        try {
          console.log(`Syncing subscription ${sub.subscriptionId} from Stripe...`);
          const stripeSub = await this.stripe.subscriptions.retrieve(sub.subscriptionId);
          const synced = await this.syncSubscription(stripeSub);
          console.log(`Synced subscription ${sub.subscriptionId}: periodStart=${synced?.currentPeriodStart}, periodEnd=${synced?.currentPeriodEnd}`);
        } catch (err) {
          console.error(`Failed to sync subscription ${sub.subscriptionId}:`, err);
        }
      })
    );
    
    // Return updated subscriptions with period start/end or endedAt as fallback
    const updatedSubscriptions = await this.subscriptionModel.find().sort({ createdAt: -1 });
    
    // Transform to include periodStart and periodEnd fields
    return updatedSubscriptions.map((sub: any) => {
      const subObj = sub.toObject();
      
      // Calculate period dates if missing
      if (!subObj.currentPeriodStart || !subObj.currentPeriodEnd) {
        const baseDate = subObj.updatedAt || subObj.createdAt || new Date();
        const interval = subObj.interval || 'month';
        const intervalCount = subObj.intervalCount || 1;
        const calculated = this.calculatePeriodDates(baseDate, interval, intervalCount);
        
        subObj.periodStart = subObj.currentPeriodStart || calculated.start;
        subObj.periodEnd = subObj.currentPeriodEnd || subObj.endedAt || calculated.end;
      } else {
        subObj.periodStart = subObj.currentPeriodStart;
        subObj.periodEnd = subObj.currentPeriodEnd || subObj.endedAt || null;
      }
      
      return subObj;
    });
  }

  // Get subscription by ID from database
  async getSubscriptionFromDb(subscriptionId: string) {
    return await this.subscriptionModel.findOne({ subscriptionId });
  }

  // Get subscriptions by customer email
  async getSubscriptionsByEmail(email: string) {
    const subscriptions = await this.subscriptionModel.find({ customerEmail: email }).sort({ createdAt: -1 });
    
    // For subscriptions missing period start or end, fetch fresh data from Stripe
    const subscriptionsToSync = subscriptions.filter(
      sub => !sub.currentPeriodStart || !sub.currentPeriodEnd
    );
    
    // Sync missing data in parallel
    await Promise.all(
      subscriptionsToSync.map(async (sub) => {
        try {
          console.log(`Syncing subscription ${sub.subscriptionId} from Stripe...`);
          const stripeSub = await this.stripe.subscriptions.retrieve(sub.subscriptionId);
          const synced = await this.syncSubscription(stripeSub);
          console.log(`Synced subscription ${sub.subscriptionId}: periodStart=${synced?.currentPeriodStart}, periodEnd=${synced?.currentPeriodEnd}`);
        } catch (err) {
          console.error(`Failed to sync subscription ${sub.subscriptionId}:`, err);
        }
      })
    );
    
    // Return updated subscriptions with period start/end or endedAt as fallback
    const updatedSubscriptions = await this.subscriptionModel.find({ customerEmail: email }).sort({ createdAt: -1 });
    
    // Transform to include periodStart and periodEnd fields
    return updatedSubscriptions.map((sub: any) => {
      const subObj = sub.toObject();
      
      // Calculate period dates if missing
      if (!subObj.currentPeriodStart || !subObj.currentPeriodEnd) {
        const baseDate = subObj.updatedAt || subObj.createdAt || new Date();
        const interval = subObj.interval || 'month';
        const intervalCount = subObj.intervalCount || 1;
        const calculated = this.calculatePeriodDates(baseDate, interval, intervalCount);
        
        subObj.periodStart = subObj.currentPeriodStart || calculated.start;
        subObj.periodEnd = subObj.currentPeriodEnd || subObj.endedAt || calculated.end;
      } else {
        subObj.periodStart = subObj.currentPeriodStart;
        subObj.periodEnd = subObj.currentPeriodEnd || subObj.endedAt || null;
      }
      
      return subObj;
    });
  }

  // Get active subscriptions count
  async getActiveSubscriptionsCount() {
    return await this.subscriptionModel.countDocuments({ status: 'active' });
  }

  // Get subscription stats
  async getSubscriptionStats() {
    const total = await this.subscriptionModel.countDocuments();
    const active = await this.subscriptionModel.countDocuments({ status: 'active' });
    const canceled = await this.subscriptionModel.countDocuments({ status: 'canceled' });
    const trialing = await this.subscriptionModel.countDocuments({ status: 'trialing' });
    const pastDue = await this.subscriptionModel.countDocuments({ status: 'past_due' });

    return {
      total,
      active,
      canceled,
      trialing,
      pastDue,
    };
  }

  // Create customer portal session (for self-service subscription management)
  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    return await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }
}

