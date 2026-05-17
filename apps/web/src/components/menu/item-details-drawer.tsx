'use client';

import { Drawer } from 'vaul';
import { Minus, Plus, X, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMenuItem } from '@/hooks/use-menu';
import { useUIStore } from '@/store/ui-store';
import { useCartStore, type CartItemModifier } from '@/store/cart-store';
import { DietaryBadges } from './dietary-badges';
import { cn } from '@/lib/utils';
import type { ItemSize, ModifierGroup } from '@/lib/api-types';

export function ItemDetailsDrawer() {
  const slug = useUIStore((s) => s.detailsItemSlug);
  const close = useUIStore((s) => s.closeItemDetails);
  const openCart = useUIStore((s) => s.openCart);
  const addToCart = useCartStore((s) => s.add);

  const open = Boolean(slug);

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && close()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          className="bg-background border-border fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l outline-none sm:max-w-xl"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">Item details</Drawer.Title>
          {open && slug ? (
            <ItemDetailsBody
              key={slug}
              slug={slug}
              onClose={close}
              onAddToCart={(payload) => {
                addToCart(payload);
                close();
                toast.success(`${payload.name} added to cart`, {
                  action: { label: 'View cart', onClick: openCart },
                });
              }}
            />
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

interface BodyProps {
  slug: string;
  onClose: () => void;
  onAddToCart: (item: {
    menuItemId: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    basePrice: number;
    sizeId: string | null;
    sizeName: string | null;
    sizePriceModifier: number;
    modifiers: CartItemModifier[];
    quantity: number;
    notes: string;
  }) => void;
}

function ItemDetailsBody({ slug, onClose, onAddToCart }: BodyProps) {
  const { data: item, isLoading, error } = useMenuItem(slug);

  // First valid default size (computed once per item via useMemo so it's stable across renders)
  const defaultSizeId = useMemo(
    () => item?.sizes?.find((s) => s.isDefault)?.id ?? item?.sizes?.[0]?.id ?? null,
    [item],
  );

  // Local state starts undefined and falls back to defaultSizeId in the render — no setState-in-effect needed.
  const [overrideSizeId, setOverrideSizeId] = useState<string | null | undefined>(undefined);
  const selectedSizeId = overrideSizeId !== undefined ? overrideSizeId : defaultSizeId;
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Set<string>>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const setSelectedSizeId = setOverrideSizeId;

  const selectedSize = useMemo(
    () => item?.sizes?.find((s) => s.id === selectedSizeId) ?? null,
    [item, selectedSizeId],
  );

  const flatSelectedModifiers = useMemo(() => {
    const out: CartItemModifier[] = [];
    if (!item) return out;
    for (const group of item.modifierGroups ?? []) {
      const ids = selectedModifiers[group.id];
      if (!ids) continue;
      for (const id of ids) {
        const m = group.modifiers.find((x) => x.id === id);
        if (m) out.push({ modifierId: m.id, name: m.name, priceModifier: m.priceModifier });
      }
    }
    return out;
  }, [item, selectedModifiers]);

  const unitPrice = useMemo(() => {
    if (!item) return 0;
    return (
      item.basePrice +
      (selectedSize?.priceModifier ?? 0) +
      flatSelectedModifiers.reduce((sum, m) => sum + m.priceModifier, 0)
    );
  }, [item, selectedSize, flatSelectedModifiers]);

  const linePrice = +(unitPrice * quantity).toFixed(2);

  const requiredGroupsSatisfied = useMemo(() => {
    if (!item) return false;
    for (const g of item.modifierGroups ?? []) {
      const ids = selectedModifiers[g.id] ?? new Set();
      if (g.isRequired && ids.size < g.minSelection) return false;
    }
    return true;
  }, [item, selectedModifiers]);

  if (isLoading) {
    return (
      <div className="grid flex-1 place-items-center">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="grid flex-1 place-items-center px-8 text-center">
        <div>
          <p className="text-foreground">Couldn&apos;t load this item.</p>
          <button
            onClick={onClose}
            className="text-primary mt-4 text-sm underline-offset-4 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const toggleModifier = (group: ModifierGroup, modifierId: string) => {
    setSelectedModifiers((prev) => {
      const next = { ...prev };
      const current = new Set(next[group.id] ?? []);
      if (current.has(modifierId)) {
        current.delete(modifierId);
      } else {
        if (group.maxSelection === 1) {
          current.clear();
        }
        // `maxSelection === 0` is treated as "unlimited" (matches backend
        // convention in orders.service.ts). Only enforce the cap when > 0.
        if (group.maxSelection > 0 && current.size >= group.maxSelection) {
          return prev;
        }
        current.add(modifierId);
      }
      next[group.id] = current;
      return next;
    });
  };

  const handleAddToCart = () => {
    onAddToCart({
      menuItemId: item.id,
      slug: item.slug,
      name: item.name,
      imageUrl: item.imageUrl,
      basePrice: item.basePrice,
      sizeId: selectedSize?.id ?? null,
      sizeName: selectedSize?.name ?? null,
      sizePriceModifier: selectedSize?.priceModifier ?? 0,
      modifiers: flatSelectedModifiers,
      quantity,
      notes,
    });
  };

  return (
    <>
      {/* Header (sticky close + name on scroll) */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="bg-background/80 border-border text-muted hover:text-foreground absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full border backdrop-blur-md transition-colors"
      >
        <X className="size-5" />
      </button>

      <div className="flex-1 overflow-y-auto">
        {/* Hero image */}
        <div className="bg-surface-elevated relative aspect-[5/4] w-full overflow-hidden">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-9xl">🍕</div>
          )}
          <div className="from-background absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="absolute right-4 bottom-4 left-4">
            <DietaryBadges item={item} size="md" />
          </div>
        </div>

        {/* Body */}
        <div className="space-y-8 px-6 py-6 sm:px-8">
          {/* Title + price */}
          <div>
            <h2 className="font-display text-foreground text-3xl sm:text-4xl">{item.name}</h2>
            <p className="text-muted mt-2 text-base leading-relaxed">{item.description}</p>
            <p className="text-muted mt-3 text-xs tracking-wide uppercase">
              From ${item.basePrice} · {item.prepTimeMin} min prep
            </p>
          </div>

          {/* Sizes */}
          {item.sizes && item.sizes.length > 0 && (
            <Section title="Choose your size" required>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {item.sizes.map((s) => (
                  <SizeButton
                    key={s.id}
                    size={s}
                    selected={selectedSizeId === s.id}
                    basePrice={item.basePrice}
                    onSelect={() => setSelectedSizeId(s.id)}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Modifier groups */}
          {item.modifierGroups?.map((group) => (
            <Section
              key={group.id}
              title={group.name}
              required={group.isRequired}
              hint={
                group.maxSelection > 1
                  ? `Choose up to ${group.maxSelection}`
                  : group.maxSelection === 1
                    ? 'Pick one'
                    : undefined
              }
            >
              <div className="space-y-1.5">
                {group.modifiers.map((m) => {
                  const selected = selectedModifiers[group.id]?.has(m.id) ?? false;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleModifier(group, m.id)}
                      className={cn(
                        'border-border bg-surface flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-all',
                        selected
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'text-muted hover:border-primary/30 hover:text-foreground',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            'grid size-5 shrink-0 place-items-center border transition-colors',
                            group.maxSelection === 1 ? 'rounded-full' : 'rounded-md',
                            selected ? 'border-primary bg-primary' : 'border-border bg-background',
                          )}
                        >
                          {selected && (
                            <span
                              className={cn(
                                'bg-background',
                                group.maxSelection === 1 ? 'size-2 rounded-full' : 'size-2.5',
                              )}
                            />
                          )}
                        </span>
                        {m.name}
                      </span>
                      {m.priceModifier > 0 && (
                        <span className="text-primary font-medium">+${m.priceModifier}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Section>
          ))}

          {/* Notes */}
          <Section title="Special instructions" hint="Allergies, extra crisp, no onions, etc.">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="Anything we should know?"
              className="border-border bg-surface text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/30 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
            />
          </Section>

          {/* Quantity */}
          <Section title="Quantity">
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </Section>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="border-border bg-background/95 sticky bottom-0 z-10 border-t px-6 py-4 backdrop-blur-md sm:px-8">
        <button
          onClick={handleAddToCart}
          disabled={!requiredGroupsSatisfied}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-xl px-6 py-4 text-base font-medium transition-all',
            'bg-primary text-background hover:bg-primary-hover shadow-[var(--shadow-gold)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span>Add to cart</span>
          <span className="font-display text-2xl">${linePrice.toFixed(2)}</span>
        </button>
        {!requiredGroupsSatisfied && (
          <p className="text-muted mt-2 text-center text-xs">Pick required options to continue</p>
        )}
      </div>
    </>
  );
}

function Section({
  title,
  required,
  hint,
  children,
}: {
  title: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-foreground text-lg">
          {title}
          {required && <span className="text-accent ml-2 text-xs uppercase">Required</span>}
        </h3>
        {hint && <span className="text-muted text-xs">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function SizeButton({
  size,
  selected,
  basePrice,
  onSelect,
}: {
  size: ItemSize;
  selected: boolean;
  basePrice: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'border-border bg-surface flex flex-col items-center gap-1 rounded-xl border px-4 py-3 text-sm transition-all',
        selected
          ? 'border-primary bg-primary/10 text-foreground shadow-[var(--shadow-gold)]'
          : 'text-muted hover:border-primary/30 hover:text-foreground',
      )}
    >
      <span className="font-display text-base">{size.name}</span>
      {size.diameterCm && <span className="text-muted text-[10px]">{size.diameterCm}cm</span>}
      <span className={cn('text-xs font-medium', selected ? 'text-primary' : 'text-muted')}>
        ${(basePrice + size.priceModifier).toFixed(2)}
      </span>
    </button>
  );
}

function QuantitySelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="border-border bg-surface inline-flex items-center gap-3 rounded-xl border p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease"
        className="hover:bg-background grid size-10 place-items-center rounded-lg transition-colors"
      >
        <Minus className="size-4" />
      </button>
      <span className="font-display w-8 text-center text-lg">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(99, value + 1))}
        aria-label="Increase"
        className="hover:bg-background grid size-10 place-items-center rounded-lg transition-colors"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
