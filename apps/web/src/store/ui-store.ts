'use client';

import { create } from 'zustand';

interface UIState {
  cartOpen: boolean;
  detailsItemSlug: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openItemDetails: (slug: string) => void;
  closeItemDetails: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  detailsItemSlug: null,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  openItemDetails: (slug) => set({ detailsItemSlug: slug }),
  closeItemDetails: () => set({ detailsItemSlug: null }),
}));
