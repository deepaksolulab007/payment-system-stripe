import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ============================================
  // PRODUCT & PRICE ENDPOINTS
  // ============================================

  // Create a new product
  @Post('product/create')
  async createProduct(
    @Body() body: { name: string; description?: string }
  ) {
    if (!body.name) {
      throw new BadRequestException('Product name is required');
    }

    const product = await this.subscriptionService.createProduct(
      body.name,
      body.description
    );

    return {
      message: 'Product created successfully',
      product,
    };
  }

  // Create a price for a product
  @Post('price/create')
  async createPrice(
    @Body() body: {
      productId: string;
      amount: number;
      currency?: string;
      interval?: 'day' | 'week' | 'month' | 'year';
      intervalCount?: number;
    }
  ) {
    if (!body.productId || !body.amount) {
      throw new BadRequestException('Product ID and amount are required');
    }

    const price = await this.subscriptionService.createPrice(
      body.productId,
      body.amount,
      body.currency || 'usd',
      body.interval || 'month',
      body.intervalCount || 1
    );

    return {
      message: 'Price created successfully',
      price,
    };
  }

  // List all products
  @Get('products')
  async listProducts(@Query('limit') limit?: number) {
    return await this.subscriptionService.listProducts(limit || 10);
  }

  // List all prices
  @Get('prices')
  async listPrices(
    @Query('productId') productId?: string,
    @Query('limit') limit?: number
  ) {
    return await this.subscriptionService.listPrices(productId, limit || 10);
  }

  // Archive/Deactivate a product (sets active: false)
  @Post('product/archive/:productId')
  async archiveProduct(@Param('productId') productId: string) {
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    const product = await this.subscriptionService.archiveProduct(productId);

    return {
      message: 'Product archived successfully',
      product,
    };
  }

  // Archive/Deactivate a price (sets active: false)
  @Post('price/archive/:priceId')
  async archivePrice(@Param('priceId') priceId: string) {
    if (!priceId) {
      throw new BadRequestException('Price ID is required');
    }

    const price = await this.subscriptionService.archivePrice(priceId);

    return {
      message: 'Price archived successfully',
      price,
    };
  }

  // ============================================
  // SUBSCRIPTION CHECKOUT (Stripe Hosted)
  // ============================================

  // Create checkout session for subscription
  @Post('checkout')
  async createCheckout(
    @Body() body: {
      email: string;
      priceId: string;
      successUrl?: string;
      cancelUrl?: string;
      trialDays?: number;
      oneTime?: boolean; // If true, subscription will cancel at period end (no auto-renewal)
    }
  ) {
    if (!body.email || !body.priceId) {
      throw new BadRequestException('Email and priceId are required');
    }

    const successUrl = body.successUrl || 'http://localhost:5173/subscription/success?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl = body.cancelUrl || 'http://localhost:5173/subscription/canceled';

    const session = await this.subscriptionService.createSubscriptionCheckout(
      body.email,
      body.priceId,
      successUrl,
      cancelUrl,
      body.trialDays,
      body.oneTime
    );

    return {
      message: 'Checkout session created',
      sessionId: session.id,
      url: session.url,
    };
  }

  // ============================================
  // DIRECT SUBSCRIPTION MANAGEMENT
  // ============================================

  // Create subscription directly (for custom UI with Stripe Elements)
  @Post('create')
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    const customer = await this.subscriptionService.findOrCreateCustomer(
      dto.email,
      dto.name
    );

    const subscription = await this.subscriptionService.createSubscription(
      customer.id,
      dto.priceId,
      undefined,
      dto.trialDays,
      dto.oneTime
    );

    return {
      message: dto.oneTime 
        ? 'One-time subscription created (will cancel at period end)'
        : 'Subscription created',
      subscription,
      customerId: customer.id,
    };
  }

  // Get subscription details from Stripe
  @Get('details/:subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    return await this.subscriptionService.getSubscription(subscriptionId);
  }

  // Cancel subscription
  @Post('cancel')
  async cancelSubscription(@Body() dto: CancelSubscriptionDto) {
    const subscription = await this.subscriptionService.cancelSubscription(
      dto.subscriptionId,
      dto.cancelImmediately || false
    );

    const message = dto.cancelImmediately
      ? 'Subscription canceled immediately'
      : 'Subscription will be canceled at the end of the billing period';

    return {
      message,
      subscription,
    };
  }

  // Resume subscription (if set to cancel at period end)
  @Post('resume')
  async resumeSubscription(@Body() body: { subscriptionId: string }) {
    if (!body.subscriptionId) {
      throw new BadRequestException('Subscription ID is required');
    }

    const subscription = await this.subscriptionService.resumeSubscription(
      body.subscriptionId
    );

    return {
      message: 'Subscription resumed successfully',
      subscription,
    };
  }

  // Update subscription (change plan)
  @Post('update')
  async updateSubscription(
    @Body() body: { subscriptionId: string; newPriceId: string }
  ) {
    if (!body.subscriptionId || !body.newPriceId) {
      throw new BadRequestException('Subscription ID and new price ID are required');
    }

    const subscription = await this.subscriptionService.updateSubscription(
      body.subscriptionId,
      body.newPriceId
    );

    return {
      message: 'Subscription updated successfully',
      subscription,
    };
  }

  // List customer subscriptions
  @Get('customer/:customerId')
  async listCustomerSubscriptions(@Param('customerId') customerId: string) {
    return await this.subscriptionService.listCustomerSubscriptions(customerId);
  }

  // ============================================
  // DATABASE QUERIES
  // ============================================

  // Get all subscriptions from database
  @Get('all')
  async getAllSubscriptions() {
    return await this.subscriptionService.getAllSubscriptions();
  }

  // Get subscription by ID from database
  @Get('db/:subscriptionId')
  async getSubscriptionFromDb(@Param('subscriptionId') subscriptionId: string) {
    return await this.subscriptionService.getSubscriptionFromDb(subscriptionId);
  }

  // Get subscriptions by email
  @Get('by-email/:email')
  async getSubscriptionsByEmail(@Param('email') email: string) {
    return await this.subscriptionService.getSubscriptionsByEmail(email);
  }

  // Get subscription stats
  @Get('stats')
  async getSubscriptionStats() {
    return await this.subscriptionService.getSubscriptionStats();
  }

  // ============================================
  // CUSTOMER PORTAL
  // ============================================

  // Create customer portal session for self-service management
  @Post('portal')
  async createPortalSession(
    @Body() body: { customerId: string; returnUrl?: string }
  ) {
    if (!body.customerId) {
      throw new BadRequestException('Customer ID is required');
    }

    const returnUrl = body.returnUrl || 'http://localhost:5173/subscription/manage';

    const session = await this.subscriptionService.createCustomerPortalSession(
      body.customerId,
      returnUrl
    );

    return {
      message: 'Portal session created',
      url: session.url,
    };
  }
}

