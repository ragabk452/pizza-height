'use client';

import { Drawer } from 'vaul';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import { useSettings } from '@/hooks/use-menu';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const close = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const vatPercent = useCartStore((s) => s.vatPercent);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const removeItem = useCartStore((s) => s.remove);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clear = useCartStore((s) => s.clear);
  const setConfig = useCartStore((s) => s.setConfig);

  // Sync VAT + delivery fee from settings whenever cart opens
  const { data: settings } = useSettings();
  useEffect(() => {
    if (!settings) return;
    setConfig({
      vatPercent: settings['restaurant.vatPercent'] ?? 14,
      deliveryFee: settings['restaurant.defaultDeliveryFee'] ?? 5,
    });
  }, [settings, setConfig]);

  // Derive totals from the actual reactive items + config — not from the
  // store's totals() helper (whose function reference is stable and would
  // make useMemo go stale when items mutate).
  const t = useMemo(() => {
    const subtotal = items.reduce(
      (sum, i) =>
        sum +
        (i.basePrice + i.sizePriceModifier + i.modifiers.reduce((s, m) => s + m.priceModifier, 0)) *
          i.quantity,
      0,
    );
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const vat = +(subtotal * (vatPercent / 100)).toFixed(2);
    const fee = items.length > 0 ? deliveryFee : 0;
    return {
      itemCount,
      subtotal: +subtotal.toFixed(2),
      vat,
      deliveryFee: fee,
      total: +(subtotal + vat + fee).toFixed(2),
    };
  }, [items, vatPercent, deliveryFee]);

  const minOrder = settings?.['restaurant.minOrderAmount'] ?? 15;
  const meetsMin = t.subtotal >= minOrder;

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && close()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          className="bg-background border-border fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l outline-none sm:max-w-md"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">Your cart</Drawer.Title>

          {/* Header */}
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-primary size-5" />
              <h2 className="font-display text-foreground text-xl">
                Your cart
                {items.length > 0 && (
                  <span className="text-muted ml-2 text-sm">
                    ({t.itemCount} {t.itemCount === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clear}
                  className="text-muted hover:text-accent text-xs underline-offset-4 hover:underline"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={close}
                aria-label="Close"
                className="text-muted hover:text-foreground -mr-2 rounded-full p-2 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <EmptyCart onClose={close} />
            ) : (
              <ul className="divide-border divide-y px-6">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.lineId}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 py-4"
                    >
                      <div className="bg-surface-elevated relative size-20 shrink-0 overflow-hidden rounded-xl">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="grid size-full place-items-center text-3xl">🍕</div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-foreground line-clamp-1 text-sm font-medium">
                            {item.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeItem(item.lineId)}
                            aria-label="Remove"
                            className="text-muted hover:text-accent -mt-1 -mr-1 p-1 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        {item.sizeName && (
                          <p className="text-muted text-xs">Size: {item.sizeName}</p>
                        )}
                        {item.modifiers.length > 0 && (
                          <p className="text-muted line-clamp-2 text-xs">
                            + {item.modifiers.map((m) => m.name).join(', ')}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-muted line-clamp-1 text-xs italic">
                            &ldquo;{item.notes}&rdquo;
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <QtyControl
                            value={item.quantity}
                            onChange={(q) => updateQuantity(item.lineId, q)}
                          />
                          <span className="font-display text-primary text-base">
                            $
                            {(
                              (item.basePrice +
                                item.sizePriceModifier +
                                item.modifiers.reduce((s, m) => s + m.priceModifier, 0)) *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {/* Footer with totals */}
          {items.length > 0 && (
            <div className="border-border bg-surface/40 sticky bottom-0 space-y-3 border-t px-6 py-5 backdrop-blur-md">
              <Row label="Subtotal" value={t.subtotal} />
              <Row label={`VAT (${vatPercent}%)`} value={t.vat} />
              <Row label="Delivery" value={t.deliveryFee} />
              <div className="border-border border-t pt-3">
                <Row label="Total" value={t.total} bold />
              </div>

              {!meetsMin && (
                <p className="text-accent text-center text-xs">
                  Add ${(minOrder - t.subtotal).toFixed(2)} more to meet the ${minOrder} minimum
                </p>
              )}

              <button
                disabled={!meetsMin}
                className={cn(
                  'mt-2 w-full rounded-xl px-6 py-4 text-base font-medium transition-all',
                  'bg-primary text-background hover:bg-primary-hover shadow-[var(--shadow-gold)]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                Continue to checkout
              </button>
              <p className="text-muted text-center text-xs">Checkout flow lands in Sprint 4.</p>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="bg-surface grid size-20 place-items-center rounded-full">
        <ShoppingBag className="text-muted size-8" />
      </div>
      <div>
        <h3 className="font-display text-foreground text-xl">Your cart is empty</h3>
        <p className="text-muted mt-2 text-sm">Pizza is one tap away. Wood-fired, in 90 seconds.</p>
      </div>
      <button
        onClick={onClose}
        className="bg-primary text-background hover:bg-primary-hover mt-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-[var(--shadow-gold)] transition-all hover:-translate-y-0.5"
      >
        Browse the menu
      </button>
    </div>
  );
}

function QtyControl({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="border-border inline-flex items-center gap-1 rounded-lg border">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Decrease"
        className="hover:text-primary text-muted grid size-7 place-items-center transition-colors"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="text-foreground w-6 text-center text-sm font-medium">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
        className="hover:text-primary text-muted grid size-7 place-items-center transition-colors"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn('text-sm', bold ? 'text-foreground font-medium' : 'text-muted')}>
        {label}
      </span>
      <span
        className={cn(
          bold ? 'font-display text-primary text-2xl' : 'text-foreground text-sm font-medium',
        )}
      >
        ${value.toFixed(2)}
      </span>
    </div>
  );
}
