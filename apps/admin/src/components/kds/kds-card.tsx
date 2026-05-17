'use client';

import { motion } from 'framer-motion';
import {
  Bike,
  Building2,
  Check,
  ChefHat,
  Loader2,
  Package,
  Phone,
  Store,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useTransitionOrder } from '@/hooks/use-admin-data';
import { ApiError } from '@/lib/api';
import type { Order, OrderStatus, OrderType } from '@/lib/api-types';
import { cn } from '@/lib/utils';
import { ElapsedTime } from './elapsed-time';

const TYPE_ICON: Record<OrderType, React.ComponentType<{ className?: string }>> = {
  DELIVERY: Bike,
  PICKUP: Store,
  DINE_IN: Building2,
};

const TYPE_LABEL: Record<OrderType, string> = {
  DELIVERY: 'Delivery',
  PICKUP: 'Pickup',
  DINE_IN: 'Dine in',
};

// The KDS only ever drives forward — kitchen staff can't cancel from here
// (that's a manager action in /orders), they just advance the ticket.
const NEXT_STATUS: Partial<
  Record<
    OrderStatus,
    { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }
  >
> = {
  PENDING: { status: 'CONFIRMED', label: 'Confirm', icon: Check },
  CONFIRMED: { status: 'PREPARING', label: 'Start', icon: ChefHat },
  PREPARING: { status: 'READY', label: 'Mark Ready', icon: Package },
  // From READY: delivery orders need a driver to take them; pickup/dine-in
  // are handed straight to the customer. The button label changes to reflect
  // that.
};

// Faint top border accent per status — gives a quick scan signal across the
// board even when the same kitchen is making different ticket types.
const STATUS_ACCENT: Record<OrderStatus, string> = {
  PENDING: 'border-t-warning',
  CONFIRMED: 'border-t-info',
  PREPARING: 'border-t-primary',
  READY: 'border-t-success',
  OUT_FOR_DELIVERY: 'border-t-primary',
  DELIVERED: 'border-t-success',
  CANCELLED: 'border-t-accent',
};

interface KdsCardProps {
  order: Order;
}

export function KdsCard({ order }: KdsCardProps) {
  const transition = useTransitionOrder();
  const TypeIcon = TYPE_ICON[order.type];

  // Compute the next action based on type + current status so a delivery
  // READY shows "Send out" while a pickup READY shows "Picked up".
  let next: {
    status: OrderStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  } | null = null;
  const stock = NEXT_STATUS[order.status];
  if (stock) {
    next = stock;
  } else if (order.status === 'READY') {
    next =
      order.type === 'DELIVERY'
        ? { status: 'OUT_FOR_DELIVERY', label: 'Send out', icon: Truck }
        : { status: 'DELIVERED', label: 'Picked up', icon: Check };
  }

  async function advance() {
    if (!next) return;
    try {
      await transition.mutateAsync({ id: order.id, status: next.status });
      // Don't toast — the chime + card animating out is signal enough.
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not advance order';
      toast.error(message);
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, x: 30 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={cn(
        'bg-surface border-border flex flex-col overflow-hidden rounded-2xl border-2 shadow-[var(--shadow-card)]',
        STATUS_ACCENT[order.status],
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="bg-surface-elevated text-primary inline-flex size-10 items-center justify-center rounded-xl">
            <TypeIcon className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-gradient-gold text-2xl tracking-wide">
              {order.orderNumber.split('-').slice(-1)[0]}
            </p>
            <p className="text-muted text-[10px] tracking-[0.18em] uppercase">
              {TYPE_LABEL[order.type]}
            </p>
          </div>
        </div>
        <ElapsedTime startedAt={order.createdAt} className="text-2xl font-bold" />
      </header>

      {/* Customer notes — most important info on a kitchen screen */}
      {order.customerNotes && (
        <div className="bg-warning/15 border-warning/40 mx-5 mb-2 rounded-lg border px-3 py-2">
          <p className="text-warning text-[10px] tracking-[0.18em] uppercase">Customer note</p>
          <p className="text-foreground mt-0.5 text-sm font-medium">{order.customerNotes}</p>
        </div>
      )}

      {/* Items list — large, easy to read across a kitchen */}
      <ul className="divide-border flex-1 divide-y px-5">
        {order.items.map((item) => (
          <li key={item.id} className="py-3">
            <div className="flex items-baseline gap-3">
              <span className="text-primary font-display text-3xl leading-none tabular-nums">
                {item.quantity}×
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-lg leading-tight font-semibold">
                  {item.itemNameSnapshot}
                </p>
                {item.sizeNameSnapshot && (
                  <p className="text-muted text-xs tracking-wide uppercase">
                    {item.sizeNameSnapshot}
                  </p>
                )}
              </div>
            </div>
            {item.modifiers.length > 0 && (
              <p className="text-foreground/80 mt-1 pl-10 text-sm">
                + {item.modifiers.map((m) => m.nameSnapshot).join(' · ')}
              </p>
            )}
            {item.notes && <p className="text-warning mt-1 pl-10 text-sm italic">“{item.notes}”</p>}
          </li>
        ))}
      </ul>

      {/* Customer contact strip (visible only on DELIVERY where the driver
          might need to call from the floor) */}
      {order.type === 'DELIVERY' && (
        <div className="text-muted flex items-center gap-2 border-t px-5 py-2 text-xs">
          <Phone className="size-3" />
          <span className="font-mono">{order.customer.phone}</span>
        </div>
      )}

      {/* Action button */}
      {next && (
        <div className="border-border border-t p-4">
          <Button
            type="button"
            size="lg"
            className="w-full text-base"
            disabled={transition.isPending}
            onClick={advance}
          >
            {transition.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <next.icon className="size-5" />
                {next.label}
              </>
            )}
          </Button>
        </div>
      )}
    </motion.article>
  );
}
