import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  type JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CheckoutSessionResponse } from './dto/checkout-session.dto';
import { MockPayDto } from './dto/mock-pay.dto';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from './providers/payment-provider.interface';
import { MockPaymobClient } from './providers/mock-paymob.client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly service: PaymentsService,
    @Inject(PAYMENT_PROVIDER)
    private readonly provider: PaymentProvider,
  ) {}

  @Post('checkout-session/:orderId')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Create a hosted-payment session for a CARD order. Returns iframe URL.',
  })
  async createSession(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ): Promise<CheckoutSessionResponse> {
    if (user.type !== 'customer') {
      throw new ForbiddenException('Only customers can pay');
    }
    return this.service.createCheckoutSession(orderId, user.sub);
  }

  /**
   * Public — the payment provider POSTs here from its server. We verify
   * the signature inside the service before trusting the body.
   *
   * IMPORTANT: this endpoint reads the *raw* body so the HMAC over the
   * exact bytes Paymob sent still verifies. main.ts mounts a raw-body
   * middleware on this path.
   */
  @Public()
  @SkipThrottle() // Paymob retries up to 10× with backoff — throttling would drop legitimate callbacks
  @Post('webhook/paymob')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paymob webhook — HMAC-verified, public endpoint' })
  async webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers() headers: Record<string, string>,
  ) {
    // body-parser stashed the raw bytes for us under `req.rawBody`.
    const raw = req.rawBody ?? JSON.stringify(req.body);
    return this.service.handleWebhook(raw, headers);
  }

  /**
   * Mock-mode helper used by the web app's /payment/mock page to simulate
   * a Paymob callback. Registered only when the mock provider is active;
   * with the real provider this 404s so it can't be abused in production.
   */
  @Public()
  @Post('mock/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      '(Mock provider only) Simulate a payment outcome — signs a mock webhook payload and runs it through the standard handler.',
  })
  async mockComplete(@Body() dto: MockPayDto) {
    if (this.provider.name !== 'mock') {
      throw new ForbiddenException(
        'Mock completion is only available when the mock provider is active',
      );
    }
    const { bodyStr, hmac } = MockPaymobClient.signMockPayload({
      sessionRef: dto.sessionRef,
      success: dto.success,
    });
    return this.service.handleWebhook(bodyStr, { 'x-paymob-hmac': hmac });
  }
}
