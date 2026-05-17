'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CheckoutSession, CouponPreview, CreateOrderPayload, Order } from '@/lib/api-types';
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

export function useOrder(id: string | undefined, options?: { pollWhilePending?: boolean }) {
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
    // For CARD orders the customer lands on /order/success while the
    // webhook is still in flight; poll every 2s until the payment flips
    // (or the order is already paid / cash).
    refetchInterval: (query) => {
      if (!options?.pollWhilePending) return false;
      const order = query.state.data as Order | undefined;
      const stillPending = order?.payment?.status === 'PENDING' && order.payment.method !== 'CASH';
      return stillPending ? 2_000 : false;
    },
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

/**
 * Kick off a hosted-payment session for a CARD order. Returns the URL
 * the browser should navigate to (Paymob iframe URL, or the local mock
 * payment page when the API is running with mock credentials).
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (orderId: string) =>
      api<CheckoutSession>(`/payments/checkout-session/${orderId}`, {
        method: 'POST',
      }),
  });
}
