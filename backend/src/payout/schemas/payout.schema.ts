import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Payout extends Document {
  @Prop({ required: true })
  payoutId: string;

  @Prop()
  amount: number;

  @Prop()
  currency: string;

  @Prop()
  status: string;

  @Prop()
  type: string;

  @Prop()
  failureCode?: string;

  @Prop()
  failureMessage?: string;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);
