'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, CreditCard, Loader2, MapPin } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Confetti } from '@/components/order/confetti';
import { useMyOrders, useOrder } from '@/hooks/use-orders';
import { useAuthStore } from '@/store/auth-store';

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-mesh-gold grid min-h-screen place-items-center">
          <Loader2 className="text-primary animate-spin" />
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}

function SuccessInner() {
  const router = useRouter();
  const params = useSearchParams();

  // Two entry points:
  //   - From our own checkout / mock page: `?id=<cuid>` (direct lookup).
  //   - From a real payment gateway redirect: `?orderNumber=PH-2026-XXXX`
  //     (Paymob echoes our merchant_order_id back, not the cuid).
  // For the orderNumber case we resolve it via the customer's own order list.
  const orderIdParam = params.get('id') ?? undefined;
  const orderNumberParam = params.get('orderNumber') ?? undefined;
  const { data: myOrders } = useMyOrders();
  const resolvedId =
    orderIdParam ??
    (orderNumberParam ? myOrders?.find((o) => o.orderNumber === orderNumberParam)?.id : undefined);

  // Auth guard
  const hydrated = useAuthStore((s) => s.hydrated);
  const customer = useAuthStore((s) => s.customer);
  useEffect(() => {
    if (hydrated && !customer && (orderIdParam || orderNumberParam)) {
      const back = orderIdParam
        ? `/order/success?id=${orderIdParam}`
        : `/order/success?orderNumber=${orderNumberParam}`;
      router.replace(`/login?next=${encodeURIComponent(back)}`);
    }
  }, [hydrated, customer, orderIdParam, orderNumberParam, router]);

  useEffect(() => {
    if (!orderIdParam && !orderNumberParam) router.replace('/menu');
  }, [orderIdParam, orderNumberParam, router]);

  const { data: order, isLoading } = useOrder(resolvedId, {
    pollWhilePending: true,
  });

  // Confetti is one-shot per page load — fire once payment is confirmed
  // (don't celebrate before the webhook lands for CARD orders). A ref
  // gates the "already fired" flag so the effect doesn't double-set state
  // (which the React Compiler lint rule rightly flags).
  const isPaid = order?.payment?.method === 'CASH' || order?.payment?.status === 'PAID';
  const firedRef = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (!isPaid || firedRef.current) return;
    firedRef.current = true;
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, [isPaid]);

  // ETA ticker
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (isLoading || !order) {
    return (
      <div className="bg-mesh-gold grid min-h-screen place-items-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  const estReady = order.estimatedReadyAt ? new Date(order.estimatedReadyAt) : null;
  const etaMinutes = estReady ? Math.max(Math.round((estReady.getTime() - now) / 60_000), 0) : null;

  const paymentMethod = order.payment?.method ?? 'CASH';
  const paymentLabel =
    paymentMethod === 'CASH'
      ? 'Total (cash on delivery)'
      : paymentMethod === 'CARD'
        ? 'Total paid by card'
        : 'Total paid';

  // While the CARD payment is still in flight, soften the celebration: the
  // big check stays, but we show a "Confirming payment…" pill and skip the
  // tracking CTA until the payment lands.
  const awaitingPayment = order.payment?.method !== 'CASH' && order.payment?.status === 'PENDING';

  return (
    <>
      <Navbar />
      {showConfetti && <Confetti />}
      <main
        id="main-content"
        className="bg-mesh-gold relative min-h-screen overflow-hidden pt-32 pb-24"
      >
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.45 }}
            className="bg-primary text-background mx-auto grid size-24 place-items-center rounded-full shadow-[var(--shadow-gold)]"
          >
            <Check className="size-12" strokeWidth={3} />
          </motion.div>

          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.55 }}
            className="font-display text-foreground mt-8 text-5xl sm:text-6xl"
          >
            {awaitingPayment ? 'Almost there' : 'Order placed'}
          </motion.h1>

          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.55 }}
            className="text-muted mt-3 text-lg"
          >
            {awaitingPayment
              ? 'Confirming your payment with the bank — this usually takes a few seconds.'
              : 'Thank you. Your masterpiece is on its way to the wood-fired oven.'}
          </motion.p>

          {awaitingPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-warning/10 text-warning border-warning/30 mx-auto mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs"
            >
              <Loader2 className="size-3.5 animate-spin" />
              Confirming payment…
            </motion.div>
          )}

          {/* Number card */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.55 }}
            className="bg-surface/60 border-border mx-auto mt-10 inline-flex flex-col items-center gap-1 rounded-2xl border px-10 py-6 backdrop-blur-md"
          >
            <span className="text-muted text-xs tracking-[0.2em] uppercase">Order number</span>
            <span className="font-display text-gradient-gold text-4xl tracking-wide">
              {order.orderNumber}
            </span>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.55 }}
            className="mt-10 grid gap-4 sm:grid-cols-2"
          >
            <div className="bg-surface/40 border-border rounded-2xl border p-5 text-left">
              <div className="text-primary flex items-center gap-2 text-xs tracking-wide uppercase">
                <Clock className="size-3.5" /> Estimated ready
              </div>
              <p className="text-foreground font-display mt-2 text-2xl">
                {etaMinutes !== null ? `~${etaMinutes} min` : 'Calculating…'}
              </p>
              {estReady && (
                <p className="text-muted mt-1 text-xs">
                  Around{' '}
                  {estReady.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
            <div className="bg-surface/40 border-border rounded-2xl border p-5 text-left">
              <div className="text-primary flex items-center gap-2 text-xs tracking-wide uppercase">
                {paymentMethod === 'CARD' ? (
                  <CreditCard className="size-3.5" />
                ) : (
                  <MapPin className="size-3.5" />
                )}{' '}
                {paymentLabel}
              </div>
              <p className="text-foreground font-display mt-2 text-2xl tabular-nums">
                ${order.total.toFixed(2)}
              </p>
              <p className="text-muted mt-1 text-xs">
                {order.items.reduce((s, i) => s + i.quantity, 0)}{' '}
                {order.items.length === 1 ? 'item' : 'items'} · {paymentMethod.toLowerCase()}
                {order.payment && ` · ${order.payment.status.toLowerCase()}`}
              </p>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.55 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" disabled={awaitingPayment}>
              <Link href={`/order/${order.id}`}>
                Track this order <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/menu">Order something else</Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </>
  );
}
