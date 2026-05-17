'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Receipt } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { useMyOrders } from '@/hooks/use-orders';
import { useAuthStore } from '@/store/auth-store';
import type { OrderStatus } from '@/lib/api-types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'text-warning border-warning/40',
  CONFIRMED: 'text-primary border-primary/40',
  PREPARING: 'text-primary border-primary/40',
  READY: 'text-primary border-primary/40',
  OUT_FOR_DELIVERY: 'text-primary border-primary/40',
  DELIVERED: 'text-success border-success/40',
  CANCELLED: 'text-accent border-accent/40',
};

export default function OrdersPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const customer = useAuthStore((s) => s.customer);
  const { data: orders, isLoading } = useMyOrders();

  useEffect(() => {
    if (hydrated && !customer) {
      router.replace(`/login?next=${encodeURIComponent('/orders')}`);
    }
  }, [hydrated, customer, router]);

  if (!hydrated || !customer) {
    return (
      <main id="main-content" className="bg-mesh-gold grid min-h-screen place-items-center">
        <Loader2 className="text-primary animate-spin" />
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-mesh-gold min-h-screen pt-28 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <p className="text-muted text-xs tracking-[0.2em] uppercase">
            Hello, {customer.name.split(' ')[0]}
          </p>
          <h1 className="font-display text-foreground mt-2 text-4xl sm:text-5xl">Your orders</h1>
          <p className="text-muted mt-2 text-sm">A trail of perfectly wood-fired moments.</p>

          {isLoading ? (
            <div className="text-muted mt-12 flex items-center justify-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="bg-surface/40 border-border mt-12 flex flex-col items-center gap-4 rounded-2xl border px-6 py-12 text-center">
              <div className="bg-surface grid size-16 place-items-center rounded-full">
                <Receipt className="text-muted size-7" />
              </div>
              <div>
                <h2 className="font-display text-foreground text-2xl">No orders yet</h2>
                <p className="text-muted mt-2 text-sm">Your first order is just a tap away.</p>
              </div>
              <Button asChild>
                <Link href="/menu">Browse the menu</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-10 space-y-4">
              {orders.map((order, i) => (
                <motion.li
                  key={order.id}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={`/order/${order.id}`}
                    className="bg-surface/40 hover:bg-surface group border-border hover:border-primary/40 flex items-center gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-gold)]"
                  >
                    <div className="bg-surface-elevated text-primary grid size-12 shrink-0 place-items-center rounded-xl">
                      <Receipt className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-foreground font-display text-lg tracking-wide">
                          {order.orderNumber}
                        </span>
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-[10px] tracking-wide uppercase',
                            STATUS_STYLES[order.status],
                          )}
                        >
                          {order.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <p className="text-muted mt-1 line-clamp-1 text-xs">
                        {new Date(order.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                        {' · '}
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-primary text-xl tabular-nums">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-muted text-[10px] tracking-wide uppercase">
                        {order.type.replace('_', ' ').toLowerCase()}
                      </p>
                    </div>
                    <ArrowRight className="text-muted group-hover:text-primary size-4 shrink-0 transition-all group-hover:translate-x-1" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
