import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class RegisterUserRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsPhoneNumber()
  phone: string;
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
