import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { RefundService } from './refund.service';

@Controller('refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  // ----------------------------------------------------------
  // 1️⃣ CREATE REFUND
  // ----------------------------------------------------------
  @Post('create')
  async createRefund(
    @Body()
    body: { paymentIntentId: string; amount?: number; reason?: string }
  ) {
    const { paymentIntentId, amount, reason } = body;

    if (!paymentIntentId) {
      return { message: 'paymentIntentId is required' };
    }

    const refund = await this.refundService.createRefund(
      paymentIntentId,
      amount,
      reason
    );

    return {
      message: 'Refund created successfully',
      refund,
    };
  }

  // ----------------------------------------------------------
  // 2️⃣ GET REFUND STATUS FROM STRIPE
  // ----------------------------------------------------------
  @Get('status/:refundId')
  async getRefundStatus(@Param('refundId') refundId: string) {
    return await this.refundService.getRefundStatus(refundId);
  }

  // ----------------------------------------------------------
  // 3️⃣ LIST REFUNDS FROM STRIPE
  // ----------------------------------------------------------
  @Get('stripe-list')
  async listRefunds(@Query('limit') limit?: number) {
    return await this.refundService.listRefunds(limit || 20);
  }

  // ----------------------------------------------------------
  // 4️⃣ LIST ALL REFUNDS FROM MONGODB
  // ----------------------------------------------------------
  @Get('db-list')
  async listRefundRecords() {
    return await this.refundService.getAllRefundRecords();
  }

  // ----------------------------------------------------------
  // 5️⃣ GET REFUNDS BY PAYMENT INTENT
  // ----------------------------------------------------------
  @Get('payment/:paymentIntentId')
  async getByPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string
  ) {
    return await this.refundService.getRefundsForPayment(paymentIntentId);
  }
}
