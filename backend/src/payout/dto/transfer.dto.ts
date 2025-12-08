// // src/payout/dto/transfer.dto.ts
// import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
// import { Type } from 'class-transformer';

// export class TransferDto {
//   @IsString({ message: 'accountId must be a string' })
//   @IsNotEmpty({ message: 'accountId is required' })
//   accountId: string;

//   @Type(() => Number)
//   @IsNumber({}, { message: 'amount must be a number' })
//   @Min(1, { message: 'amount must be at least 1 (in cents)' })
//   amount: number;
// }


import { IsNotEmpty, IsNumber } from 'class-validator';

export class TransferDto {
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  amount: number;
}
