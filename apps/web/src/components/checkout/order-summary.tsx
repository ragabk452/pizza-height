'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart-store';
import { useValidateCoupon } from '@/hooks/use-orders';
import { ApiError } from '@/lib/api';
import { TextInput } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import type { CouponPreview, OrderType } from '@/lib/api-types';

interface OrderSummaryProps {
  type: OrderType;
  vatPercent: number;
  serviceChargePercent: number;
  deliveryFeeBase: number;
  coupon: CouponPreview | null;
  onCouponChange: (coupon: CouponPreview | null) => void;
}

export function OrderSummary({
  type,
  vatPercent,
  serviceChargePercent,
  deliveryFeeBase,
  coupon,
  onCouponChange,
}: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const [code, setCode] = useState('');
  const validate = useValidateCoupon();

  const totals = useMemo(() => {
    const subtotal = +items
      .reduce(
        (sum, i) =>
          sum +
          (i.basePrice +
            i.sizePriceModifier +
            i.modifiers.reduce((s, m) => s + m.priceModifier, 0)) *
            i.quantity,
        0,
      )
      .toFixed(2);

    // Mirror the backend pricing model (apps/api/src/modules/orders/orders.service.ts):
    //   - PERCENTAGE / FIXED coupons reduce the taxable base.
    //   - FREE_DELIVERY zeros the delivery fee but does NOT reduce taxable.
    //   - VAT and service charge both run on `taxable`.
    // `coupon.discount` is the *displayed savings* — for FREE_DELIVERY it's
    // the delivery fee value (so the UI can show "Discount -$5.00").
    const foodDiscount = coupon?.freeDelivery ? 0 : (coupon?.discount ?? 0);
    let deliveryFee = type === 'DELIVERY' ? deliveryFeeBase : 0;
    if (coupon?.freeDelivery) deliveryFee = 0;

    const taxable = Math.max(subtotal - foodDiscount, 0);
    const vat = +(taxable * (vatPercent / 100)).toFixed(2);
    const serviceCharge = +(taxable * (serviceChargePercent / 100)).toFixed(2);
    const displayDiscount = coupon?.discount ?? 0;
    const total = +(taxable + vat + serviceCharge + deliveryFee).toFixed(2);
    return {
      subtotal,
      discount: displayDiscount,
      deliveryFee,
      vat,
      serviceCharge,
      total,
    };
  }, [items, type, vatPercent, serviceChargePercent, deliveryFeeBase, coupon]);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
      const result = await validate.mutateAsync({
        code: trimmed,
        subtotal: totals.subtotal,
      });
      onCouponChange(result);
      toast.success(`Coupon ${result.code} applied`);
      setCode('');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not apply coupon';
      toast.error(message);
    }
  }

  return (
    <aside className="bg-surface/40 border-border flex flex-col gap-4 rounded-2xl border p-6 backdrop-blur-md md:sticky md:top-24">
      <h3 className="font-display text-foreground text-2xl">Your order</h3>

      <ul className="divide-border max-h-[24rem] divide-y overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.lineId} className="flex items-start gap-3 py-3">
            <div className="bg-surface-elevated grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-lg">🍕</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-foreground line-clamp-1 text-sm font-medium">
                  {item.quantity}× {item.name}
                </span>
                <span className="text-foreground text-sm tabular-nums">
                  $
                  {(
                    (item.basePrice +
                      item.sizePriceModifier +
                      item.modifiers.reduce((s, m) => s + m.priceModifier, 0)) *
                    item.quantity
                  ).toFixed(2)}
                </span>
              </div>
              {item.sizeName && <p className="text-muted text-xs">{item.sizeName}</p>}
              {item.modifiers.length > 0 && (
                <p className="text-muted line-clamp-1 text-xs">
                  + {item.modifiers.map((m) => m.name).join(', ')}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Coupon */}
      <div>
        {coupon ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-primary/40 bg-primary/5 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Tag className="text-primary size-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-foreground text-sm font-medium">{coupon.code}</p>
                {coupon.description && (
                  <p className="text-muted line-clamp-1 text-xs">{coupon.description}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onCouponChange(null)}
              className="text-muted hover:text-accent p-1 transition-colors"
              aria-label="Remove coupon"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ) : (
          <form onSubmit={applyCoupon} className="flex gap-2">
            <TextInput
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="h-11 flex-1"
              maxLength={40}
            />
            <button
              type="submit"
              disabled={!code.trim() || validate.isPending}
              className={cn(
                'border-primary/40 text-primary hover:bg-primary/10 inline-flex h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-all',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {validate.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Apply'}
            </button>
          </form>
        )}
      </div>

      {/* Totals */}
      <div className="border-border space-y-2 border-t pt-4">
        <Row label="Subtotal" value={totals.subtotal} />
        {totals.discount > 0 && <Row label="Discount" value={-totals.discount} accent />}
        <Row label={`VAT (${vatPercent}%)`} value={totals.vat} />
        {totals.serviceCharge > 0 && (
          <Row label={`Service (${serviceChargePercent}%)`} value={totals.serviceCharge} />
        )}
        <Row
          label={type === 'DELIVERY' ? 'Delivery' : 'Service'}
          value={totals.deliveryFee}
          muted={type !== 'DELIVERY'}
        />
        <div className="border-border mt-3 flex items-baseline justify-between gap-2 border-t pt-3">
          <span className="text-foreground text-sm font-medium">Total</span>
          <span className="font-display text-primary text-3xl tabular-nums">
            ${totals.total.toFixed(2)}
          </span>
        </div>
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
}) {
  if (muted) return null;
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className={cn('tabular-nums', accent ? 'text-primary' : 'text-foreground')}>
        {value < 0 ? '−' : ''}${Math.abs(value).toFixed(2)}
      </span>
    </div>
  );
}
