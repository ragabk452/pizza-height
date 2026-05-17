'use client';

import { Drawer } from 'vaul';
import { Loader2, Phone, Receipt, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/field';
import { StatusBadge } from '@/components/ui/status-badge';
import { useStaffOrder, useTransitionOrder } from '@/hooks/use-admin-data';
import type { Order, OrderStatus } from '@/lib/api-types';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const ACTION_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Mark pending',
  CONFIRMED: 'Confirm',
  PREPARING: 'Start preparing',
  READY: 'Mark ready',
  OUT_FOR_DELIVERY: 'Send for delivery',
  DELIVERED: 'Mark delivered',
  CANCELLED: 'Cancel order',
};

const TYPE_LABEL: Record<string, string> = {
  DELIVERY: 'Delivery',
  PICKUP: 'Pickup',
  DINE_IN: 'Dine in',
};

interface Props {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailDrawer({ orderId, onClose }: Props) {
  const { data: order, isLoading } = useStaffOrder(orderId ?? undefined);
  return (
    <Drawer.Root open={Boolean(orderId)} onOpenChange={(o) => !o && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          className="bg-background border-border fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l outline-none sm:max-w-lg"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">
            {order ? `Order ${order.orderNumber}` : 'Order details'}
          </Drawer.Title>

          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Order</p>
              <p className="font-display text-gradient-gold text-2xl tracking-wide">
                {order?.orderNumber ?? '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-muted hover:text-foreground rounded-full p-2 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isLoading || !order ? (
              <div className="text-muted flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </div>
            ) : (
              <OrderBody order={order} />
            )}
          </div>

          {order && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
            <StatusActions order={order} onClose={onClose} />
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function OrderBody({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <StatusBadge status={order.status} />
        <span className="text-muted text-xs">
          {TYPE_LABEL[order.type] ?? order.type} ·{' '}
          {new Date(order.createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      </div>

      {/* Customer */}
      <section>
        <h4 className="text-muted text-[10px] tracking-[0.18em] uppercase">Customer</h4>
        <p className="text-foreground mt-2 font-medium">{order.customer.name}</p>
        <a
          href={`tel:${order.customer.phone}`}
          className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
        >
          <Phone className="size-3.5" /> {order.customer.phone}
        </a>
      </section>

      {/* Address */}
      {order.address && (
        <section>
          <h4 className="text-muted text-[10px] tracking-[0.18em] uppercase">Delivering to</h4>
          <p className="text-foreground mt-2 font-medium">{order.address.label}</p>
          <p className="text-muted text-sm">
            {[
              order.address.street,
              order.address.building && `Bldg ${order.address.building}`,
              order.address.apartment && `Apt ${order.address.apartment}`,
              order.address.area,
              order.address.city,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </section>
      )}

      {/* Items */}
      <section>
        <h4 className="text-muted text-[10px] tracking-[0.18em] uppercase">Items</h4>
        <ul className="divide-border mt-2 divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-foreground text-sm font-medium">
                  {item.quantity}× {item.itemNameSnapshot}
                </span>
                <span className="text-foreground text-sm tabular-nums">
                  ${item.lineTotal.toFixed(2)}
                </span>
              </div>
              {item.sizeNameSnapshot && (
                <p className="text-muted text-xs">{item.sizeNameSnapshot}</p>
              )}
              {item.modifiers.length > 0 && (
                <p className="text-muted text-xs">
                  + {item.modifiers.map((m) => m.nameSnapshot).join(', ')}
                </p>
              )}
              {item.notes && <p className="text-muted text-xs italic">“{item.notes}”</p>}
            </li>
          ))}
        </ul>
      </section>

      {order.customerNotes && (
        <section className="bg-warning/10 border-warning/30 rounded-xl border px-4 py-3">
          <p className="text-warning text-[10px] tracking-[0.18em] uppercase">Customer note</p>
          <p className="text-foreground mt-1 text-sm">{order.customerNotes}</p>
        </section>
      )}

      {/* Pricing */}
      <section>
        <h4 className="text-muted text-[10px] tracking-[0.18em] uppercase">
          <Receipt className="mr-1 inline size-3" /> Totals
        </h4>
        <div className="mt-2 space-y-1 text-sm">
          <Row label="Subtotal" value={order.subtotal} />
          {order.discountAmount > 0 && (
            <Row
              label={order.couponUsage ? `Coupon (${order.couponUsage.coupon.code})` : 'Discount'}
              value={-order.discountAmount}
              accent
            />
          )}
          <Row label="VAT" value={order.vatAmount} />
          {order.serviceCharge > 0 && <Row label="Service" value={order.serviceCharge} />}
          {order.deliveryFee > 0 && <Row label="Delivery" value={order.deliveryFee} />}
          <div className="border-border mt-2 flex items-baseline justify-between gap-2 border-t pt-2">
            <span className="text-foreground text-sm font-medium">Total</span>
            <span className="font-display text-primary text-2xl tabular-nums">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* History */}
      <section>
        <h4 className="text-muted text-[10px] tracking-[0.18em] uppercase">History</h4>
        <ol className="mt-2 space-y-2">
          {order.statusHistory.map((h) => (
            <li
              key={h.id}
              className="text-foreground flex items-baseline justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="bg-primary inline-block size-1.5 rounded-full" />
                <span className="text-foreground">
                  {h.fromStatus ? `${h.fromStatus} → ` : ''}
                  {h.toStatus}
                </span>
                {h.reason && <span className="text-muted italic">— {h.reason}</span>}
              </div>
              <span className="text-muted">
                {new Date(h.createdAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function StatusActions({ order, onClose }: { order: Order; onClose: () => void }) {
  const transition = useTransitionOrder();
  const allowed = VALID_TRANSITIONS[order.status];
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  async function go(status: OrderStatus, reason?: string) {
    try {
      await transition.mutateAsync({ id: order.id, status, reason });
      toast.success(`Order ${order.orderNumber} → ${status}`);
      if (status === 'CANCELLED' || status === 'DELIVERED') onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not update status';
      toast.error(message);
    }
  }

  if (!allowed.length) return null;
  const primary = allowed.find((s) => s !== 'CANCELLED');
  const canCancel = allowed.includes('CANCELLED');

  return (
    <div className="border-border bg-surface/60 sticky bottom-0 border-t px-6 py-5 backdrop-blur-md">
      {showCancel && canCancel ? (
        <div className="space-y-3">
          <TextInput
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason (optional but recommended)"
            maxLength={200}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              type="button"
              // Don't let the user back out of the form mid-request — the
              // mutation is still in flight and would close the drawer on
              // success with a toast for an order they're no longer viewing.
              disabled={transition.isPending}
              onClick={() => setShowCancel(false)}
            >
              Back
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              type="button"
              disabled={transition.isPending}
              onClick={() => go('CANCELLED', cancelReason.trim() || undefined)}
            >
              {transition.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Confirm cancel'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn('flex gap-2', !canCancel && 'justify-end')}>
          {canCancel && (
            <Button
              type="button"
              variant="ghost"
              // Pending while the primary transition is firing — otherwise
              // the user could open the cancel form mid-confirm and confuse
              // the workflow.
              disabled={transition.isPending}
              onClick={() => setShowCancel(true)}
              className="text-accent hover:text-accent"
            >
              Cancel order
            </Button>
          )}
          {primary && (
            <Button
              type="button"
              disabled={transition.isPending}
              onClick={() => go(primary)}
              className="flex-1"
            >
              {transition.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                ACTION_LABEL[primary]
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className={cn('tabular-nums', accent ? 'text-primary' : 'text-foreground')}>
        {value < 0 ? '−' : ''}${Math.abs(value).toFixed(2)}
      </span>
    </div>
  );
}
