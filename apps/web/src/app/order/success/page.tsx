'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Loader2, MapPin } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Confetti } from '@/components/order/confetti';
import { useOrder } from '@/hooks/use-orders';
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
  const orderId = params.get('id') ?? undefined;
  // Confetti is one-shot — unmount after the animation finishes so the 80
  // absolutely-positioned spans (z-30) don't sit invisibly over the page.
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);
  const { data: order, isLoading } = useOrder(orderId);
  // The ETA depends on the wall-clock; tick once a minute so it stays accurate
  // without re-rendering on every frame.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!orderId) router.replace('/menu');
  }, [orderId, router]);

  // If the user lands here without a session (e.g. they cleared cookies after
  // placing the order), bounce them to /login so useOrder can succeed.
  const hydrated = useAuthStore((s) => s.hydrated);
  const customer = useAuthStore((s) => s.customer);
  useEffect(() => {
    if (hydrated && !customer && orderId) {
      router.replace(`/login?next=${encodeURIComponent(`/order/success?id=${orderId}`)}`);
    }
  }, [hydrated, customer, orderId, router]);

  if (isLoading || !order) {
    return (
      <div className="bg-mesh-gold grid min-h-screen place-items-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  const estReady = order.estimatedReadyAt ? new Date(order.estimatedReadyAt) : null;
  const etaMinutes = estReady ? Math.max(Math.round((estReady.getTime() - now) / 60_000), 0) : null;

  return (
    <>
      <Navbar />
      {showConfetti && <Confetti />}
      <main className="bg-mesh-gold relative min-h-screen overflow-hidden pt-32 pb-24">
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
            Order placed
          </motion.h1>

          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.55 }}
            className="text-muted mt-3 text-lg"
          >
            Thank you. Your masterpiece is on its way to the wood-fired oven.
          </motion.p>

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
                <MapPin className="size-3.5" /> Total paid (on delivery)
              </div>
              <p className="text-foreground font-display mt-2 text-2xl tabular-nums">
                ${order.total.toFixed(2)}
              </p>
              <p className="text-muted mt-1 text-xs">
                {order.items.reduce((s, i) => s + i.quantity, 0)}{' '}
                {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                {order.payment?.method.toLowerCase() ?? 'cash'}
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
            <Button asChild size="lg">
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
