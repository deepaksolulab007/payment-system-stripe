import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CancelSubscriptionDto {
  @IsNotEmpty()
  subscriptionId: string;

  @IsOptional()
  @IsBoolean()
  cancelImmediately?: boolean; // If true, cancel now. If false, cancel at period end
}

