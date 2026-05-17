'use client';

import { Drawer } from 'vaul';
import { CalendarClock, Loader2, Mail, MapPin, Phone, Receipt, User, X } from 'lucide-react';
import { useCustomerDetail } from '@/hooks/use-admin-data';
import { StatusBadge } from '@/components/ui/status-badge';
import type { OrderStatus, OrderType } from '@/lib/api-types';
import { cn } from '@/lib/utils';

interface Props {
  customerId: string | null;
  onClose: () => void;
  /** Open the order detail drawer in the orders page when the admin clicks
   * a row in the customer's history. */
  onOrderClick?: (orderId: string) => void;
}

const TYPE_LABEL: Record<OrderType, string> = {
  DELIVERY: 'Delivery',
  PICKUP: 'Pickup',
  DINE_IN: 'Dine in',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CustomerDetailDrawer({ customerId, onClose, onOrderClick }: Props) {
  const { data: customer, isLoading } = useCustomerDetail(customerId ?? undefined);

  return (
    <Drawer.Root open={Boolean(customerId)} onOpenChange={(o) => !o && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          className="bg-background border-border fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l outline-none sm:max-w-lg"
        >
          <Drawer.Title className="sr-only">
            {customer ? `Customer ${customer.name}` : 'Customer details'}
          </Drawer.Title>

          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <p className="text-primary text-[10px] tracking-[0.18em] uppercase">Customer</p>
              <h2 className="font-display text-foreground mt-0.5 text-xl">
                {customer?.name ?? 'Loading…'}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-muted hover:text-foreground rounded-full p-2 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading || !customer ? (
              <div className="text-muted flex items-center justify-center gap-2 py-20 text-sm">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </div>
            ) : (
              <div className="space-y-8">
                {/* Profile */}
                <section>
                  <div className="bg-surface/40 border-border flex items-start gap-4 rounded-2xl border p-5">
                    <span className="bg-primary/15 border-primary/40 text-primary inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border">
                      <User className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-lg font-medium">{customer.name}</p>
                      <ul className="text-muted mt-2 space-y-1 text-xs">
                        <li className="flex items-center gap-2">
                          <Phone className="size-3" /> {customer.phone}
                          {customer.phoneVerified && (
                            <span className="text-success ml-1 text-[10px]">verified</span>
                          )}
                        </li>
                        {customer.email && (
                          <li className="flex items-center gap-2">
                            <Mail className="size-3" /> {customer.email}
                            {customer.emailVerified && (
                              <span className="text-success ml-1 text-[10px]">verified</span>
                            )}
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <CalendarClock className="size-3" /> Joined{' '}
                          {new Date(customer.createdAt).toLocaleDateString(undefined, {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Stat label="Lifetime spend" value={`$${customer.lifetimeSpend.toFixed(2)}`} />
                    <Stat
                      label="Orders"
                      value={String(customer.orderCount)}
                      sub={customer.orderCount === 1 ? 'order' : 'orders'}
                    />
                  </div>
                </section>

                {/* Addresses */}
                <section>
                  <SectionHeader title="Saved addresses" count={customer.addresses.length} />
                  {customer.addresses.length === 0 ? (
                    <EmptyHint>No saved addresses.</EmptyHint>
                  ) : (
                    <ul className="space-y-2">
                      {customer.addresses.map((a) => (
                        <li
                          key={a.id}
                          className="bg-surface/40 border-border flex items-start gap-3 rounded-xl border p-3"
                        >
                          <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <p className="text-foreground text-sm font-medium">{a.label}</p>
                              {a.isDefault && (
                                <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[9px] tracking-wide uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-muted text-xs">
                              {a.street}, {a.area}, {a.city}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Order history */}
                <section>
                  <SectionHeader
                    title="Recent orders"
                    count={customer.orders.length}
                    hint="Last 25 non-cancelled."
                  />
                  {customer.orders.length === 0 ? (
                    <EmptyHint>No orders yet.</EmptyHint>
                  ) : (
                    <ul className="divide-border bg-surface/40 border-border divide-y overflow-hidden rounded-2xl border">
                      {customer.orders.map((o) => {
                        const clickable = Boolean(onOrderClick);
                        return (
                          <li key={o.id}>
                            <button
                              type="button"
                              onClick={() => onOrderClick?.(o.id)}
                              disabled={!clickable}
                              className={cn(
                                'flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors',
                                clickable ? 'hover:bg-surface' : 'cursor-default',
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Receipt className="text-muted size-4 shrink-0" />
                                <div>
                                  <p className="text-foreground font-mono text-sm">
                                    {o.orderNumber}
                                  </p>
                                  <p className="text-muted text-[10px]">
                                    {TYPE_LABEL[o.type]} · {relativeTime(o.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <StatusBadge status={o.status as OrderStatus} />
                                <span className="text-foreground font-display tabular-nums">
                                  ${o.total.toFixed(2)}
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// helpers ---------------------------------------------------------

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface/40 border-border rounded-xl border p-4">
      <p className="text-muted text-[10px] tracking-[0.18em] uppercase">{label}</p>
      <p className="font-display text-primary mt-1 text-2xl tabular-nums">{value}</p>
      {sub && <p className="text-muted text-[10px]">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, count, hint }: { title: string; count?: number; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <div>
        <h3 className="text-foreground font-display text-base">{title}</h3>
        {hint && <p className="text-muted text-[10px]">{hint}</p>}
      </div>
      {typeof count === 'number' && <span className="text-muted text-xs">{count}</span>}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted bg-surface/30 border-border rounded-xl border border-dashed py-4 text-center text-xs">
      {children}
    </p>
  );
}
