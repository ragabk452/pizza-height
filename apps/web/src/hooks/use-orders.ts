'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CouponPreview, CreateOrderPayload, Order } from '@/lib/api-types';
import { useAuthStore } from '@/store/auth-store';

const KEYS = {
  mine: ['orders', 'me'] as const,
  one: (id: string) => ['orders', id] as const,
};

export function useMyOrders() {
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  return useQuery({
    queryKey: KEYS.mine,
    queryFn: () => api<Order[]>('/orders/me'),
    enabled: isAuthed,
  });
}

export function useOrder(id: string | undefined) {
  // Gate the request on both an id AND the auth store finishing rehydration
  // — otherwise on a hard refresh the query fires before localStorage has
  // restored the access token, hits 401, the refresh-token is also missing,
  // and the page is stuck on a permanent spinner.
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  return useQuery({
    queryKey: KEYS.one(id ?? ''),
    queryFn: () => api<Order>(`/orders/${id}`),
    enabled: Boolean(id) && hydrated && isAuthed,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      api<Order>('/orders', { method: 'POST', body: payload }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: KEYS.mine });
      queryClient.setQueryData(KEYS.one(order.id), order);
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      api<CouponPreview>('/coupons/validate', {
        method: 'POST',
        body: { code, subtotal },
      }),
  });
}
