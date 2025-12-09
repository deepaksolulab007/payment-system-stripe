
import { IsNotEmpty, IsNumber } from 'class-validator';

export class PayoutDto {
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  amount: number;
}
