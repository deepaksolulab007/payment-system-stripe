import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateAccountDto {
  @IsEmail()
  email: string;
}