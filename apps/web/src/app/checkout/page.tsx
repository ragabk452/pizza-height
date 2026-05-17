'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bike,
  Building2,
  CreditCard,
  Home,
  Loader2,
  Plus,
  ShoppingBag,
  Store,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextArea } from '@/components/ui/field';
import { Navbar } from '@/components/layout/navbar';
import { OrderSummary } from '@/components/checkout/order-summary';
import { AddressForm } from '@/components/checkout/address-form';
import { Stepper, type StepDef } from '@/components/checkout/stepper';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useSettings } from '@/hooks/use-menu';
import { useMyAddresses } from '@/hooks/use-addresses';
import { useCreateCheckoutSession, usePlaceOrder } from '@/hooks/use-orders';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type {
  Address,
  CouponPreview,
  CreateOrderItemPayload,
  OrderType,
  PaymentMethod,
} from '@/lib/api-types';

const ORDER_TYPE_OPTIONS: {
  value: OrderType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: 'DELIVERY',
    label: 'Delivery',
    description: 'Hand-delivered, hot, in ~35 minutes.',
    icon: Bike,
  },
  {
    value: 'PICKUP',
    label: 'Pickup',
    description: "Skip the line — we'll have it ready.",
    icon: Store,
  },
  {
    value: 'DINE_IN',
    label: 'Dine in',
    description: 'Reserve a table and let us host you.',
    icon: Building2,
  },
];

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}[] = [
  {
    value: 'CASH',
    label: 'Cash on delivery',
    description: 'Pay when your order arrives.',
    icon: Banknote,
  },
  {
    value: 'CARD',
    label: 'Card (Paymob)',
    description: 'Visa / Mastercard via Paymob. Sandbox / mock — no real charges.',
    icon: CreditCard,
  },
  {
    value: 'WALLET',
    label: 'Wallet',
    description: 'Mobile wallet — coming in a future sprint.',
    icon: Wallet,
    disabled: true,
  },
];

const STEPS: StepDef[] = [
  { key: 'type', label: 'Type' },
  { key: 'address', label: 'Address' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
];

const STEPS_NO_ADDRESS: StepDef[] = [
  { key: 'type', label: 'Type' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const cartHydrated = useCartStore((s) => s.hydrated);
  const clearCart = useCartStore((s) => s.clear);
  const customer = useAuthStore((s) => s.customer);
  const hydrated = useAuthStore((s) => s.hydrated);

  const { data: settings } = useSettings();
  const vatPercent = settings?.['restaurant.vatPercent'] ?? 14;
  const serviceChargePercent = settings?.['restaurant.serviceChargePercent'] ?? 0;
  const deliveryFee = settings?.['restaurant.defaultDeliveryFee'] ?? 5;
  const minOrder = settings?.['restaurant.minOrderAmount'] ?? 15;

  const [type, setTypeState] = useState<OrderType>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [pickedAddressId, setPickedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(0);

  const visibleSteps = type === 'DELIVERY' ? STEPS : STEPS_NO_ADDRESS;
  // Clamp the step into range whenever visibleSteps shrinks (no useEffect — we
  // derive it on render to avoid cascading state).
  const safeStep = Math.min(step, visibleSteps.length - 1);
  const stepKey = visibleSteps[safeStep].key;

  function setType(next: OrderType) {
    setTypeState(next);
    const nextSteps = next === 'DELIVERY' ? STEPS : STEPS_NO_ADDRESS;
    if (step >= nextSteps.length) setStep(nextSteps.length - 1);
  }

  const subtotal = useMemo(
    () =>
      +items
        .reduce(
          (sum, i) =>
            sum +
            (i.basePrice +
              i.sizePriceModifier +
              i.modifiers.reduce((s, m) => s + m.priceModifier, 0)) *
              i.quantity,
          0,
        )
        .toFixed(2),
    [items],
  );

  const placeOrder = usePlaceOrder();
  const checkoutSession = useCreateCheckoutSession();
  const addresses = useMyAddresses();

  // Derive the effective address id: explicit selection wins, otherwise fall
  // back to the customer's default (or the first one). No useEffect needed —
  // this re-derives whenever either side changes.
  const effectiveAddressId =
    pickedAddressId ??
    addresses.data?.find((a) => a.isDefault)?.id ??
    addresses.data?.[0]?.id ??
    null;

  // Auth guard — bounce to /login with `next=/checkout`
  useEffect(() => {
    if (hydrated && !customer) {
      router.replace(`/login?next=${encodeURIComponent('/checkout')}`);
    }
  }, [hydrated, customer, router]);

  // Empty-cart guard — bounce to /menu. MUST wait for cart to rehydrate
  // from localStorage first, otherwise the page sees `items=[]` for a beat
  // and redirects before the persisted cart loads.
  useEffect(() => {
    if (cartHydrated && items.length === 0 && !placeOrder.isSuccess) {
      router.replace('/menu');
    }
  }, [cartHydrated, items.length, placeOrder.isSuccess, router]);

  if (!hydrated || !cartHydrated || !customer || items.length === 0) {
    return (
      <div className="bg-mesh-gold grid min-h-screen place-items-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  function canAdvance(): boolean {
    if (stepKey === 'type') return true;
    if (stepKey === 'address') return Boolean(effectiveAddressId);
    if (stepKey === 'payment') return Boolean(paymentMethod);
    return true;
  }

  async function placeOrderHandler() {
    if (subtotal < minOrder) {
      toast.error(`Minimum order is $${minOrder.toFixed(2)}`);
      return;
    }
    if (type === 'DELIVERY' && !effectiveAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    const payload = {
      type,
      paymentMethod,
      addressId: type === 'DELIVERY' ? effectiveAddressId! : undefined,
      couponCode: coupon?.code,
      customerNotes: notes.trim() || undefined,
      items: items.map<CreateOrderItemPayload>((i) => ({
        menuItemId: i.menuItemId,
        sizeId: i.sizeId ?? undefined,
        modifierIds: i.modifiers.map((m) => m.modifierId),
        quantity: i.quantity,
        notes: i.notes || undefined,
      })),
    };
    try {
      const order = await placeOrder.mutateAsync(payload);
      clearCart();
      if (paymentMethod === 'CARD') {
        // Hand off to the payment provider — `/order/success?id=…` is
        // the customer's return URL after the gateway redirects them
        // back, and a Paymob webhook will flip the payment to PAID on
        // the server-side before they arrive (the success page polls
        // until that's true).
        const session = await checkoutSession.mutateAsync(order.id);
        // Use a hard nav (window.location) for cross-origin gateway URLs;
        // router.push would treat them as relative.
        window.location.href = session.iframeUrl;
        return;
      }
      router.replace(`/order/success?id=${order.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not place order';
      toast.error(message);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-mesh-gold min-h-screen pt-28 pb-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
          {/* Left: stepper + step content */}
          <div>
            <Link
              href="/menu"
              className="text-muted hover:text-primary inline-flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="size-4" /> Back to menu
            </Link>
            <h1 className="font-display text-foreground mt-3 text-4xl sm:text-5xl">Checkout</h1>
            <p className="text-muted mt-1 text-sm">
              Four quick steps and your order is on its way.
            </p>

            <div className="mt-8">
              <Stepper steps={visibleSteps} current={step} />
            </div>

            <div className="mt-8 min-h-[24rem]">
              <AnimatePresence mode="wait">
                {stepKey === 'type' && (
                  <Step key="type">
                    <h2 className="font-display text-foreground text-2xl">
                      How would you like it?
                    </h2>
                    <p className="text-muted mt-1 text-sm">
                      Choose how you’d like to receive your order.
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      {ORDER_TYPE_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = type === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => setType(opt.value)}
                            className={cn(
                              'group bg-surface/60 hover:bg-surface relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all',
                              active
                                ? 'border-primary shadow-[var(--shadow-gold)]'
                                : 'border-border hover:border-primary/40 hover:-translate-y-0.5',
                            )}
                          >
                            <div
                              className={cn(
                                'grid size-11 place-items-center rounded-xl transition-colors',
                                active
                                  ? 'bg-primary text-background'
                                  : 'bg-surface-elevated text-primary',
                              )}
                            >
                              <Icon className="size-5" />
                            </div>
                            <div>
                              <p className="text-foreground font-display text-lg">{opt.label}</p>
                              <p className="text-muted mt-0.5 text-xs">{opt.description}</p>
                            </div>
                            {active && (
                              <motion.div
                                layoutId="type-glow"
                                className="border-primary pointer-events-none absolute inset-0 rounded-2xl border-2"
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Step>
                )}

                {stepKey === 'address' && (
                  <Step key="address">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-foreground text-2xl">
                          Where should we deliver?
                        </h2>
                        <p className="text-muted mt-1 text-sm">
                          Pick a saved address or add a new one.
                        </p>
                      </div>
                      {!showAddressForm && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddressForm(true)}
                        >
                          <Plus className="size-4" /> Add new
                        </Button>
                      )}
                    </div>

                    {addresses.isLoading ? (
                      <div className="text-muted mt-6 flex items-center gap-2 text-sm">
                        <Loader2 className="size-4 animate-spin" /> Loading…
                      </div>
                    ) : showAddressForm || (addresses.data ?? []).length === 0 ? (
                      <div className="bg-surface/40 border-border mt-6 rounded-2xl border p-6">
                        <h3 className="font-display text-foreground mb-4 text-lg">New address</h3>
                        <AddressForm
                          onCreated={(id) => {
                            setPickedAddressId(id);
                            setShowAddressForm(false);
                          }}
                          // Cancel returns to the saved-address list if any
                          // exist; if none exist there's nothing to fall back
                          // to, so step back to "Type" instead of leaving the
                          // user staring at the same empty form again.
                          onCancel={() => {
                            if ((addresses.data ?? []).length > 0) {
                              setShowAddressForm(false);
                            } else {
                              setStep(0);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {(addresses.data ?? []).map((address) => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            selected={effectiveAddressId === address.id}
                            onSelect={() => setPickedAddressId(address.id)}
                          />
                        ))}
                      </div>
                    )}
                  </Step>
                )}

                {stepKey === 'payment' && (
                  <Step key="payment">
                    <h2 className="font-display text-foreground text-2xl">How will you pay?</h2>
                    <p className="text-muted mt-1 text-sm">
                      Cash on delivery is live now. Card &amp; wallet land in Sprint 7.
                    </p>

                    <div className="mt-6 grid gap-3">
                      {PAYMENT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = paymentMethod === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => !opt.disabled && setPaymentMethod(opt.value)}
                            disabled={opt.disabled}
                            className={cn(
                              'bg-surface/60 flex items-center gap-4 rounded-2xl border p-5 text-left transition-all',
                              active
                                ? 'border-primary shadow-[var(--shadow-gold)]'
                                : 'border-border hover:border-primary/40',
                              opt.disabled && 'cursor-not-allowed opacity-50',
                            )}
                          >
                            <div
                              className={cn(
                                'grid size-11 place-items-center rounded-xl transition-colors',
                                active
                                  ? 'bg-primary text-background'
                                  : 'bg-surface-elevated text-primary',
                              )}
                            >
                              <Icon className="size-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground font-display text-lg">{opt.label}</p>
                              <p className="text-muted mt-0.5 text-xs">{opt.description}</p>
                            </div>
                            <div
                              className={cn(
                                'size-5 rounded-full border-2 transition-all',
                                active
                                  ? 'border-primary bg-primary shadow-[0_0_0_4px_rgba(201,169,97,0.2)]'
                                  : 'border-border',
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-8">
                      <Field
                        label="Notes for the chef / driver (optional)"
                        hint="Allergies, gate code, anything else."
                      >
                        <TextArea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          maxLength={500}
                          placeholder="Extra napkins, ring the gate first…"
                        />
                      </Field>
                    </div>
                  </Step>
                )}

                {stepKey === 'review' && (
                  <Step key="review">
                    <h2 className="font-display text-foreground text-2xl">Review &amp; confirm</h2>
                    <p className="text-muted mt-1 text-sm">
                      One last look before we send it to the kitchen.
                    </p>

                    <div className="mt-6 grid gap-4">
                      <ReviewCard
                        title="Order type"
                        body={ORDER_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type}
                        onEdit={() => setStep(0)}
                      />
                      {type === 'DELIVERY' && (
                        <ReviewCard
                          title="Delivery address"
                          body={
                            effectiveAddressId
                              ? formatAddress(
                                  addresses.data?.find((a) => a.id === effectiveAddressId),
                                )
                              : 'No address selected'
                          }
                          onEdit={() => setStep(1)}
                        />
                      )}
                      <ReviewCard
                        title="Payment"
                        body={
                          PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label ??
                          paymentMethod
                        }
                        onEdit={() => setStep(type === 'DELIVERY' ? 2 : 1)}
                      />
                      {notes && (
                        <ReviewCard
                          title="Notes"
                          body={notes}
                          onEdit={() => setStep(type === 'DELIVERY' ? 2 : 1)}
                        />
                      )}
                    </div>
                  </Step>
                )}
              </AnimatePresence>
            </div>

            {/* Nav buttons */}
            <div className="border-border mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
              ) : (
                <span />
              )}

              {step < visibleSteps.length - 1 ? (
                <Button
                  type="button"
                  disabled={!canAdvance()}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  onClick={placeOrderHandler}
                  disabled={
                    placeOrder.isPending || checkoutSession.isPending || subtotal < minOrder
                  }
                >
                  {placeOrder.isPending || checkoutSession.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag className="size-4" />
                      {paymentMethod === 'CARD' ? 'Place order & pay' : 'Place order'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Right: order summary */}
          <OrderSummary
            type={type}
            vatPercent={vatPercent}
            serviceChargePercent={serviceChargePercent}
            deliveryFeeBase={deliveryFee}
            coupon={coupon}
            onCouponChange={setCoupon}
          />
        </div>
      </main>
    </>
  );
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'bg-surface/60 group hover:bg-surface relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
        selected
          ? 'border-primary shadow-[var(--shadow-gold)]'
          : 'border-border hover:border-primary/40 hover:-translate-y-0.5',
      )}
    >
      <div className="bg-surface-elevated text-primary mt-0.5 grid size-10 place-items-center rounded-xl">
        <Home className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-foreground font-medium">{address.label}</p>
          {address.isDefault && (
            <span className="text-primary border-primary/40 rounded-full border px-2 py-0.5 text-[10px] tracking-wide uppercase">
              Default
            </span>
          )}
        </div>
        <p className="text-muted mt-1 line-clamp-2 text-sm">{formatAddress(address)}</p>
      </div>
      <div
        className={cn(
          'mt-1 size-5 shrink-0 rounded-full border-2',
          selected
            ? 'border-primary bg-primary shadow-[0_0_0_4px_rgba(201,169,97,0.2)]'
            : 'border-border',
        )}
      />
    </button>
  );
}

function ReviewCard({ title, body, onEdit }: { title: string; body: string; onEdit: () => void }) {
  return (
    <div className="bg-surface/40 border-border flex items-start justify-between gap-3 rounded-2xl border px-5 py-4">
      <div className="min-w-0">
        <p className="text-muted text-xs tracking-wide uppercase">{title}</p>
        <p className="text-foreground mt-1 text-sm">{body}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-primary text-xs font-medium underline-offset-4 hover:underline"
      >
        Edit
      </button>
    </div>
  );
}

function formatAddress(address?: Address): string {
  if (!address) return '';
  const parts = [
    address.street,
    address.building && `Bldg ${address.building}`,
    address.apartment && `Apt ${address.apartment}`,
    address.area,
    address.city,
  ].filter(Boolean);
  return parts.join(', ');
}
