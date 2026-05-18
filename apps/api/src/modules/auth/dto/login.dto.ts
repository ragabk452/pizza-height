import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@pizzaheight.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin@2026', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
