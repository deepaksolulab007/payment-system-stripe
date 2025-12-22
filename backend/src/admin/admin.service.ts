import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Payment') private paymentModel: Model<any>,
    @InjectModel('Refund') private refundModel: Model<any>,
    @InjectModel('Payout') private payoutModel: Model<any>,
    @InjectModel('Subscription') private subscriptionModel: Model<any>,
  ) {}

  async getDashboardStats() {
    const totalPayments = await this.paymentModel.countDocuments();
    const failedPayments = await this.paymentModel.countDocuments({
      status: 'failed',
    });

    const totalRefunds = await this.refundModel.countDocuments();

    const totalPayouts = await this.payoutModel.countDocuments();
    const failedPayouts = await this.payoutModel.countDocuments({
      status: 'failed',
    });

    // Subscription stats
    const totalSubscriptions = await this.subscriptionModel.countDocuments();
    const activeSubscriptions = await this.subscriptionModel.countDocuments({
      status: 'active',
    });
    const canceledSubscriptions = await this.subscriptionModel.countDocuments({
      status: 'canceled',
    });
    const trialingSubscriptions = await this.subscriptionModel.countDocuments({
      status: 'trialing',
    });

    return {
      totalPayments,
      failedPayments,
      totalRefunds,
      totalPayouts,
      failedPayouts,
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      trialingSubscriptions,
    };
  }
}
