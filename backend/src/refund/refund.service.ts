import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Refund } from "./schemas/refund.schema";

@Injectable()
export class RefundService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Refund.name) private refundModel: Model<Refund>
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>("STRIPE_SECRET_KEY")!,
      { apiVersion: "2025-11-17.clover" }
    );
  }

  // ⭐ CREATE REFUND
  async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: reason as any, // Stripe only accepts predefined strings
    });
  }

  // ⭐ GET REFUND STATUS FROM STRIPE
  async getRefundStatus(refundId: string) {
    return await this.stripe.refunds.retrieve(refundId);
  }

  // ⭐ LIST STRIPE REFUNDS
  async listRefunds(limit = 20) {
    return await this.stripe.refunds.list({ limit });
  }

  // ⭐ SAVE REFUND EVENT FROM WEBHOOK
  async storeRefundEvent(data: any) {
    return await this.refundModel.create({
      refundId: data.refundId,
      paymentIntentId: data.paymentIntentId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      reason: data.reason,
    });
  }

  // ⭐ LIST REFUND RECORDS FROM DATABASE
  async getAllRefundRecords() {
    return await this.refundModel.find().sort({ createdAt: -1 });
  }

  // ⭐ GET REFUNDS BY PAYMENT INTENT
  async getRefundsForPayment(paymentIntentId: string) {
    return await this.refundModel.find({ paymentIntentId });
  }
}
