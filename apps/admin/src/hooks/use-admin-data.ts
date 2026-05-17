'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type {
  Category,
  CustomerDetail,
  CustomerListItem,
  DashboardStats,
  MenuItem,
  Order,
  OrderStatus,
  SettingsMap,
} from '@/lib/api-types';

const KEYS = {
  stats: ['admin', 'stats'] as const,
  orders: (filters?: { status?: OrderStatus; limit?: number }) =>
    ['admin', 'orders', filters ?? {}] as const,
  order: (id: string) => ['admin', 'order', id] as const,
  categories: ['admin', 'categories'] as const,
  menuItems: ['admin', 'menu-items'] as const,
  customers: (search?: string) => ['admin', 'customers', search ?? ''] as const,
  customer: (id: string) => ['admin', 'customer', id] as const,
  settings: ['admin', 'settings'] as const,
};

function useAuthed() {
  return useAuthStore((s) => s.hydrated && Boolean(s.accessToken));
}

// Dashboard ==========================================================

export function useDashboardStats() {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: () => api<DashboardStats>('/orders/stats/today'),
    enabled,
    refetchInterval: 30_000, // soft fallback if a socket event is missed
  });
}

// Orders =============================================================

export function useStaffOrders(filters?: { status?: OrderStatus; limit?: number }) {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.orders(filters),
    queryFn: () =>
      api<Order[]>('/orders', {
        query: filters as Record<string, string | number | boolean | undefined>,
      }),
    enabled,
  });
}

export function useStaffOrder(id: string | undefined) {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.order(id ?? ''),
    queryFn: () => api<Order>(`/orders/${id}`),
    enabled: enabled && Boolean(id),
  });
}

export function useTransitionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: OrderStatus; reason?: string }) =>
      api<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status, reason },
      }),
    onSuccess: (order) => {
      queryClient.setQueryData(KEYS.order(order.id), order);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

// Menu ===============================================================

export function useAdminCategories() {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.categories,
    queryFn: () => api<Category[]>('/categories'),
    enabled,
  });
}

export function useAdminMenuItems() {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.menuItems,
    queryFn: () => api<MenuItem[]>('/menu-items?availableOnly=false'),
    enabled,
  });
}

// Customers ==========================================================

export function useCustomersList(search?: string) {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.customers(search),
    queryFn: () =>
      api<CustomerListItem[]>('/customers', {
        query: search ? { search } : undefined,
      }),
    enabled,
  });
}

export function useCustomerDetail(id: string | undefined) {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.customer(id ?? ''),
    queryFn: () => api<CustomerDetail>(`/customers/${id}`),
    enabled: enabled && Boolean(id),
  });
}

// Settings ==========================================================

export function useAdminSettings() {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.settings,
    queryFn: () => api<SettingsMap>('/settings'),
    enabled,
  });
}
