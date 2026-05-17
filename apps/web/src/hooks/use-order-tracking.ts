'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/api-types';

// Strip the trailing /api/v1 path — the socket namespace lives on the
// origin, not on the REST prefix.
function socketOrigin(): string {
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'http://localhost:4000';
  }
}

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (sharedSocket && sharedSocket.connected) return sharedSocket;
  if (sharedSocket) return sharedSocket;
  sharedSocket = io(`${socketOrigin()}/realtime`, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  return sharedSocket;
}

/**
 * Subscribes to the `order:{id}` room and updates the cached Order in
 * react-query whenever an `order.statusChanged` event arrives.
 */
export function useOrderTracking(orderId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    const room = `order:${orderId}`;

    const join = () => socket.emit('join', room);
    if (socket.connected) join();
    socket.on('connect', join);

    const handler = (payload: { id: string; status: OrderStatus; updatedAt: string }) => {
      if (payload.id !== orderId) return;
      queryClient.setQueryData<Order | undefined>(['orders', orderId], (prev) =>
        prev ? { ...prev, status: payload.status, updatedAt: payload.updatedAt } : prev,
      );
      // Also refetch to pick up the new statusHistory row
      void queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
    };

    socket.on('order.statusChanged', handler);

    return () => {
      socket.off('order.statusChanged', handler);
      socket.off('connect', join);
      socket.emit('leave', room);
    };
  }, [orderId, queryClient]);
}
