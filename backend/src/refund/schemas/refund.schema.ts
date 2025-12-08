import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Refund extends Document {
  @Prop({ required: true })
  refundId: string;

  @Prop({ required: true })
  paymentIntentId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  reason?: string;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);
