// // src/payout/dto/create-account.dto.ts
// import { IsEmail, IsOptional, IsString } from 'class-validator';

// export class CreateAccountDto {
//   @IsOptional()
//   @IsEmail({}, { message: 'Invalid email format' })
//   email?: string;

//   @IsOptional()
//   @IsString({ message: 'country must be string (ISO code)' })
//   country?: string;
// }


import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateAccountDto {
  @IsEmail()
  email: string;
}