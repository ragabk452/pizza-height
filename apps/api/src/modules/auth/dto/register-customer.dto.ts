import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({ example: 'Sara Khalil' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: '+201001112222' })
  @IsPhoneNumber()
  phone!: string;

  @ApiPropertyOptional({ example: 'sara@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'StrongPass2026!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class CustomerLoginDto {
  @ApiProperty({ example: '+201001112222' })
  @IsPhoneNumber()
  phone!: string;

  @ApiProperty({ example: 'StrongPass2026!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
