import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

/**
 * Body the web app's /payment/mock page POSTs to /payments/mock/complete
 * — the API then forges a valid mock webhook payload and feeds it through
 * the same handler the real Paymob webhook uses.
 */
export class MockPayDto {
  @ApiProperty({
    description: 'Session ref returned by createCheckoutSession.',
  })
  @IsString()
  sessionRef!: string;

  @ApiProperty({ description: 'Whether the simulated payment should succeed.' })
  @IsBoolean()
  success!: boolean;
}
