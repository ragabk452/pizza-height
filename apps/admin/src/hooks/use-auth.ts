'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { StaffAuthResponse } from '@/lib/api-types';

interface LoginPayload {
  email: string;
  password: string;
}

export function useStaffLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api<StaffAuthResponse>('/auth/staff/login', {
        method: 'POST',
        body: payload,
        skipAuth: true,
      }),
    onSuccess: (data) =>
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }),
  });
}

export function useStaffLogout() {
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: async () => {
      try {
        await api('/auth/logout', { method: 'POST' });
      } catch {
        // ignore — server might already consider us signed out
      }
    },
    onSettled: () => clear(),
  });
}
