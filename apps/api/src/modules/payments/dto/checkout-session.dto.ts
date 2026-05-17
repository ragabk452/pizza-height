import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponse {
  @ApiProperty({
    description:
      'Hosted payment URL the customer should be redirected to (Paymob iframe or, in mock mode, the local /payment/mock page).',
  })
  iframeUrl!: string;

  @ApiProperty({ description: 'Opaque session reference for support.' })
  sessionRef!: string;

  @ApiProperty({ description: 'Provider name — "paymob" or "mock".' })
  provider!: 'paymob' | 'mock';
}
