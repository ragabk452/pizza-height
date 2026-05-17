import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'WELCOME20' })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code!: string;

  @ApiProperty({ description: 'Current cart subtotal (before tax/fees)' })
  @IsNumber()
  @Min(0)
  subtotal!: number;
}
