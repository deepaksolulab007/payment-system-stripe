import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';

@Injectable()
export class PaymentService {
    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    ) { }

    async saveSuccessfulPayment(data: {
        paymentIntentId: string;
        chargeId: string;
        amount: number;
        currency: string;
        status: string;
        paymentMethodType?: string;
        receiptEmail?: string;
        customerId?: string;
        description?: string;
    }) {
        return await this.paymentModel.create(data);
    }
    async findAll() {
        return await this.paymentModel.find().sort({ createdAt: -1 });
  }

  async getLastPayments(limit: number) {
  return this.paymentModel
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

}
