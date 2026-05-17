'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerProfile } from '@/lib/api-types';

interface AuthState {
  customer: CustomerProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  // True after Zustand has rehydrated from localStorage. UI guards
  // should wait for this before deciding "logged in vs not".
  hydrated: boolean;
  setSession: (data: {
    customer: CustomerProfile;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      accessToken: null,
      refreshToken: null,
      hydrated: false,
      setSession: ({ customer, accessToken, refreshToken }) =>
        set({ customer, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clear: () => set({ customer: null, accessToken: null, refreshToken: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'pizza-height-auth',
      partialize: (state) => ({
        customer: state.customer,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

/**
 * Synchronous helpers for use *outside* React components (e.g. the fetch
 * interceptor in lib/api.ts). Always read fresh state — never close over
 * a captured token.
 */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}
