'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import type { Order, OrderStatus } from '@/lib/api-types';

function socketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit && explicit.length > 0) return explicit;
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'http://localhost:4000';
  }
}

// socket.io-client's built-in reconnection handles dropped connections;
// we keep the same singleton across reconnects so we don't end up with
// two live sockets (and duplicate handlers) after a server restart.
let sharedSocket: Socket | null = null;
function getSocket(): Socket {
  if (sharedSocket) return sharedSocket;
  sharedSocket = io(`${socketUrl()}/realtime`, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return sharedSocket;
}

interface StaffRealtimeOptions {
  /** Toast each new order on the admin overview. */
  notifyOnNewOrder?: boolean;
}

/**
 * Subscribes the current page to the `admin` and `kitchen` staff rooms
 * (with server-verified JWT). Invalidates the dashboard + orders caches
 * on every `order.created` / `order.statusChanged` event.
 */
export function useStaffRealtime(options: StaffRealtimeOptions = {}) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (!token || !role) return;
    const socket = getSocket();

    // Pick the broadest room the staff member is allowed in. ADMIN/MANAGER
    // also get kitchen updates (the API broadcasts to both); KITCHEN-only
    // staff just need the kitchen room.
    const joinAll = () => {
      socket.emit('staff:join', { token, room: 'admin' });
      socket.emit('staff:join', { token, room: 'kitchen' });
    };

    if (socket.connected) joinAll();
    socket.on('connect', joinAll);

    const onCreated = (payload: { orderNumber: string; total?: number }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      if (options.notifyOnNewOrder) {
        toast(`New order ${payload.orderNumber}`, {
          description:
            typeof payload.total === 'number' ? `$${payload.total.toFixed(2)}` : undefined,
        });
      }
    };

    const onStatusChanged = (payload: {
      id: string;
      orderNumber: string;
      status: OrderStatus;
      updatedAt: string;
    }) => {
      queryClient.setQueryData<Order | undefined>(['admin', 'order', payload.id], (prev) =>
        prev ? { ...prev, status: payload.status, updatedAt: payload.updatedAt } : prev,
      );
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    };

    socket.on('order.created', onCreated);
    socket.on('order.statusChanged', onStatusChanged);

    return () => {
      socket.off('order.created', onCreated);
      socket.off('order.statusChanged', onStatusChanged);
      socket.off('connect', joinAll);
    };
  }, [token, role, queryClient, options.notifyOnNewOrder]);
}
