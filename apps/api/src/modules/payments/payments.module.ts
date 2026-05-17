import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymobClient } from './providers/paymob.client';
import { MockPaymobClient } from './providers/mock-paymob.client';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from './providers/payment-provider.interface';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): PaymentProvider => {
        const apiKey = config.get<string>('paymob.apiKey');
        const integrationId = config.get<string>('paymob.integrationId');
        const iframeId = config.get<string>('paymob.iframeId');
        const hmacSecret = config.get<string>('paymob.hmacSecret');
        const mockBaseUrl =
          config.get<string>('paymob.mockBaseUrl') ?? 'http://localhost:3000';

        // Real Paymob requires the full set of credentials, AND none of
        // them can look like a placeholder. The .env.example shipped with
        // `your_paymob_api_key` etc.; treat anything containing "your_"
        // or "replace_me" as still-unset so a freshly-copied .env doesn't
        // try to hit real Paymob with garbage.
        const looksReal = (v?: string) =>
          Boolean(v) && !/^your_|replace_me/i.test(v ?? '');
        const allSet =
          looksReal(apiKey) &&
          looksReal(integrationId) &&
          looksReal(iframeId) &&
          looksReal(hmacSecret);

        if (allSet) {
          Logger.log(
            'Paymob credentials detected — using real Paymob client',
            'PaymentsModule',
          );
          return new PaymobClient({
            apiKey: apiKey!,
            integrationId: integrationId!,
            iframeId: iframeId!,
            hmacSecret: hmacSecret!,
          });
        }
        return new MockPaymobClient(mockBaseUrl);
      },
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
