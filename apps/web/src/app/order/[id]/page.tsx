'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Receipt } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { StatusTimeline } from '@/components/order/status-timeline';
import { useOrder } from '@/hooks/use-orders';
import { useOrderTracking } from '@/hooks/use-order-tracking';
import { useAuthStore } from '@/store/auth-store';

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = typeof params?.id === 'string' ? params.id : undefined;
  const hydrated = useAuthStore((s) => s.hydrated);
  const customer = useAuthStore((s) => s.customer);
  const { data: order, isLoading, isError } = useOrder(orderId);
  useOrderTracking(orderId);

  // Bounce unauthenticated visitors to /login instead of showing a misleading
  // "Order not found" — useOrder is gated on auth so it doesn't even fire,
  // and the page would otherwise render with no data to show.
  useEffect(() => {
    if (hydrated && !customer && orderId) {
      router.replace(`/login?next=${encodeURIComponent(`/order/${orderId}`)}`);
    }
  }, [hydrated, customer, orderId, router]);

  if (!hydrated || (!customer && hydrated && orderId)) {
    return (
      <div className="bg-mesh-gold grid min-h-screen place-items-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-mesh-gold grid min-h-screen place-items-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="bg-mesh-gold grid min-h-screen place-items-center pt-24">
          <div className="text-center">
            <h2 className="font-display text-foreground text-3xl">Order not found</h2>
            <p className="text-muted mt-2 text-sm">
              We couldn’t find this order. It may have been removed.
            </p>
            <Button asChild className="mt-6">
              <Link href="/orders">View all orders</Link>
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-mesh-gold min-h-screen pt-28 pb-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          {/* Left: timeline */}
          <div>
            <Link
              href="/orders"
              className="text-muted hover:text-primary text-sm transition-colors"
            >
              ← All orders
            </Link>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-muted text-xs tracking-[0.2em] uppercase">Order</p>
                <h1 className="font-display text-gradient-gold mt-1 text-4xl sm:text-5xl">
                  {order.orderNumber}
                </h1>
              </div>
              <span
                className={`bg-surface/60 border-primary/40 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide uppercase`}
              >
                {order.status.replaceAll('_', ' ')}
              </span>
            </div>
            <p className="text-muted mt-3 text-sm">
              Placed{' '}
              {new Date(order.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              {order.estimatedReadyAt && (
                <>
                  {' · '}ETA{' '}
                  {new Date(order.estimatedReadyAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </>
              )}
            </p>

            <div className="bg-surface/40 border-border mt-10 rounded-2xl border p-6">
              <StatusTimeline status={order.status} type={order.type} />
            </div>
          </div>

          {/* Right: receipt */}
          <aside className="space-y-4">
            <div className="bg-surface/40 border-border rounded-2xl border p-6">
              <h3 className="font-display text-foreground flex items-center gap-2 text-xl">
                <Receipt className="text-primary size-5" /> Receipt
              </h3>

              <ul className="divide-border mt-4 divide-y">
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

              <div className="border-border mt-4 space-y-1.5 border-t pt-4 text-sm">
                <Row label="Subtotal" value={order.subtotal} />
                {order.discountAmount > 0 && (
                  <Row
                    label={
                      order.couponUsage ? `Coupon (${order.couponUsage.coupon.code})` : 'Discount'
                    }
                    value={-order.discountAmount}
                    accent
                  />
                )}
                <Row label="VAT" value={order.vatAmount} />
                {order.deliveryFee > 0 && <Row label="Delivery" value={order.deliveryFee} />}
                <div className="border-border mt-3 flex items-baseline justify-between gap-2 border-t pt-3">
                  <span className="text-foreground text-sm font-medium">Total</span>
                  <span className="font-display text-primary text-2xl tabular-nums">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {order.address && (
              <div className="bg-surface/40 border-border rounded-2xl border p-6">
                <p className="text-muted text-xs tracking-[0.2em] uppercase">Delivering to</p>
                <p className="text-foreground font-display mt-2 text-lg">{order.address.label}</p>
                <p className="text-muted mt-1 text-sm">
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
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className={`tabular-nums ${accent ? 'text-primary' : 'text-foreground'}`}>
        {value < 0 ? '−' : ''}${Math.abs(value).toFixed(2)}
      </span>
    </div>
  );
}
