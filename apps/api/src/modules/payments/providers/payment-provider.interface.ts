/**
 * Abstract interface every payment provider implements. Lets us swap a
 * real Paymob client for a mock during development / tests without
 * touching the orchestration in PaymentsService.
 */

export interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  street?: string;
  city?: string;
  country?: string;
}

export interface CreateSessionParams {
  amount: number; // in restaurant currency (we use $; provider will get cents)
  currency: string; // "USD" / "EGP"
  /** Our internal order number, e.g. PH-2026-0042 — used as the merchant_order_id. */
  merchantOrderRef: string;
  /** Our internal Order.id (cuid). Mock provider echoes it back so the
   * mock page can route to /order/[id] on cancel. The real Paymob client
   * doesn't need it. */
  merchantOrderId: string;
  billing: BillingData;
}

export interface CreateSessionResult {
  /** URL the customer's browser should be redirected to (iframe or hosted page). */
  iframeUrl: string;
  /** Provider's session/payment-key token (we store this for webhook lookup). */
  sessionRef: string;
  /** Provider's internal order id (we store this in Payment.providerId). */
  providerOrderId: string;
  /** Raw provider response — stored on Payment.providerPayload for audit. */
  raw: unknown;
}

export interface WebhookPayload {
  /** Whether the payment ultimately succeeded. */
  success: boolean;
  /** The session ref we got back from createSession — used to find the Payment row. */
  sessionRef: string;
  /** Optional merchant-side reference (PH-YYYY-NNNN) if provider echoes it. */
  merchantOrderRef?: string;
  /** Provider's own transaction id. */
  transactionId?: string;
  /** Raw payload — stored on Payment.providerPayload for audit. */
  raw: unknown;
}

export interface PaymentProvider {
  /** Human-readable provider name — written to Payment.providerName. */
  readonly name: 'paymob' | 'mock';
  /** Whether this provider is exercising real third-party HTTP. */
  readonly isReal: boolean;

  createSession(params: CreateSessionParams): Promise<CreateSessionResult>;

  /**
   * Verify the webhook signature and extract the canonical outcome. Throws
   * if the signature doesn't validate.
   */
  verifyAndParseWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): WebhookPayload;
}

/** Nest injection token. */
export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
