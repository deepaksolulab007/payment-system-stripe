import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: String, required: true })
  paymentIntentId: string;

  @Prop({ type: String, required: true })
  chargeId: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  currency: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String })
  paymentMethodType?: string;

  @Prop({ type: String })
  receiptEmail?: string;

  @Prop({ type: String })
  customerId?: string;

  @Prop({ type: String })
  description?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
