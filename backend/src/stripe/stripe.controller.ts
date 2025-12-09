import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('payments')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-intent')
async createPaymentIntent(
  @Body() body: { amount: number; currency?: string }
) {
  const { amount, currency } = body;

  if (!amount || amount <= 50) {
    throw new BadRequestException('Amount must be greater than 50 cent');
  }

  // Default currency = USD (user flow)
  const finalCurrency = currency?.toLowerCase() || 'usd';

  // Create PaymentIntent
  const paymentIntent = await this.stripeService.createPaymentIntent(
    amount,
    finalCurrency
  );

  return {
    message: 'PaymentIntent created successfully',
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    currency: finalCurrency,
    amount: amount,
  };
}


  // =====================
  // 2️⃣  Create Customer
  // =====================
  @Post('create-customer')
  async createCustomer(@Body() body: { email: string; name: string }) {
    const { email, name } = body;

    const customer = await this.stripeService.createCustomer(email, name);

    return {
      message: 'Customer created successfully',
      customer,
    };
  }

  // =====================
  // 3️⃣  Retrieve PaymentIntent Status
  // =====================
  @Post('intent-status')
  async getIntentStatus(@Body() body: { id: string }) {
    const { id } = body;

    const status = await this.stripeService.retrievePaymentIntent(id);

    return {
      message: 'PaymentIntent status fetched successfully',
      status,
    };
  }

  // =====================
  // 4️⃣  Cancel PaymentIntent
  // =====================
  @Post('cancel-intent')
  async cancelIntent(@Body() body: { id: string }) {
    const { id } = body;

    const cancelled = await this.stripeService.cancelPaymentIntent(id);

    return {
      message: 'PaymentIntent cancelled successfully',
      cancelled,
    };
  }
}
