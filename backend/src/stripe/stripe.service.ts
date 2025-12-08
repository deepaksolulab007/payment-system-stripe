import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    // Get Stripe secret key from .env file
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is missing from environment variables');
    }

    // Initialize Stripe client
    this.stripe = new Stripe(secretKey);
  }

  // ==============================
  // Create PaymentIntent
  // ==============================
async createPaymentIntent(amount: number, currency = 'usd') {
  return await this.stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: {
      enabled: true, // Allows Stripe to use the best available payment method
    },
  });
}

  // ==============================
  // Create Customer
  // ==============================
  async createCustomer(email: string, name: string) {
    return await this.stripe.customers.create({
      email,
      name,
    });
  }

  // ==============================
  // Retrieve PaymentIntent status
  // ==============================
  async retrievePaymentIntent(id: string) {
    return await this.stripe.paymentIntents.retrieve(id);
  }

  // ==============================
  // Cancel a PaymentIntent
  // ==============================
  async cancelPaymentIntent(id: string) {
    return await this.stripe.paymentIntents.cancel(id);
  }
}
