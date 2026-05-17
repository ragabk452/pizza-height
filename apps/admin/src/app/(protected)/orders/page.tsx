'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { OrdersTable } from '@/components/orders/orders-table';
import { OrderDetailDrawer } from '@/components/orders/order-detail-drawer';
import { useStaffOrders } from '@/hooks/use-admin-data';
import { useStaffRealtime } from '@/hooks/use-staff-realtime';
import type { OrderStatus } from '@/lib/api-types';
import { cn } from '@/lib/utils';

const FILTERS: Array<{ key: 'ALL' | OrderStatus; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the way' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-mesh-gold grid min-h-screen place-items-center">
          <Loader2 className="text-primary animate-spin" />
        </div>
      }
    >
      <OrdersInner />
    </Suspense>
  );
}

function OrdersInner() {
  const router = useRouter();
  const params = useSearchParams();
  // Derive directly from the URL — keeping a separate state means browser
  // back/forward leaves the drawer showing a stale order.
  const selectedId = params.get('id');
  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');

  useStaffRealtime();

  const queryFilter = useMemo(
    () => (filter === 'ALL' ? undefined : { status: filter, limit: 100 }),
    [filter],
  );
  const { data: orders, isLoading } = useStaffOrders(queryFilter);

  const counts = useMemo(() => {
    const next: Record<string, number> = { ALL: orders?.length ?? 0 };
    for (const o of orders ?? []) next[o.status] = (next[o.status] ?? 0) + 1;
    return next;
  }, [orders]);

  const handleSelect = useCallback(
    (id: string) => {
      const next = new URLSearchParams(params.toString());
      next.set('id', id);
      router.replace(`/orders?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const handleClose = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    next.delete('id');
    const qs = next.toString();
    router.replace(qs ? `/orders?${qs}` : '/orders', { scroll: false });
  }, [params, router]);

  return (
    <>
      <Topbar
        title="Orders"
        subtitle="Live workflow — click a row to see the receipt and move it along."
      />

      <main className="flex-1 px-6 py-8 sm:px-8">
        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            const c = counts[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'relative inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                  active
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border bg-surface/40 text-muted hover:text-foreground hover:border-primary/40',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="orders-filter-pill"
                    className="bg-primary/10 absolute inset-0 rounded-full"
                    transition={{ duration: 0.25 }}
                  />
                )}
                <span className="relative">{f.label}</span>
                {typeof c === 'number' && (
                  <span
                    className={cn(
                      'relative rounded-full px-1.5 text-[10px] tabular-nums',
                      active ? 'bg-primary text-background' : 'bg-surface-elevated',
                    )}
                  >
                    {c}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <OrdersTable
            orders={orders}
            loading={isLoading}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </main>

      <OrderDetailDrawer orderId={selectedId} onClose={handleClose} />
    </>
  );
}
