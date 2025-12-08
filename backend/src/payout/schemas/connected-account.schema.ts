import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class ConnectedAccount extends Document {
  @Prop({ required: true })
  accountId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: false })
  detailsSubmitted: boolean;

  @Prop({ default: false })
  payoutsEnabled: boolean;

  @Prop({ default: false })
  chargesEnabled: boolean;

  @Prop({ default: false })
  isVerified: boolean; // our unified verification flag
}

export const ConnectedAccountSchema =
  SchemaFactory.createForClass(ConnectedAccount);
