'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2, XCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';

export default function OrderCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-mesh-gold grid min-h-screen place-items-center">
          <Loader2 className="text-primary animate-spin" />
        </div>
      }
    >
      <CancelledInner />
    </Suspense>
  );
}

function CancelledInner() {
  const params = useSearchParams();
  const orderNumber = params.get('orderNumber');

  return (
    <>
      <Navbar />
      <main className="bg-mesh-gold relative min-h-screen overflow-hidden pt-32 pb-24">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
            className="bg-accent/10 text-accent border-accent/40 mx-auto grid size-20 place-items-center rounded-full border"
          >
            <XCircle className="size-10" />
          </motion.div>

          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-display text-foreground mt-8 text-4xl sm:text-5xl"
          >
            Payment cancelled
          </motion.h1>

          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-muted mt-3 text-lg"
          >
            {orderNumber
              ? `Order ${orderNumber} was created but the payment didn't go through.`
              : 'The payment didn’t go through.'}{' '}
            Your cart is intact — try a different method whenever you’re ready.
          </motion.p>

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="/menu">Back to menu</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/orders">View your orders</Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </>
  );
}
