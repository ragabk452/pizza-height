'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bike, Building2, Store } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Order, OrderType } from '@/lib/api-types';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<OrderType, React.ComponentType<{ className?: string }>> = {
  DELIVERY: Bike,
  PICKUP: Store,
  DINE_IN: Building2,
};

const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY']);

interface Props {
  orders: Order[] | undefined;
  loading?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OrdersTable({ orders, loading, selectedId, onSelect }: Props) {
  if (loading) {
    return (
      <div className="bg-surface/40 border-border rounded-2xl border p-6">
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface-elevated/60 h-14 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-surface/40 border-border rounded-2xl border px-6 py-20 text-center">
        <h3 className="font-display text-foreground text-xl">No orders yet</h3>
        <p className="text-muted mt-2 text-sm">
          When customers place orders, they’ll appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface/40 border-border overflow-hidden rounded-2xl border">
      <div className="border-border text-muted hidden border-b px-6 py-3 text-[10px] font-medium tracking-[0.15em] uppercase sm:grid sm:grid-cols-[7rem_1fr_8rem_7rem_5rem] sm:gap-4">
        <span>Order #</span>
        <span>Customer</span>
        <span>Status</span>
        <span className="text-right">Total</span>
        <span className="text-right">Time</span>
      </div>
      <ul className="divide-border divide-y">
        <AnimatePresence initial={false}>
          {orders.map((order) => {
            const TypeIcon = TYPE_ICON[order.type];
            const active = order.id === selectedId;
            const liveDot = ACTIVE_STATUSES.has(order.status);
            return (
              <motion.li
                key={order.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(order.id)}
                  className={cn(
                    'group flex w-full items-center gap-4 px-6 py-3 text-left transition-colors',
                    active ? 'bg-primary/5' : 'hover:bg-surface/60',
                  )}
                >
                  <div className="sm:grid sm:flex-1 sm:grid-cols-[7rem_1fr_8rem_7rem_5rem] sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'bg-surface-elevated text-primary grid size-8 place-items-center rounded-lg',
                          active && 'bg-primary text-background',
                        )}
                      >
                        <TypeIcon className="size-4" />
                      </span>
                      <span className="text-foreground font-display tracking-wide">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className="mt-1 sm:mt-0">
                      <p className="text-foreground line-clamp-1 text-sm font-medium">
                        {order.customer.name}
                      </p>
                      <p className="text-muted line-clamp-1 text-xs">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                        {order.customer.phone}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <StatusBadge status={order.status} pulse={liveDot} />
                    </div>
                    <div className="mt-2 text-right sm:mt-0">
                      <p className="text-foreground font-display text-lg tabular-nums">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-muted mt-1 text-right text-xs sm:mt-0">
                      {new Date(order.createdAt).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
