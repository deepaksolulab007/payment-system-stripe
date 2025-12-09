import { IsNotEmpty, IsNumber } from 'class-validator';

export class TransferDto {
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  amount: number;
}
