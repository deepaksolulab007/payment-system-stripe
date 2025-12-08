// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import Stripe from 'stripe';

// @Injectable()
// export class RefundService {
//   private stripe: Stripe;

//   constructor(@InjectModel('Refund') private refundModel: Model<any>) {
//     // Use your actual API version or let Stripe auto-detect
//     this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//       apiVersion: "2025-11-17.clover" as any, 
//     });
//   }

//   async createRefund(
//     paymentIntentId: string,
//     amount?: number,
//     reason?: string
//   ) {
//     // Stripe expects reason to match a union type
//     const validReason = reason as
//       | 'duplicate'
//       | 'fraudulent'
//       | 'requested_by_customer'
//       | undefined;

//     // 1️⃣ Create refund in Stripe
//     const refund = await this.stripe.refunds.create({
//       payment_intent: paymentIntentId,
//       amount: amount || undefined,
//       reason: validReason,
//     });

//     // 2️⃣ Save refund in DB
//     const savedRefund = new this.refundModel({
//       refundId: refund.id,
//       paymentIntentId,
//       amount: refund.amount,
//       currency: refund.currency,
//       status: refund.status,
//       reason: validReason,
//     });

//     await savedRefund.save();

//     return savedRefund;
//   }

//   // =========================================================
//   // SUPPORTING APIS YOU REQUESTED
//   // =========================================================

//   /** Get status of refund */
//   async getRefundStatus(refundId: string) {
//     const refund = await this.stripe.refunds.retrieve(refundId);
//     return refund;
//   }

//   /** Get list of all refunds */
//   async listRefunds(limit = 20) {
//     return await this.stripe.refunds.list({ limit });
//   }

//   /** Get all refund records stored in MongoDB */
//   async getAllRefundRecords() {
//     return await this.refundModel.find().sort({ createdAt: -1 });
//   }

//   /** Get refunds for a particular paymentIntent */
//   async getRefundsForPayment(paymentIntentId: string) {
//     return await this.refundModel.find({ paymentIntentId });
//   }
// }


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
