'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, Loader2, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';
import { ApiError, api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function MockPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-mesh-gold grid min-h-screen place-items-center">
          <Loader2 className="text-primary animate-spin" />
        </div>
      }
    >
      <MockPaymentInner />
    </Suspense>
  );
}

function MockPaymentInner() {
  const params = useSearchParams();
  const session = params.get('session') ?? '';
  const amount = params.get('amount') ?? '0.00';
  const currency = params.get('currency') ?? 'EGP';
  const orderRef = params.get('order') ?? '';
  const orderId = params.get('id') ?? '';

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [exp, setExp] = useState('12 / 28');
  const [cvc, setCvc] = useState('123');
  const [name, setName] = useState('Layla Hassan');
  const [pending, setPending] = useState<'pay' | 'cancel' | null>(null);

  async function complete(success: boolean) {
    setPending(success ? 'pay' : 'cancel');
    try {
      await api('/payments/mock/complete', {
        method: 'POST',
        body: { sessionRef: session, success },
        skipAuth: true,
      });
      // Drop the customer back on the order page — the success page polls
      // `/orders/:id` for the payment to flip to PAID, which the webhook
      // we just simulated has already done.
      const qs = orderId
        ? `?id=${encodeURIComponent(orderId)}`
        : orderRef
          ? `?orderNumber=${encodeURIComponent(orderRef)}`
          : '';
      window.location.href = success ? `/order/success${qs}` : `/order/cancelled${qs}`;
    } catch (err) {
      setPending(null);
      const message = err instanceof ApiError ? err.message : 'Could not complete payment';
      toast.error(message);
    }
  }

  // Order number is the merchant ref Paymob would echo back; show it as the
  // "merchant" so the page feels like a real gateway.
  return (
    <main
      id="main-content"
      className="bg-mesh-gold relative min-h-screen overflow-hidden pt-12 pb-24 sm:pt-20"
    >
      <div className="mx-auto w-full max-w-xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Link
            href="/menu"
            className="text-muted hover:text-primary inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to menu
          </Link>

          {/* Mock-mode disclosure ribbon */}
          <div className="bg-warning/10 text-warning border-warning/30 mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-xs">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>Sandbox / mock mode.</strong> No real payment is taken and no card details
              leave your browser. Set <code className="font-mono">PAYMOB_API_KEY</code> in{' '}
              <code className="font-mono">apps/api/.env</code> to enable the real Paymob sandbox.
            </p>
          </div>

          <div className="bg-surface border-border mt-6 overflow-hidden rounded-3xl border shadow-[var(--shadow-card)]">
            {/* "Merchant" header — mirrors what Paymob's hosted iframe looks like */}
            <div className="border-border flex items-center justify-between gap-3 border-b px-6 py-5">
              <div>
                <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Merchant</p>
                <p className="font-display text-foreground text-xl">Pizza Height</p>
                {orderRef && <p className="text-muted mt-0.5 font-mono text-xs">{orderRef}</p>}
              </div>
              <div className="text-right">
                <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Total</p>
                <p className="font-display text-gradient-gold text-3xl tabular-nums">
                  {currency} {amount}
                </p>
              </div>
            </div>

            <form
              className="space-y-4 px-6 py-6"
              onSubmit={(e) => {
                e.preventDefault();
                void complete(true);
              }}
            >
              <Field label="Cardholder name">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="cc-name"
                />
              </Field>
              <Field label="Card number" hint="Test card: 4242 4242 4242 4242">
                <div className="relative">
                  <TextInput
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="pl-10 font-mono"
                  />
                  <CreditCard className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expiry">
                  <TextInput
                    value={exp}
                    onChange={(e) => setExp(e.target.value)}
                    placeholder="MM / YY"
                    autoComplete="cc-exp"
                    className="font-mono"
                  />
                </Field>
                <Field label="CVC">
                  <div className="relative">
                    <TextInput
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                      className="pl-10 font-mono"
                    />
                    <Lock className="text-muted pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                  </div>
                </Field>
              </div>

              <Button type="submit" size="lg" className="mt-4 w-full" disabled={pending !== null}>
                {pending === 'pay' ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Check className="size-5" /> Pay {currency} {amount}
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => void complete(false)}
                disabled={pending !== null}
                className={cn(
                  'text-muted hover:text-accent flex w-full items-center justify-center gap-1 text-xs transition-colors disabled:opacity-50',
                )}
              >
                {pending === 'cancel' ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <XCircle className="size-3" />
                )}{' '}
                Cancel and decline the payment
              </button>
            </form>

            <div className="text-muted border-border border-t bg-black/20 px-6 py-3 text-center text-[10px] tracking-wide uppercase">
              Powered by Paymob (mocked) · session{' '}
              <span className="font-mono">{session.slice(-12)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
