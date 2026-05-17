'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category, MenuItem, MenuItemQuery, RestaurantSettings } from '@/lib/api-types';

export const queryKeys = {
  categories: ['categories'] as const,
  menuItems: (filters?: MenuItemQuery) => ['menu-items', filters ?? {}] as const,
  menuItem: (slugOrId: string) => ['menu-item', slugOrId] as const,
  settings: ['settings'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api<Category[]>('/categories'),
  });
}

export function useMenuItems(filters?: MenuItemQuery) {
  return useQuery({
    queryKey: queryKeys.menuItems(filters),
    queryFn: () =>
      api<MenuItem[]>('/menu-items', {
        query: filters as Record<string, string | number | boolean | undefined> | undefined,
      }),
  });
}

export function useMenuItem(slugOrId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.menuItem(slugOrId ?? ''),
    queryFn: () => api<MenuItem>(`/menu-items/${slugOrId}`),
    enabled: Boolean(slugOrId),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => api<RestaurantSettings>('/settings'),
    staleTime: 5 * 60_000,
  });
}
