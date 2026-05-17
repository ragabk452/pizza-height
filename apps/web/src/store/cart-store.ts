'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemModifier {
  modifierId: string;
  name: string;
  priceModifier: number;
}

export interface CartItem {
  /** Unique line-id (uuid-ish). Different selections of the same menu item = different lines. */
  lineId: string;
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
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  vat: number;
  deliveryFee: number;
  total: number;
}

interface CartState {
  items: CartItem[];
  vatPercent: number;
  deliveryFee: number;
  // True after Zustand has rehydrated from localStorage. UI that paints
  // counts/totals should wait for this before rendering, otherwise the
  // server (empty cart) and the client (rehydrated cart) markup mismatch.
  hydrated: boolean;
  add: (item: Omit<CartItem, 'lineId' | 'quantity'> & { quantity?: number }) => void;
  remove: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  setConfig: (cfg: Partial<Pick<CartState, 'vatPercent' | 'deliveryFee'>>) => void;
  setHydrated: () => void;
  totals: () => CartTotals;
  unitPrice: (item: Pick<CartItem, 'basePrice' | 'sizePriceModifier' | 'modifiers'>) => number;
}

function lineId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function unitPriceOf(item: Pick<CartItem, 'basePrice' | 'sizePriceModifier' | 'modifiers'>) {
  return (
    item.basePrice +
    item.sizePriceModifier +
    item.modifiers.reduce((sum, m) => sum + m.priceModifier, 0)
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      vatPercent: 14, // overridden by settings on app load
      deliveryFee: 5,
      hydrated: false,

      add: (payload) => {
        const item: CartItem = {
          lineId: lineId(),
          quantity: payload.quantity ?? 1,
          menuItemId: payload.menuItemId,
          slug: payload.slug,
          name: payload.name,
          imageUrl: payload.imageUrl,
          basePrice: payload.basePrice,
          sizeId: payload.sizeId,
          sizeName: payload.sizeName,
          sizePriceModifier: payload.sizePriceModifier,
          modifiers: payload.modifiers,
          notes: payload.notes ?? '',
        };
        set({ items: [...get().items, item] });
      },

      remove: (id) => set({ items: get().items.filter((i) => i.lineId !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().remove(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.lineId === id ? { ...i, quantity: Math.min(quantity, 99) } : i,
          ),
        });
      },

      clear: () => set({ items: [] }),

      setConfig: (cfg) => set(cfg),

      setHydrated: () => set({ hydrated: true }),

      unitPrice: unitPriceOf,

      totals: () => {
        const items = get().items;
        const subtotal = items.reduce((sum, i) => sum + unitPriceOf(i) * i.quantity, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        const vat = +(subtotal * (get().vatPercent / 100)).toFixed(2);
        const deliveryFee = items.length > 0 ? get().deliveryFee : 0;
        const total = +(subtotal + vat + deliveryFee).toFixed(2);
        return {
          itemCount,
          subtotal: +subtotal.toFixed(2),
          vat,
          deliveryFee,
          total,
        };
      },
    }),
    {
      name: 'pizza-height-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
