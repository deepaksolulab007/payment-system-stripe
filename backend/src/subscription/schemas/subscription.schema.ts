import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true })
  subscriptionId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop()
  customerEmail: string;

  @Prop({ required: true })
  priceId: string;

  @Prop()
  productId: string;

  @Prop()
  productName: string;

  @Prop({ required: true })
  status: string; // active, canceled, past_due, unpaid, trialing, incomplete, incomplete_expired, paused

  @Prop()
  currentPeriodStart: Date;

  @Prop()
  currentPeriodEnd: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;

  @Prop()
  canceledAt: Date;

  @Prop()
  endedAt: Date;

  @Prop()
  trialStart: Date;

  @Prop()
  trialEnd: Date;

  @Prop()
  interval: string; // month, year, week, day

  @Prop()
  intervalCount: number;

  @Prop()
  amount: number;

  @Prop()
  currency: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

