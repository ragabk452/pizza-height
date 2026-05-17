'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { AuthResponse } from '@/lib/api-types';

interface LoginPayload {
  phone: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api<AuthResponse>('/auth/customer/login', {
        method: 'POST',
        body: payload,
        skipAuth: true,
      }),
    onSuccess: (data) => setSession(data),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      api<AuthResponse>('/auth/customer/register', {
        method: 'POST',
        body: payload,
        skipAuth: true,
      }),
    onSuccess: (data) => setSession(data),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: async () => {
      try {
        await api('/auth/logout', { method: 'POST' });
      } catch {
        // Even if the server call fails (network/expired), clear local state.
      }
    },
    onSettled: () => clear(),
  });
}
