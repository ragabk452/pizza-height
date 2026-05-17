'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  CustomerDetail,
  CustomerListItem,
  DashboardStats,
  MenuItem,
  MenuItemCreatePayload,
  MenuItemUpdatePayload,
  Order,
  OrderStatus,
  SettingsMap,
} from '@/lib/api-types';

const KEYS = {
  stats: ['admin', 'stats'] as const,
  orders: (filters?: { status?: OrderStatus; limit?: number }) =>
    ['admin', 'orders', filters ?? {}] as const,
  order: (id: string) => ['admin', 'order', id] as const,
  kds: ['admin', 'kds'] as const,
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
      void queryClient.invalidateQueries({ queryKey: KEYS.kds });
    },
  });
}

// KDS endpoint is gated to these roles server-side; we mirror the gate
// client-side so we don't fire a doomed 403 request for a logged-in user
// on the wrong role (e.g. DRIVER) — that would pollute the react-query
// cache and flash the "Offline" dot before the page redirects.
const KDS_ROLES = new Set(['ADMIN', 'MANAGER', 'KITCHEN']);

/**
 * Kitchen Display board — active orders sorted by ETA. Polls every 30s as a
 * safety net even though the socket should keep it in sync; if the socket
 * drops without us noticing, the next poll catches up.
 *
 * `retry: false` because once auth is cleared (401) or the role is wrong
 * (403), retrying just burns more failed requests on the way to the
 * /login redirect.
 */
export function useKdsBoard() {
  const role = useAuthStore((s) => s.user?.role);
  const enabled = useAuthed() && Boolean(role && KDS_ROLES.has(role));
  return useQuery({
    queryKey: KEYS.kds,
    queryFn: () => api<Order[]>('/orders/kds/board'),
    enabled,
    refetchInterval: 30_000,
    retry: false,
  });
}

// Menu ===============================================================

export function useAdminCategories() {
  const enabled = useAuthed();
  return useQuery({
    queryKey: KEYS.categories,
    // includeInactive surfaces soft-deleted categories so admins can see
    // / restore them; the public list view filters them out itself.
    queryFn: () => api<Category[]>('/categories', { query: { includeInactive: true } }),
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

export function useAdminMenuItem(slugOrId: string | undefined) {
  const enabled = useAuthed();
  return useQuery({
    queryKey: ['admin', 'menu-item', slugOrId ?? ''],
    queryFn: () => api<MenuItem>(`/menu-items/${slugOrId}`),
    enabled: enabled && Boolean(slugOrId),
  });
}

// Invalidating the menu / categories cache after every write is the
// simplest correct thing — the list response is small and the admin
// menu page is rarely open in two tabs.
function invalidateMenu(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: KEYS.menuItems });
  void queryClient.invalidateQueries({ queryKey: KEYS.categories });
  void queryClient.invalidateQueries({ queryKey: ['admin', 'menu-item'] });
}

// Categories ---------------------------------------------------------

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryCreatePayload) =>
      api<Category>('/categories', { method: 'POST', body: payload }),
    onSuccess: () => invalidateMenu(queryClient),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryUpdatePayload }) =>
      api<Category>(`/categories/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => invalidateMenu(queryClient),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateMenu(queryClient),
  });
}

// Menu items ---------------------------------------------------------

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MenuItemCreatePayload) =>
      api<MenuItem>('/menu-items', { method: 'POST', body: payload }),
    onSuccess: () => invalidateMenu(queryClient),
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MenuItemUpdatePayload }) =>
      api<MenuItem>(`/menu-items/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => invalidateMenu(queryClient),
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/menu-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateMenu(queryClient),
  });
}

export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      api<{ id: string; name: string; isAvailable: boolean }>(`/menu-items/${id}/availability`, {
        method: 'PATCH',
        body: { isAvailable },
      }),
    onSuccess: () => invalidateMenu(queryClient),
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

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      api<{ key: string; value: unknown }>(`/settings/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: { value },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEYS.settings });
    },
  });
}
