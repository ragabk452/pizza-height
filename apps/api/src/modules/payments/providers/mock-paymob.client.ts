import { Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import type {
  CreateSessionParams,
  CreateSessionResult,
  PaymentProvider,
  WebhookPayload,
} from './payment-provider.interface';

/**
 * Mock provider used when no Paymob credentials are configured. Returns an
 * iframeUrl that points at the web app's local /payment/mock page, so the
 * full CARD flow can be demonstrated end-to-end (form → simulated callback
 * → status flip) without any third-party HTTP.
 *
 * The mock signs its webhook payload with a deterministic HMAC so the
 * service-side verification path is the same as the real provider.
 */
const MOCK_HMAC_SECRET = 'mock-paymob-hmac-secret';

export class MockPaymobClient implements PaymentProvider {
  readonly name = 'mock' as const;
  readonly isReal = false;
  private readonly logger = new Logger(MockPaymobClient.name);

  constructor(private readonly mockPageBaseUrl: string) {
    this.logger.warn(
      'Using MOCK payment provider — set PAYMOB_API_KEY in apps/api/.env to enable real Paymob sandbox.',
    );
  }

  async createSession(
    params: CreateSessionParams,
  ): Promise<CreateSessionResult> {
    // Treat the merchant ref as both the session ref and the provider order
    // id — there's only one identifier in the mock world.
    const sessionRef = `mock_${params.merchantOrderRef}_${Date.now().toString(36)}`;
    const q = new URLSearchParams({
      session: sessionRef,
      amount: params.amount.toFixed(2),
      currency: params.currency,
      order: params.merchantOrderRef,
      id: params.merchantOrderId,
    });
    return {
      iframeUrl: `${this.mockPageBaseUrl}/payment/mock?${q.toString()}`,
      sessionRef,
      providerOrderId: sessionRef,
      raw: { mode: 'mock', requestedAt: new Date().toISOString() },
    };
  }

  /**
   * Mock webhook payloads are JSON `{ sessionRef, success }` signed with
   * the static mock secret. The mock /payment/mock page (or a direct
   * curl from a test) computes the HMAC and posts it to /payments/webhook.
   * The verification logic is identical in shape to the real Paymob path —
   * we just sign the JSON body rather than Paymob's ordered field list.
   */
  verifyAndParseWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): WebhookPayload {
    const bodyStr =
      typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const headerHmac = (headers['x-paymob-hmac'] as string | undefined) ?? '';
    const expected = crypto
      .createHmac('sha512', MOCK_HMAC_SECRET)
      .update(bodyStr)
      .digest('hex');
    if (headerHmac.toLowerCase() !== expected.toLowerCase()) {
      throw new Error('Invalid mock HMAC');
    }
    const parsed = JSON.parse(bodyStr) as {
      sessionRef?: string;
      merchantOrderRef?: string;
      success?: boolean;
    };
    if (!parsed.sessionRef) throw new Error('Missing sessionRef');
    return {
      success: Boolean(parsed.success),
      sessionRef: parsed.sessionRef,
      merchantOrderRef: parsed.merchantOrderRef,
      transactionId: `mock_${Date.now()}`,
      raw: parsed,
    };
  }

  /**
   * Exposed so the mock controller can issue a properly-signed callback
   * without duplicating the HMAC plumbing on the test side.
   */
  static signMockPayload(body: object): {
    bodyStr: string;
    hmac: string;
  } {
    const bodyStr = JSON.stringify(body);
    const hmac = crypto
      .createHmac('sha512', MOCK_HMAC_SECRET)
      .update(bodyStr)
      .digest('hex');
    return { bodyStr, hmac };
  }
}
