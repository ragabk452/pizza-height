import { Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';
import type {
  CreateSessionParams,
  CreateSessionResult,
  PaymentProvider,
  WebhookPayload,
} from './payment-provider.interface';

/**
 * Real Paymob sandbox client. The flow per Paymob's "Accept" docs:
 *   1. POST /api/auth/tokens          → auth_token (15-min lifetime)
 *   2. POST /api/ecommerce/orders     → paymob order id
 *   3. POST /api/acceptance/payment_keys → payment_key (the iframe token)
 *   4. Customer is redirected to https://accept.paymob.com/api/acceptance/iframes/{IFRAME_ID}?payment_token={payment_key}
 *   5. Paymob fires the callback to our webhook; HMAC is built from a
 *      concatenation of specific fields in the payload.
 *
 * Notes:
 * - Paymob amounts are in *cents* (so $24 → 2400).
 * - The HMAC algorithm is HMAC-SHA512 over a specific ordered field list.
 *   We verify whatever Paymob lists in their docs as the "transaction"
 *   processed callback fields.
 */
export class PaymobClient implements PaymentProvider {
  readonly name = 'paymob' as const;
  readonly isReal = true;
  private readonly logger = new Logger(PaymobClient.name);

  // Paymob base URL — same host for sandbox + production; the API key
  // selects the environment.
  private readonly base = 'https://accept.paymob.com/api';

  constructor(
    private readonly config: {
      apiKey: string;
      integrationId: string;
      iframeId: string;
      hmacSecret: string;
    },
  ) {}

  async createSession(
    params: CreateSessionParams,
  ): Promise<CreateSessionResult> {
    const amountCents = Math.round(params.amount * 100);

    // 1. Auth token
    const authToken = await this.fetchJson<{ token: string }>('/auth/tokens', {
      api_key: this.config.apiKey,
    }).then((r) => r.token);

    // 2. Register the order with Paymob
    const paymobOrder = await this.fetchJson<{ id: number }>(
      '/ecommerce/orders',
      {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: params.currency,
        merchant_order_id: params.merchantOrderRef,
        items: [],
      },
    );

    // 3. Get a payment key (the iframe token)
    const key = await this.fetchJson<{ token: string }>(
      '/acceptance/payment_keys',
      {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: paymobOrder.id,
        billing_data: {
          first_name: params.billing.firstName,
          last_name: params.billing.lastName,
          email: params.billing.email,
          phone_number: params.billing.phoneNumber,
          street: params.billing.street ?? 'NA',
          building: 'NA',
          floor: 'NA',
          apartment: 'NA',
          city: params.billing.city ?? 'NA',
          country: params.billing.country ?? 'EG',
          state: 'NA',
          postal_code: 'NA',
        },
        currency: params.currency,
        integration_id: Number(this.config.integrationId),
      },
    );

    return {
      iframeUrl: `${this.base}/acceptance/iframes/${this.config.iframeId}?payment_token=${key.token}`,
      sessionRef: key.token,
      providerOrderId: String(paymobOrder.id),
      raw: { authStep: 'omitted', orderId: paymobOrder.id, paymentKey: key },
    };
  }

  /**
   * Paymob HMAC is HMAC-SHA512 over the concatenated string-cast values of
   * specific fields in the callback body, in order. The signature is sent
   * either in the URL `?hmac=...` (transaction processed callback) or in
   * the request body's `hmac` field — we accept either.
   */
  verifyAndParseWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): WebhookPayload {
    const bodyStr =
      typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const parsed = JSON.parse(bodyStr) as {
      type?: string;
      obj?: PaymobTxnObj;
      hmac?: string;
    };
    const headerHmac =
      (headers['x-paymob-hmac'] as string | undefined) ?? parsed.hmac;
    if (!parsed.obj) throw new Error('Missing obj on Paymob webhook payload');
    const txn = parsed.obj;

    // Concatenate Paymob's fixed ordered field list — every field gets its
    // stringified value joined with no separator. The full list (per the
    // Paymob v2 docs) is:
    const ordered = [
      txn.amount_cents,
      txn.created_at,
      txn.currency,
      txn.error_occured,
      txn.has_parent_transaction,
      txn.id,
      txn.integration_id,
      txn.is_3d_secure,
      txn.is_auth,
      txn.is_capture,
      txn.is_refunded,
      txn.is_standalone_payment,
      txn.is_voided,
      txn.order?.id,
      txn.owner,
      txn.pending,
      txn.source_data?.pan,
      txn.source_data?.sub_type,
      txn.source_data?.type,
      txn.success,
    ]
      .map((v) => (v === undefined || v === null ? '' : String(v)))
      .join('');

    const expected = crypto
      .createHmac('sha512', this.config.hmacSecret)
      .update(ordered)
      .digest('hex');

    if (!headerHmac || headerHmac.toLowerCase() !== expected.toLowerCase()) {
      this.logger.warn('Paymob webhook HMAC mismatch — dropping');
      throw new Error('Invalid HMAC');
    }

    return {
      success: Boolean(txn.success) && !txn.error_occured,
      sessionRef: txn.order?.merchant_order_id ?? String(txn.order?.id ?? ''),
      merchantOrderRef: txn.order?.merchant_order_id,
      transactionId: String(txn.id),
      raw: parsed,
    };
  }

  private async fetchJson<T>(path: string, body: object): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Paymob ${path} failed ${res.status}: ${text.slice(0, 200)}`,
      );
    }
    return (await res.json()) as T;
  }
}

interface PaymobTxnObj {
  amount_cents?: number;
  created_at?: string;
  currency?: string;
  error_occured?: boolean;
  has_parent_transaction?: boolean;
  id?: number;
  integration_id?: number;
  is_3d_secure?: boolean;
  is_auth?: boolean;
  is_capture?: boolean;
  is_refunded?: boolean;
  is_standalone_payment?: boolean;
  is_voided?: boolean;
  order?: { id?: number; merchant_order_id?: string };
  owner?: number;
  pending?: boolean;
  source_data?: { pan?: string; sub_type?: string; type?: string };
  success?: boolean;
}
