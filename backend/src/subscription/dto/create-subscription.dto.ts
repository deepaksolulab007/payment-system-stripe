import { IsEmail, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateSubscriptionDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  priceId: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsNumber()
  trialDays?: number;

  @IsOptional()
  @IsBoolean()
  oneTime?: boolean; // If true, subscription will cancel at period end (no auto-renewal)
}

